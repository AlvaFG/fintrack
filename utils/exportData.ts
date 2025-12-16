import { Expense, Category } from '../types';

export interface ExportOptions {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  currency?: string;
  t: (key: string) => string; // Translation function
}

export function exportToCSV(
  expenses: Expense[],
  categories: Category[],
  options: ExportOptions
) {
  const { t } = options;
  // Filtrar gastos por rango de fechas
  let filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= options.startDate && expenseDate <= options.endDate;
  });

  // Filtrar por categoría si está especificada
  if (options.categoryId) {
    filteredExpenses = filteredExpenses.filter(e => e.categoryId === options.categoryId);
  }

  // Filtrar por moneda si está especificada
  if (options.currency) {
    filteredExpenses = filteredExpenses.filter(e => e.currency === options.currency);
  }

  // Ordenar por fecha descendente
  filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Crear encabezados CSV usando traducciones
  const headers = [
    t('export.columns.date'),
    t('export.columns.month'),
    t('export.columns.category'),
    t('export.columns.description'),
    t('export.columns.amount'),
    t('export.columns.currency'),
    t('export.columns.dayOfWeek'),
    t('export.columns.type'),
    t('export.columns.id')
  ];

  // Convertir gastos a filas CSV
  const rows = filteredExpenses.map(expense => {
    const date = new Date(expense.date);
    const category = categories.find(c => c.id === expense.categoryId);
    
    return [
      formatDate(date), // Fecha (DD/MM/YYYY)
      formatMonth(date, t), // Mes (Enero 2024)
      category?.name || t('recurring.noCategory'), // Categoría
      escapeCSV(expense.description), // Descripción
      expense.amount.toFixed(2), // Monto
      expense.currency, // Moneda
      getDayOfWeek(date, t), // Día de semana (Lunes, Martes, etc.)
      expense.isRecurring ? t('recurring.title') : t('expenses.title'), // Tipo
      expense.id // ID
    ];
  });

  // Combinar encabezados y filas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `gastos_${formatDateForFilename(options.startDate)}_${formatDateForFilename(options.endDate)}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMonth(date: Date, t: (key: string) => string): string {
  const monthKeys = [
    'stats.months.january', 'stats.months.february', 'stats.months.march',
    'stats.months.april', 'stats.months.may', 'stats.months.june',
    'stats.months.july', 'stats.months.august', 'stats.months.september',
    'stats.months.october', 'stats.months.november', 'stats.months.december'
  ];
  return `${t(monthKeys[date.getMonth()])} ${date.getFullYear()}`;
}

function getDayOfWeek(date: Date, t: (key: string) => string): string {
  const dayKeys = [
    'stats.days.sunday', 'stats.days.monday', 'stats.days.tuesday',
    'stats.days.wednesday', 'stats.days.thursday', 'stats.days.friday', 'stats.days.saturday'
  ];
  return t(dayKeys[date.getDay()]);
}

function formatDateForFilename(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}${month}${day}`;
}

function escapeCSV(value: string): string {
  // Si contiene coma, comillas o salto de línea, envolver en comillas
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
