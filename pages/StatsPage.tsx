import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Badge,
  Select
} from '../components/ui/shadcn';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  getCategoryTrends,
  getSpendingByDayOfWeek,
  getTopExpenses,
  calculateMonthVariation,
  getCategoryWithMaxGrowth,
  calculateAverages,
  projectMonthlySpending,
  getMonthlyComparison,
  getCategoryStats,
  getDayName,
  getMonthName
} from '../utils/analytics';

const StatsPage = () => {
  const { t } = useTranslation();
  const { expenses, categories, loading } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonths, setSelectedMonths] = useState(6);

  // Calcular todas las métricas
  const metrics = useMemo(() => {
    if (expenses.length === 0 || categories.length === 0) {
      return null;
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      categoryTrends: getCategoryTrends(expenses, categories, selectedMonths, t),
      dayOfWeek: getSpendingByDayOfWeek(expenses, t),
      topExpenses: getTopExpenses(expenses, 5),
      monthVariation: calculateMonthVariation(expenses, currentMonth, previousMonth),
      maxGrowthCategory: getCategoryWithMaxGrowth(expenses, categories),
      averages: calculateAverages(expenses),
      projection: projectMonthlySpending(expenses),
      monthlyComparison: getMonthlyComparison(expenses, selectedMonths, t),
      categoryStats: getCategoryStats(expenses, categories)
    };
  }, [expenses, categories, selectedMonths, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{t('stats.title')}</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">{t('stats.noDataYet')}</h3>
            <p className="text-gray-500">
              {t('stats.addExpensesForStats')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{t('stats.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('stats.subtitle')}
          </p>
        </div>
        
        <Select
          value={selectedMonths.toString()}
          onChange={(e) => setSelectedMonths(Number(e.target.value))}
          options={[
            { value: '3', label: t('stats.lastMonths.3') },
            { value: '6', label: t('stats.lastMonths.6') },
            { value: '12', label: t('stats.lastMonths.12') }
          ]}
        />
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('stats.monthlyVariation')}</p>
                {metrics.monthVariation > 0 ? (
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  {metrics.monthVariation > 0 ? '+' : ''}{metrics.monthVariation.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('stats.averageDaily')}</p>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  ${metrics.averages.daily.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('stats.projectedSpending')}</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  ${metrics.projection.projected.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metrics.projection.daysElapsed}/{metrics.projection.daysTotal} días
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('stats.highestGrowth')}</p>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  {metrics.maxGrowthCategory?.category.name || 'N/A'}
                </div>
                {metrics.maxGrowthCategory && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{metrics.maxGrowthCategory.growth.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t('stats.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="trends">{t('stats.tabs.trends')}</TabsTrigger>
          <TabsTrigger value="categories">{t('stats.tabs.categories')}</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Comparativa mensual */}
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.monthlyComparison')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString('es-AR')}`}
                    />
                    <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gastos por día de la semana */}
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.spendingByDay')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.dayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString('es-AR')}`}
                    />
                    <Bar dataKey="total" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 gastos */}
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.topExpenses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topExpenses.map((expense, index) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm text-gray-600">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {category && (
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {category.icon} {category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {expense.date.toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${expense.amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">{expense.currency}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.categoryTrends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={metrics.categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString('es-AR')}`}
                  />
                  <Legend />
                  {categories.slice(0, 6).map((category) => (
                    <Line
                      key={category.id}
                      type="monotone"
                      dataKey={category.id}
                      name={category.name}
                      stroke={category.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('stats.averageDaily')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${metrics.averages.daily.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Gasto promedio por día
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('stats.weeklyAverage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${metrics.averages.weekly.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Gasto promedio por semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('stats.monthlyAverage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${metrics.averages.monthly.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Gasto promedio por mes
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Por Categoría */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.categoryBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.categoryStats.map((stat) => (
                  <div key={stat.category.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${stat.category.color}20` }}
                        >
                          {stat.category.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{stat.category.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {stat.count} gastos
                            </Badge>
                            {stat.trend === 'up' && (
                              <span className="flex items-center text-xs text-red-600">
                                <ArrowUp size={12} className="mr-1" />
                                {stat.variation.toFixed(1)}%
                              </span>
                            )}
                            {stat.trend === 'down' && (
                              <span className="flex items-center text-xs text-green-600">
                                <ArrowDown size={12} className="mr-1" />
                                {Math.abs(stat.variation).toFixed(1)}%
                              </span>
                            )}
                            {stat.trend === 'stable' && (
                              <span className="flex items-center text-xs text-gray-500">
                                <Minus size={12} className="mr-1" />
                                Estable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${stat.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.percentage.toFixed(1)}% del total
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t('stats.distribution')}</span>
                        <span>{stat.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(stat.percentage, 100)}%`,
                            backgroundColor: stat.category.color 
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">{t('stats.average')}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ${stat.average.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ${stat.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
