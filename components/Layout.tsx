import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Wallet, 
  Repeat, 
  PieChart, 
  FolderOpen, 
  Download, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  Home,
  DoorOpen
} from 'lucide-react';
import { Button, Avatar, AvatarFallback, AvatarImage } from './ui/shadcn';
import { useApp } from '../App';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, signOut } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  // Extract initials from user name
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/' },
    { icon: <Wallet size={20} />, label: t('nav.expenses'), path: '/expenses' },
    { icon: <Repeat size={20} />, label: t('nav.recurring'), path: '/recurring' },
    { icon: <PieChart size={20} />, label: t('nav.stats'), path: '/stats' },
    { icon: <FolderOpen size={20} />, label: t('nav.categories'), path: '/categories' },
    { icon: <Download size={20} />, label: t('nav.export'), path: '/export' },
    { icon: <Settings size={20} />, label: t('nav.settings'), path: '/settings' },
  ];

  // Breadcrumb Logic
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const item = navItems.find(i => i.path === path);
    const label = item ? item.label : t('nav.dashboard');
    
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home size={14} />
          <span className="hidden sm:inline">{t('common.home')}</span>
        </Link>
        {path !== '/' && (
          <>
            <ChevronRight size={14} className="mx-2" />
            <span className="font-medium text-gray-900">{label}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#0F172A] text-white transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700/30">
            <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="w-9 h-9 bg-[#10B981] rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-sm">
                FT
              </div>
              <span className="text-white">{t('common.appName')}</span>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
            <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">MENÚ PRINCIPAL</p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20' 
                      : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-300'
                  }`
                }
              >
                <span className="flex items-center justify-center w-5">
                    {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700/30 space-y-2">
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 hover:bg-slate-800/50 hover:text-gray-300 rounded-lg transition-colors text-sm font-medium"
            >
              <DoorOpen size={18} />
              <span>{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;