const pool = require('../database/pool');
const Decimal = require('decimal.js');

const createPurchase = async (req, res) => {
  try {
    const { order_number, store_id, supplier_id, purchase_date, items, freight_estimated, payment_method, installments } = req.body;
    const userId = req.user.id;

    // Validações
    if (!order_number || !store_id || !supplier_id || !purchase_date || !items || items.length === 0) {
      return res.status(400).json({ error: 'Campos obrigatórios: order_number, store_id, supplier_id, purchase_date, items' });
    }

    // Controle de acesso: gerente só cria para sua loja
    if (req.user.role === 'gerente' && req.user.store_id !== store_id) {
      return res.status(403).json({ error: 'Você só pode criar compras para sua loja' });
    }

    // Começar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Calcular totais
      let subtotal = new Decimal(0);
      let discount = new Decimal(0);

      items.forEach(item => {
        const itemTotal = new Decimal(item.unit_price).times(item.quantity);
        subtotal = subtotal.plus(itemTotal);
        if (item.discount) {
          discount = discount.plus(item.discount);
        }
      });

      const product_total = subtotal.minus(discount);
      const freight = new Decimal(freight_estimated || 0);
      const total_amount = product_total.plus(freight);

      // Validar parcelas
      if (installments && installments.length > 0) {
        const installmentSum = installments.reduce((sum, inst) => sum.plus(new Decimal(inst.amount)), new Decimal(0));
        if (!installmentSum.equals(total_amount)) {
          throw new Error(`A soma das parcelas (${installmentSum}) não corresponde ao valor total da compra (${total_amount})`);
        }
      }

      // Criar compra
      const purchaseResult = await client.query(
        `INSERT INTO purchases 
         (order_number, store_id, supplier_id, purchase_date, subtotal, discount, product_total, freight_estimated, total_amount, payment_method, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [order_number, store_id, supplier_id, purchase_date, subtotal.toString(), discount.toString(), product_total.toString(), freight.toString(), total_amount.toString(), payment_method, 'realized', userId]
      );

      const purchaseId = purchaseResult.rows[0].id;

      // Inserir itens
      for (const item of items) {
        const itemTotal = new Decimal(item.unit_price).times(item.quantity).minus(item.discount || 0);
        await client.query(
          `INSERT INTO purchase_items 
           (purchase_id, product_name, reference, color, size, quantity, unit_price, discount, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [purchaseId, item.product_name, item.reference, item.color, item.size, item.quantity, item.unit_price, item.discount || 0, itemTotal.toString()]
        );
      }

      // Criar parcelas automaticamente
      if (installments && installments.length > 0) {
        for (let i = 0; i < installments.length; i++) {
          await client.query(
            `INSERT INTO installments 
             (purchase_id, installment_number, due_date, amount, status)
             VALUES ($1, $2, $3, $4, $5)`,
            [purchaseId, i + 1, installments[i].due_date, installments[i].amount, 'pending']
          );
        }
      }

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity, entity_id, new_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'Criou compra', 'purchases', purchaseId, JSON.stringify({ order_number, store_id, total_amount: total_amount.toString() })]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Compra criada com sucesso',
        purchase_id: purchaseId,
        order_number,
        total_amount: total_amount.toString(),
        installments_count: installments ? installments.length : 0
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    if (error.message.includes('A soma das parcelas')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar compra
    const purchaseResult = await pool.query(
      `SELECT p.*, s.name as store_name, su.company_name as supplier_name
       FROM purchases p
       JOIN stores s ON p.store_id = s.id
       JOIN suppliers su ON p.supplier_id = su.id
       WHERE p.id = $1`,
      [id]
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    const purchase = purchaseResult.rows[0];

    // Controle de acesso
    if (req.user.role === 'gerente' && req.user.store_id !== purchase.store_id) {
      return res.status(403).json({ error: 'Você não tem acesso a essa compra' });
    }

    // Buscar itens
    const itemsResult = await pool.query(
      'SELECT * FROM purchase_items WHERE purchase_id = $1',
      [id]
    );

    // Buscar entregas
    const deliveriesResult = await pool.query(
      'SELECT * FROM deliveries WHERE purchase_id = $1 ORDER BY delivery_date DESC',
      [id]
    );

    // Buscar parcelas
    const installmentsResult = await pool.query(
      'SELECT * FROM installments WHERE purchase_id = $1 ORDER BY installment_number ASC',
      [id]
    );

    // Calcular quantidade recebida e pendente
    const quantityReceived = deliveriesResult.rows.reduce((sum, d) => sum + d.quantity_received, 0);
    const quantityPurchased = itemsResult.rows.reduce((sum, item) => sum + item.quantity, 0);
    const quantityPending = quantityPurchased - quantityReceived;

    res.status(200).json({
      ...purchase,
      items: itemsResult.rows,
      deliveries: deliveriesResult.rows,
      installments: installmentsResult.rows,
      quantity_purchased: quantityPurchased,
      quantity_received: quantityReceived,
      quantity_pending: quantityPending
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPurchasesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status, supplier_id, limit = 50, offset = 0 } = req.query;

    // Controle de acesso
    if (req.user.role === 'gerente' && req.user.store_id !== parseInt(storeId)) {
      return res.status(403).json({ error: 'Você não tem acesso a essa loja' });
    }

    let query = 'SELECT p.id, p.order_number, p.purchase_date, p.total_amount, p.status, s.name as store_name, su.company_name as supplier_name FROM purchases p JOIN stores s ON p.store_id = s.id JOIN suppliers su ON p.supplier_id = su.id WHERE p.store_id = $1';
    const params = [storeId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (supplier_id) {
      paramCount++;
      query += ` AND p.supplier_id = $${paramCount}`;
      params.push(supplier_id);
    }

    query += ` ORDER BY p.purchase_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const { status, store_id, supplier_id, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT p.id, p.order_number, p.purchase_date, p.total_amount, p.status, s.name as store_name, su.company_name as supplier_name FROM purchases p JOIN stores s ON p.store_id = s.id JOIN suppliers su ON p.supplier_id = su.id WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Gerente só vê sua loja
    if (req.user.role === 'gerente') {
      paramCount++;
      query += ` AND p.store_id = $${paramCount}`;
      params.push(req.user.store_id);
    }

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (store_id) {
      paramCount++;
      query += ` AND p.store_id = $${paramCount}`;
      params.push(store_id);
    }

    if (supplier_id) {
      paramCount++;
      query += ` AND p.supplier_id = $${paramCount}`;
      params.push(supplier_id);
    }

    query += ` ORDER BY p.purchase_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPurchase, getPurchaseById, getPurchasesByStore, getAllPurchases };
