const pool = require('./pool');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar se já existe dados
    const existingStores = await pool.query('SELECT COUNT(*) as count FROM stores');
    if (existingStores.rows[0].count > 0) {
      console.log('⚠️  Banco de dados já contém dados. Pulando seed...');
      return;
    }

    // Criar lojas
    console.log('📦 Criando lojas...');
    const storesResult = await pool.query(`
      INSERT INTO stores (name, document, address, city, state, active)
      VALUES 
        ('BBB', '12.345.678/0001-99', 'Rua BBB, 100', 'São Paulo', 'SP', true),
        ('SELECT', '87.654.321/0001-11', 'Rua SELECT, 200', 'Rio de Janeiro', 'RJ', true),
        ('RONDONÓPOLIS', '11.111.111/0001-22', 'Rua RONDONÓPOLIS, 300', 'Rondonópolis', 'MT', true)
      RETURNING id, name;
    `);

    const storeIds = storesResult.rows.reduce((acc, row) => {
      acc[row.name] = row.id;
      return acc;
    }, {});

    console.log('✅ Lojas criadas:', storeIds);

    // Criar usuários
    console.log('👥 Criando usuários...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedGerPassword = await bcrypt.hash('gerente123', 10);
    const hashedFinPassword = await bcrypt.hash('financeiro123', 10);

    const usersResult = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, store_id, active)
      VALUES 
        ('Admin Zeus', 'admin@grupozeus.com.br', $1, 'admin', NULL, true),
        ('João Silva (BBB)', 'joao@bbb.com.br', $2, 'gerente', $3, true),
        ('Maria Santos (SELECT)', 'maria@select.com.br', $2, 'gerente', $4, true),
        ('Pedro Costa (RONDONÓPOLIS)', 'pedro@rondonopolis.com.br', $2, 'gerente', $5, true),
        ('Financeiro Zeus', 'financeiro@grupozeus.com.br', $3, 'financeiro', NULL, true)
      RETURNING id, email, role;
    `, [hashedAdminPassword, hashedGerPassword, storeIds['BBB'], storeIds['SELECT'], storeIds['RONDONÓPOLIS'], hashedFinPassword]);

    console.log('✅ Usuários criados');

    // Criar fornecedores
    console.log('🏭 Criando fornecedores...');
    const suppliersResult = await pool.query(`
      INSERT INTO suppliers (company_name, trade_name, document, phone, whatsapp, email, address, city, state, active)
      VALUES 
        ('CONFECÇÕES PREMIUM LTDA', 'Premium Fashion', '99.999.999/0001-88', '(11) 3333-4444', '(11) 99999-8888', 'contato@premium.com.br', 'Rua São Paulo, 1000', 'São Paulo', 'SP', true),
        ('TÊXTIL BRASIL S/A', 'Têxtil Brasil', '88.888.888/0001-77', '(21) 2222-3333', '(21) 98888-7777', 'vendas@textizbrasil.com.br', 'Av. Rio Branco, 500', 'Rio de Janeiro', 'RJ', true),
        ('CONFECÇÕES DO VALE LTDA', 'Vale Fashion', '77.777.777/0001-66', '(31) 1111-2222', '(31) 97777-6666', 'compras@valefashion.com.br', 'Rua Minas, 800', 'Belo Horizonte', 'MG', true)
      RETURNING id;
    `);

    console.log('✅ Fornecedores criados');

    console.log('\n🎉 Seed do banco de dados concluído com sucesso!\n');
    console.log('📋 Credenciais de acesso:');
    console.log('\n👑 ADMINISTRADOR:');
    console.log('   Email: admin@grupozeus.com.br');
    console.log('   Senha: admin123');
    console.log('\n🏪 GERENTE (BBB):');
    console.log('   Email: joao@bbb.com.br');
    console.log('   Senha: gerente123');
    console.log('\n🏪 GERENTE (SELECT):');
    console.log('   Email: maria@select.com.br');
    console.log('   Senha: gerente123');
    console.log('\n🏪 GERENTE (RONDONÓPOLIS):');
    console.log('   Email: pedro@rondonopolis.com.br');
    console.log('   Senha: gerente123');
    console.log('\n💰 FINANCEIRO:');
    console.log('   Email: financeiro@grupozeus.com.br');
    console.log('   Senha: financeiro123\n');

  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
