# CONTROLE DE COMPRAS — GRUPO ZEUS

## 🎯 Objetivo

Sistema web completo, profissional, responsivo e seguro para centralizar e controlar todo o processo de:
**COMPRA → ENTREGA → CONFERÊNCIA → FINANCEIRO → PAGAMENTO → RELATÓRIOS**

## 📋 Características Principais

- ✅ Cadastro único de compras
- ✅ Distribuição automática de informações
- ✅ Controle de entregas (simples e múltiplas)
- ✅ Gestão financeira com parcelas automáticas
- ✅ Dashboard visual e profissional
- ✅ Relatórios completos (Excel, CSV, PDF)
- ✅ Responsivo (Desktop, Tablet, Mobile)
- ✅ Autenticação e autorização por perfil
- ✅ Auditoria de todas as alterações
- ✅ Filtros e busca global

## 🏢 Lojas

- BBB
- SELECT
- RONDONÓPOLIS

## 👥 Perfis de Usuário

- **Administrador**: Acesso total
- **Gerente**: Acesso à sua loja
- **Financeiro**: Visualiza todas as lojas

## 🗂️ Estrutura do Projeto

```
COMPRAS-GRUPO-ZEUS/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── database/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── App.js
│   └── package.json
└── docs/
    ├── database-schema.md
    ├── api-documentation.md
    └── requirements.md
```

## 🚀 Como Iniciar

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 Banco de Dados

PostgreSQL com as seguintes entidades principais:
- users
- stores
- suppliers
- purchases
- purchase_items
- deliveries
- installments
- payments
- attachments
- audit_logs

## 📝 Status

- 🔵 RASCUNHO
- 🟡 COMPRA REALIZADA
- 🟠 AGUARDANDO ENTREGA
- 🟣 ENTREGA PARCIAL
- 🟢 ENTREGA COMPLETA
- 🔴 CANCELADA

## 🔐 Segurança

- Autenticação com JWT
- Autorização por perfil (role-based)
- Validação de dados
- Proteção de rotas
- Controle de acesso por loja
- Auditoria completa

## 📱 Responsividade

- Desktop
- Tablet
- Mobile (prioridade para gerentes)

## 🧪 Testes Obrigatórios

1. Criar compra com entrada + parcelas
2. Validar soma das parcelas
3. Registrar entrega parcial
4. Registrar segunda entrega
5. Confirmar entrega completa
6. Registrar pagamento
7. Testar controle de acesso
8. Testar auditoria
9. Testar mobile
10. Testar filtros e relatórios

## 📄 Licença

Privado - Grupo ZEUS
