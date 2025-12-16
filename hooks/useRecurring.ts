import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RecurringExpense, RecurringFrequency, Currency } from '../types';

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user logged in');

      const { data, error: fetchError } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('next_payment_date', { ascending: true });

      if (fetchError) throw fetchError;

      const recurringData = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        description: item.description,
        amount: item.amount,
        currency: item.currency as Currency,
        categoryId: item.category_id,
        frequency: item.frequency as RecurringFrequency,
        startDate: new Date(item.start_date),
        endDate: item.end_date ? new Date(item.end_date) : null,
        nextPaymentDate: new Date(item.next_payment_date),
        dayOfMonth: item.day_of_month,
        isActive: item.is_active,
        notes: item.notes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      setRecurring(recurringData);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching recurring expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRecurring = async (recurringData: {
    description: string;
    amount: number;
    currency: Currency;
    categoryId: string;
    frequency: RecurringFrequency;
    startDate: Date;
    endDate: Date | null;
    dayOfMonth: number | null;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const nextPaymentDate = calculateNextPaymentDate(
        recurringData.startDate,
        recurringData.frequency,
        recurringData.dayOfMonth
      );

      const { error: insertError } = await supabase
        .from('recurring_expenses')
        .insert({
          user_id: user.id,
          description: recurringData.description,
          amount: recurringData.amount,
          currency: recurringData.currency,
          category_id: recurringData.categoryId,
          frequency: recurringData.frequency,
          start_date: recurringData.startDate.toISOString(),
          end_date: recurringData.endDate?.toISOString() || null,
          next_payment_date: nextPaymentDate.toISOString(),
          day_of_month: recurringData.dayOfMonth,
          is_active: true,
          notes: recurringData.notes,
        });

      if (insertError) throw insertError;

      await fetchRecurring();
    } catch (err) {
      console.error('Error adding recurring expense:', err);
      throw err;
    }
  };

  const updateRecurring = async (id: string, updates: {
    description?: string;
    amount?: number;
    currency?: Currency;
    categoryId?: string;
    frequency?: RecurringFrequency;
    startDate?: Date;
    endDate?: Date | null;
    dayOfMonth?: number | null;
    isActive?: boolean;
    notes?: string;
  }) => {
    try {
      const currentRecurring = recurring.find(r => r.id === id);
      if (!currentRecurring) throw new Error('Recurring expense not found');

      const updateData: any = {};
      
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate?.toISOString() || null;
      if (updates.dayOfMonth !== undefined) updateData.day_of_month = updates.dayOfMonth;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      // Recalculate next payment date if frequency or start date changed
      if (updates.frequency || updates.startDate || updates.dayOfMonth !== undefined) {
        const nextPaymentDate = calculateNextPaymentDate(
          updates.startDate || currentRecurring.startDate,
          updates.frequency || currentRecurring.frequency,
          updates.dayOfMonth !== undefined ? updates.dayOfMonth : currentRecurring.dayOfMonth
        );
        updateData.next_payment_date = nextPaymentDate.toISOString();
      }

      const { error: updateError } = await supabase
        .from('recurring_expenses')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchRecurring();
    } catch (err) {
      console.error('Error updating recurring expense:', err);
      throw err;
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchRecurring();
    } catch (err) {
      console.error('Error deleting recurring expense:', err);
      throw err;
    }
  };

  const toggleActive = async (id: string) => {
    const recurringItem = recurring.find(r => r.id === id);
    if (!recurringItem) return;

    await updateRecurring(id, { isActive: !recurringItem.isActive });
  };

  const processPayment = async (id: string) => {
    try {
      const recurringItem = recurring.find(r => r.id === id);
      if (!recurringItem) throw new Error('Recurring expense not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Create expense from recurring
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: recurringItem.amount,
          currency: recurringItem.currency,
          category_id: recurringItem.categoryId,
          description: recurringItem.description,
          date: new Date().toISOString(),
          notes: recurringItem.notes ? `${recurringItem.notes} (Gasto recurrente)` : 'Gasto recurrente',
        });

      if (expenseError) throw expenseError;

      // Update next payment date
      const newNextPayment = calculateNextPaymentDate(
        new Date(),
        recurringItem.frequency,
        recurringItem.dayOfMonth
      );

      await updateRecurring(id, {
        isActive: recurringItem.endDate ? new Date() < recurringItem.endDate : true,
      });

      const { error: updateError } = await supabase
        .from('recurring_expenses')
        .update({ next_payment_date: newNextPayment.toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchRecurring();
    } catch (err) {
      console.error('Error processing payment:', err);
      throw err;
    }
  };

  return {
    recurring,
    loading,
    error,
    fetchRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processPayment,
  };
}

// Helper function to calculate next payment date
export function calculateNextPaymentDate(
  startDate: Date,
  frequency: RecurringFrequency,
  dayOfMonth: number | null
): Date {
  const now = new Date();
  let nextDate = new Date(startDate);

  // If start date is in the future, return it
  if (nextDate > now) {
    return nextDate;
  }

  switch (frequency) {
    case 'daily':
      while (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;

    case 'weekly':
      while (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;

    case 'biweekly':
      while (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 14);
      }
      break;

    case 'monthly':
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        }
      }
      break;

    case 'bimonthly':
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 2);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        }
      }
      break;

    case 'quarterly':
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 3);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        }
      }
      break;

    case 'semiannual':
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 6);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        }
      }
      break;

    case 'annual':
      while (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        if (dayOfMonth) {
          nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
        }
      }
      break;
  }

  return nextDate;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
