import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchStripeTransactions } from '../services/stripe';
import { supabase } from '@repo/api';

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

export function TransactionsProvider({ children }: { children: ReactNode }) {
    const DEFAULT_CATEGORIES = ['Serviços', 'Equipamentos', 'SaaS', 'Serviços Recorrentes', 'Impostos', 'Salários', 'Infraestrutura'];
    
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carregamento inicial do Supabase + Stripe
    React.useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
            try {
                // 1. Carrega categorias do Supabase
                const { data: catData, error: catError } = await supabase.from('categories').select('name');
                if (!catError && catData && isMounted) {
                    if (catData.length > 0) {
                        setCategories(catData.map(c => c.name));
                    }
                }

                // 2. Carrega despesas/receitas manuais do Supabase
                // Ordernar da mais recente para a mais antiga (assumindo que a API retorna como inseridas, ou podemos ordenar por data dps)
                const { data: txData, error: txError } = await supabase.from('transactions').select('*');
                let manualTxs: Transaction[] = [];
                if (!txError && txData) {
                    manualTxs = txData as Transaction[];
                }

                // 3. Carrega o Stripe online
                const stripeTxs = await fetchStripeTransactions();

                if (isMounted) {
                    // Mescla os dois mundos (Stripe sendo garantido por ID unico)
                    setTransactions([...stripeTxs, ...manualTxs]);
                }
            } catch (error) {
                console.error('Erro geral ao carregar dados:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
        const { data, error } = await supabase.from('transactions').insert([tx]).select().single();
        if (!error && data) {
            setTransactions(prev => [data as Transaction, ...prev]);
            if (tx.category && !categories.includes(tx.category)) {
                await addCategory(tx.category);
            }
        } else {
            console.error('Erro ao adicionar transação:', error);
            alert('Falha ao salvar transação na nuvem.');
        }
    };

    const editTransaction = async (id: string, updatedTx: Omit<Transaction, 'id'>) => {
        const { error } = await supabase.from('transactions').update(updatedTx).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...updatedTx, id } : tx));
            if (updatedTx.category && !categories.includes(updatedTx.category)) {
                await addCategory(updatedTx.category);
            }
        } else {
            console.error('Erro ao editar:', error);
        }
    };

    const deleteTransaction = async (id: string) => {
        // Se for transação do Stripe, bloquamos a exclusão pelo sistema
        if (id.startsWith('ch_') || id.startsWith('txn_')) {
            alert('Transações financeiras do Stripe não podem ser apagadas pelo painel por segurança.');
            return;
        }

        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } else {
             console.error('Erro ao excluir:', error);
        }
    };

    const markAsPaid = async (id: string) => {
        const { error } = await supabase.from('transactions').update({ status: 'paid' }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'paid' } : tx));
        }
    };

    const toggleTransactionStatus = async (id: string) => {
        const txTarget = transactions.find(t => t.id === id);
        if (!txTarget) return;
        const newStatus = txTarget.status === 'paid' ? 'pending' : 'paid';

        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
        }
    };

    const updateTransactionStatus = async (id: string, newStatus: 'paid' | 'pending') => {
        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
        }
    };

    const addCategory = async (category: string) => {
        if (!categories.includes(category)) {
            const { error } = await supabase.from('categories').insert([{ name: category }]);
            if (!error) {
                setCategories(prev => [...prev, category]);
            }
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
