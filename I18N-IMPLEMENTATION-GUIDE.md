# Guía de Implementación de i18n (Internacionalización)

## ✅ Completado

1. **Dependencias instaladas**: i18next, react-i18next, i18next-browser-languagedetector
2. **Configuración de i18n**: `/i18n/config.ts`
3. **Archivos de traducción creados**:
   - `/i18n/locales/en.json` (Inglés)
   - `/i18n/locales/es.json` (Español)
4. **Componente selector de idioma**: `/components/LanguageSwitcher.tsx`
5. **Layout actualizado**: Incluye selector de idioma y traducciones en navegación
6. **Index.tsx actualizado**: Importa configuración de i18n
7. **Traducciones parciales aplicadas**: Dashboard y componentes principales

## 📋 Pasos para Completar la Implementación

### 1. Importar useTranslation en cada página

En cada archivo de página, agregar al inicio:

```typescript
import { useTranslation } from 'react-i18next';

// Dentro del componente:
const { t } = useTranslation();
```

### 2. Páginas que Faltan Actualizar

#### ExpensesPage.tsx
Ya tiene el import, falta reemplazar los textos:

```typescript
// Ejemplos de reemplazos:
"Gastos" → {t('expenses.title')}
"Agregar Gasto" → {t('expenses.addExpense')}
"Buscar gastos..." → {t('expenses.searchPlaceholder')}
"Guardar" → {t('common.save')}
"Cancelar" → {t('common.cancel')}
```

#### RecurringPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Gastos Recurrentes" → {t('recurring.title')}
"Agregar Recurrente" → {t('recurring.addRecurring')}
"Frecuencia" → {t('recurring.frequency')}
"Próximo Pago" → {t('recurring.nextPayment')}
```

#### StatsPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Estadísticas" → {t('stats.title')}
"Variación Mensual" → {t('stats.monthlyVariation')}
"Tendencias por Categoría" → {t('stats.categoryTrends')}
```

#### CategoriesPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Categorías" → {t('categories.title')}
"Agregar Categoría" → {t('categories.addCategory')}
"Nombre de la Categoría" → {t('categories.categoryName')}
```

#### SettingsPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Configuración" → {t('settings.title')}
"Moneda" → {t('settings.currency')}
"Idioma" → {t('settings.language')}
"Tema" → {t('settings.theme')}
```

#### ExportPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Exportar Datos" → {t('export.title')}
"Exportar a CSV" → {t('export.exportToCSV')}
"Seleccionar Formato" → {t('export.selectFormat')}
```

#### AuthPage.tsx
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Reemplazos:
"Iniciar Sesión" → {t('auth.signIn')}
"Registrarse" → {t('auth.signUp')}
"Correo Electrónico" → {t('auth.email')}
"Contraseña" → {t('auth.password')}
```

### 3. Traducción de Frecuencias (RecurringPage)

Reemplazar el objeto `frequencyLabels`:

```typescript
const frequencyLabels: Record<RecurringFrequency, string> = {
  daily: t('recurring.frequencies.daily'),
  weekly: t('recurring.frequencies.weekly'),
  biweekly: t('recurring.frequencies.biweekly'),
  monthly: t('recurring.frequencies.monthly'),
  bimonthly: t('recurring.frequencies.bimonthly'),
  quarterly: t('recurring.frequencies.quarterly'),
  semiannual: t('recurring.frequencies.semiannual'),
  annual: t('recurring.frequencies.annual'),
};
```

### 4. Traducción de Nombres de Días y Meses

En `utils/analytics.ts`, actualizar las funciones:

