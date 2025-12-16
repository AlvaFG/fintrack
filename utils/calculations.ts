import { Expense, Category } from '../types';

/**
 * Calcula el total de gastos para un período específico
 */
export function calculateTotal(
  expenses: Expense[],
  currency: 'ARS' | 'USD',
  startDate?: Date,
  endDate?: Date
): number {
  return expenses
    .filter((e) => {
      if (e.currency !== currency) return false;
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calcula el total de gastos del mes actual
 */
export function calculateMonthlyTotal(expenses: Expense[], currency: 'ARS' | 'USD'): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return calculateTotal(expenses, currency, startOfMonth, endOfMonth);
}

/**
 * Calcula el total de gastos de la última semana
 */
export function calculateWeeklyTotal(expenses: Expense[], currency: 'ARS' | 'USD'): number {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return calculateTotal(expenses, currency, weekAgo);
}

/**
 * Agrupa gastos por mes para gráficos
 */
export function groupExpensesByMonth(expenses: Expense[], months: number = 6) {
  const monthData: { name: string; ARS: number; USD: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('es-AR', { month: 'short' });
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    monthData.push({
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ARS: calculateTotal(expenses, 'ARS', startOfMonth, endOfMonth),
      USD: calculateTotal(expenses, 'USD', startOfMonth, endOfMonth),
    });
  }

  return monthData;
}

/**
 * Calcula distribución de gastos por categoría
 */
export function calculateCategoryDistribution(
  expenses: Expense[],
  categories: Category[],
  currency: 'ARS' | 'USD'
) {
  const distribution = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.categoryId === cat.id && e.currency === currency)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      name: cat.name,
      value: total,
      color: cat.color,
    };
  });

  return distribution.filter((d) => d.value > 0);
}

/**
 * Encuentra la categoría con más gastos
 */
export function getTopCategory(expenses: Expense[], categories: Category[]) {
  const categoryTotals = categories.map((cat) => ({
    category: cat,
    total: expenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  categoryTotals.sort((a, b) => b.total - a.total);
  return categoryTotals[0] || null;
}

/**
 * Calcula el porcentaje de cambio entre dos períodos
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Formatea números como moneda
 */
export function formatCurrency(amount: number, currency: 'ARS' | 'USD'): string {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
