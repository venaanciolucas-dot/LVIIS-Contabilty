import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
    // @ts-ignore
    try { if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_URL) return process.env.EXPO_PUBLIC_SUPABASE_URL; } catch (e) { }
    // @ts-ignore
    try { if (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) return process.env.VITE_SUPABASE_URL; } catch (e) { }
    // @ts-ignore
    try { if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) return import.meta.env.VITE_SUPABASE_URL; } catch (e) { }
    return '';
};

const getSupabaseKey = () => {
    // @ts-ignore
    try { if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; } catch (e) { }
    // @ts-ignore
    try { if (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) return process.env.VITE_SUPABASE_ANON_KEY; } catch (e) { }
    // @ts-ignore
    try { if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) return import.meta.env.VITE_SUPABASE_ANON_KEY; } catch (e) { }
    return '';
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
        persistSession: true,
    },
});
