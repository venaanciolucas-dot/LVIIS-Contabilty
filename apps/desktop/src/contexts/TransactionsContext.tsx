import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { fetchStripeTransactions } from '../services/stripe';

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
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    editTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    markAsPaid: (id: string) => void;
    toggleTransactionStatus: (id: string) => void;
    updateTransactionStatus: (id: string, status: 'paid' | 'pending') => void;
    addCategory: (category: string) => void;
}

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData);

export function TransactionsProvider({ children }: { children: ReactNode }) {
    const DEFAULT_CATEGORIES = ['Serviços', 'Equipamentos', 'SaaS', 'Serviços Recorrentes', 'Impostos', 'Salários', 'Infraestrutura'];
    // Sem dados fictícios - as receitas virão da API do Stripe e as despesas da inserção manual
    const DEFAULT_TRANSACTIONS: Transaction[] = [];

    const [categories, setCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('lviis_categories');
            return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
        } catch { return DEFAULT_CATEGORIES; }
    });

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        try {
            const saved = localStorage.getItem('lviis_transactions');
            if (saved) {
                const parsed = JSON.parse(saved) as Transaction[];
                // Remove os dados fictícios iniciais (que tinham IDs fixos '1' até '7')
                // Mantém apenas o que o usuário incluiu de fato (que tem IDs do tipo '17740...') ou id do Stripe ('ch_', 'txn_')
                const mockIds = ['1', '2', '3', '4', '5', '6', '7'];
                return parsed.filter(tx => !mockIds.includes(tx.id));
            }
            return DEFAULT_TRANSACTIONS;
        } catch { return DEFAULT_TRANSACTIONS; }
    });

    // Persiste no localStorage sempre que os dados mudam
    React.useEffect(() => {
        try { localStorage.setItem('lviis_transactions', JSON.stringify(transactions)); } catch {}
    }, [transactions]);

    React.useEffect(() => {
        try { localStorage.setItem('lviis_categories', JSON.stringify(categories)); } catch {}
    }, [categories]);

    // Busca dados do Stripe ao carregar o Contexto (exemplo de inicialização única)
    React.useEffect(() => {
        let isMounted = true;
        const syncStripe = async () => {
            const stripeTxs = await fetchStripeTransactions();
            if (isMounted && stripeTxs.length > 0) {
                setTransactions(prev => {
                    // Mantem apenas as transações manuais (despesas locais não tem prefixo 'txn_' ou 'ch_')
                    const manualTxs = prev.filter(tx => !tx.id.startsWith('txn_') && !tx.id.startsWith('ch_'));
                    // Junta com as fresquinhas vindas da API do Stripe
                    return [...stripeTxs, ...manualTxs];
                });
            }
        };
        syncStripe();
        return () => { isMounted = false; };
    }, []);

    const addTransaction = (tx: Omit<Transaction, 'id'>) => {
        const newTx = { ...tx, id: String(Date.now()) };
        setTransactions(prev => [newTx, ...prev]);
        if (tx.category && !categories.includes(tx.category)) {
            setCategories(prev => [...prev, tx.category]);
        }
    };

    const editTransaction = (id: string, updatedTx: Omit<Transaction, 'id'>) => {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...updatedTx, id } : tx));
        if (updatedTx.category && !categories.includes(updatedTx.category)) {
            setCategories(prev => [...prev, updatedTx.category]);
        }
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id));
    };

    const markAsPaid = (id: string) => {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'paid' } : tx));
    };

    const toggleTransactionStatus = (id: string) => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id === id) {
                return { ...tx, status: tx.status === 'paid' ? 'pending' : 'paid' };
            }
            return tx;
        }));
    };

    const updateTransactionStatus = (id: string, newStatus: 'paid' | 'pending') => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id === id) {
                return { ...tx, status: newStatus };
            }
            return tx;
        }));
    };

    const addCategory = (category: string) => {
        if (!categories.includes(category)) {
            setCategories(prev => [...prev, category]);
        }
    };

    return (
        <TransactionsContext.Provider value={{ transactions, categories, addTransaction, editTransaction, deleteTransaction, markAsPaid, toggleTransactionStatus, updateTransactionStatus, addCategory }}>
            {children}
        </TransactionsContext.Provider>
    );
}

export function useTransactions() {
    return useContext(TransactionsContext);
}
