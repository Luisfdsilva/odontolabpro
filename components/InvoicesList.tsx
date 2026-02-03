
import React, { useState } from 'react';
import { FileText, Plus, Search, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Invoice } from '../types';

const MOCK_INVOICES: Invoice[] = [
  { id: 'FAT-001', serviceId: '1', clientId: 'C1', clientName: 'Dr. Ricardo Silva', amount: 450, issueDate: '2023-10-25', status: 'Paga' },
  { id: 'FAT-002', serviceId: '2', clientId: 'C2', clientName: 'Dra. Ana Costa', amount: 1200, issueDate: '2023-10-26', status: 'Pendente' },
  { id: 'FAT-003', serviceId: '3', clientId: 'C3', clientName: 'Clínica Sorriso', amount: 2800, issueDate: '2023-10-27', status: 'Pendente' },
];

const InvoicesList: React.FC = () => {
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Faturamento</h2>
          <p className="text-slate-500 text-xs">Gestão de faturas e cobranças.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest transition-all">
          <Plus size={16} /><span>Nova Fatura</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-50 bg-slate-50/30">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-400">{inv.id}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-800">{inv.clientName}</td>
                  <td className="px-4 py-2.5 font-black text-right text-slate-900">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                      inv.status === 'Paga' ? 'bg-blue-50 text-blue-600' : 
                      inv.status === 'Pendente' ? 'bg-amber-50 text-amber-600' : 
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><Download size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesList;
