const pool = require('../database/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, store_id FROM users WHERE email = $1 AND active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_id: user.store_id
      },
      process.env.JWT_SECRET || 'your_super_secret_key_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyToken = (req, res) => {
  try {
    res.status(200).json({
      message: 'Token válido',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, verifyToken };
