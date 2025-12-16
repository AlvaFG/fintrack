# Plan de Mejoras UI - FinTrack Pro

## Estado: En Progreso
Fecha: 15/12/2025

---

## 📋 Tareas Pendientes

### 1. Reorganización del Layout Sidebar
**Estado:** ✅ Completado

**Objetivo:**
- Mover el nombre de usuario y email a la parte inferior del panel lateral
- Reorganizar estructura para mejor UX

**Archivos a modificar:**
- `components/Layout.tsx`

**Detalles:**
- Usuario y email deben estar al final del sidebar
- Mantener accesibilidad y diseño limpio

---

### 2. Botón Cerrar Sesión - Nuevo Diseño
**Estado:** ✅ Completado

**Objetivo:**
- Cambiar el botón "Cerrar Sesión" de rojo a gris
- Agregar icono de puerta con flecha (`DoorOpen` o `LogOut` de Lucide)

**Archivos a modificar:**
- `components/Layout.tsx`

**Detalles:**
- Color: gris (#6B7280 o similar)
- Icono: puerta con flecha al lado
- Ubicar junto al usuario al final del sidebar

---

### 3. Sistema de Temas Completo
**Estado:** ✅ Completado

**Objetivo:**
- Implementar modo claro, oscuro y sistema
- Sincronizar con configuración de usuario en Settings
- Aplicar tema a toda la aplicación

**Archivos a modificar:**
- `App.tsx` - Context para tema
- `index.html` - Clase dark en html
- Todas las páginas - Clases dark: condicionales

**Detalles:**
- Usar `prefers-color-scheme` para modo sistema
- Guardar preferencia en settings
- Aplicar clases `dark:` de Tailwind
- Toggle en SettingsPage ya existe, solo falta implementar lógica

---

### 4. Categorías - Reemplazar Emojis por Iconos Lucide
**Estado:** ✅ Completado

**Objetivo:**
- Eliminar todos los emojis (🍔, 🚗, etc.)
- Implementar iconos de Lucide React
- Mantener los 20 iconos disponibles

**Archivos a modificar:**
- `pages/CategoriesPage.tsx`
- `types.ts` (si es necesario ajustar tipo de icon)

**Nuevos iconos sugeridos:**
- ShoppingCart (compras)
- Car (transporte)
- Home (hogar)
- Utensils (comida)
- Heart (salud)
- Shirt (ropa)
- Gamepad (entretenimiento)
- GraduationCap (educación)
- Plane (viajes)
- Gift (regalos)
- Wrench (herramientas)
- Coffee (café/restaurantes)
- Phone (tecnología)
- Dumbbell (deporte)
- Music (música)
- Film (cine)
- Book (libros)
- Briefcase (trabajo)
- Wallet (finanzas)
- MoreHorizontal (otros)

---

### 5. Modal Nueva Categoría - Mejorar Diseño
**Estado:** ✅ Completado

**Objetivo:**
- Mejorar el diseño del modal "Nueva Categoría"
- Mejor distribución de iconos y colores
- UI más profesional y organizada

**Archivos a modificar:**
- `pages/CategoriesPage.tsx`

**Mejoras específicas:**
- Grid de iconos más espaciado
- Paleta de colores con mejor preview
- Labels más claros
- Validación visual mejorada
- Animaciones suaves

---

### 6. Centrar Paneles en Categorías
**Estado:** ✅ Completado

**Objetivo:**
- Centrar los 3 paneles principales (Total Categorías, Gasto Total, Promedio)
- Alinear contenido dentro de cada panel

**Archivos a modificar:**
- `pages/CategoriesPage.tsx`

**Detalles:**
- Usar flexbox/grid para centrado perfecto
- Alinear iconos y texto verticalmente
- Asegurar responsive design

---

### 7. Centrar Paneles en Estadísticas
**Estado:** ✅ Completado

**Objetivo:**
- Centrar los 4 paneles principales (Variación Mensual, Promedio Diario, Proyección, Mayor Crecimiento)
- Alinear contenido dentro de cada panel

**Archivos a modificar:**
- `pages/StatsPage.tsx`

**Detalles:**
- Usar flexbox/grid para centrado perfecto
- Alinear iconos y texto verticalmente
- Asegurar responsive design
- Mantener consistencia con otras páginas

---

## 🎯 Prioridad de Implementación

1. **Alta prioridad:**
   - Tarea 1: Layout Sidebar
   - Tarea 2: Botón Cerrar Sesión
   - Tarea 4: Iconos Lucide en Categorías

2. **Media prioridad:**
   - Tarea 5: Diseño Modal
   - Tarea 6: Centrado Categorías
   - Tarea 7: Centrado Estadísticas

3. **Baja prioridad:**
   - Tarea 3: Sistema de Temas (más complejo, requiere más trabajo)

---

## 📝 Notas de Implementación

- Mantener consistencia de diseño en todas las páginas
- Usar componentes reutilizables cuando sea posible
- Testear en diferentes tamaños de pantalla (responsive)
- Verificar accesibilidad (contraste de colores, etc.)
- No romper funcionalidad existente

---

## ✅ Completado

- ✅ Fase 1: Categorías (CRUD completo)
- ✅ Fase 2: Settings (4 tabs)
- ✅ Fase 3: Estadísticas (3 tabs)
- ✅ Fase 4: Gastos Recurrentes (completo)
- ✅ Fase 5: Exportar Datos (CSV)
