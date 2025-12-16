-- Migración de tabla de categorías
-- Primero, eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Deshabilitar RLS temporalmente
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Agregar la columna user_id si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Obtener el primer usuario para asignar las categorías existentes
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Obtener el primer usuario de la tabla auth.users
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Si existe un usuario, actualizar las categorías sin user_id
  IF first_user_id IS NOT NULL THEN
    UPDATE categories SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Ahora hacer la columna NOT NULL y agregar la foreign key
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;

-- Agregar la foreign key si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'categories_user_id_fkey' AND table_name = 'categories'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Agregar created_at si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Agregar updated_at si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias categorías
CREATE POLICY "Users can view own categories"
  ON categories
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias categorías
CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias categorías
CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias categorías
CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento (si no existen)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_user_id'
  ) THEN
    CREATE INDEX idx_categories_user_id ON categories(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_name'
  ) THEN
    CREATE INDEX idx_categories_name ON categories(name);
  END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_categories_timestamp ON categories;
CREATE TRIGGER update_categories_timestamp
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Insertar categorías predeterminadas para cada usuario (opcional)
-- Nota: Esto se puede ejecutar cuando un nuevo usuario se registra
-- o puedes crear un trigger que lo haga automáticamente

-- Función para crear categorías predeterminadas para un nuevo usuario
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon, is_preset)
  VALUES
    (NEW.id, 'Comida', '#E57373', '🍔', true),
    (NEW.id, 'Transporte', '#64B5F6', '🚗', true),
    (NEW.id, 'Salud', '#81C784', '⚕️', true),
    (NEW.id, 'Entretenimiento', '#FFD54F', '🎮', true),
    (NEW.id, 'Servicios', '#9575CD', '💡', true),
    (NEW.id, 'Educación', '#4FC3F7', '📚', true),
    (NEW.id, 'Compras', '#F06292', '🛒', true),
    (NEW.id, 'Vivienda', '#A1887F', '🏠', true),
    (NEW.id, 'Otros', '#90A4AE', '📦', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear categorías predeterminadas cuando se registra un nuevo usuario
DROP TRIGGER IF EXISTS create_user_default_categories ON auth.users;
CREATE TRIGGER create_user_default_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
