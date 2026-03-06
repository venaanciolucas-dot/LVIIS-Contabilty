import { create } from 'zustand';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    setAuth: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    setAuth: (session) => {
        if (session) {
            set({ session, user: { id: session.user.id, email: session.user.email || '' }, isLoading: false });
        } else {
            set({ session: null, user: null, isLoading: false });
        }
    },
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null, session: null, isLoading: false }),
}));
