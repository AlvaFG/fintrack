# 📋 Plan de Desarrollo - FinTrack Pro
*Fecha de creación: 15 de diciembre de 2025*

---

## 📊 Estado Actual

### ✅ Páginas Implementadas
- **Dashboard**: Resumen de gastos, gráficos y estadísticas básicas
- **Gastos**: CRUD completo de gastos con filtros y búsqueda
- **OCR Ticket**: Escaneo de tickets y extracción de datos
- **Categorías**: ✨ Gestión completa de categorías (CRUD)
- **Configuración**: ✨ Preferencias de usuario y presupuesto

### ❌ Páginas Pendientes
- Recurrentes
- Estadísticas
- Exportar

---

## 🎯 Orden de Implementación

### **Fase 1: Gestión de Categorías** 🏷️
**Prioridad:** Alta (Base para otras funcionalidades)

#### Funcionalidades
- **Lista de categorías**
  - Ver todas las categorías existentes
  - Mostrar icono y color de cada categoría
  - Estadísticas por categoría (total gastado, número de gastos, promedio)
  - Porcentaje del gasto total

- **CRUD de categorías**
  - ✨ Crear nueva categoría
    - Nombre
    - Icono (selector visual)
    - Color (picker)
  - ✏️ Editar categoría existente
  - 🗑️ Eliminar categoría
    - Validación: no permitir eliminar si tiene gastos asociados
    - O reasignar gastos a otra categoría antes de eliminar

- **Categorías predeterminadas**
  - Asegurar que existan categorías básicas al inicio:
    - 🍔 Restaurantes
    - 🚗 Transporte
    - 🎮 Entretenimiento
    - 🏥 Salud
    - 🏠 Hogar
    - 🛒 Supermercado
    - 💊 Farmacia
    - 👕 Ropa
    - 📱 Tecnología
    - 🎓 Educación
    - 💡 Servicios
    - 🎁 Regalos
    - ✈️ Viajes
    - 🔧 Otros

#### Archivos a crear/modificar
- `pages/CategoriesPage.tsx` (nuevo)
- Actualizar rutas en `App.tsx`
- Posiblemente agregar hooks o utilidades para gestión de categorías

---

### **Fase 2: Configuración de Usuario** ⚙️
**Prioridad:** Alta (Personalización y preferencias)

#### Funcionalidades

- **Perfil de usuario**
  - 👤 Ver y editar nombre completo
  - 🖼️ Cambiar avatar/foto de perfil
  - 🔒 Cambiar contraseña
  - 📧 Mostrar email (solo lectura)

- **Preferencias generales**
  - 💰 Moneda principal
    - USD, EUR, MXN, ARS, COP, CLP, etc.
    - Símbolo de la moneda
  - 📅 Formato de fecha
    - DD/MM/YYYY
    - MM/DD/YYYY
    - YYYY-MM-DD
  - 🌐 Idioma (Español/Inglés)
  - 🎨 Tema (Claro/Oscuro/Sistema)

- **Presupuesto mensual**
  - 💵 Establecer límite de gasto mensual
  - 🚨 Alertas al alcanzar porcentajes:
    - 50%, 75%, 90%, 100%
  - 📊 Presupuesto por categoría (opcional)

- **Notificaciones** (opcional para futuro)
  - 🔔 Alertas de gastos recurrentes próximos
  - 📩 Resumen semanal/mensual por email

- **Gestión de datos**
  - 📥 Exportar todos los datos
  - 🗑️ Eliminar todos los datos (con confirmación)

#### Archivos a crear/modificar
- `pages/SettingsPage.tsx` (nuevo)
- Actualizar rutas en `App.tsx`
- Posiblemente crear tabla de configuración en Supabase
- Hook `useSettings.ts` para gestionar preferencias

---

### **Fase 3: Estadísticas Avanzadas** 📈
**Prioridad:** Media-Alta (Gran valor para el usuario)

#### Funcionalidades

- **Gráficos avanzados**
  - 📊 Tendencias por categoría (gráfico multi-línea)
  - 📉 Comparativa mes a mes (barras agrupadas)
  - 📆 Evolución anual (vista consolidada)
  - 📍 Promedio diario/semanal/mensual

- **Métricas e insights**
  - 💰 Gasto promedio por categoría
  - 📅 Día de la semana con más gastos
  - 🏆 Top 5 gastos del mes
  - 📈 Categoría con mayor crecimiento
  - 📉 Categoría con mayor reducción
  - 🎯 Proyección de gasto del mes actual

- **Análisis comparativo**
  - 🔄 Variación % vs mes anterior
  - 📊 Variación % vs mismo mes año anterior
  - 📉 Tendencia general (creciente/decreciente)

- **Filtros personalizados**
  - 📅 Rango de fechas personalizado
  - 🏷️ Por categoría específica
  - 💵 Por moneda
  - 📊 Agrupación (día, semana, mes, año)

#### Archivos a crear/modificar
- `pages/StatsPage.tsx` (nuevo)
- `utils/analytics.ts` (nuevo - funciones de análisis)
- Actualizar rutas en `App.tsx`

---

### **Fase 4: Gastos Recurrentes** 🔄
**Prioridad:** Media (Muy útil para usuarios)

#### Funcionalidades

- **Lista de gastos recurrentes**
  - Ver todas las suscripciones y pagos fijos
  - Estado: Activo/Pausado/Vencido
  - Próximo pago estimado
  - Total mensual de recurrentes activos

- **Crear gasto recurrente**
  - 📝 Descripción
  - 💰 Monto
  - 🏷️ Categoría
  - 🔄 Frecuencia:
    - Diaria
    - Semanal
    - Quincenal
    - Mensual
    - Bimestral
    - Trimestral
    - Semestral
    - Anual
  - 📅 Día de cobro/vencimiento
  - 📅 Fecha de inicio
  - 📅 Fecha de fin (opcional)

