-- Crear tabla de gastos recurrentes
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_payment_date DATE NOT NULL,
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios gastos recurrentes
CREATE POLICY "Users can view own recurring expenses"
  ON recurring_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios gastos recurrentes
CREATE POLICY "Users can insert own recurring expenses"
  ON recurring_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios gastos recurrentes
CREATE POLICY "Users can update own recurring expenses"
  ON recurring_expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios gastos recurrentes
CREATE POLICY "Users can delete own recurring expenses"
  ON recurring_expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_category_id ON recurring_expenses(category_id);
CREATE INDEX idx_recurring_expenses_next_payment ON recurring_expenses(next_payment_date);
CREATE INDEX idx_recurring_expenses_active ON recurring_expenses(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_recurring_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_recurring_expenses_timestamp ON recurring_expenses;
CREATE TRIGGER update_recurring_expenses_timestamp
  BEFORE UPDATE ON recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_expenses_updated_at();
