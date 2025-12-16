/**
 * Script de utilidad para ayudar con traducciones masivas
 * Este archivo muestra patrones de reemplazo comunes
 */

// Patrón 1: Textos estáticos simples
// Antes: <h1>Dashboard</h1>
// Después: <h1>{t('dashboard.title')}</h1>

// Patrón 2: Atributos placeholder
// Antes: placeholder="Buscar..."
// Después: placeholder={t('common.search')}

// Patrón 3: Botones
// Antes: <Button>Guardar</Button>
// Después: <Button>{t('common.save')}</Button>

// Patrón 4: Textos con variables
// Antes: `Total: ${amount}`
// Después: t('dashboard.total', { amount })
// JSON: "total": "Total: {{amount}}"

// Patrón 5: Plurales
// JSON:
// "items": "{{count}} item",
// "items_plural": "{{count}} items"
// Uso: t('items', { count: 5 })

// Función auxiliar para formatear moneda
export const formatCurrency = (amount: number, currency: string, locale: string): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Función auxiliar para fechas
export const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Hook personalizado para i18n con helpers
export const useI18nHelpers = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? 'es-AR' : 'en-US';

  return {
    t,
    locale,
    formatCurrency: (amount: number, currency: string) => formatCurrency(amount, currency, locale),
    formatDate: (date: Date) => formatDate(date, locale),
    isSpanish: i18n.language === 'es'
  };
};
