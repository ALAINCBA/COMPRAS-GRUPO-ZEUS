const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_change_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }
    next();
  };
};

const checkStoreAccess = async (req, res, next) => {
  // Administrador e financeiro têm acesso a todas as lojas
  if (req.user.role === 'admin' || req.user.role === 'financeiro') {
    return next();
  }

  // Gerente só acessa sua própria loja
  if (req.user.role === 'gerente') {
    const storeId = parseInt(req.params.storeId || req.body.store_id);
    if (storeId !== req.user.store_id) {
      return res.status(403).json({ error: 'Você não tem acesso a essa loja' });
    }
  }

  next();
};

module.exports = { authenticate, authorize, checkStoreAccess };
