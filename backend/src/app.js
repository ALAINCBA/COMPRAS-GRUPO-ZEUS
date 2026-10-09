const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const storesRoutes = require('./routes/stores');
const suppliersRoutes = require('./routes/suppliers');
const purchasesRoutes = require('./routes/purchases');
const deliveriesRoutes = require('./routes/deliveries');
const installmentsRoutes = require('./routes/installments');
const paymentsRoutes = require('./routes/payments');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');

const { authenticate } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/stores', authenticate, storesRoutes);
app.use('/api/suppliers', authenticate, suppliersRoutes);
app.use('/api/purchases', authenticate, purchasesRoutes);
app.use('/api/deliveries', authenticate, deliveriesRoutes);
app.use('/api/installments', authenticate, installmentsRoutes);
app.use('/api/payments', authenticate, paymentsRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/reports', authenticate, reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Tratamento de erros
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
});

module.exports = app;
