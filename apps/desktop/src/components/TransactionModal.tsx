import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactions, Transaction } from '../contexts/TransactionsContext';
import './TransactionModal.css';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: 'income' | 'expense';
    initialData?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, defaultType = 'expense', initialData }: TransactionModalProps) {
    const { addTransaction, editTransaction, categories } = useTransactions();
    const [type, setType] = useState(defaultType);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [method, setMethod] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [status, setStatus] = useState<'paid'|'pending'>('pending');
    const [attachment, setAttachment] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType(initialData.type);
                setAmount(String(initialData.amount));
                setDescription(initialData.description);
                const [d, m, y] = initialData.date.split('/');
                setDate(`${y}-${m}-${d}`);
                setCategory(initialData.category);
                setMethod(initialData.method);
                setStatus(initialData.status);
                setIsRecurring(initialData.isRecurring || false);
                setAttachment(null);
            } else {
                setType(defaultType);
                setAmount('');
                setDescription('');
                setDate(new Date().toISOString().split('T')[0]);
                setCategory('');
                setMethod('');
                setStatus('pending');
                setIsRecurring(false);
                setAttachment(null);
            }
            setIsCreatingCategory(false);
            setNewCategory('');
        }
    }, [isOpen, initialData, defaultType]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Conversão da data (YYYY-MM-DD para DD/MM/YYYY)
        const [y, m, d] = date.split('-');
        const formattedDate = `${d}/${m}/${y}`;
        
        const finalCategory = isCreatingCategory && newCategory.trim() ? newCategory.trim() : category;
        const attachmentUrl = attachment ? URL.createObjectURL(attachment) : initialData?.attachment;

        const txData = {
            description,
            amount: parseFloat(amount),
            date: formattedDate,
            category: finalCategory,
            method,
            type: type as 'income' | 'expense',
            status: type === 'expense' ? status : 'paid',
            isRecurring,
            attachment: attachmentUrl
        };

        if (initialData) {
            editTransaction(initialData.id, txData);
            alert(`Transação atualizada com sucesso!\n\nValor: R$ ${amount}\nDesc: ${description}`);
        } else {
            addTransaction(txData);
            alert(`Transação adicionada com sucesso!\n\nValor: R$ ${amount}\nDesc: ${description}`);
        }
        
        // Reset and close
        setAmount('');
        setDescription('');
        setCategory('');
        setNewCategory('');
        setIsCreatingCategory(false);
        setAttachment(null);
        setStatus('pending');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>{initialData ? 'Editar Transação' : 'Nova Transação'}</h2>
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

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" className="custom-checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                            Esta é uma transação recorrente (Mensal)
                        </label>
                    </div>

                    {type === 'expense' && (
                        <div className="form-group">
                            <label>Status</label>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '14px', cursor: 'pointer' }}>
                                    <input type="radio" name="status" value="pending" checked={status === 'pending'} onChange={() => setStatus('pending')} />
                                    A Pagar
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '14px', cursor: 'pointer' }}>
                                    <input type="radio" name="status" value="paid" checked={status === 'paid'} onChange={() => setStatus('paid')} />
                                    Pago
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" required placeholder="Ex: Conta de Luz"
                            value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Categoria</label>
                            {!isCreatingCategory ? (
                                <select required value={category} onChange={e => {
                                    if(e.target.value === '__NEW__') {
                                        setIsCreatingCategory(true);
                                        setCategory('');
                                    } else {
                                        setCategory(e.target.value);
                                    }
                                }}>
                                    <option value="" disabled>Selecione...</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="__NEW__" style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>+ Nova Categoria</option>
                                </select>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" autoFocus required placeholder="Nome da categoria..." value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ flex: 1 }} />
                                    <button type="button" className="secondary-btn" onClick={() => { setIsCreatingCategory(false); setCategory(''); }} style={{ padding: '0 12px' }}>X</button>
                                </div>
                            )}
                        </div>
                        <div className="form-group flex-1">
                            <label>Forma de Pagto.</label>
                            <select required value={method} onChange={e => setMethod(e.target.value)}>
                                <option value="" disabled>Selecione...</option>
                                <option value="PIX">PIX</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                                <option value="Boleto">Boleto</option>
                                <option value="TED/DOC">TED/DOC</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Comprovante / Anexo <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'normal' }}>(Opcional)</span></label>
                        <input type="file" onChange={e => setAttachment(e.target.files?.[0] || null)} style={{ fontSize: '14px', marginTop: '4px' }} />
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
