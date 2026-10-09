const pool = require('../database/pool');

const getAllSuppliers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, company_name, trade_name, document, phone, whatsapp, email, address, city, state, active, created_at FROM suppliers WHERE active = true ORDER BY company_name'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM suppliers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { company_name, trade_name, document, phone, whatsapp, email, address, city, state, notes } = req.body;

    if (!company_name || !document) {
      return res.status(400).json({ error: 'Razão social e documento são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO suppliers (company_name, trade_name, document, phone, whatsapp, email, address, city, state, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [company_name, trade_name, document, phone, whatsapp, email, address, city, state, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Documento já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, trade_name, document, phone, whatsapp, email, address, city, state, notes, active } = req.body;

    const result = await pool.query(
      `UPDATE suppliers SET 
        company_name = $1, trade_name = $2, document = $3, phone = $4, whatsapp = $5, 
        email = $6, address = $7, city = $8, state = $9, notes = $10, active = $11, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $12 RETURNING *`,
      [company_name, trade_name, document, phone, whatsapp, email, address, city, state, notes, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.id, p.order_number, p.purchase_date, p.total_amount, p.status, s.name as store_name
       FROM purchases p
       JOIN stores s ON p.store_id = s.id
       WHERE p.supplier_id = $1
       ORDER BY p.purchase_date DESC
       LIMIT 50`,
      [id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, getSupplierHistory };
