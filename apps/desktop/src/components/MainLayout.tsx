import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@repo/core';
import { LayoutDashboard, Receipt, ArrowUpCircle, ArrowDownCircle, LogOut } from 'lucide-react';
import './MainLayout.css';

export function MainLayout() {
    const { user, logout } = useAuthStore();

    return (
        <div className="layout-container">
            {/* Sidebar de Navegação */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="LVIIS" className="sidebar-logo" />
                    <span className="user-email">{user?.email}</span>
                </div>

                <nav className="nav-menu">
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
                        <LayoutDashboard size={20} />
                        <span>Painel</span>
                    </NavLink>

                    <NavLink to="/extract" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <Receipt size={20} />
                        <span>Extrato</span>
                    </NavLink>

                    <NavLink to="/incomes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <ArrowUpCircle size={20} />
                        <span>Vendas</span>
                    </NavLink>

                    <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                        <ArrowDownCircle size={20} />
                        <span>Despesas</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => logout()}>
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal (Rotas Internas) */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
