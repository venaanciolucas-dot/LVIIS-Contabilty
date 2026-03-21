import { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Paperclip, Edit } from 'lucide-react';
import { useTransactions, Transaction } from '../contexts/TransactionsContext';
import { TransactionModal } from '../components/TransactionModal';
import './TransactionsList.css';

function parseDate(str: string): Date {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}

export function Extract() {
    const { transactions, deleteTransaction, updateTransactionStatus } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [filterType, setFilterType] = useState('all');
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

    const handleStatusChange = (id: string, newStatus: string) => {
        if (newStatus === 'paid' || newStatus === 'pending') {
            updateTransactionStatus(id, newStatus);
        }
    };

    const filtered = useMemo(() => {
        return transactions.filter((tx) => {
            if (filterType === 'incomes' && tx.type !== 'income') return false;
            if (filterType === 'expenses' && tx.type !== 'expense') return false;

            if (filterMethod !== 'all') {
                const methodMap: Record<string, string> = { pix: 'PIX', credit: 'Cartão de Crédito', debit: 'Cartão de Débito', boleto: 'Boleto' };
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
    }, [transactions, filterType, filterMethod, filterPeriod, dateFrom, dateTo]);

    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="list-page-container">
            <header className="page-header">
                <div>
                    <h1>Extrato Completo</h1>
                    <p className="subtitle">Histórico de todas as suas entradas e saídas.</p>
                </div>
            </header>

            <div className="summary-cards">
                <div className="card">
                    <div className="card-header">
                        <span>Receita Total</span>
                        <div className="icon-wrapper success"><ArrowUpRight size={20} /></div>
                    </div>
                    <div className="card-value success-text">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <span>Despesa Total</span>
                        <div className="icon-wrapper danger"><ArrowDownRight size={20} /></div>
                    </div>
                    <div className="card-value danger-text">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="card main-card">
                    <div className="card-header"><span>Saldo do Período</span></div>
                    <div className="card-value">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div className="table-container panel">
                <div className="table-actions">
                    <div className="filters-group">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="table-select">
                            <option value="all">Todas as transações</option>
                            <option value="incomes">Apenas Receitas</option>
                            <option value="expenses">Apenas Despesas</option>
                        </select>
                        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="table-select">
                            <option value="all">Qualquer forma de pagto</option>
                            <option value="pix">PIX</option>
                            <option value="credit">Cartão de Crédito</option>
                            <option value="debit">Cartão de Débito</option>
                            <option value="boleto">Boleto</option>
                        </select>
                        <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="table-select">
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
                            <th>Categoria</th>
                            <th>Forma Pgt.</th>
                            <th>Status</th>
                            <th className="align-right">Valor</th>
                            <th className="align-center" style={{ width: '80px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Nenhuma transação encontrada.</td></tr>
                        ) : filtered.map((tx) => {
                            const isOverdue = tx.type === 'expense' && tx.status === 'pending' && parseDate(tx.date) < new Date(2026, 2, 15);
                            return (
                                <tr key={tx.id}>
                                    <td>{tx.date}</td>
                                <td>
                                    <div className="tx-desc">
                                        <span className={`tx-dot ${tx.type === 'income' ? 'success' : 'danger'}`}></span>
                                        {tx.description}
                                    </div>
                                </td>
                                <td><span className="badge">{tx.category}</span></td>
                                <td>{tx.method}</td>
                                <td>
                                    {tx.type === 'income' ? (
                                        <span className="badge success">Recebido</span>
                                    ) : (
                                        <select 
                                            className={`status-select ${tx.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : 'pending'}`}
                                            value={tx.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : 'pending'}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleStatusChange(tx.id, e.target.value);
                                            }}
                                        >
                                            <option value="paid">Pago</option>
                                            <option value="pending">A Pagar</option>
                                            {isOverdue && <option value="overdue">Atrasado</option>}
                                        </select>
                                    )}
                                </td>
                                <td className={`align-right fw-bold ${tx.type === 'income' ? 'success-text' : 'danger-text'}`}>
                                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="align-center" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    {tx.attachment && (
                                        <a href={tx.attachment} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ color: 'var(--text-muted)' }} title="Ver Comprovante">
                                            <Paperclip size={18} />
                                        </a>
                                    )}
                                    <button className="icon-btn" onClick={() => handleEdit(tx)} title="Editar" style={{ color: 'var(--primary-color)' }}>
                                        <Edit size={18} />
                                    </button>
                                    <button className="icon-btn danger-text" onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }} title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={transactionToEdit} />
        </div>
    );
}
