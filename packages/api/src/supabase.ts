import { createClient } from '@supabase/supabase-js';

// Lê a URL e a chave do ambiente (Vite injeta via import.meta.env)
// @ts-ignore
const supabaseUrl: string = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || '';
// @ts-ignore
const supabaseKey: string = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

// Criamos um cliente "dummy" que não quebra se as chaves estiverem ausentes
// O app vai funcionar sem banco de dados, exibindo somente os dados do Stripe
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
        },
    }
);

// Flag para verificar se o Supabase está realmente configurado
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
