import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import './TransactionsList.css'; // Compartilhado entre Extract, Incomes e Expenses

const mockTransactions = [
    { id: 1, date: '05/03/2026', description: 'Venda Consultoria', category: 'Serviços', method: 'PIX', amount: 4500, type: 'income' },
    { id: 2, date: '04/03/2026', description: 'Compra de Monitor', category: 'Equipamentos', method: 'Cartão de Crédito', amount: 1200, type: 'expense' },
    { id: 3, date: '02/03/2026', description: 'Licença Software', category: 'SaaS', method: 'Cartão de Crédito', amount: 250, type: 'expense' },
    { id: 4, date: '01/03/2026', description: 'Mensalidade Cliente A', category: 'Serviços Recorrentes', method: 'Boleto', amount: 1500, type: 'income' },
];

export function Extract() {
    const [filterType, setFilterType] = useState('all');

    return (
        <div className="list-page-container">
            <header className="page-header">
                <div>
                    <h1>Extrato Completo</h1>
                    <p className="subtitle">Histórico de todas as suas entradas e saídas.</p>
                </div>
            </header>

            {/* Cards de Resumo */}
            <div className="summary-cards">
                <div className="card">
                    <div className="card-header">
                        <span>Receita Total</span>
                        <div className="icon-wrapper success"><ArrowUpRight size={20} /></div>
                    </div>
                    <div className="card-value success-text">R$ 6.000,00</div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <span>Despesa Total</span>
                        <div className="icon-wrapper danger"><ArrowDownRight size={20} /></div>
                    </div>
                    <div className="card-value danger-text">R$ 1.450,00</div>
                </div>
                <div className="card main-card">
                    <div className="card-header">
                        <span>Saldo do Período</span>
                    </div>
                    <div className="card-value">R$ 4.550,00</div>
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
                        <select className="table-select">
                            <option value="all">Qualquer forma de pagto</option>
                            <option value="pix">PIX</option>
                            <option value="credit">Cartão de Crédito</option>
                        </select>
                        <button className="secondary-btn btn-icon"><Filter size={18} /> Filtrar Data</button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Forma Pgt.</th>
                            <th className="align-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockTransactions.map((tx) => (
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
                                <td className={`align-right fw-bold ${tx.type === 'income' ? 'success-text' : 'danger-text'}`}>
                                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
