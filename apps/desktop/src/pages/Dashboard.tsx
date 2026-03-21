import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionsContext';
import './Dashboard.css';

function parseDate(str: string): Date {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
}

export function Dashboard() {
    const { transactions, toggleTransactionStatus } = useTransactions();
    const [period, setPeriod] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredTxs = useMemo(() => {
        return transactions.filter((tx) => {
            const txDate = parseDate(tx.date);
            const now = new Date(); // Data real do sistema
            if (period === 'month') {
                return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else if (period === 'last_month') {
                const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastYear;
            } else if (period === 'custom') {
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
                return true;
            }
            return true;
        });
    }, [transactions, period, dateFrom, dateTo]);

    const filteredData = useMemo(() => {
        // Ordena por data
        const sortedTxs = [...filteredTxs].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

        // Agrupa por dia (DD/MM)
        const grouped: Record<string, { income: number; expense: number }> = {};
        sortedTxs.forEach((tx) => {
            const name = tx.date.substring(0, 5); // 'DD/MM'
            if (!grouped[name]) grouped[name] = { income: 0, expense: 0 };
            
            if (tx.type === 'income') grouped[name].income += tx.amount;
            else if (tx.type === 'expense') grouped[name].expense += tx.amount;
        });

        return Object.entries(grouped).map(([name, vals]) => ({
            name,
            income: vals.income,
            expense: vals.expense
        }));
    }, [filteredTxs]);

    const totalIncome = filteredData.reduce((s, d) => s + d.income, 0);
    const totalExpense = filteredData.reduce((s, d) => s + d.expense, 0);
    const balance = totalIncome - totalExpense;

    // Gráfico de pizza: gastos por categoria
    const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FFD60A', '#AF52DE', '#FF9F0A', '#5AC8FA', '#FF2D55'];
    const pieData = useMemo(() => {
        const byCat: Record<string, number> = {};
        filteredTxs
            .filter(tx => tx.type === 'expense')
            .forEach(tx => { byCat[tx.category] = (byCat[tx.category] || 0) + tx.amount; });
        return Object.entries(byCat).map(([name, value]) => ({ name, value }));
    }, [filteredTxs]);

    // Indicador de saúde do caixa
    const healthStatus = balance >= 0
        ? (balance > totalIncome * 0.2 ? { label: '🟢 Saudável', cls: 'status-good' }
            : { label: '🟡 Atenção', cls: 'status-warn' })
        : { label: '🔴 Crítico', cls: 'status-bad' };

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Visão Geral</h1>
                    <p className="subtitle">Acompanhe a saúde financeira da empresa.</p>
                </div>
                <div className="filters">
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
                        <option value="all">Todos os períodos</option>
                        <option value="month">Este Mês</option>
                        <option value="last_month">Mês Passado</option>
                        <option value="custom">Personalizado</option>
                    </select>
                    {period === 'custom' && (
                        <div className="date-range-inline">
                            <input type="date" className="period-select" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            <span className="date-separator-inline">até</span>
                            <input type="date" className="period-select" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                    )}
                </div>
            </header>

            {/* Cards de Resumo */}
            <div className="summary-cards">
                <div className="card">
                    <div className="card-header">
                        <span>Vendas</span>
                        <div className="icon-wrapper success"><ArrowUpRight size={20} /></div>
                    </div>
                    <div className="card-value success-text">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span>Custos</span>
                        <div className="icon-wrapper danger"><ArrowDownRight size={20} /></div>
                    </div>
                    <div className="card-value danger-text">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="card highlighted">
                    <div className="card-header">
                        <span>Saldo (Período)</span>
                        <div className="icon-wrapper"><DollarSign size={20} /></div>
                    </div>
                    <div className="card-value">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className={`card-status ${healthStatus.cls}`}>{healthStatus.label}</p>
                </div>
            </div>

            <div className="dashboard-grid charts-grid">
                {/* Gráfico de Entradas x Saídas */}
                <div className="chart-section panel">
                    <h3>Fluxo de Caixa</h3>
                    <div className="chart-wrapper">
                        {filteredData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                Nenhum dado para o período selecionado.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        )}
                    </div>
                </div>

                {/* Gráfico de Pizza - Gastos por Categoria */}
                <div className="chart-section panel">
                    <h3>Gastos por Categoria</h3>
                    <div className="chart-wrapper">
                        {pieData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                Nenhum dado disponível.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}>
                                        {pieData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number, name: string) => {
                                            const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
                                            const percent = ((value / total) * 100).toFixed(0);
                                            return [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percent}%)`, name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#ccc', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid alerts-grid" style={{ marginTop: '20px', gridTemplateColumns: '1fr' }}>
                {/* Quadro de Avisos */}
                <div className="alerts-section panel">
                    <h3>Quadro de Avisos</h3>
                    <p className="panel-subtitle">Vencimentos próximos e atrasos</p>

                    <div className="alerts-list">
                        {transactions
                            .filter(tx => tx.type === 'expense' && (tx.status === 'pending' || tx.isRecurring))
                            .slice(0, 4)
                            .map(tx => {
                                const txDate = parseDate(tx.date);
                                const now = new Date(2026, 2, 15);
                                const isOverdue = txDate < now && tx.status === 'pending';
                                
                                return (
                                    <div key={tx.id} 
                                        className={`alert-item ${isOverdue ? 'overdue' : tx.isRecurring ? '' : 'warning'}`}
                                        onClick={() => toggleTransactionStatus(tx.id)}
                                        style={{ cursor: 'pointer' }}
                                        title={tx.status === 'pending' ? "Clique para marcar como Pago" : "Clique para marcar como Pendente"}
                                    >
                                        <div className="alert-icon"><AlertCircle size={18} /></div>
                                        <div className="alert-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <strong>{tx.description}</strong>
                                                {tx.isRecurring && <span className="badge warning" style={{ fontSize: '10px', padding: '2px 6px' }}>Recorrente</span>}
                                            </div>
                                            <span>{isOverdue ? 'Vencido' : `Vence em ${tx.date}`}</span>
                                        </div>
                                        <div className="alert-value">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                );
                        })}
                        {transactions.filter(tx => tx.type === 'expense' && (tx.status === 'pending' || tx.isRecurring)).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                                Tudo em dia!
                            </div>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Link to="/expenses" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                            Ver todas as contas a pagar &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
