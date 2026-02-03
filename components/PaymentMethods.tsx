
import React, { useState } from 'react';
import { Plus, CreditCard, Wallet, QrCode, Banknote, Landmark, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { PaymentMethod } from '../types';

const PaymentMethods: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'PIX à Vista', active: true, type: 'pix' },
    { id: '2', name: 'Cartão de Crédito 1x', active: true, type: 'credit' },
    { id: '3', name: 'Boleto Bancário', active: false, type: 'transfer' },
    { id: '4', name: 'Dinheiro', active: true, type: 'cash' },
  ]);

  const toggleStatus = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const getTypeIcon = (type: PaymentMethod['type']) => {
    switch(type) {
      case 'pix': return <QrCode size={20} />;
      case 'credit': return <CreditCard size={20} />;
      case 'debit': return <Wallet size={20} />;
      case 'cash': return <Banknote size={20} />;
      case 'transfer': return <Landmark size={20} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Formas de Pagamento</h2>
          <p className="text-slate-500">Configure os métodos aceitos para serviços e faturamento.</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100 transition-all transform active:scale-95">
          <Plus size={20} />
          <span>Novo Método</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div 
            key={method.id} 
            className={`bg-white p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden group ${
              method.active ? 'border-emerald-100' : 'border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${method.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {getTypeIcon(method.type)}
              </div>
              <button 
                onClick={() => toggleStatus(method.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  method.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {method.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                <span>{method.active ? 'Ativo' : 'Inativo'}</span>
              </button>
            </div>

            <h4 className="text-lg font-black text-slate-800 mb-1">{method.name}</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{method.type}</p>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all">
                  <Edit3 size={18} />
                </button>
                <button className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
              <span className="text-[10px] font-bold text-slate-300">ID: #{method.id}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
        <Wallet className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h5 className="text-sm font-bold text-amber-800">Dica de Gestão</h5>
          <p className="text-xs text-amber-700 leading-relaxed mt-1">
            Mantenha as formas de pagamento atualizadas para facilitar a conciliação bancária automática no módulo financeiro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
