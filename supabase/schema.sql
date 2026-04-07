-- ============================================================
-- NORIPAY — Schema Supabase
-- Execute este script no SQL Editor do Supabase:
-- Supabase Dashboard → SQL Editor → New Query → Cole e rode
-- ============================================================

-- ============================================================
-- 1. ACCOUNTS (Contas e Cartões)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  institution    TEXT,
  type           TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'wallet', 'credit')),
  balance        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  -- Campos exclusivos de cartão de crédito
  "limit"        NUMERIC(15, 2),
  used           NUMERIC(15, 2) DEFAULT 0,
  closing_day    SMALLINT CHECK (closing_day BETWEEN 1 AND 31),
  due_day        SMALLINT CHECK (due_day BETWEEN 1 AND 31),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TRANSACTIONS (Transações)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  amount         NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  type           TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category       TEXT,
  category_icon  TEXT,
  account        TEXT,
  date           DATE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  recurrent      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. GOALS (Metas Financeiras)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  target_amount  NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline       DATE NOT NULL,
  color          TEXT NOT NULL DEFAULT '#818cf8',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. BILLS (Contas a Pagar)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bills (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  amount         NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  due_date       DATE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  recurrent      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. TRIGGERS — updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON public.accounts;
CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.goals;
CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_bills_updated_at ON public.bills;
CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- Cada usuário só enxerga e edita os próprios dados.
-- ============================================================
ALTER TABLE public.accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills        ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS
DROP POLICY IF EXISTS "accounts: select own" ON public.accounts;
DROP POLICY IF EXISTS "accounts: insert own" ON public.accounts;
DROP POLICY IF EXISTS "accounts: update own" ON public.accounts;
DROP POLICY IF EXISTS "accounts: delete own" ON public.accounts;
CREATE POLICY "accounts: select own"  ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts: insert own"  ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts: update own"  ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts: delete own"  ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS
DROP POLICY IF EXISTS "transactions: select own" ON public.transactions;
DROP POLICY IF EXISTS "transactions: insert own" ON public.transactions;
DROP POLICY IF EXISTS "transactions: update own" ON public.transactions;
DROP POLICY IF EXISTS "transactions: delete own" ON public.transactions;
CREATE POLICY "transactions: select own"  ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions: insert own"  ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions: update own"  ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions: delete own"  ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- GOALS
DROP POLICY IF EXISTS "goals: select own" ON public.goals;
DROP POLICY IF EXISTS "goals: insert own" ON public.goals;
DROP POLICY IF EXISTS "goals: update own" ON public.goals;
DROP POLICY IF EXISTS "goals: delete own" ON public.goals;
CREATE POLICY "goals: select own"  ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals: insert own"  ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals: update own"  ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals: delete own"  ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- BILLS
DROP POLICY IF EXISTS "bills: select own" ON public.bills;
DROP POLICY IF EXISTS "bills: insert own" ON public.bills;
DROP POLICY IF EXISTS "bills: update own" ON public.bills;
DROP POLICY IF EXISTS "bills: delete own" ON public.bills;
CREATE POLICY "bills: select own"  ON public.bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bills: insert own"  ON public.bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bills: update own"  ON public.bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bills: delete own"  ON public.bills FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 7. ÍNDICES — performance nas queries mais comuns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date   ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type   ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON public.transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_accounts_user            ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_deadline      ON public.goals(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_bills_user_due_date      ON public.bills(user_id, due_date);
