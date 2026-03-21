import { Transaction } from '../contexts/TransactionsContext';

export async function fetchStripeTransactions(): Promise<Transaction[]> {
    try {
        // Rota do Vercel Serverless Function (rodando na nuvem)
        const response = await fetch('/api/stripe');
        
        if (!response.ok) {
            // Se falhar (ex: rodando local via npm run dev ao invés do Vercel CLI)
            // Retornamos silenciosamente um array vazio e logamos o aviso na aba Network/Console
            console.warn(`[Stripe Sync] Endpoint /api/stripe retornou ${response.status}.
                Se estiver rodando na máquina local com 'npm run dev', isso é esperado, 
                pois o servidor do Vite não roda as funções Serverless do Vercel.
                Para testar o Stripe local, use 'npx vercel dev'.
                No Vercel em produção, isso funcionará perfeitamente.`);
            return [];
        }

        const data = await response.json();
        return data as Transaction[];
    } catch (error) {
        console.error('[Stripe Sync] Falha ao sincronizar com o Stripe:', error);
        return [];
    }
}
