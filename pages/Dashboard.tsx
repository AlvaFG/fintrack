import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button, Dialog, Input, Label, Select } from '../components/ui/shadcn';
import { 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Award,
  Plus,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  calculateMonthlyTotal, 
  calculateWeeklyTotal, 
  groupExpensesByMonth,
  calculateCategoryDistribution,
  getTopCategory 
} from '../utils/calculations';

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

const Dashboard = () => {
  const { t } = useTranslation();
  const { expenses, categories, loading, settings, addExpense } = useApp();
  const currency = settings?.currency || 'USD'; // Usar la moneda de settings

  // Estado para el modal de agregar gasto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCurrency, setNewCurrency] = useState('ARS');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState(categories[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenNew = () => {
    setNewAmount('');
    setNewDesc('');
    setNewCat(categories[0]?.id || '');
    setNewCurrency('ARS');
    setNewDate(new Date().toISOString().split('T')[0]);
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

      await addExpense(expenseData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      alert(t('messages.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  // Cálculos reales basados en datos de Supabase
  const totalSpentUSD = calculateMonthlyTotal(expenses, 'USD');
  const totalSpentARS = calculateMonthlyTotal(expenses, 'ARS');
  const weeklySpentUSD = calculateWeeklyTotal(expenses, 'USD');
  const weeklySpentARS = calculateWeeklyTotal(expenses, 'ARS');
  const topCategoryData = getTopCategory(expenses, categories);
  const topCategory = topCategoryData?.category || categories[0];
  
  // Calcular totales por moneda para la categoría top
  const topCategoryAmountARS = topCategory ? expenses
    .filter(e => e.categoryId === topCategory.id && e.currency === 'ARS')
    .reduce((sum, e) => sum + e.amount, 0) : 0;
  const topCategoryAmountUSD = topCategory ? expenses
    .filter(e => e.categoryId === topCategory.id && e.currency === 'USD')
    .reduce((sum, e) => sum + e.amount, 0) : 0;

  // Datos reales para gráficos
  const chartData = groupExpensesByMonth(expenses, 6);
  
  // Calcular distribución por categoría separando monedas
  const pieDataARS = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.categoryId === cat.id && e.currency === 'ARS')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      name: `${cat.name} (ARS)`,
      value: total,
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  const pieDataUSD = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.categoryId === cat.id && e.currency === 'USD')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      name: `${cat.name} (USD)`,
      value: total,
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  const pieData = [...pieDataARS, ...pieDataUSD];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 pt-1">{t('dashboard.monthlyExpenses')}</p>
                <TrendingDown className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  $ {totalSpentARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                {totalSpentUSD > 0 && (
                  <p className="text-sm text-gray-600
                    US$ {totalSpentUSD.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-xs text-gray-500
                  {t('dashboard.thisMonth')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 pt-1">{t('dashboard.weeklyExpenses')}</p>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  $ {weeklySpentARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                {weeklySpentUSD > 0 && (
                  <p className="text-sm text-gray-600
                    US$ {weeklySpentUSD.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-xs text-gray-500
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 pt-1">{t('dashboard.topCategory')}</p>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-bold text-gray-900 mb-1">{topCategory?.name || 'N/A'}</div>
                {topCategoryAmountARS > 0 && (
                  <p className="text-xs text-gray-500
                    $ {topCategoryAmountARS.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                )}
                {topCategoryAmountUSD > 0 && (
                  <p className="text-xs text-gray-500
                    US$ {topCategoryAmountUSD.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 pt-1">{t('expenses.totalExpenses')}</p>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 mb-1">{expenses.length}</div>
                <p className="text-xs text-gray-500
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthlyTrend')} (ARS)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ARS" 
                    name="Pesos (ARS)"
                    stroke="#0F172A" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthlyTrend')} (USD)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `US$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="USD" 
                    name={t('dashboard.dollarsUSD')}
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.categoryDistribution')} (ARS)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {pieDataARS.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataARS}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieDataARS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {t('dashboard.noExpenses')} (ARS)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.categoryDistribution')} (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {pieDataUSD.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataUSD}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieDataUSD.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `US$${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {t('dashboard.noExpenses')} (USD)
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.recentExpenses')}</CardTitle>
          <Button variant="ghost" size="sm">{t('dashboard.viewAll')}</Button>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t('dashboard.addFirstExpense')}
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => {
                const cat = categories.find(c => c.id === expense.categoryId);
                const IconComponent = cat ? getIconComponent(cat.icon) : Package;
                return (
                  <div key={expense.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${cat?.color}20` }}
                      >
                        <IconComponent size={20} style={{ color: cat?.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900
                        <p className="text-xs text-gray-500
                          {expense.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-danger">
                        - {expense.currency === 'USD' ? 'US$' : '$'} {expense.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1" style={{ borderColor: cat?.color, color: cat?.color }}>
                        {cat?.name}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <button
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label={t('expenses.addExpense')}
      >
        <Plus size={24} />
      </button>

      {/* Modal Agregar Gasto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">{t('expenses.addExpense')}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="amount">{t('common.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder={t('expenses.amountPlaceholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">{t('common.currency')}</Label>
                <Select
                  id="currency"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  options={[
                    { value: 'ARS', label: 'ARS - Pesos' },
                    { value: 'USD', label: 'USD - Dólares' },
                  ]}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('common.description')}</Label>
                <Input
                  id="description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t('expenses.descriptionPlaceholder')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">{t('common.category')}</Label>
                <Select
                  id="category"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  options={categories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="date">{t('common.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Dashboard;
