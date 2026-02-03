
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  LayoutGrid,
  TrendingUp,
  Package,
  Save,
  Tag,
  Hash,
  DollarSign as CoinIcon
} from 'lucide-react';
import { ServiceDefinition } from '../types';
import { useData } from '../contexts/DataContext';

const INITIAL_CATALOG: ServiceDefinition[] = [
  { id: '1', code: 'PRO-001', name: 'Coroa Zircônia Monolítica', basePrice: 220.00, category: 'Prótese Fixa', order: 1 },
  { id: '2', code: 'PRO-002', name: 'Prótese Total Convencional', basePrice: 1100.00, category: 'Prótese Removível', order: 2 },
  { id: '3', code: 'PRO-003', name: 'Protocolo Cerâmico Superior', basePrice: 3500.00, category: 'Implante', order: 3 },
  { id: '4', code: 'PRO-004', name: 'Placa Miorrelaxante Acetato', basePrice: 180.00, category: 'Ortodontia', order: 4 },
  { id: '5', code: 'PRO-005', name: 'Inlay/Onlay E-max', basePrice: 280.00, category: 'Estética', order: 5 },
  { id: '6', code: 'PRO-006', name: 'Lente de Contato Dental', basePrice: 450.00, category: 'Estética', order: 6 },
];

const CATEGORIES = ['Todos', 'Prótese Fixa', 'Prótese Removível', 'Implante', 'Ortodontia', 'Estética'];

const ServiceCatalog: React.FC = () => {
  const {
    serviceDefinitions: catalog,
    addServiceDefinition,
    updateServiceDefinition,
    deleteServiceDefinition,
    loading
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceDefinition> | null>(null);

  // Estados de UI e Busca

  const filteredCatalog = useMemo(() => {
    return catalog
      .filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [catalog, searchTerm, selectedCategory]);

  const stats = useMemo(() => {
    const total = catalog.length;
    const avg = catalog.reduce((acc, s) => acc + s.basePrice, 0) / (total || 1);
    return { total, avg };
  }, [catalog]);

  const handleOpenAdd = () => {
    setEditingService({
      code: `PRO-${(catalog.length + 1).toString().padStart(3, '0')}`,
      name: '',
      basePrice: 0,
      category: 'Prótese Fixa',
      order: catalog.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceDefinition) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este serviço do catálogo?')) {
      try {
        await deleteServiceDefinition(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir item do catálogo.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || !editingService?.code) return;

    try {
      if (editingService.id) {
        await updateServiceDefinition(editingService.id, editingService);
      } else {
        await addServiceDefinition(editingService as Omit<ServiceDefinition, 'id'>);
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item no catálogo.');
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'Prótese Fixa': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Prótese Removível': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Implante': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Estética': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">

      {/* Modal Adicionar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-xl"><Package size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {editingService?.id ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="text" required className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingService?.code || ''} onChange={e => setEditingService({ ...editingService!, code: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ordem</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingService?.order || 0} onChange={e => setEditingService({ ...editingService!, order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Procedimento</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Coroa E-max" value={editingService?.name || ''} onChange={e => setEditingService({ ...editingService!, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingService?.category || ''} onChange={e => setEditingService({ ...editingService!, category: e.target.value })}>
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Base (R$)</label>
                  <div className="relative">
                    <CoinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="number" step="0.01" required className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 text-blue-600" value={editingService?.basePrice || 0} onChange={e => setEditingService({ ...editingService!, basePrice: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center space-x-2">
                  <Save size={16} />
                  <span>Salvar Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Compacto */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 mb-0.5">
            <LayoutGrid size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Gestão de Portfólio</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Catálogo de Serviços</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Defina seus preços e procedimentos</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cadastrados</span>
              <span className="text-xl font-black text-slate-800">{stats.total}</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valor Médio</span>
              <span className="text-xl font-black text-blue-600">R$ {formatCurrency(stats.avg)}</span>
            </div>
          </div>
          <button onClick={handleOpenAdd} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center space-x-2">
            <Plus size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Novo Item</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 p-2 rounded-[2rem] border border-white/40 shadow-sm backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCatalog.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCatalog.map((service) => (
            <div key={service.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getCategoryColor(service.category)}`}>
                    {service.category || 'Geral'}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEdit(service)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(service.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-sm font-black text-slate-800 leading-tight mb-1 pr-6">{service.name}</h3>
                <span className="text-[10px] font-mono font-black text-slate-300 uppercase tracking-widest">{service.code}</span>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço Sugerido</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-[10px] font-black text-blue-600">R$</span>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(service.basePrice)}</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-blue-200 transition-colors">
                  <Package size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white py-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Nenhum serviço encontrado</h3>
          <p className="text-slate-400 text-sm font-medium">Ajuste seus filtros ou adicione um novo item ao catálogo.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalog;
