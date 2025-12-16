import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hotodlrckfuiqliyyzjg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oGj-zt68G36Na-Wp-oRzZg_YTURh1sa';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
