import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle } from 'lucide-react';
import './Dashboard.css';

// Mock data para estruturar o visual inicial
const mockData = [
    { name: '01', income: 4000, expense: 2400 },
    { name: '05', income: 3000, expense: 1398 },
    { name: '10', income: 2000, expense: 9800 },
    { name: '15', income: 2780, expense: 3908 },
    { name: '20', income: 1890, expense: 4800 },
    { name: '25', income: 2390, expense: 3800 },
    { name: '30', income: 3490, expense: 4300 },
];

export function Dashboard() {
    const [period, setPeriod] = useState('month');

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Visão Geral</h1>
                    <p className="subtitle">Acompanhe a saúde financeira da empresa.</p>
                </div>
                <div className="filters">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
                        <option value="month">Este Mês</option>
                        <option value="last_month">Mês Passado</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>
            </header>

            {/* Cards de Resumo */}
            <div className="summary-cards">
                <div className="card">
                    <div className="card-header">
                        <span>Vendas</span>
                        <div className="icon-wrapper success">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="card-value success-text">R$ 19.550,00</div>
                    <p className="card-compare">+12% vs mês passado</p>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span>Custos</span>
                        <div className="icon-wrapper danger">
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div className="card-value danger-text">R$ 6.306,00</div>
                    <p className="card-compare">-2% vs mês passado</p>
                </div>

                <div className="card main-card">
                    <div className="card-header">
                        <span>Saldo (Período)</span>
                        <div className="icon-wrapper">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="card-value">R$ 13.244,00</div>
                </div>

                <div className="card highlighted">
                    <div className="card-header">
                        <span>Caixa Atual (Global)</span>
                    </div>
                    <div className="card-value">R$ 145.890,50</div>
                    <p className="card-status status-good">🟢 Saudável</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Gráfico de Entradas x Saídas */}
                <div className="chart-section panel">
                    <h3>Fluxo de Caixa</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="income" name="Vendas" stroke="#34C759" fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" name="Custos" stroke="#FF3B30" fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quadro de Avisos (Recorrências) */}
                <div className="alerts-section panel">
                    <h3>Quadro de Avisos</h3>
                    <p className="panel-subtitle">Vencimentos próximos e atrasos</p>

                    <div className="alerts-list">
                        <div className="alert-item overdue">
                            <div className="alert-icon"><AlertCircle size={18} /></div>
                            <div className="alert-info">
                                <strong>Aluguel Sala</strong>
                                <span>Venceu ontem</span>
                            </div>
                            <div className="alert-value">R$ 2.500,00</div>
                        </div>

                        <div className="alert-item warning">
                            <div className="alert-icon"><AlertCircle size={18} /></div>
                            <div className="alert-info">
                                <strong>Internet VIVO</strong>
                                <span>Vence em 3 dias</span>
                            </div>
                            <div className="alert-value">R$ 150,00</div>
                        </div>

                        <div className="alert-item">
                            <div className="alert-info">
                                <strong>Salários</strong>
                                <span>Vence em 15 dias</span>
                            </div>
                            <div className="alert-value">R$ 8.900,00</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
