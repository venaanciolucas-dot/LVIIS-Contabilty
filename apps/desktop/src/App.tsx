import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from './components/AuthGuard';
import { MainLayout } from './components/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Extract } from './pages/Extract';
import { Incomes } from './pages/Incomes';
import { Expenses } from './pages/Expenses';
import { TransactionsProvider } from './contexts/TransactionsContext';

function App() {
  return (
    <TransactionsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas envelopadas pelo MainLayout */}
          <Route path="/" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }>
            <Route index element={<Dashboard />} />
            <Route path="extract" element={<Extract />} />
            <Route path="incomes" element={<Incomes />} />
            <Route path="expenses" element={<Expenses />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TransactionsProvider>
  );
}

export default App;
