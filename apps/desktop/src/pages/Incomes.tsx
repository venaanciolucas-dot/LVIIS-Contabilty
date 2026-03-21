import { useState, useMemo } from 'react';
import { ArrowUpRight, Plus, Trash2, Paperclip, Edit } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import { useTransactions, Transaction } from '../contexts/TransactionsContext';
import './TransactionsList.css';

function parseDate(str: string): Date {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}

export function Incomes() {
    const { transactions, deleteTransaction } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [filterMethod, setFilterMethod] = useState('all');
    const [filterPeriod, setFilterPeriod] = useState('current');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleEdit = (tx: Transaction) => {
        setTransactionToEdit(tx);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(false);
    };

    const filtered = useMemo(() => {
        return transactions.filter((tx) => {
            if (tx.type !== 'income') return false;
            if (filterMethod !== 'all') {
                const methodMap: Record<string, string> = { pix: 'PIX', boleto: 'Boleto', credit: 'Cartão de Crédito', debit: 'Cartão de Débito' };
                if (tx.method !== methodMap[filterMethod]) return false;
            }

            const txDate = parseDate(tx.date);
            const now = new Date(2026, 2, 15); // Data fixa para alinhar com os dados de mock (Março/2026)
            if (filterPeriod === 'current') {
                if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
            } else if (filterPeriod === 'last') {
                const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                if (txDate.getMonth() !== lastMonth || txDate.getFullYear() !== lastYear) return false;
            } else if (filterPeriod === 'custom') {
                if (dateFrom) {
                    const [y, m, d] = dateFrom.split('-').map(Number);
                    const fromDate = new Date(y, m - 1, d);
                    if (txDate < fromDate) return false;
                }
                if (dateTo) {
                    const [y, m, d] = dateTo.split('-').map(Number);
                    const toDate = new Date(y, m - 1, d, 23, 59, 59);
                    if (txDate > toDate) return false;
                }
            }

            return true;
        });
    }, [transactions, filterMethod, filterPeriod, dateFrom, dateTo]);

    const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <div className="list-page-container">
            <header className="page-header">
                <div>
                    <h1>Vendas</h1>
                    <p className="subtitle">Controle de receitas e entradas da empresa.</p>
                </div>
                <button className="primary-btn btn-icon" style={{ width: 'auto' }} onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> NOVA VENDA
                </button>
            </header>

            <div className="featured-total success-bg">
                <div className="icon-wrapper big success"><ArrowUpRight size={28} /></div>
                <div className="total-info">
                    <span>Total de Vendas (Período)</span>
                    <h2>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div className="table-container panel">
                <div className="table-actions">
                    <div className="filters-group">
                        <select className="table-select" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                            <option value="all">Todas as formas de pagto</option>
                            <option value="pix">PIX</option>
                            <option value="boleto">Boleto</option>
                            <option value="credit">Cartão de Crédito</option>
                            <option value="debit">Cartão de Débito</option>
                        </select>

                        <select className="table-select" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                            <option value="all">Todos os períodos</option>
                            <option value="current">Mês Atual</option>
                            <option value="last">Mês Anterior</option>
                            <option value="custom">Personalizado</option>
                        </select>

                        {filterPeriod === 'custom' && (
                            <div className="date-range-group">
                                <input type="date" className="table-select date-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                <span className="date-separator">até</span>
                                <input type="date" className="table-select date-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        )}
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Forma Pgt.</th>
                            <th>Status</th>
                            <th className="align-right">Valor</th>
                            <th className="align-center" style={{ width: '80px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Nenhuma venda encontrada no período.</td></tr>
                        ) : filtered.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.date}</td>
                                <td>{tx.description}</td>
                                <td>{tx.method}</td>
                                <td><span className="badge success">Recebido</span></td>
                                <td className="align-right fw-bold success-text">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="align-center" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    {tx.attachment && (
                                        <a href={tx.attachment} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ color: 'var(--text-muted)' }} title="Ver Comprovante">
                                            <Paperclip size={18} />
                                        </a>
                                    )}
                                    <button className="icon-btn" onClick={() => handleEdit(tx)} title="Editar" style={{ color: 'var(--primary-color)' }}>
                                        <Edit size={18} />
                                    </button>
                                    <button className="icon-btn danger-text" onClick={() => deleteTransaction(tx.id)} title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} defaultType="income" initialData={transactionToEdit} />
        </div>
    );
}
