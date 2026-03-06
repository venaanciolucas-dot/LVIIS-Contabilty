-- Habilita extensão pgcrypto para gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Payment Methods Table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- 3. Recurrences Table
CREATE TABLE recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency TEXT CHECK (frequency IN ('daily','weekly','monthly','yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_date DATE NOT NULL,
  active BOOLEAN DEFAULT true
);

-- 4. Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category_id UUID REFERENCES categories(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  recurrence_id UUID REFERENCES recurrences(id),
  source TEXT DEFAULT 'manual',
  external_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES - WORKSPACE COMPARTILHADO INTERNO
-- -----------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política simples: Se o usuário estiver logado ("authenticated"), ele pode fazer tudo (ALL)
-- em todas as tabelas. Os dados são globais no workspace da empresa.

CREATE POLICY "Libera acesso total a Categories para auth" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Libera acesso total a PaymentMethods para auth" ON payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Libera acesso total a Recurrences para auth" ON recurrences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Libera acesso total a Transactions para auth" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Extra: Payment Methods precisam ser lidos também (caso não queira atrelar a auth.users pra ler dropdown de login se tiver), mas vamos manter protegido.

-- -----------------------------------------------------------------------------
-- DB SEED (Carga inicial das formas de pagamento)
-- -----------------------------------------------------------------------------
INSERT INTO payment_methods (name) VALUES 
('PIX'), ('Cartão de Crédito'), ('Cartão de Débito'), 
('Dinheiro'), ('TED/DOC'), ('Boleto'), ('Outro');
