import { useState } from 'react';
import { X } from 'lucide-react';
import './TransactionModal.css';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: 'income' | 'expense';
}

export function TransactionModal({ isOpen, onClose, defaultType = 'expense' }: TransactionModalProps) {
    const [type, setType] = useState(defaultType);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [method, setMethod] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Conectar com a store (Zustand -> Supabase) na próxima fase
        alert(`Salvo localmente! (Integrar Supabase na Fase 5)\n\nValor: R$ ${amount}\nDesc: ${description}`);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Nova Transação</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </header>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="type-toggle">
                        <button type="button"
                            className={`toggle-btn ${type === 'income' ? 'active-income' : ''}`}
                            onClick={() => setType('income')}
                        >Receita</button>
                        <button type="button"
                            className={`toggle-btn ${type === 'expense' ? 'active-expense' : ''}`}
                            onClick={() => setType('expense')}
                        >Despesa</button>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" required
                                className={`amount-input ${type === 'income' ? 'success-text' : 'danger-text'}`}
                                placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <div className="form-group flex-1">
                            <label>Data</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" required placeholder="Ex: Conta de Luz"
                            value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Categoria</label>
                            <select required value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="" disabled>Selecione...</option>
                                <option value="Serviços">Serviços</option>
                                <option value="Equipamentos">Equipamentos</option>
                                <option value="SaaS">SaaS</option>
                                <option value="Impostos">Impostos</option>
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>Forma de Pagto.</label>
                            <select required value={method} onChange={e => setMethod(e.target.value)}>
                                <option value="" disabled>Selecione...</option>
                                <option value="PIX">PIX</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Boleto">Boleto</option>
                                <option value="TED/DOC">TED/DOC</option>
                            </select>
                        </div>
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="primary-btn submit-btn">Confirmar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
