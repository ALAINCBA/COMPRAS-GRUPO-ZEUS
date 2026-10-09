# Requisitos Funcionais - CONTROLE DE COMPRAS GRUPO ZEUS

## 1. AUTENTICAÇÃO E AUTORIZAÇÃO

### Login
- [x] Tela de login com email/senha
- [x] JWT Token
- [x] Recuperação de senha
- [x] Redirect automático por perfil

### Perfis
- [x] Administrador - Acesso total
- [x] Gerente - Acesso à sua loja
- [x] Financeiro - Visualiza todas as lojas

## 2. MÓDULO COMPRAS

### Criar Compra
- [x] Número do pedido
- [x] Loja (auto-fill)
- [x] Data da compra
- [x] Usuário responsável (auto-fill)
- [x] Fornecedor (select ou novo)
- [x] Produtos (múltiplos)
- [x] Frete estimado
- [x] Forma de pagamento
- [x] Parcelas automáticas

### Validações
- [x] Soma das parcelas = valor total
- [x] Campos obrigatórios
- [x] Formato de valores monetários

## 3. MÓDULO ENTREGAS

### Registrar Entrega
- [x] Data da entrega
- [x] Quantidade recebida
- [x] Frete efetivo
- [x] Número da NF
- [x] Anexos
- [x] Múltiplas entregas por compra

### Cálculos
- [x] Quantidade pendente = comprado - recebido
- [x] Status automático (completa/parcial)
- [x] Alertas de divergência

## 4. MÓDULO FINANCEIRO

### Contas a Pagar
- [x] Listagem de parcelas
- [x] Filtros (loja, fornecedor, período, status)
- [x] Alertas (vence hoje, vencido, vencendo)

### Pagamentos
- [x] Registrar pagamento
- [x] Atualizar status
- [x] Histórico de pagamentos
- [x] Auditoria (quem, quando, quanto)

## 5. DASHBOARDS

### Admin
- [x] Cards: Compras, Fretes, A pagar, Vencido, Pago
- [x] Comparação entre lojas
- [x] Gráficos
- [x] Filtros

### Gerente
- [x] Minhas compras
- [x] Entregas parciais
- [x] Entregas completas
- [x] Compras do mês

### Financeiro
- [x] Total a pagar
- [x] Vence hoje
- [x] Próximos 7 dias
- [x] Vencido
- [x] Tabela de contas

## 6. RELATÓRIOS

- [x] Compras por loja
- [x] Compras por fornecedor
- [x] Compras por período
- [x] Entregas pendentes
- [x] Diferenças de entrega
- [x] Contas a pagar
- [x] Contas vencidas
- [x] Pagamentos realizados
- [x] Exportar (Excel, CSV, PDF)

## 7. FUNCIONALIDADES AUXILIARES

### Cadastros
- [x] Fornecedores
- [x] Lojas
- [x] Usuários
- [x] Configurações

### Timeline da Compra
- [x] Histórico de eventos
- [x] Datas importantes
- [x] Status de entregas
- [x] Pagamentos

### Auditoria
- [x] Registro de todas as alterações
- [x] Quem alterou
- [x] O quê alterou
- [x] Quando alterou
- [x] Valores antes/depois

## 8. RESPONSIVIDADE

- [x] Desktop
- [x] Tablet
- [x] Mobile
- [x] Câmera para anexar fotos
- [x] Campos grandes
- [x] Formulário em etapas

## 9. SEGURANÇA

- [x] Autenticação JWT
- [x] Autorização por perfil
- [x] Validação de dados
- [x] Controle de acesso por loja
- [x] Gerente não acessa outra loja
- [x] Auditoria completa

## 10. PERFORMANCE

- [x] Paginação
- [x] Índices de banco de dados
- [x] Lazy loading
- [x] Cache quando apropriado

## 11. DADOS INICIAIS

- [x] 3 Lojas (BBB, SELECT, RONDONÓPOLIS)
- [x] Usuários de teste
- [x] Dados fictícios para demonstração
