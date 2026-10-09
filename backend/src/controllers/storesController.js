const pool = require('../database/pool');

const getAllStores = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, document, address, city, state, active, created_at FROM stores ORDER BY name'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, document, address, city, state, active, created_at FROM stores WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, document, address, city, state } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar lojas' });
    }

    if (!name || !document) {
      return res.status(400).json({ error: 'Nome e documento são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO stores (name, document, address, city, state) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, document, address, city, state]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Documento já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, document, address, city, state, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem editar lojas' });
    }

    const result = await pool.query(
      'UPDATE stores SET name = $1, document = $2, address = $3, city = $4, state = $5, active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [name, document, address, city, state, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllStores, getStoreById, createStore, updateStore };
