import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Button } from '../components/ui/shadcn';
import { 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Award,
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
  const { expenses, categories, loading, settings } = useApp();
  const currency = settings?.currency || 'USD'; // Usar la moneda de settings

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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('dashboard.monthlyExpenses')}</p>
                <TrendingDown className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  $ {totalSpentARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                {totalSpentUSD > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    US$ {totalSpentUSD.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('dashboard.weeklyExpenses')}</p>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  $ {weeklySpentARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
                {weeklySpentUSD > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    US$ {weeklySpentUSD.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.thisWeek')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('dashboard.topCategory')}</p>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{topCategory?.name || 'N/A'}</div>
                {topCategoryAmountARS > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    $ {topCategoryAmountARS.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </p>
                )}
                {topCategoryAmountUSD > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('expenses.totalExpenses')}</p>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">{expenses.length}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalSpent')}</p>
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
                    name="Dólares (USD)"
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
                        <p className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
    </div>
  );
};

export default Dashboard;
