import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSettings(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Si no existe configuración, crear una por defecto
        if (fetchError.code === 'PGRST116') {
          const newSettings = await createDefaultSettings(user.id);
          setSettings(newSettings);
        } else {
          throw fetchError;
        }
      } else {
        // Mapear snake_case a camelCase
        const settingsData: UserSettings = {
          id: data.id,
          userId: data.user_id,
          currency: data.currency,
          dateFormat: data.date_format,
          language: data.language,
          theme: data.theme,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setSettings(settingsData);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async (userId: string): Promise<UserSettings> => {
    const { data, error: insertError } = await supabase
      .from('user_settings')
      .insert([{
        user_id: userId,
        currency: 'USD',
        date_format: 'DD/MM/YYYY',
        language: 'es',
        theme: 'light',
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      id: data.id,
      userId: data.user_id,
      currency: data.currency,
      dateFormat: data.date_format,
      language: data.language,
      theme: data.theme,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  };

  const updateSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const updateData: any = {};
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.dateFormat !== undefined) updateData.date_format = updates.dateFormat;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.theme !== undefined) updateData.theme = updates.theme;

      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedSettings: UserSettings = {
        id: data.id,
        userId: data.user_id,
        currency: data.currency,
        dateFormat: data.date_format,
        language: data.language,
        theme: data.theme,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err: any) {
      console.error('Error al actualizar configuración:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}
