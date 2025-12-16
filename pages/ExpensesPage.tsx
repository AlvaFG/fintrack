import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { Card, CardContent, Input, Button, Dialog } from '../components/ui/shadcn';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Loader2,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Heart,
  Shirt,
  Gamepad,
  GraduationCap,
  Plane,
  Gift,
  Wrench,
  Coffee,
  Phone,
  Dumbbell,
  Music,
  Film,
  Book,
  Briefcase,
  Wallet,
  MoreHorizontal,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Paintbrush,
  Hammer,
  Zap,
  Droplet,
  Leaf,
  Scissors,
  Baby,
  PawPrint,
  Pizza,
  IceCream,
  Wine,
  ShoppingBag,
  Watch,
  Glasses,
  Package
} from 'lucide-react';
import { Expense } from '../types';

// Función para obtener el componente de icono
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    ShoppingCart, Car, Home, Utensils, Heart, Shirt, Gamepad, GraduationCap,
    Plane, Gift, Wrench, Coffee, Phone, Dumbbell, Music, Film, Book, Briefcase,
    Wallet, Tv, Smartphone, Laptop, Headphones, Camera, Paintbrush, Hammer,
    Zap, Droplet, Leaf, Scissors, Baby, PawPrint, Pizza, IceCream, Wine,
    ShoppingBag, Watch, Glasses, MoreHorizontal, Package
  };
  return iconMap[iconName] || MoreHorizontal;
};

const ExpensesPage = () => {
  const { t } = useTranslation();
  const { expenses, categories, addExpense, updateExpense, deleteExpense, loading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('ARS');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState(categories[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenNew = () => {
    setEditingExpense(null);
    setNewAmount('');
    setNewDesc('');
    setNewCat(categories[0]?.id || '');
    setNewCurrency('ARS');
    setNewDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setNewAmount(expense.amount.toString());
    setNewDesc(expense.description);
    setNewCat(expense.categoryId);
    setNewCurrency(expense.currency);
    setNewDate(expense.date.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const expenseData = {
        amount: parseFloat(newAmount),
        currency: newCurrency as 'ARS' | 'USD',
        description: newDesc,
        categoryId: newCat,
        date: new Date(newDate),
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    setDeleting(id);
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el gasto');
    } finally {
      setDeleting(null);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mis Gastos</h2>
          <p className="text-gray-500">Gestiona y analiza cada movimiento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter size={18} className="mr-2" /> Filtros
          </Button>
          <Button onClick={handleOpenNew}>
            <Plus size={18} className="mr-2" /> Agregar Gasto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar por descripción..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-gray-500 mt-2">Cargando gastos...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                          <tr>
                              <th className="px-4 py-3">Fecha</th>
                              <th className="px-4 py-3">Descripción</th>
                              <th className="px-4 py-3">Categoría</th>
                              <th className="px-4 py-3 text-right">Monto</th>
                              <th className="px-4 py-3 text-center">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y">
                          {filteredExpenses.map((expense) => {
                              const cat = categories.find(c => c.id === expense.categoryId);
                              return (
                                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3">
                                          <div className="font-medium text-gray-900">
                                              {expense.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                              {expense.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                      </td>
                                      <td className="px-4 py-3 text-gray-700">{expense.description}</td>
                                      <td className="px-4 py-3">
                                          {(() => {
                                            const IconComponent = cat ? getIconComponent(cat.icon) : Package;
                                            return (
                                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-white" style={{ borderColor: cat?.color, color: cat?.color }}>
                                                <IconComponent size={14} />
                                                {cat?.name}
                                              </div>
                                            );
                                          })()}
                                      </td>
                                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                                          <span className="text-gray-400 mr-1">{expense.currency === 'USD' ? 'US$' : '$'}</span>
                                          {expense.amount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                          <button 
                                            className="text-gray-400 hover:text-secondary mx-1"
                                            onClick={() => handleOpenEdit(expense)}
                                          >
                                            <Edit2 size={16} />
                                          </button>
                                          <button 
                                            className="text-gray-400 hover:text-red-600 mx-1"
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={deleting === expense.id}
                                          >
                                            {deleting === expense.id ? (
                                              <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                              <Trash2 size={16} />
                                            )}
                                          </button>
                                      </td>
                                  </tr>
                              )
                          })}
                          {filteredExpenses.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                      No se encontraron gastos.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
            )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} title={editingExpense ? "Editar Gasto" : "Nuevo Gasto"}>
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={newAmount} 
                        onChange={e => setNewAmount(e.target.value)}
                        required
                        className="text-lg font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Moneda</label>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                        <button 
                            type="button"
                            className={`flex-1 text-sm font-medium py-1.5 rounded-sm transition-all ${newCurrency === 'ARS' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                            onClick={() => setNewCurrency('ARS')}
                        >
                            ARS
                        </button>
                        <button 
                            type="button"
                            className={`flex-1 text-sm font-medium py-1.5 rounded-sm transition-all ${newCurrency === 'USD' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                            onClick={() => setNewCurrency('USD')}
                        >
                            USD
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewCat(cat.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${newCat === cat.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <span className="text-xl mb-1">{cat.icon}</span>
                            <span className="text-xs font-medium">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <Input 
                label="Descripción" 
                placeholder="¿Qué compraste?" 
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                required
            />

            <Input 
                label="Fecha" 
                type="date" 
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    editingExpense ? 'Actualizar' : 'Guardar Gasto'
                  )}
                </Button>
            </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;