```typescript
export const getDayName = (dayIndex: number, t: any): string => {
  const days = [
    t('stats.days.monday'),
    t('stats.days.tuesday'),
    t('stats.days.wednesday'),
    t('stats.days.thursday'),
    t('stats.days.friday'),
    t('stats.days.saturday'),
    t('stats.days.sunday')
  ];
  return days[dayIndex] || '';
};

export const getMonthName = (monthIndex: number, t: any): string => {
  const months = [
    t('stats.months.january'),
    t('stats.months.february'),
    t('stats.months.march'),
    t('stats.months.april'),
    t('stats.months.may'),
    t('stats.months.june'),
    t('stats.months.july'),
    t('stats.months.august'),
    t('stats.months.september'),
    t('stats.months.october'),
    t('stats.months.november'),
    t('stats.months.december')
  ];
  return months[monthIndex] || '';
};
```

### 5. Traducción de Iconos de Categorías

En `CategoriesPage.tsx`, actualizar el array `AVAILABLE_ICONS`:

```typescript
const AVAILABLE_ICONS = [
  { icon: 'ShoppingCart', name: t('categories.icons.shopping'), component: ShoppingCart },
  { icon: 'Car', name: t('categories.icons.transport'), component: Car },
  { icon: 'Home', name: t('categories.icons.home'), component: Home },
  // ... resto de iconos
];
```

### 6. Mensajes de Toast/Notificaciones

Si usas toast notifications, actualizar con:

```typescript
toast.success(t('messages.expenseAdded'));
toast.error(t('messages.errorOccurred'));
toast.success(t('messages.settingsUpdated'));
```

## 🔧 Utilidades Helper

### Hook personalizado (Opcional)

Crear `/hooks/useI18n.ts`:

```typescript
import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: 'en' | 'es') => {
    i18n.changeLanguage(lang);
  };

  const currentLanguage = i18n.language;

  return {
    t,
    changeLanguage,
    currentLanguage,
    isSpanish: currentLanguage === 'es',
    isEnglish: currentLanguage === 'en'
  };
};
```

## 📝 Checklist de Implementación

- [x] Instalar dependencias
- [x] Crear archivos de configuración
- [x] Crear archivos de traducción (EN/ES)
- [x] Configurar i18n en index.tsx
- [x] Crear componente LanguageSwitcher
- [x] Actualizar Layout.tsx
- [ ] Actualizar Dashboard.tsx (parcialmente completado)
- [ ] Actualizar ExpensesPage.tsx
- [ ] Actualizar RecurringPage.tsx
- [ ] Actualizar StatsPage.tsx
- [ ] Actualizar CategoriesPage.tsx
- [ ] Actualizar SettingsPage.tsx
- [ ] Actualizar ExportPage.tsx
- [ ] Actualizar AuthPage.tsx
- [ ] Actualizar utils/analytics.ts
- [ ] Actualizar mensajes de toast
- [ ] Testear cambio de idioma en todas las páginas

## 🚀 Comando para Compilar y Probar

```bash
npm run dev
```

El idioma se detectará automáticamente del navegador o del localStorage.

## 📌 Notas Importantes

1. **Persistencia**: El idioma seleccionado se guarda automáticamente en localStorage
2. **Detección**: La primera vez detecta el idioma del navegador
3. **Fallback**: Si no encuentra traducción, usa inglés por defecto
4. **Formato**: Usar interpolación para valores dinámicos:
   ```typescript
   t('welcome', { name: userName })
   // En JSON: "welcome": "Welcome, {{name}}!"
   ```

## 🌐 Agregar Más Idiomas (Futuro)

Para agregar más idiomas (ej: portugués):

1. Crear `/i18n/locales/pt.json`
2. Actualizar `/i18n/config.ts`:
   ```typescript
   import pt from './locales/pt.json';
   
   resources: {
     en: { translation: en },
     es: { translation: es },
     pt: { translation: pt }
   },
   supportedLngs: ['en', 'es', 'pt']
   ```
3. Actualizar LanguageSwitcher para mostrar más opciones

## 🎨 Mejoras de UX

- El selector de idioma está en el sidebar
- Muestra el idioma actual (EN/ES)
- Cambio instantáneo sin recargar página
- Se mantiene entre sesiones
