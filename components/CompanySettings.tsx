
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Fingerprint,
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  QrCode,
  Banknote,
  Landmark,
  Wallet,
  Settings,
  Database,
  Download,
  Percent,
  Tag,
  Info,
  BadgePercent,
  BadgeDollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  FileJson
} from 'lucide-react';
import { CompanyInfo, PaymentMethod } from '../types';
import { useData } from '../contexts/DataContext';
import * as XLSX from 'xlsx';

const CompanySettings: React.FC = () => {
  const {
    companyInfo: info,
    updateCompanyInfo,
    paymentMethods: methods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    loading
  } = useData();

  const [activeTab, setActiveTab] = useState<'geral' | 'vendas' | 'pagamentos' | 'backup'>('geral');
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Estado para Modal de Edição de Pagamento

  // Estado para Modal de Edição de Pagamento
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompanyInfo(info!);
      alert('Configurações atualizadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const exportFullBackup = () => {
    // Coleta de todos os dados do sistema
    const companyData = [info];
    const paymentMethods = methods;
    const services = JSON.parse(localStorage.getItem('odontolab_services') || '[]');
    const clients = JSON.parse(localStorage.getItem('odontolab_clients') || '[]');
    const catalog = JSON.parse(localStorage.getItem('odontolab_catalog') || '[]');
    const finance = JSON.parse(localStorage.getItem('odontolab_finance') || '[]');

    const wb = XLSX.utils.book_new();

    // Aba 1: Configurações da Empresa
    const wsCompany = XLSX.utils.json_to_sheet(companyData);
    XLSX.utils.book_append_sheet(wb, wsCompany, "EMPRESA");

    // Aba 2: Canais de Pagamento
    const wsPayments = XLSX.utils.json_to_sheet(paymentMethods);
    XLSX.utils.book_append_sheet(wb, wsPayments, "PAGAMENTOS");

    // Aba 3: Ordens de Serviço
    const wsServices = XLSX.utils.json_to_sheet(services);
    XLSX.utils.book_append_sheet(wb, wsServices, "SERVICOS_OS");

    // Aba 4: Clientes / Dentistas
    const wsClients = XLSX.utils.json_to_sheet(clients);
    XLSX.utils.book_append_sheet(wb, wsClients, "CLIENTES_DENTISTAS");

    // Aba 5: Catálogo de Preços
    const wsCatalog = XLSX.utils.json_to_sheet(catalog);
    XLSX.utils.book_append_sheet(wb, wsCatalog, "CATALOGO");

    // Aba 6: Fluxo Financeiro
    const wsFinance = XLSX.utils.json_to_sheet(finance);
    XLSX.utils.book_append_sheet(wb, wsFinance, "FINANCEIRO");

    // Geração do arquivo
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `BACKUP_TOTAL_ODONTOLAB_${dateStr}.xlsx`);

    setLastBackup(new Date().toLocaleString('pt-BR'));
    alert('Backup completo gerado com sucesso!');
  };

  const getTypeIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'pix': return <QrCode size={18} />;
      case 'credit': return <CreditCard size={18} />;
      case 'debit': return <Wallet size={18} />;
      case 'cash': return <Banknote size={18} />;
      case 'transfer': return <Landmark size={18} />;
      default: return <CreditCard size={18} />;
    }
  };

  const handleOpenNewMethod = () => {
    setEditingMethod({ name: '', type: 'pix', discount: 0, active: true });
    setIsMethodModalOpen(true);
  };

  const handleOpenEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsMethodModalOpen(true);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod?.name) return;

    try {
      if (editingMethod.id) {
        await updatePaymentMethod(editingMethod.id, editingMethod);
      } else {
        await addPaymentMethod(editingMethod as Omit<PaymentMethod, 'id'>);
      }
      setIsMethodModalOpen(false);
      setEditingMethod(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar canal de pagamento.');
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (window.confirm('Deseja excluir este canal de pagamento?')) {
      try {
        await deletePaymentMethod(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir canal de pagamento.');
      }
    }
  };

  const toggleMethodActive = async (id: string) => {
    const method = methods.find(m => m.id === id);
    if (!method) return;
    try {
      await updatePaymentMethod(id, { active: !method.active });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !info) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

      {/* Modal de Pagamento */}
      {isMethodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <h3 className="text-lg font-black uppercase tracking-tight">{editingMethod?.id ? 'Editar Canal' : 'Novo Canal de Recebimento'}</h3>
              <button onClick={() => setIsMethodModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMethod} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Canal</label>
                <input required type="text" value={editingMethod?.name || ''} onChange={e => setEditingMethod({ ...editingMethod!, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: PIX Empresa" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select value={editingMethod?.type || 'pix'} onChange={e => setEditingMethod({ ...editingMethod!, type: e.target.value as any })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pix">PIX</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="debit">Cartão de Débito</option>
                    <option value="cash">Dinheiro</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desconto (%)</label>
                  <input type="number" value={editingMethod?.discount || 0} onChange={e => setEditingMethod({ ...editingMethod!, discount: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex items-center space-x-3">
                <button type="button" onClick={() => setIsMethodModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">Salvar Canal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-blue-600 mb-0.5">
            <Settings size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Painel de Administração</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Configurações</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gerencie os dados vitais do laboratório</p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('geral')} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'geral' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Geral</button>
          <button onClick={() => setActiveTab('vendas')} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'vendas' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Vendas</button>
          <button onClick={() => setActiveTab('pagamentos')} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'pagamentos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Pagamentos</button>
          <button onClick={() => setActiveTab('backup')} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'backup' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Backup</button>
        </div>
      </div>

      {activeTab === 'geral' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center space-x-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Building2 size={24} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Informações Cadastrais</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identificação e contato oficial</p>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                  <input type="text" value={info.name} onChange={e => updateCompanyInfo({ ...info, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" value={info.cnpj} onChange={e => updateCompanyInfo({ ...info, cnpj: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Contato</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="email" value={info.email} onChange={e => updateCompanyInfo({ ...info, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone Principal</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="text" value={info.phone} onChange={e => updateCompanyInfo({ ...info, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Comercial</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" value={info.address} onChange={e => updateCompanyInfo({ ...info, address: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button type="submit" disabled={saving} className="px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                  {saving ? 'Gravando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'vendas' && (
        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center space-x-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><BadgeDollarSign size={24} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Política de Preços</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Descontos e promoções globais</p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="max-w-md bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex items-center space-x-2 text-rose-600">
                  <Percent size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Campanha Ativa</span>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Desconto Global (%)
                    <div className="group relative cursor-help"><Info size={12} className="text-slate-400" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Aplicado automaticamente ao selecionar um serviço do catálogo.</div></div>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={info.globalDiscount || 0}
                    onChange={e => {
                      const newVal = Number(e.target.value);
                      updateCompanyInfo({ ...info, globalDiscount: newVal });
                    }}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-black outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                  * Alterações neste campo refletirão imediatamente na criação de novas Ordens de Serviço.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pagamentos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Canais de Pagamento</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configurações de recebimento.</p>
            </div>
            <button onClick={handleOpenNewMethod} className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all">
              <Plus size={16} /><span>Adicionar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <div key={method.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all group relative overflow-hidden ${method.active ? 'border-slate-100' : 'border-slate-200 opacity-60 grayscale'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-colors ${method.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {getTypeIcon(method.type)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => toggleMethodActive(method.id)} className={`p-1.5 rounded-lg transition-all ${method.active ? 'text-blue-500 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                      {method.active ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </button>
                    <button onClick={() => handleOpenEditMethod(method)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteMethod(method.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight">{method.name}</h4>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{method.type}</span>
                    {method.discount ? (
                      <span className="flex items-center text-[9px] font-black text-rose-500 space-x-0.5">
                        <Tag size={10} /><span>-{method.discount}%</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-100 mx-auto">
              <Database size={36} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Backup Total do Sistema</h3>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Este processo gera um arquivo Excel (.xlsx) consolidado contendo:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['O.S.', 'Clientes', 'Catálogo', 'Financeiro', 'Empresa'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 text-[10px] font-black uppercase text-slate-400 rounded-full border border-slate-100">{tag}</span>
                ))}
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={exportFullBackup}
                className="inline-flex items-center space-x-3 px-12 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                <Download size={20} />
                <span>Iniciar Backup Total</span>
              </button>
            </div>
            {lastBackup && (
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                Último backup realizado em: {lastBackup}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
