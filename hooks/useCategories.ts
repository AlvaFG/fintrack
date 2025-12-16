import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      // Mapear snake_case a camelCase
      const categoriesData = data.map((cat: any) => ({
        ...cat,
        isPreset: cat.is_preset,
      }));

      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          color: category.color,
          icon: category.icon,
          is_preset: category.isPreset || false,
          user_id: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const newCategory: Category = {
        ...data,
        isPreset: data.is_preset,
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.isPreset !== undefined) updateData.is_preset = updates.isPreset;

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedCategory: Category = {
        ...data,
        isPreset: data.is_preset,
      };

      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err: any) {
      console.error('Error al actualizar categoría:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Verificar si hay gastos asociados
      const { data: expenses, error: checkError } = await supabase
        .from('expenses')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (expenses && expenses.length > 0) {
        throw new Error('Cannot delete a category with associated expenses');
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
