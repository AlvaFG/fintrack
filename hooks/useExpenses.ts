import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Expense } from '../types';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar gastos desde Supabase
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch if user is logged in
      if (!userId) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Convertir fechas de string a Date
      const expensesWithDates = data.map((exp: any) => ({
        ...exp,
        categoryId: exp.category_id,
        isRecurring: exp.is_recurring,
        date: new Date(exp.date),
      }));

      setExpenses(expensesWithDates);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar gastos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when user changes
  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  // Agregar gasto
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      setError(null);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: userId,
            amount: expense.amount,
            currency: expense.currency,
            category_id: expense.categoryId,
            description: expense.description,
            notes: expense.notes,
            date: expense.date.toISOString(),
            is_recurring: expense.isRecurring || false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newExpense: Expense = {
        ...data,
        categoryId: data.category_id,
        isRecurring: data.is_recurring,
        date: new Date(data.date),
      };

      setExpenses((prev) => [newExpense, ...prev]);
      return newExpense;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al agregar gasto:', err);
      throw err;
    }
  };

  // Actualizar gasto
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      setError(null);

      const dbUpdates: any = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.date !== undefined) dbUpdates.date = updates.date.toISOString();
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

      const { data, error: updateError } = await supabase
        .from('expenses')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedExpense: Expense = {
        ...data,
        categoryId: data.category_id,
        isRecurring: data.is_recurring,
        date: new Date(data.date),
      };

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? updatedExpense : exp))
      );

      return updatedExpense;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al actualizar gasto:', err);
      throw err;
    }
  };

  // Eliminar gasto
  const deleteExpense = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error al eliminar gasto:', err);
      throw err;
    }
  };

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
}
