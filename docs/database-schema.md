# Database Schema - CONTROLE DE COMPRAS GRUPO ZEUS

## Tabelas Principais

### 1. users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gerente', 'financeiro')),
  store_id INTEGER REFERENCES stores(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. stores
```sql
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20) NOT NULL UNIQUE,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. suppliers
```sql
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  document VARCHAR(20) NOT NULL UNIQUE,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. purchases
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  purchase_date DATE NOT NULL,
  subtotal DECIMAL(15,2),
  discount DECIMAL(15,2) DEFAULT 0,
  product_total DECIMAL(15,2),
  freight_estimated DECIMAL(15,2),
  freight_actual DECIMAL(15,2),
  total_amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'realized', 'awaiting', 'partial', 'complete', 'cancelled')),
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_store_id ON purchases(store_id);
CREATE INDEX idx_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_status ON purchases(status);
CREATE INDEX idx_order_number ON purchases(order_number);
```

### 5. purchase_items
```sql
CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  reference VARCHAR(100),
  color VARCHAR(100),
  size VARCHAR(20),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  discount DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. deliveries
```sql
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  invoice_number VARCHAR(50),
  quantity_received INTEGER NOT NULL,
  freight_actual DECIMAL(15,2),
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_purchase ON deliveries(purchase_id);
```

### 7. installments
```sql
CREATE TABLE installments (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'due_today', 'due_soon', 'overdue', 'paid')),
  paid_at TIMESTAMP,
  payment_method VARCHAR(100),
  bank_account VARCHAR(255),
  proof_file VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_due_date ON installments(due_date);
CREATE INDEX idx_installment_status ON installments(status);
CREATE INDEX idx_installment_purchase ON installments(purchase_id);
```

### 8. payments
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  installment_id INTEGER NOT NULL REFERENCES installments(id),
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  bank_account VARCHAR(255),
  proof_file VARCHAR(255),
  notes TEXT,
  paid_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_date ON payments(payment_date);
```

### 9. attachments
```sql
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id),
  delivery_id INTEGER REFERENCES deliveries(id),
  installment_id INTEGER REFERENCES installments(id),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. audit_logs
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INTEGER NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

## Índices Estratégicos

Todos os índices estão definidos acima em suas respectivas tabelas para otimizar:
- Buscas por data
- Filtros por status
- Filtros por loja e fornecedor
- Queries de auditoria
