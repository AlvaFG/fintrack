export type Currency = 'ARS' | 'USD' | 'EUR' | 'MXN' | 'COP' | 'CLP' | 'BRL';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // Emoji or Lucide icon name
  isPreset: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  description: string;
  date: Date;
  notes?: string;
  isRecurring?: boolean;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';

export interface RecurringExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate: Date | null;
  nextPaymentDate: Date;
  dayOfMonth: number | null; // For monthly frequencies
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  currency: Currency;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  language: 'es' | 'en';
  theme: 'light';
  createdAt: string;
  updatedAt: string;
}
  updatedAt: Date;
}

// Legacy settings (puede ser removido después)
export interface LegacyUserSettings {
  primaryCurrency: Currency;
  exchangeRate: number; // ARS per 1 USD
}

// Stats types
export interface MonthlyData {
  name: string;
  ARS: number;
  USD: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}