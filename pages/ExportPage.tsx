import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { exportToCSV } from '../utils/exportData';
import { Download, Filter, Calendar, FileSpreadsheet } from 'lucide-react';

export default function ExportPage() {
  const { t } = useTranslation();
  const { expenses, categories } = useApp();
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert(t('export.selectDateRange'));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert(t('validation.invalidDate'));
      return;
    }

    exportToCSV(expenses, categories, {
      startDate: start,
      endDate: end,
      categoryId: selectedCategory || undefined,
      currency: selectedCurrency || undefined,
    });
  };

  const getPreviewCount = () => {
    let count = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });

    if (selectedCategory) {
      count = count.filter(e => e.categoryId === selectedCategory);
    }

    if (selectedCurrency) {
      count = count.filter(e => e.currency === selectedCurrency);
    }

    return count.length;
  };

  const getPreviewTotal = () => {
    let filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });

    if (selectedCategory) {
      filtered = filtered.filter(e => e.categoryId === selectedCategory);
    }

    if (selectedCurrency) {
      filtered = filtered.filter(e => e.currency === selectedCurrency);
    }

    // Agrupar por moneda
    const totals = filtered.reduce((acc, expense) => {
      if (!acc[expense.currency]) {
        acc[expense.currency] = 0;
      }
      acc[expense.currency] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return totals;
  };

  const setQuickDateRange = (range: 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        // Encontrar el gasto más antiguo
        if (expenses.length > 0) {
          const oldestExpense = expenses.reduce((oldest, expense) => {
            return new Date(expense.date) < new Date(oldest.date) ? expense : oldest;
          });
          start.setTime(new Date(oldestExpense.date).getTime());
        } else {
          start.setFullYear(2020, 0, 1);
        }
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const totals = getPreviewTotal();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('export.title')}</h1>
        <FileSpreadsheet className="text-green-600" size={32} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-secondary" />
            {t('export.selectDateRange')}
          </h2>
          
          {/* Quick date range buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setQuickDateRange('week')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {t('export.lastWeek')}
            </button>
            <button
              onClick={() => setQuickDateRange('month')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Último mes
            </button>
            <button
              onClick={() => setQuickDateRange('quarter')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Últimos 3 meses
            </button>
            <button
              onClick={() => setQuickDateRange('year')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Último año
            </button>
            <button
              onClick={() => setQuickDateRange('all')}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Todo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={24} className="text-secondary" />
            Filtros Opcionales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                <option value="">Todas las monedas</option>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="MXN">MXN</option>
                <option value="COP">COP</option>
                <option value="CLP">CLP</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-900 mb-2">Vista Previa</h3>
          <p className="text-emerald-800">
            Se exportarán <strong>{getPreviewCount()}</strong> gastos
          </p>
          {Object.keys(totals).length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-emerald-700 font-medium">Total por moneda:</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {Object.entries(totals).map(([currency, total]: [string, number]) => (
                  <span key={currency} className="text-sm text-emerald-900">
                    <strong>{currency}:</strong> ${total.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formato del CSV */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Formato del Archivo CSV</h3>
          <p className="text-sm text-gray-700 mb-2">
            El archivo incluirá las siguientes columnas:
          </p>
          <div className="flex flex-wrap gap-2">
            {['Fecha', 'Mes', 'Categoría', 'Descripción', 'Monto', 'Moneda', 'Día de semana', 'Tipo', 'ID'].map(col => (
              <span key={col} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700">
                {col}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Los gastos se ordenarán por fecha (más recientes primero) y el archivo será compatible con Excel, Google Sheets y otras aplicaciones.
          </p>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={getPreviewCount() === 0}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
        >
          <Download size={20} />
          Exportar a CSV ({getPreviewCount()} gastos)
        </button>
      </div>

      {/* Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Información</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• El archivo CSV se descargará automáticamente en tu carpeta de Descargas</p>
          <p>• El formato es compatible con Excel, Google Sheets, Numbers y otras aplicaciones</p>
          <p>• La codificación UTF-8 con BOM garantiza que los caracteres especiales se muestren correctamente</p>
          <p>• Puedes usar los filtros para exportar solo gastos específicos de una categoría o moneda</p>
          <p>• Los gastos se ordenan de más reciente a más antiguo</p>
        </div>
      </div>
    </div>
  );
}
