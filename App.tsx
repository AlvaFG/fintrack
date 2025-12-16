import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import StatsPage from './pages/StatsPage';
import RecurringPage from './pages/RecurringPage';
import ExportPage from './pages/ExportPage';
import { Expense, Category, UserSettings } from './types';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import type { User } from '@supabase/supabase-js';

// --- CONTEXT SETUP ---
interface AppContextType {
  user: User | null;
  profile: { id: string; fullName: string | null; avatarUrl: string | null } | null;
  isAuthenticated: boolean;
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<UserSettings>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Autenticación real con Supabase
  const { 
    user, 
    profile, 
    isAuthenticated, 
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  } = useAuth();

  // Usar hooks reales de Supabase
  const { 
    expenses, 
    loading: expensesLoading, 
    error: expensesError,
    addExpense: addExpenseDB,
    updateExpense: updateExpenseDB,
    deleteExpense: deleteExpenseDB
  } = useExpenses();

  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    addCategory: addCategoryDB,
    updateCategory: updateCategoryDB,
    deleteCategory: deleteCategoryDB
  } = useCategories();

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    updateSettings: updateSettingsDB
  } = useSettings();

  const loading = authLoading || expensesLoading || categoriesLoading || settingsLoading;
  const error = expensesError || categoriesError || settingsError;

  return (
    <AppContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      expenses,
      categories,
      settings,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      addExpense: addExpenseDB,
      updateExpense: updateExpenseDB,
      deleteExpense: deleteExpenseDB,
      addCategory: addCategoryDB,
      updateCategory: updateCategoryDB,
      deleteCategory: deleteCategoryDB,
      updateSettings: updateSettingsDB
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- ROUTES ---
const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useApp();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><Layout><ExpensesPage /></Layout></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><Layout><CategoriesPage /></Layout></PrivateRoute>} />
      <Route path="/recurring" element={<PrivateRoute><Layout><RecurringPage /></Layout></PrivateRoute>} />
      <Route path="/stats" element={<PrivateRoute><Layout><StatsPage /></Layout></PrivateRoute>} />
      <Route path="/export" element={<PrivateRoute><Layout><ExportPage /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
