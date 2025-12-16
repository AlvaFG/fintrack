# Configuración MCP para FinTrack Pro

## Servidor MCP Implementado

Tu proyecto ahora incluye un servidor MCP personalizado que se integra con Supabase para gestionar gastos y categorías.

## Configuración

### 1. Variables de Entorno

Actualiza [.env.local](.env.local) con tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 2. Configuración en Claude Desktop

Para usar este servidor MCP con Claude Desktop, agrega lo siguiente a tu archivo de configuración de Claude (`claude_desktop_config.json`):

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fintrack-pro": {
      "command": "node",
      "args": ["mcp.js"],
      "cwd": "c:\\Users\\alvar\\Downloads\\fintrack-pro",
      "env": {
        "SUPABASE_URL": "https://tu-proyecto.supabase.co",
        "SUPABASE_ANON_KEY": "tu_clave_anon_aqui"
      }
    }
  }
}
```

### 3. Crear Tablas en Supabase

Ejecuta este SQL en tu proyecto de Supabase:

```sql
-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  category_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
```

## Herramientas Disponibles

El servidor MCP proporciona las siguientes herramientas:

### 📊 `get_expenses`
Obtiene gastos con filtros opcionales.
```javascript
// Parámetros:
{
  limit: 100,          // Opcional: número de gastos
  category: "uuid"     // Opcional: filtrar por categoría
}
```

### ➕ `add_expense`
Agrega un nuevo gasto.
```javascript
// Parámetros:
{
  amount: 1500.50,
  currency: "ARS",
  categoryId: "uuid",
  description: "Compra de supermercado",
  notes: "Opcional"
}
```

### 🏷️ `get_categories`
Obtiene todas las categorías disponibles.

### 📈 `get_monthly_summary`
Resumen de gastos por mes.
```javascript
// Parámetros:
{
  year: 2025,    // Opcional: año
  month: 12      // Opcional: mes (1-12)
}
```

### 🗑️ `delete_expense`
Elimina un gasto por ID.
```javascript
// Parámetros:
{
  id: "uuid"
}
```

## Recursos Disponibles

- `fintrack://expenses/recent` - Últimos 20 gastos
- `fintrack://categories/all` - Todas las categorías

## Probar el Servidor

Ejecuta el servidor localmente:

```bash
npm run mcp
```

## Uso en Claude Desktop

Una vez configurado, podrás usar comandos naturales en Claude Desktop como:

- "Muéstrame mis gastos recientes"
- "Agrega un gasto de $5000 ARS en comida"
- "Dame un resumen de gastos de diciembre"
- "Lista todas las categorías"

Claude automáticamente usará las herramientas MCP para interactuar con tu base de datos de Supabase.
