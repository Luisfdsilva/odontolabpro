import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

let supabaseCached: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
    if (supabaseCached) return supabaseCached;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('ALERTA: Variáveis de ambiente do Supabase faltando!');
    }

    supabaseCached = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabaseCached;
};

// Mantendo suporte para importação direta, mas o getSupabase é mais seguro
export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);
