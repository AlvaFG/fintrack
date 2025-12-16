import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../App';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton
} from '../components/ui/shadcn';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Package,
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
  Glasses
} from 'lucide-react';
import { Category } from '../types';

// Colores disponibles para categorías
const AVAILABLE_COLORS = [
  { color: '#FF6B6B', name: 'Rojo' },
  { color: '#4ECDC4', name: 'Turquesa' },
  { color: '#FFD93D', name: 'Amarillo' },
  { color: '#95E1D3', name: 'Verde Agua' },
  { color: '#A8E6CF', name: 'Verde Menta' },
  { color: '#A8D8EA', name: 'Azul Claro' },
  { color: '#FF8B94', name: 'Rosa' },
  { color: '#B4A7D6', name: 'Lavanda' },
  { color: '#F4A261', name: 'Naranja' },
  { color: '#2A9D8F', name: 'Verde Azulado' },
  { color: '#E76F51', name: 'Terracota' },
  { color: '#8338EC', name: 'Púrpura' },
];

const CategoriesPage = () => {
  const { t } = useTranslation();
  const { expenses, categories, loading, addCategory, updateCategory, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'MoreHorizontal',
    color: '#FF6B6B',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Iconos disponibles para categorías (dentro del componente para acceder a t())
  const AVAILABLE_ICONS = [
    { icon: 'ShoppingCart', name: t('categories.icons.shopping'), component: ShoppingCart },
    { icon: 'Car', name: t('categories.icons.transport'), component: Car },
    { icon: 'Home', name: t('categories.icons.home'), component: Home },
    { icon: 'Utensils', name: t('categories.icons.food'), component: Utensils },
    { icon: 'Heart', name: t('categories.icons.health'), component: Heart },
    { icon: 'Shirt', name: t('categories.icons.clothing'), component: Shirt },
    { icon: 'Gamepad', name: t('categories.icons.entertainment'), component: Gamepad },
    { icon: 'GraduationCap', name: t('categories.icons.education'), component: GraduationCap },
    { icon: 'Plane', name: t('categories.icons.travel'), component: Plane },
    { icon: 'Gift', name: t('categories.icons.gifts'), component: Gift },
    { icon: 'Wrench', name: t('categories.icons.services'), component: Wrench },
    { icon: 'Coffee', name: t('categories.icons.coffee'), component: Coffee },
    { icon: 'Phone', name: t('categories.icons.technology'), component: Phone },
    { icon: 'Dumbbell', name: t('categories.icons.sports'), component: Dumbbell },
    { icon: 'Music', name: t('categories.icons.music'), component: Music },
    { icon: 'Film', name: t('categories.icons.movies'), component: Film },
    { icon: 'Book', name: t('categories.icons.books'), component: Book },
    { icon: 'Briefcase', name: t('categories.icons.work'), component: Briefcase },
    { icon: 'Wallet', name: t('categories.icons.finance'), component: Wallet },
    { icon: 'Tv', name: t('categories.icons.tv'), component: Tv },
    { icon: 'Smartphone', name: t('categories.icons.mobile'), component: Smartphone },
    { icon: 'Laptop', name: t('categories.icons.computer'), component: Laptop },
    { icon: 'Headphones', name: t('categories.icons.audio'), component: Headphones },
    { icon: 'Camera', name: t('categories.icons.photography'), component: Camera },
    { icon: 'Paintbrush', name: t('categories.icons.art'), component: Paintbrush },
    { icon: 'Hammer', name: t('categories.icons.tools'), component: Hammer },
    { icon: 'Zap', name: t('categories.icons.electricity'), component: Zap },
    { icon: 'Droplet', name: t('categories.icons.water'), component: Droplet },
    { icon: 'Leaf', name: t('categories.icons.nature'), component: Leaf },
    { icon: 'Scissors', name: t('categories.icons.beauty'), component: Scissors },
    { icon: 'Baby', name: t('categories.icons.baby'), component: Baby },
    { icon: 'PawPrint', name: t('categories.icons.pets'), component: PawPrint },
    { icon: 'Pizza', name: t('categories.icons.pizza'), component: Pizza },
    { icon: 'IceCream', name: t('categories.icons.desserts'), component: IceCream },
    { icon: 'Wine', name: t('categories.icons.drinks'), component: Wine },
    { icon: 'ShoppingBag', name: t('categories.icons.bags'), component: ShoppingBag },
    { icon: 'Watch', name: t('categories.icons.watch'), component: Watch },
    { icon: 'Glasses', name: t('categories.icons.glasses'), component: Glasses },
    { icon: 'MoreHorizontal', name: t('categories.icons.other'), component: MoreHorizontal },
  ];

  // Función auxiliar para obtener componente de icono
  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find(i => i.icon === iconName);
    return iconData ? iconData.component : MoreHorizontal;
  };

  // Calcular estadísticas por categoría
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { total: number; count: number; average: number; totalUSD: number; totalARS: number }>();
    
    categories.forEach(category => {
      const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
      const totalUSD = categoryExpenses
        .filter(e => e.currency === 'USD')
        .reduce((sum, e) => sum + e.amount, 0);
      const totalARS = categoryExpenses
        .filter(e => e.currency === 'ARS')
        .reduce((sum, e) => sum + e.amount, 0);
      const total = totalARS + totalUSD; // Para el cálculo del porcentaje
      
      stats.set(category.id, {
        total,
        totalUSD,
        totalARS,
        count: categoryExpenses.length,
        average: categoryExpenses.length > 0 ? total / categoryExpenses.length : 0,
      });
    });
    
    return stats;
  }, [expenses, categories]);

  // Calcular métricas por período
  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let yearARS = 0, yearUSD = 0;
    let monthARS = 0, monthUSD = 0;
    let lastMonthARS = 0, lastMonthUSD = 0;
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      // Gasto anual
      if (expenseYear === currentYear) {
        if (expense.currency === 'ARS') yearARS += expense.amount;
        else if (expense.currency === 'USD') yearUSD += expense.amount;
      }
      
      // Gasto mes actual
      if (expenseYear === currentYear && expenseMonth === currentMonth) {
        if (expense.currency === 'ARS') monthARS += expense.amount;
        else if (expense.currency === 'USD') monthUSD += expense.amount;
      }
      
      // Gasto mes anterior
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (expenseYear === lastMonthYear && expenseMonth === lastMonth) {
        if (expense.currency === 'ARS') lastMonthARS += expense.amount;
        else if (expense.currency === 'USD') lastMonthUSD += expense.amount;
      }
    });
    
    return {
      yearARS, yearUSD,
      monthARS, monthUSD,
      lastMonthARS, lastMonthUSD
    };
  }, [expenses]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        icon: 'MoreHorizontal',
        color: '#FF6B6B',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', icon: 'MoreHorizontal', color: '#FF6B6B' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
        });
      } else {
        await addCategory({
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          isPreset: false,
        });
      }
      handleCloseModal();
    } catch (error: any) {
      alert(`${t('messages.error')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const stats = categoryStats.get(categoryId);
    if (stats && stats.count > 0) {
      alert(`${t('categories.cannotDelete')} ${stats.count} ${t('categories.associatedExpenses')}`);
      return;
    }
    
    if (deleteConfirm === categoryId) {
      try {
        await deleteCategory(categoryId);
        setDeleteConfirm(null);
      } catch (error: any) {
        alert(`${t('messages.error')}: ${error.message}`);
      }
    } else {
      setDeleteConfirm(categoryId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{t('nav.categories')}</h1>
          <p className="text-gray-500 mt-1">
            {t('categories.manageAndOrganize')}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={18} />
          {t('categories.newCategory')}
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('categories.yearlyExpense')}</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto space-y-1">
                {metrics.yearARS > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    ${metrics.yearARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                )}
                {metrics.yearUSD > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    US${metrics.yearUSD.toLocaleString('es-AR', { 
                      minimumFractionDigits: metrics.yearUSD % 1 !== 0 ? 2 : 0, 
                      maximumFractionDigits: metrics.yearUSD % 1 !== 0 ? 2 : 0 
                    }).replace('.', ',')}
                  </div>
                )}
                {metrics.yearARS === 0 && metrics.yearUSD === 0 && (
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">$0</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('categories.thisMonthExpense')}</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto space-y-1">
                {metrics.monthARS > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    ${metrics.monthARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                )}
                {metrics.monthUSD > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    US${metrics.monthUSD.toLocaleString('es-AR', { 
                      minimumFractionDigits: metrics.monthUSD % 1 !== 0 ? 2 : 0, 
                      maximumFractionDigits: metrics.monthUSD % 1 !== 0 ? 2 : 0 
                    }).replace('.', ',')}
                  </div>
                )}
                {metrics.monthARS === 0 && metrics.monthUSD === 0 && (
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">$0</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-5">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-1">{t('categories.lastMonthExpense')}</p>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-auto space-y-1">
                {metrics.lastMonthARS > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    ${metrics.lastMonthARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                )}
                {metrics.lastMonthUSD > 0 && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                    US${metrics.lastMonthUSD.toLocaleString('es-AR', { 
                      minimumFractionDigits: metrics.lastMonthUSD % 1 !== 0 ? 2 : 0, 
                      maximumFractionDigits: metrics.lastMonthUSD % 1 !== 0 ? 2 : 0 
                    }).replace('.', ',')}
                  </div>
                )}
                {metrics.lastMonthARS === 0 && metrics.lastMonthUSD === 0 && (
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-50">$0</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de categorías */}
      <div className="flex justify-center">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl">
          {categories.map((category) => {
          const stats = categoryStats.get(category.id) || { total: 0, count: 0, average: 0, totalUSD: 0, totalARS: 0 };
          const IconComponent = getIconComponent(category.icon);

          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.isPreset && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {t('categories.preset')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 size={14} />
                    </Button>
                    {!category.isPreset && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className={`h-8 w-8 p-0 ${
                          deleteConfirm === category.id ? 'text-red-600 bg-red-50' : ''
                        }`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      {stats.totalARS > 0 && stats.totalUSD > 0 ? (
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          ${stats.totalARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} + US${stats.totalUSD.toLocaleString('es-AR', { 
                            minimumFractionDigits: stats.totalUSD % 1 !== 0 ? 2 : 0, 
                            maximumFractionDigits: stats.totalUSD % 1 !== 0 ? 2 : 0 
                          }).replace('.', ',')}
                        </p>
                      ) : stats.totalARS > 0 ? (
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          ${stats.totalARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      ) : stats.totalUSD > 0 ? (
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                          US${stats.totalUSD.toLocaleString('es-AR', { 
                            minimumFractionDigits: stats.totalUSD % 1 !== 0 ? 2 : 0, 
                            maximumFractionDigits: stats.totalUSD % 1 !== 0 ? 2 : 0 
                          }).replace('.', ',')}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">$0</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('categories.expenses')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{stats.count}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">{t('categories.noCategories')}</h3>
            <p className="text-gray-500 mb-4">
              {t('categories.createFirstCategory')}
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={18} className="mr-2" />
              {t('categories.createFirst')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de crear/editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <DialogTitle className="text-2xl">
                {editingCategory ? t('categories.editCategory') : t('categories.newCategory')}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingCategory 
                  ? t('categories.editDescription') 
                  : t('categories.createDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('categories.categoryName')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('categories.namePlaceholder')}
                  required
                  className="mt-2 h-11"
                />
              </div>

              {/* Icono */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  {t('categories.selectIcon')}
                </Label>
                <div className="grid grid-cols-6 gap-3">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.component;
                    return (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.icon })}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center group ${
                          formData.icon === item.icon
                            ? 'border-secondary bg-emerald-50 dark:bg-emerald-950 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        title={item.name}
                      >
                        <IconComp 
                          size={20} 
                          className={
                            formData.icon === item.icon 
                              ? 'text-secondary dark:text-emerald-400' 
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          } 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Elige un color
                </Label>
                <div className="grid grid-cols-6 gap-3">
                  {AVAILABLE_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: item.color })}
                      className={`h-14 rounded-lg border-3 transition-all hover:scale-105 relative ${
                        formData.color === item.color
                          ? 'scale-110 ring-3 ring-offset-2 dark:ring-offset-gray-900 ring-gray-900 dark:ring-gray-100 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    >
                      {formData.color === item.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                            <div className="w-3 h-3 bg-gray-900 dark:bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                  Vista previa
                </Label>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-inner">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                    >
                      {(() => {
                        const PreviewIcon = getIconComponent(formData.icon);
                        return <PreviewIcon size={30} strokeWidth={2} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-gray-50 text-xl">
                        {formData.name || t('categories.categoryNamePlaceholder')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="h-2 flex-1 max-w-[140px] rounded-full shadow-sm"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('categories.saving') : editingCategory ? t('categories.saveChanges') : t('categories.createCategoryButton')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
