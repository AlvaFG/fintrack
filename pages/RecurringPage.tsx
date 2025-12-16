import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecurring, calculateNextPaymentDate } from '../hooks/useRecurring';
import { useApp } from '../App';
import { RecurringFrequency, Currency } from '../types';
import { Plus, Calendar, Pause, Play, Trash2, CheckCircle2, Circle, Edit2 } from 'lucide-react';

export default function RecurringPage() {
  const { t } = useTranslation();
  const { recurring, loading, addRecurring, updateRecurring, deleteRecurring, toggleActive, processPayment } = useRecurring();
  const { categories, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: settings?.currency || 'ARS' as Currency,
    categoryId: '',
    frequency: 'monthly' as RecurringFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dayOfMonth: '',
    notes: '',
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const recurringData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        categoryId: formData.categoryId,
        frequency: formData.frequency,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        dayOfMonth: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : null,
        notes: formData.notes || undefined,
      };

      if (editingId) {
        await updateRecurring(editingId, recurringData);
      } else {
        await addRecurring(recurringData);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving recurring expense:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      currency: settings?.currency || 'ARS',
      categoryId: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dayOfMonth: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const item = recurring.find(r => r.id === id);
    if (!item) return;

    setFormData({
      description: item.description,
      amount: item.amount.toString(),
      currency: item.currency,
      categoryId: item.categoryId,
      frequency: item.frequency,
      startDate: item.startDate.toISOString().split('T')[0],
      endDate: item.endDate ? item.endDate.toISOString().split('T')[0] : '',
      dayOfMonth: item.dayOfMonth?.toString() || '',
      notes: item.notes || '',
    });
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('recurring.confirmDelete'))) {
      await deleteRecurring(id);
    }
  };

  const filteredRecurring = recurring.filter(item => {
    if (filter === 'active') return item.isActive;
    if (filter === 'paused') return !item.isActive;
    return true;
  });

  const totalMonthlyAmount = recurring
    .filter(r => r.isActive)
    .reduce((total, item) => {
      const monthlyEquivalent = getMonthlyEquivalent(item.amount, item.frequency);
      return total + monthlyEquivalent;
    }, 0);

  const upcomingPayments = recurring
    .filter(r => r.isActive)
    .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime())
    .slice(0, 5);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || t('recurring.noCategory');
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#gray';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('recurring.today');
    if (diffDays === 1) return t('recurring.tomorrow');
    if (diffDays < 0) return t('recurring.overdue');
    return t('recurring.inDays', { days: diffDays });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('recurring.title')}</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2"
        >
          <Plus size={20} />
          {t('recurring.addRecurring')}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('stats.projectedSpending')}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalMonthlyAmount.toFixed(2)}
              </p>
            </div>
            <Calendar className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('recurring.active')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {recurring.filter(r => r.isActive).length}
              </p>
            </div>
            <Play className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('recurring.paused')}</p>
              <p className="text-2xl font-bold text-gray-600">
                {recurring.filter(r => !r.isActive).length}
              </p>
            </div>
            <Pause className="text-gray-400" size={32} />
          </div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('recurring.nextPayment')}</h2>
        {upcomingPayments.length === 0 ? (
          <p className="text-gray-600">{t('recurring.noRecurring')}</p>
        ) : (
          <div className="space-y-3">
            {upcomingPayments.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">{getCategoryName(item.categoryId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${item.amount.toFixed(2)} {item.currency}</p>
                  <p className="text-sm text-gray-600">{getDaysUntil(item.nextPaymentDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${
            filter === 'all'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('recurring.all')} ({recurring.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 font-medium ${
            filter === 'active'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('recurring.activeOnly')} ({recurring.filter(r => r.isActive).length})
        </button>
        <button
          onClick={() => setFilter('paused')}
          className={`px-4 py-2 font-medium ${
            filter === 'paused'
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('recurring.pausedOnly')} ({recurring.filter(r => !r.isActive).length})
        </button>
      </div>

      {/* Recurring List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRecurring.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {t('recurring.noRecurring')}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('recurring.active')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('recurring.frequency')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('recurring.nextPayment')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecurring.map(item => (
                <tr key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Play size={12} className="mr-1" />
                        {t('recurring.active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Pause size={12} className="mr-1" />
                        {t('recurring.paused')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                      />
                      <span className="text-sm text-gray-900">{getCategoryName(item.categoryId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      ${item.amount.toFixed(2)} {item.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{frequencyLabels[item.frequency]}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">{formatDate(item.nextPaymentDate)}</p>
                      <p className="text-xs text-gray-500">{getDaysUntil(item.nextPaymentDate)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {item.isActive && getDaysUntil(item.nextPaymentDate) === 'Hoy' && (
                        <button
                          onClick={() => processPayment(item.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Registrar pago"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => toggleActive(item.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title={item.isActive ? t('recurring.pause') : t('recurring.resume')}
                      >
                        {item.isActive ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-secondary hover:text-emerald-700"
                        title={t('common.edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('common.delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? t('recurring.editRecurring') : t('recurring.newRecurring')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.description')} *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moneda *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringFrequency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {['monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'].includes(formData.frequency) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día del Mes (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="Dejar vacío para usar fecha de inicio"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
                >
                  {editingId ? t('recurring.saveChanges') : t('recurring.createRecurring')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert any frequency to monthly equivalent
function getMonthlyEquivalent(amount: number, frequency: RecurringFrequency): number {
  const multipliers: Record<RecurringFrequency, number> = {
    daily: 30,
    weekly: 4.33,
    biweekly: 2.17,
    monthly: 1,
    bimonthly: 0.5,
    quarterly: 0.33,
    semiannual: 0.17,
    annual: 0.083,
  };
  
  return amount * multipliers[frequency];
}
