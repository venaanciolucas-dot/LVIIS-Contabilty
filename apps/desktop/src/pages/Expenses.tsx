import { useState, useMemo } from 'react';
import { ArrowDownRight, Plus, Trash2, Paperclip, Edit } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import { useTransactions, Transaction } from '../contexts/TransactionsContext';
import './TransactionsList.css';

// Helper: converte 'DD/MM/YYYY' para Date
function parseDate(str: string): Date {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}

export function Expenses() {
    const { transactions, deleteTransaction, updateTransactionStatus } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [filterMethod, setFilterMethod] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
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
            if (tx.type !== 'expense') return false;

            // Filtro por forma de pagamento
            if (filterMethod !== 'all') {
                const methodMap: Record<string, string> = {
                    credit: 'Cartão de Crédito',
                    debit: 'Cartão de Débito',
                    pix: 'PIX',
                    boleto: 'Boleto',
                };
                if (tx.method !== methodMap[filterMethod]) return false;
            }

            // Filtro por período
            const txDate = parseDate(tx.date);
            const now = new Date(2026, 2, 15); // Data fixa para alinhar com os dados de mock (Março/2026)
            
            // Filtro por status
            const isOverdue = tx.status === 'pending' && txDate < now;
            if (filterStatus === 'paid' && tx.status !== 'paid') return false;
            if (filterStatus === 'pending' && (tx.status !== 'pending' || isOverdue)) return false;
            if (filterStatus === 'overdue' && !isOverdue) return false;

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
    }, [transactions, filterStatus, filterMethod, filterPeriod, dateFrom, dateTo]);

    const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <div className="list-page-container">
            <header className="page-header">
                <div>
                    <h1>Despesas</h1>
                    <p className="subtitle">Controle de custos e contas a pagar.</p>
                </div>
                <button
                    className="primary-btn btn-icon danger-bg"
                    style={{ width: 'auto' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} /> NOVA DESPESA
                </button>
            </header>

            <div className="featured-total danger-bg-soft">
                <div className="icon-wrapper big danger"><ArrowDownRight size={28} /></div>
                <div className="total-info">
                    <span>Total de Custos (Período)</span>
                    <h2 className="danger-text">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div className="table-container panel">
                <div className="table-actions">
                    <div className="filters-group">
                        <select className="table-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">Qualquer status</option>
                            <option value="paid">Pagas</option>
                            <option value="pending">A Pagar / Pendentes</option>
                            <option value="overdue">Atrasadas</option>
                        </select>

                        <select className="table-select" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                            <option value="all">Forma de pagto</option>
                            <option value="credit">Cartão de Crédito</option>
                            <option value="debit">Cartão de Débito</option>
                            <option value="pix">PIX</option>
                            <option value="boleto">Boleto</option>
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
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Nenhuma despesa encontrada no período.</td></tr>
                        ) : filtered.map((tx) => {
                            const isOverdue = tx.status === 'pending' && parseDate(tx.date) < new Date(2026, 2, 15);
                            return (
                                <tr key={tx.id}>
                                    <td>{tx.date}</td>
                                    <td>{tx.description}</td>
                                    <td>{tx.method}</td>
                                    <td>
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
                                    </td>
                                    <td className="align-right fw-bold danger-text">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
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
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} defaultType="expense" initialData={transactionToEdit} />
        </div>
    );
}
