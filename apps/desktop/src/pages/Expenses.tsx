import { useState } from 'react';
import { ArrowDownRight, Filter, Plus } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import './TransactionsList.css';

const mockExpenses = [
    { id: 2, date: '04/03/2026', description: 'Compra de Monitor', category: 'Equipamentos', method: 'Cartão de Crédito', amount: 1200, recurring: false, status: 'paid' },
    { id: 3, date: '02/03/2026', description: 'Licença Software', category: 'SaaS', method: 'Cartão de Crédito', amount: 250, recurring: true, status: 'paid' },
    { id: 5, date: '10/03/2026', description: 'Impostos', category: 'Tributos', method: 'PIX', amount: 800, recurring: false, status: 'pending' },
];

export function Expenses() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                    <span>Total de Custos (Mês)</span>
                    <h2 className="danger-text">R$ 2.250,00</h2>
                </div>
            </div>

            <div className="table-container panel">
                <div className="table-actions">
                    <div className="filters-group">
                        <select className="table-select">
                            <option value="all">Qualquer forma de pagto</option>
                            <option value="credit">Cartão de Crédito</option>
                            <option value="pix">PIX</option>
                        </select>
                        <select className="table-select">
                            <option value="all">Todas Categorias</option>
                        </select>
                        <button className="secondary-btn btn-icon"><Filter size={18} /> Mes / Data</button>
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
                        </tr>
                    </thead>
                    <tbody>
                        {mockExpenses.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.date}</td>
                                <td>{tx.description} {tx.recurring && <span className="badge sm warning">Recorrente</span>}</td>
                                <td>{tx.method}</td>
                                <td>
                                    <span className={`badge ${tx.status === 'paid' ? 'success' : 'warning'}`}>
                                        {tx.status === 'paid' ? 'Pago' : 'A Pagar'}
                                    </span>
                                </td>
                                <td className="align-right fw-bold danger-text">R$ {tx.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultType="expense"
            />
        </div>
    );
}
