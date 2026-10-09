const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  if (err.code === 'P0001') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes('duplicate key')) {
    return res.status(400).json({ error: 'Registro duplicado' });
  }

  if (err.message.includes('foreign key')) {
    return res.status(400).json({ error: 'Referência inválida' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
};

module.exports = { errorHandler };
