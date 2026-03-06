import { useState } from 'react';
import { ArrowUpRight, Filter, Plus } from 'lucide-react';
import { TransactionModal } from '../components/TransactionModal';
import './TransactionsList.css';

const mockIncomes = [
    { id: 1, date: '05/03/2026', description: 'Venda Consultoria', category: 'Serviços', method: 'PIX', amount: 4500, recurring: false },
    { id: 4, date: '01/03/2026', description: 'Mensalidade Cliente A', category: 'Serviços Recorrentes', method: 'Boleto', amount: 1500, recurring: true },
];

export function Incomes() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="list-page-container">
            <header className="page-header">
                <div>
                    <h1>Vendas</h1>
                    <p className="subtitle">Controle de receitas e entradas da empresa.</p>
                </div>
                <button
                    className="primary-btn btn-icon"
                    style={{ width: 'auto' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} /> NOVA VENDA
                </button>
            </header>

            <div className="featured-total success-bg">
                <div className="icon-wrapper big success"><ArrowUpRight size={28} /></div>
                <div className="total-info">
                    <span>Total de Vendas (Mês)</span>
                    <h2>R$ 6.000,00</h2>
                </div>
            </div>

            <div className="table-container panel">
                <div className="table-actions">
                    <div className="filters-group">
                        <select className="table-select">
                            <option value="all">Todas as formas de pagto</option>
                            <option value="pix">PIX</option>
                            <option value="boleto">Boleto</option>
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
                        {mockIncomes.map((tx) => (
                            <tr key={tx.id}>
                                <td>{tx.date}</td>
                                <td>{tx.description} {tx.recurring && <span className="badge sm">Recorrente</span>}</td>
                                <td>{tx.method}</td>
                                <td><span className="badge success">Recebido</span></td>
                                <td className="align-right fw-bold success-text">R$ {tx.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultType="income"
            />
        </div>
    );
}
