import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas requisições GET permitidas
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // @ts-ignore
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        
        // Verifica se a chave foi configurada no Vercel/Ambiente
        if (!stripeKey) {
            return res.status(500).json({ error: 'Stripe Secret Key is not configured' });
        }

        const stripe = new Stripe(stripeKey, {
            // @ts-ignore - Stripe SDK version mismatch with strictly typed old version
            apiVersion: '2023-10-16',
        });

        // Busca as últimas 100 transações de saldo (pagamentos recebidos)
        const balanceTransactions = await stripe.balanceTransactions.list({
            limit: 100,
            type: 'charge', // Pega apenas cobranças (ganhos)
            expand: ['data.source'] // Expande para pegar dados do pagamento
        });

        // Mapeia os dados do Stripe para o formato de transação do Lviis
        const mappedTransactions = balanceTransactions.data.map(tx => {
            // Converte Unix Timestamp para DD/MM/YYYY
            const dateObj = new Date(tx.created * 1000);
            const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            // Busca forma de pagamento se disponível no source (Charge object)
            let method = 'Cartão de Crédito';
            if (tx.description && tx.description.toLowerCase().includes('pix')) method = 'PIX';
            if (tx.description && tx.description.toLowerCase().includes('boleto')) method = 'Boleto';

            // O Stripe cobra taxas, o valor líquido que entra no caixa
            const netAmount = (tx.amount - tx.fee) / 100;

            return {
                id: tx.id,
                date: dateStr,
                description: tx.description || 'Recebimento Stripe',
                category: 'Vendas via Stripe',
                method: method,
                amount: netAmount, 
                type: 'income',
                status: 'paid', // Transações de balanço (charges) já estão pagas
                isRecurring: false
            };
        });

        return res.status(200).json(mappedTransactions);
    } catch (error: any) {
        console.error('Stripe API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch from Stripe', message: error.message });
    }
}
