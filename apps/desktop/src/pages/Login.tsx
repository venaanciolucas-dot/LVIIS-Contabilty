import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@repo/api';
import './Login.css';

export function Login() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Conta criada! Você já pode fazer login (ou verifique seu email se o Supabase exigir).');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Erro na autenticação');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-brand">
                    <img src="/logo.png" alt="LVIIS Logo" className="brand-logo" />
                </div>
                <h2>{isLogin ? 'Backoffice' : 'Criar Conta'}</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="primary-btn">
                        {loading ? 'Carregando...' : (isLogin ? 'ENTRAR' : 'CADASTRAR')}
                    </button>
                </form>

                <button
                    className="toggle-mode-btn"
                    onClick={() => setIsLogin(!isLogin)}
                    type="button"
                >
                    {isLogin ? 'Ainda não tem conta? Criar uma.' : 'Já tem conta? Entrar.'}
                </button>
            </div>
        </div>
    );
}
