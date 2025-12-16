import { Expense, Category } from '../types';

export interface ExportOptions {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  currency?: string;
}

export function exportToCSV(
  expenses: Expense[],
  categories: Category[],
  options: ExportOptions
): void {
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

  // Crear encabezados CSV según especificación del usuario:
  // Fecha, Mes, Categoría, Descripción, Monto, Moneda, Día de semana, Tipo, ID
  const headers = ['Fecha', 'Mes', 'Categoría', 'Descripción', 'Monto', 'Moneda', 'Día de semana', 'Tipo', 'ID'];

  // Convertir gastos a filas CSV
  const rows = filteredExpenses.map(expense => {
    const date = new Date(expense.date);
    const category = categories.find(c => c.id === expense.categoryId);
    
    return [
      formatDate(date), // Fecha (DD/MM/YYYY)
      formatMonth(date), // Mes (Enero 2024)
      category?.name || 'Sin categoría', // Categoría
      escapeCSV(expense.description), // Descripción
      expense.amount.toFixed(2), // Monto
      expense.currency, // Moneda
      getDayOfWeek(date), // Día de semana (Lunes, Martes, etc.)
      expense.isRecurring ? 'Recurrente' : 'Normal', // Tipo
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

function formatMonth(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getDayOfWeek(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
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
