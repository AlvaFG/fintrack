import { Expense, Category, Currency } from '../types';

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(date: Date): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[date.getMonth()];
}

/**
 * Calcula tendencias por categoría para un rango de tiempo
 */
export function getCategoryTrends(
  expenses: Expense[],
  categories: Category[],
  months: number = 6
): { month: string; [categoryId: string]: number | string }[] {
  const now = new Date();
  const trends: { month: string; [categoryId: string]: number | string }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    
    const monthName = `${getMonthName(monthDate)} ${monthDate.getFullYear()}`;
    const monthData: { month: string; [categoryId: string]: number | string } = { month: monthName };

    categories.forEach(category => {
      const categoryExpenses = expenses.filter(
        e => e.categoryId === category.id && 
             e.date >= monthStart && 
             e.date <= monthEnd
      );
      
      const total = categoryExpenses.reduce((sum, e) => {
        return sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount);
      }, 0);
      
      monthData[category.id] = total;
    });

    trends.push(monthData);
  }

  return trends;
}

/**
 * Calcula el promedio de gastos por día de la semana
 */
export function getSpendingByDayOfWeek(expenses: Expense[]): {
  day: string;
  total: number;
  count: number;
  average: number;
}[] {
  const dayStats: { [key: string]: { total: number; count: number } } = {};
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  days.forEach(day => {
    dayStats[day] = { total: 0, count: 0 };
  });

  expenses.forEach(expense => {
    const dayName = getDayName(expense.date);
    const amount = expense.currency === 'USD' ? expense.amount * 1000 : expense.amount;
    dayStats[dayName].total += amount;
    dayStats[dayName].count += 1;
  });

  return days.map(day => ({
    day,
    total: dayStats[day].total,
    count: dayStats[day].count,
    average: dayStats[day].count > 0 ? dayStats[day].total / dayStats[day].count : 0
  }));
}

/**
 * Obtiene los top N gastos
 */
export function getTopExpenses(expenses: Expense[], limit: number = 5): Expense[] {
  return [...expenses]
    .sort((a, b) => {
      const amountA = a.currency === 'USD' ? a.amount * 1000 : a.amount;
      const amountB = b.currency === 'USD' ? b.amount * 1000 : b.amount;
      return amountB - amountA;
    })
    .slice(0, limit);
}

/**
 * Calcula la variación porcentual entre dos meses
 */
export function calculateMonthVariation(
  expenses: Expense[],
  currentMonth: Date,
  previousMonth: Date
): number {
  const currentStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const currentEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
  
  const previousStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
  const previousEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0, 23, 59, 59);

  const currentTotal = expenses
    .filter(e => e.date >= currentStart && e.date <= currentEnd)
    .reduce((sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0);

  const previousTotal = expenses
    .filter(e => e.date >= previousStart && e.date <= previousEnd)
    .reduce((sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0);

  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  
  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

/**
 * Calcula la categoría con mayor crecimiento
 */
export function getCategoryWithMaxGrowth(
  expenses: Expense[],
  categories: Category[]
): { category: Category; growth: number } | null {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let maxGrowth = -Infinity;
  let maxCategory: Category | null = null;

  categories.forEach(category => {
    const currentExpenses = expenses.filter(
      e => e.categoryId === category.id &&
           e.date >= currentMonth
    );
    const previousExpenses = expenses.filter(
      e => e.categoryId === category.id &&
           e.date >= previousMonth &&
           e.date < currentMonth
    );

    const currentTotal = currentExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );
    const previousTotal = previousExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );

    if (previousTotal > 0) {
      const growth = ((currentTotal - previousTotal) / previousTotal) * 100;
      if (growth > maxGrowth) {
        maxGrowth = growth;
        maxCategory = category;
      }
    }
  });

  return maxCategory ? { category: maxCategory, growth: maxGrowth } : null;
}

/**
 * Calcula el promedio diario, semanal y mensual
 */
export function calculateAverages(expenses: Expense[]): {
  daily: number;
  weekly: number;
  monthly: number;
} {
  if (expenses.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  const total = expenses.reduce(
    (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
  );

  const sortedExpenses = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedExpenses[0].date;
  const lastDate = sortedExpenses[sortedExpenses.length - 1].date;
  
  const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksDiff = Math.max(1, daysDiff / 7);
  const monthsDiff = Math.max(1, daysDiff / 30);

  return {
    daily: total / daysDiff,
    weekly: total / weeksDiff,
    monthly: total / monthsDiff
  };
}

/**
 * Proyecta el gasto del mes actual basado en el progreso
 */
export function projectMonthlySpending(expenses: Expense[]): {
  current: number;
  projected: number;
  daysElapsed: number;
  daysTotal: number;
} {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const daysTotal = monthEnd.getDate();
  const daysElapsed = now.getDate();

  const monthExpenses = expenses.filter(
    e => e.date >= monthStart && e.date <= now
  );

  const current = monthExpenses.reduce(
    (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
  );

  const projected = (current / daysElapsed) * daysTotal;

  return {
    current,
    projected,
    daysElapsed,
    daysTotal
  };
}

/**
 * Agrupa gastos por mes y categoría para comparativas
 */
export function getMonthlyComparison(
  expenses: Expense[],
  months: number = 6
): { month: string; total: number; count: number }[] {
  const now = new Date();
  const comparison: { month: string; total: number; count: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    
    const monthExpenses = expenses.filter(
      e => e.date >= monthStart && e.date <= monthEnd
    );

    const total = monthExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );

    comparison.push({
      month: `${getMonthName(monthDate).substring(0, 3)} ${monthDate.getFullYear()}`,
      total,
      count: monthExpenses.length
    });
  }

  return comparison;
}

/**
 * Calcula estadísticas por categoría con comparativas
 */
export function getCategoryStats(
  expenses: Expense[],
  categories: Category[]
): {
  category: Category;
  total: number;
  count: number;
  average: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  variation: number;
}[] {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalAllExpenses = expenses.reduce(
    (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
  );

  return categories.map(category => {
    const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
    const total = categoryExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );

    // Gastos del mes actual
    const currentMonthExpenses = categoryExpenses.filter(e => e.date >= currentMonth);
    const currentTotal = currentMonthExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );

    // Gastos del mes anterior
    const previousMonthExpenses = categoryExpenses.filter(
      e => e.date >= previousMonth && e.date < currentMonth
    );
    const previousTotal = previousMonthExpenses.reduce(
      (sum, e) => sum + (e.currency === 'USD' ? e.amount * 1000 : e.amount), 0
    );

    const variation = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : (currentTotal > 0 ? 100 : 0);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (variation > 5) trend = 'up';
    else if (variation < -5) trend = 'down';

    return {
      category,
      total,
      count: categoryExpenses.length,
      average: categoryExpenses.length > 0 ? total / categoryExpenses.length : 0,
      percentage: totalAllExpenses > 0 ? (total / totalAllExpenses) * 100 : 0,
      trend,
      variation
    };
  }).sort((a, b) => b.total - a.total);
}
