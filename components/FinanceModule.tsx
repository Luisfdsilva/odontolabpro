
import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpCircle, ArrowDownCircle, Plus, Filter, FileSpreadsheet, Calendar, Search,
  Wallet, X, Trash2, Edit3, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle2,
  CalendarDays, Download, PieChart, Landmark, ArrowRightLeft
} from 'lucide-react';
import { Transaction } from '../types';
import { useData } from '../contexts/DataContext';
import * as XLSX from 'xlsx';

const CATEGORIES = ['Serviço', 'Insumos', 'Aluguel', 'Energia/Água', 'Marketing', 'Pessoal', 'Impostos', 'Investimentos', 'Outros'];

const MONTHS = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
];

const YEARS = [2023, 2024, 2025, 2026];

const FinanceCard: React.FC<{ title: string, value: number, icon: React.ReactNode, color: string, bgColor: string, label: string }> = ({ title, value, icon, color, bgColor, label }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
    </div>
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <p className="text-2xl font-black text-slate-900 mt-1">
      R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </p>
    <div className={`absolute bottom-0 left-0 h-1 w-full ${color.replace('text-', 'bg-')} opacity-10`}></div>
  </div>
);

const FinanceModule: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useData();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Partial<Transaction> = {
    description: '',
    type: 'Receita',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Serviço',
    status: 'Pago'
  };

  const [formData, setFormData] = useState<Partial<Transaction>>(initialFormState);

  // Estados de Filtro e UI

  // Cálculos de Dashboard
  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const tDate = new Date(t.date);
      const isCurrentMonth = (tDate.getMonth() + 1 === selectedMonth) && (tDate.getFullYear() === selectedYear);

      if (isCurrentMonth) {
        if (t.type === 'Receita') {
          if (t.status === 'Pago') acc.realIncomes += t.amount;
          else acc.pendingIncomes += t.amount;
        } else {
          if (t.status === 'Pago') acc.realExpenses += t.amount;
          else acc.pendingExpenses += t.amount;
        }
      }
      return acc;
    }, { realIncomes: 0, realExpenses: 0, pendingIncomes: 0, pendingExpenses: 0 });
  }, [transactions, selectedMonth, selectedYear]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());
      return m === selectedMonth && y === selectedYear && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, selectedYear, searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    try {
      if (editingId) {
        await updateTransaction(editingId, formData);
      } else {
        await addTransaction(formData as Omit<Transaction, 'id'>);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar lançamento.");
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja excluir permanentemente este lançamento financeiro?")) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir lançamento.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const exportToExcel = () => {
    const dataToExport = filteredTransactions.map(t => ({
      'Data / Vencimento': t.date.split('-').reverse().join('/'),
      'Descrição': t.description,
      'Categoria': t.category,
      'Tipo de Fluxo': t.type,
      'Valor (R$)': t.amount,
      'Status de Pagamento': t.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Financeiro");
    XLSX.writeFile(wb, `Financeiro_${selectedMonth}_${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Modal de Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 flex items-center justify-between text-white ${formData.type === 'Receita' ? 'bg-blue-600' : 'bg-rose-600'}`}>
              <div className="flex items-center space-x-3">
                <Landmark size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">{editingId ? 'Editar Lançamento' : `Nova ${formData.type}`}</h3>
              </div>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'Receita' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'Receita' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Receita</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'Despesa' })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'Despesa' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Despesa</button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Lançamento</label>
                <input type="text" required placeholder="Ex: Recebimento Dr. Silva / Compra Gesso" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor R$</label>
                  <input type="number" step="0.01" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                  <input type="date" required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="Pago">Efetivado (Pago)</option>
                    <option value="Pendente">Previsto (Pendente)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className={`flex-[2] py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${formData.type === 'Receita' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                  {editingId ? 'Salvar Alterações' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header e Ações Principais */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
            <PieChart size={14} /><span>Gestão de Caixa</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Financeiro</h2>
          <p className="text-slate-500 text-sm font-medium">Controle total de entradas, saídas e projeções.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={exportToExcel} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm group" title="Exportar Excel">
            <FileSpreadsheet size={22} className="group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => { setFormData(initialFormState); setIsModalOpen(true); }} className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95">
            <Plus size={20} /><span>Lançar Valor</span>
          </button>
        </div>
      </div>

      {/* Dashboard Bento de Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <FinanceCard
          title="Saldo Atual"
          value={stats.realIncomes - stats.realExpenses}
          icon={<Wallet size={20} />}
          color="text-blue-600"
          bgColor="bg-blue-50"
          label="Em Caixa"
        />
        <FinanceCard
          title="Entradas (Mês)"
          value={stats.realIncomes}
          icon={<ArrowUpCircle size={20} />}
          color="text-emerald-500"
          bgColor="bg-emerald-50"
          label="Efetivado"
        />
        <FinanceCard
          title="Saídas (Mês)"
          value={stats.realExpenses}
          icon={<ArrowDownCircle size={20} />}
          color="text-rose-500"
          bgColor="bg-rose-50"
          label="Efetivado"
        />
        <FinanceCard
          title="Previsão Final"
          value={(stats.realIncomes + stats.pendingIncomes) - (stats.realExpenses + stats.pendingExpenses)}
          icon={<Clock size={20} />}
          color="text-amber-500"
          bgColor="bg-amber-50"
          label="Estimado"
        />
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
          {MONTHS.map(m => (
            <button key={m.value} onClick={() => setSelectedMonth(m.value)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedMonth === m.value ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-blue-500">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Pesquisar registro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left table-auto min-w-[1000px]">
          <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">Vencimento</th>
              <th className="px-6 py-5">Descrição</th>
              <th className="px-6 py-5">Categoria</th>
              <th className="px-6 py-5 text-center">Tipo</th>
              <th className="px-6 py-5 text-right">Valor</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[11px]">
            {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-4 text-slate-400 font-mono font-bold whitespace-nowrap">{t.date.split('-').reverse().join('/')}</td>
                <td className="px-6 py-4 font-black text-slate-800 whitespace-nowrap uppercase tracking-tight">{t.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-bold text-[9px] uppercase border border-slate-200/50">{t.category}</span>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className={`inline-flex items-center space-x-1.5 font-black uppercase text-[9px] ${t.type === 'Receita' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'Receita' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{t.type}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 font-black text-right whitespace-nowrap ${t.type === 'Receita' ? 'text-blue-600' : 'text-slate-900'}`}>
                  R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase inline-flex items-center space-x-1.5 ${t.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                    {t.status === 'Pago' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    <span>{t.status === 'Pago' ? 'Liquidado' : 'Pendente'}</span>
                  </div>
                </td>
                <td className="px-8 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => handleEdit(t)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Editar"><Edit3 size={15} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Excluir"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-8 py-24 text-center opacity-20 font-black uppercase text-xs tracking-widest">Nenhuma movimentação para este período</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceModule;
