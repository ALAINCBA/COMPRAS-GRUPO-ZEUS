const pool = require('./pool');
const { createTables } = require('./migrate');
const { seedDatabase } = require('./seed');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    await createTables();
    await seedDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro na inicialização do banco de dados:', error);
    process.exit(1);
  }
};

module.exports = { initializeDatabase };
