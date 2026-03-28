import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchStripeTransactions } from '../services/stripe';
import { supabase, isSupabaseConfigured } from '@repo/api';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string; // format 'DD/MM/YYYY'
    category: string;
    method: string;
    type: TransactionType;
    status: 'paid' | 'pending';
    isRecurring?: boolean;
    attachment?: string;
}

interface TransactionsContextData {
    transactions: Transaction[];
    categories: string[];
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    editTransaction: (id: string, tx: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    markAsPaid: (id: string) => Promise<void>;
    toggleTransactionStatus: (id: string) => Promise<void>;
    updateTransactionStatus: (id: string, status: 'paid' | 'pending') => Promise<void>;
    addCategory: (category: string) => Promise<void>;
    isLoading: boolean;
}

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData);

const DEFAULT_CATEGORIES = ['Serviços', 'Equipamentos', 'SaaS', 'Serviços Recorrentes', 'Impostos', 'Salários', 'Infraestrutura'];

export function TransactionsProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregamento inicial: Supabase + Stripe
    React.useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            try {
                let manualTxs: Transaction[] = [];

                if (isSupabaseConfigured) {
                    // 1. Carrega categorias
                    const { data: catData } = await supabase.from('categories').select('name');
                    if (catData && catData.length > 0 && isMounted) {
                        setCategories(catData.map((c: { name: string }) => c.name));
                    }

                    // 2. Carrega transações manuais
                    const { data: txData } = await supabase.from('transactions').select('*');
                    if (txData) {
                        manualTxs = txData as Transaction[];
                    }
                }

                // 3. Carrega do Stripe (independente do Supabase)
                const stripeTxs = await fetchStripeTransactions();

                if (isMounted) {
                    const parseDate = (str: string) => {
                        const [d, m, y] = str.split('/').map(Number);
                        return new Date(y, m - 1, d).getTime();
                    };
                    const allTxs = [...stripeTxs, ...manualTxs].sort(
                        (a, b) => parseDate(b.date) - parseDate(a.date)
                    );
                    setTransactions(allTxs);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
        if (!isSupabaseConfigured) {
            alert('Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel para persistir dados!');
            return;
        }
        const { data, error } = await supabase.from('transactions').insert([tx]).select().single();
        if (!error && data) {
            setTransactions(prev => [data as Transaction, ...prev]);
            if (tx.category && !categories.includes(tx.category)) {
                await addCategory(tx.category);
            }
        } else {
            console.error('Erro ao adicionar transação:', error);
            alert('Falha ao salvar. Verifique as variáveis de ambiente do Supabase no Vercel.');
        }
    };

    const editTransaction = async (id: string, updatedTx: Omit<Transaction, 'id'>) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('transactions').update(updatedTx).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...updatedTx, id } : tx));
            if (updatedTx.category && !categories.includes(updatedTx.category)) {
                await addCategory(updatedTx.category);
            }
        }
    };

    const deleteTransaction = async (id: string) => {
        if (id.startsWith('ch_') || id.startsWith('txn_')) {
            alert('Transações do Stripe não podem ser apagadas pelo painel por segurança.');
            return;
        }
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        }
    };

    const markAsPaid = async (id: string) => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('transactions').update({ status: 'paid' }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'paid' } : tx));
        }
    };

    const toggleTransactionStatus = async (id: string) => {
        const txTarget = transactions.find(t => t.id === id);
        if (!txTarget || !isSupabaseConfigured) return;
        const newStatus = txTarget.status === 'paid' ? 'pending' : 'paid';
        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
        }
    };

    const updateTransactionStatus = async (id: string, newStatus: 'paid' | 'pending') => {
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
        }
    };

    const addCategory = async (category: string) => {
        if (!categories.includes(category)) {
            if (isSupabaseConfigured) {
                await supabase.from('categories').insert([{ name: category }]);
            }
            setCategories(prev => [...prev, category]);
        }
    };

    return (
        <TransactionsContext.Provider value={{ transactions, categories, addTransaction, editTransaction, deleteTransaction, markAsPaid, toggleTransactionStatus, updateTransactionStatus, addCategory, isLoading }}>
            {children}
        </TransactionsContext.Provider>
    );
}

export function useTransactions() {
    return useContext(TransactionsContext);
}
