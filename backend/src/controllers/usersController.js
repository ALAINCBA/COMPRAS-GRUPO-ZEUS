const pool = require('../database/pool');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.user;

    // Admin vê todos, gerente só vê de sua loja, financeiro vê todos
    if (role === 'gerente') {
      return res.status(403).json({ error: 'Gerentes não podem listar usuários' });
    }

    const result = await pool.query(
      'SELECT id, name, email, role, store_id, active, created_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, role, store_id, active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, store_id } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar usuários' });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Nome, email, senha e role são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, store_id',
      [name, email, hashedPassword, role, store_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email já existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, store_id, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem editar usuários' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, store_id = $4, active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, email, role, store_id || null, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem deletar usuários' });
    }

    const result = await pool.query(
      'UPDATE users SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