- **Gestión de recurrentes**
  - ✏️ Editar monto o frecuencia
  - ⏸️ Pausar/Reactivar
  - 🗑️ Eliminar
  - 💳 Generar gasto manual desde recurrente

- **Calendario y alertas**
  - 📅 Vista de calendario con próximos pagos
  - 🔔 Notificación 3 días antes del pago
  - 📊 Dashboard widget: próximos 5 vencimientos

- **Generación automática** (opcional avanzado)
  - Crear gastos automáticamente en la fecha programada
  - Historial de gastos generados

#### Archivos a crear/modificar
- `pages/RecurringPage.tsx` (nuevo)
- `types.ts` (agregar tipo RecurringExpense)
- `hooks/useRecurring.ts` (nuevo)
- Crear tabla `recurring_expenses` en Supabase
- Actualizar rutas en `App.tsx`

---

### **Fase 5: Exportar Datos** 📥
**Prioridad:** Media (Funcionalidad complementaria)

#### Funcionalidades

- **Selector de rango de fechas**
  - 📅 Fecha inicio
  - 📅 Fecha fin
  - 🎯 Shortcuts:
    - Este mes
    - Mes pasado
    - Últimos 3 meses
    - Últimos 6 meses
    - Este año
    - Todo

- **Generar exportación**
  - Botón "Generar Exportación"
  - Formato: CSV (compatible con Excel)
  - Nombre del archivo: `fintrack-gastos-{fechaInicio}-{fechaFin}.csv`
  - Codificación: UTF-8 con BOM (para Excel en español)

- **Estructura del archivo CSV**
  
  **Columnas en este orden:**
  1. **Fecha** (formato: DD/MM/YYYY)
  2. **Mes** (formato: "Enero 2025" o "01-2025")
  3. **Categoría** (nombre de la categoría)
  4. **Descripción** (puede estar vacía)
  5. **Monto** (número decimal con 2 decimales)
  6. **Moneda** (USD, EUR, MXN, etc.)
  7. **Día de la semana** (Lunes, Martes, etc.)
  8. **Tipo** (Regular/Recurrente)
  9. **ID** (para referencia)

- **Lista de exportaciones generadas**
  - 📋 Historial de exportaciones
  - Mostrar:
    - Nombre del archivo
    - Rango de fechas
    - Cantidad de registros
    - Fecha de generación
    - Tamaño del archivo
  - 📥 Botón de descarga por cada archivo
  - 🗑️ Eliminar exportación

- **Almacenamiento**
  - Guardar archivos en Supabase Storage
  - O generar dinámicamente al descargar (sin guardar)

#### Archivos a crear/modificar
- `pages/ExportPage.tsx` (nuevo)
- `utils/export.ts` (nuevo - funciones de exportación CSV)
- Actualizar rutas en `App.tsx`
- Posible tabla `exports_history` en Supabase (opcional)

---

## 📦 Estructura de Archivos Final

```
fintrack-pro/
├── pages/
│   ├── Dashboard.tsx          ✅
│   ├── ExpensesPage.tsx       ✅
│   ├── OCRPage.tsx            ✅
│   ├── CategoriesPage.tsx     🆕 Fase 1
│   ├── SettingsPage.tsx       🆕 Fase 2
│   ├── StatsPage.tsx          🆕 Fase 3
│   ├── RecurringPage.tsx      🆕 Fase 4
│   └── ExportPage.tsx         🆕 Fase 5
├── hooks/
│   ├── useAuth.ts             ✅
│   ├── useExpenses.ts         ✅
│   ├── useCategories.ts       ✅
│   ├── useRecurring.ts        🆕 Fase 4
│   └── useSettings.ts         🆕 Fase 2
├── utils/
│   ├── calculations.ts        ✅
│   ├── analytics.ts           🆕 Fase 3
│   └── export.ts              🆕 Fase 5
└── types.ts                   📝 Actualizar
```

---

## 🗃️ Cambios en Base de Datos (Supabase)

### Nuevas Tablas

#### `recurring_expenses` (Fase 4)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- description (text)
- amount (numeric)
- currency (text)
- category_id (uuid, foreign key)
- frequency (text) -- daily, weekly, biweekly, monthly, etc.
- start_date (date)
- end_date (date, nullable)
- next_payment_date (date)
- day_of_month (integer, nullable)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `user_settings` (Fase 2)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, unique)
- currency (text, default 'USD')
- date_format (text, default 'DD/MM/YYYY')
- language (text, default 'es')
- theme (text, default 'light')
- monthly_budget (numeric, nullable)
- budget_alerts (jsonb) -- {50: true, 75: true, 90: true, 100: true}
- created_at (timestamp)
- updated_at (timestamp)
```

#### `exports_history` (Fase 5 - Opcional)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- filename (text)
- start_date (date)
- end_date (date)
- record_count (integer)
- file_size (integer)
- file_url (text)
- created_at (timestamp)
```

---

## 🚀 Próximos Pasos

1. ✅ **Revisar y aprobar este plan**
2. 🏷️ **Comenzar Fase 1: Categorías**
3. ⚙️ **Continuar con Fase 2: Configuración**
4. 📈 **Seguir orden establecido**

---

## 📝 Notas

- Cada fase es independiente y funcional
- Se puede modificar el orden según prioridades
- Las fases 3, 4 y 5 pueden desarrollarse en paralelo si es necesario
- Mantener consistencia en el diseño UI/UX con las páginas existentes
- Usar los mismos componentes de shadcn/ui

---

**¿Listo para comenzar con la Fase 1: Categorías?** 🚀
