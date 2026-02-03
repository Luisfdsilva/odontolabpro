
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Edit3, Trash2, Printer, FileSpreadsheet, X, Layers,
  Download, FileText, CreditCard, Tag, Calendar, Filter, XCircle, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Service, ServiceStatus, ServiceDefinition, CompanyInfo, Client, PaymentMethod } from '../types';
import { useData } from '../contexts/DataContext';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const INITIAL_CATALOG: ServiceDefinition[] = [
  { id: '1', code: 'PRO-001', name: 'Coroa Zircônia Monolítica', basePrice: 220.00, order: 1 },
  { id: '2', code: 'PRO-002', name: 'Prótese Total Convencional', basePrice: 1100.00, order: 2 },
  { id: '3', code: 'PRO-003', name: 'Protocolo Cerâmico Superior', basePrice: 3500.00, order: 3 },
  { id: '4', code: 'PRO-004', name: 'Placa Miorrelaxante Acetato', basePrice: 180.00, order: 4 },
  { id: '5', code: 'PRO-005', name: 'Inlay/Onlay E-max', basePrice: 280.00, order: 5 },
];

const MOCK_SERVICES: Service[] = [
  { id: '1', clientName: 'Dr. Ricardo Silva', patientName: 'Maria Oliveira', type: 'Coroa Zircônia Monolítica', material: 'Zircônia', quantity: 2, unitValue: 220, discountValue: 22, totalValue: 418, entryDate: '2023-10-25', deadline: '2023-11-02', status: 'Em Produção', observations: 'Paciente solicitou cor A2.', paymentMethodId: '1' },
];

const STATUS_OPTIONS: ServiceStatus[] = ['Pendente', 'Em Produção', 'Finalizado', 'Entregue'];

const StatusBadge: React.FC<{ status: ServiceStatus }> = ({ status }) => {
  const styles: Record<ServiceStatus, string> = {
    'Pendente': 'bg-amber-100 text-amber-700 border-amber-200',
    'Em Produção': 'bg-blue-100 text-blue-700 border-blue-200',
    'Finalizado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Entregue': 'bg-slate-100 text-slate-700 border-slate-200'
  };
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status]} whitespace-nowrap`}>{status}</span>;
};

const ServicesList: React.FC = () => {
  const {
    services, addService, updateService, deleteService,
    clients: registeredClients,
    serviceDefinitions: catalog,
    paymentMethods,
    companyInfo: settings,
    loading
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDentist, setFilterDentist] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialNewServiceState: Partial<Service> = {
    quantity: 1, unitValue: 0, discountValue: 0, totalValue: 0, status: 'Pendente',
    entryDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '', type: '', observations: '', material: 'Padrão', paymentMethodId: ''
  };

  const [newService, setNewService] = useState<Partial<Service>>(initialNewServiceState);

  useEffect(() => {
    const qty = Number(newService.quantity) || 0;
    const unit = Number(newService.unitValue) || 0;
    const subtotal = qty * unit;

    let finalDiscount = 0;

    if (newService.paymentMethodId) {
      const method = paymentMethods.find(m => m.id === newService.paymentMethodId);
      if (method && method.discount) {
        finalDiscount = (subtotal * method.discount) / 100;
      }
    }

    if (finalDiscount === 0 && !editingId && settings?.globalDiscount) {
      finalDiscount = (subtotal * settings.globalDiscount) / 100;
    }

    const total = subtotal - finalDiscount;
    setNewService(prev => ({
      ...prev,
      discountValue: finalDiscount,
      totalValue: total > 0 ? total : 0
    }));
  }, [newService.quantity, newService.unitValue, newService.paymentMethodId, paymentMethods, settings?.globalDiscount, editingId]);

  const allDentists = useMemo(() => {
    const names = new Set<string>();
    registeredClients.forEach(c => names.add(c.name));
    services.forEach(s => names.add(s.clientName));
    return Array.from(names).sort();
  }, [registeredClients, services]);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    catalog.forEach(c => types.add(c.name));
    services.forEach(s => types.add(s.type));
    return Array.from(types).sort();
  }, [catalog, services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch =
        service.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.id.toString().includes(searchTerm) ||
        service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDentist = !filterDentist || service.clientName === filterDentist;
      const matchesType = !filterType || service.type === filterType;

      let matchesDate = true;
      if (startDate || endDate) {
        const entryDate = new Date(service.entryDate).getTime();
        if (startDate) {
          const sDate = new Date(startDate).getTime();
          if (entryDate < sDate) matchesDate = false;
        }
        if (endDate) {
          const eDate = new Date(endDate).getTime();
          if (entryDate > eDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesDentist && matchesType && matchesDate;
    }).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }, [services, searchTerm, filterDentist, filterType, startDate, endDate]);

  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.clientName || !newService.patientName || !newService.type) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    try {
      if (editingId) {
        await updateService(editingId, newService);
      } else {
        await addService(newService as Omit<Service, 'id'>);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar ordem de serviço.");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setNewService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Deseja realmente EXCLUIR permanentemente este trabalho? Esta ação não pode ser desfeita.")) {
      try {
        await deleteService(id);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir ordem de serviço.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewService(initialNewServiceState);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDentist('');
    setFilterType('');
    setStartDate('');
    setEndDate('');
  };

  const exportToExcel = () => {
    const dataToExport = filteredServices.map(s => ({
      'Protocolo': s.id,
      'Dentista': s.clientName,
      'Paciente': s.patientName,
      'Serviço': s.type,
      'Quantidade': s.quantity,
      'Valor Unitário': s.unitValue,
      'Desconto (R$)': s.discountValue,
      'Total (R$)': s.totalValue,
      'Data Entrada': s.entryDate.split('-').reverse().join('/'),
      'Prazo Entrega': s.deadline.split('-').reverse().join('/'),
      'Status': s.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Serviços");
    XLSX.writeFile(wb, "Ordens_de_Servico.xlsx");
  };

  const handlePrintSingleOS = (service: Service) => {
    const doc = new jsPDF({ unit: 'mm', format: [100, 150] });
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("ORDEM DE SERVIÇO", 50, 15, { align: "center" });
    doc.line(10, 18, 90, 18); doc.setFontSize(10);
    doc.text(`Protocolo: #${service.id}`, 10, 25);
    doc.text(`Entrada: ${service.entryDate.split('-').reverse().join('/')}`, 10, 30);
    doc.text(`Saída: ${service.deadline.split('-').reverse().join('/')}`, 10, 35);
    doc.line(10, 38, 90, 38); doc.text("DENTISTA:", 10, 45);
    doc.setFont("helvetica", "normal"); doc.text(service.clientName, 10, 50);
    doc.setFont("helvetica", "bold"); doc.text("PACIENTE:", 10, 58);
    doc.setFont("helvetica", "normal"); doc.text(service.patientName, 10, 63);
    doc.line(10, 68, 90, 68); doc.setFont("helvetica", "bold"); doc.text("SERVIÇO:", 10, 75);
    doc.setFont("helvetica", "normal"); doc.text(service.type, 10, 80);
    doc.text(`Qtd: ${service.quantity}`, 10, 87);
    doc.text(`Desc: R$ ${service.discountValue.toFixed(2)}`, 10, 92);
    doc.text(`Valor Total: R$ ${service.totalValue.toFixed(2)}`, 10, 97);
    doc.save(`OS_${service.id}.pdf`);
  };

  const hasActiveFilters = searchTerm || filterDentist || filterType || startDate || endDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 my-8">
            <div className="p-6 flex items-center justify-between text-white bg-blue-600">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2.5 rounded-2xl"><Layers size={20} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? `Editar O.S. #${editingId}` : 'Nova O.S.'}</h3>
              </div>
              <button type="button" onClick={closeModal} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveOS} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dentista Parceiro *</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={newService.clientName || ''} onChange={e => setNewService({ ...newService, clientName: e.target.value })}>
                    <option value="">Selecione...</option>
                    {allDentists.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente *</label>
                  <input type="text" required placeholder="Nome completo do paciente" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={newService.patientName || ''} onChange={e => setNewService({ ...newService, patientName: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Entrada</label>
                  <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold" value={newService.entryDate} onChange={e => setNewService({ ...newService, entryDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Saída (Prazo)</label>
                  <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold border-blue-100 bg-blue-50/20" value={newService.deadline} onChange={e => setNewService({ ...newService, deadline: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none" value={newService.status} onChange={e => setNewService({ ...newService, status: e.target.value as ServiceStatus })}>
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serviço do Catálogo *</label>
                  <select required className="w-full px-4 py-3 bg-blue-50/20 border border-blue-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" value={newService.type || ''} onChange={e => {
                    const selectedDef = catalog.find(s => s.name === e.target.value);
                    if (selectedDef) {
                      setNewService(prev => ({ ...prev, type: selectedDef.name, unitValue: selectedDef.basePrice }));
                    } else {
                      setNewService(prev => ({ ...prev, type: e.target.value }));
                    }
                  }}>
                    <option value="">Selecione o procedimento...</option>
                    {catalog.map(s => <option key={s.id} value={s.name}>{s.code} - {s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none" value={newService.paymentMethodId || ''} onChange={e => setNewService({ ...newService, paymentMethodId: e.target.value })}>
                      <option value="">Selecione o canal...</option>
                      {paymentMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.discount ? `(-${m.discount}%)` : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="text-center"><label className="text-[9px] font-black uppercase text-slate-400">Qtd</label><input type="number" min="1" className="w-full px-2 py-2 bg-white rounded-xl text-center font-black text-[11px]" value={newService.quantity || 1} onChange={e => setNewService({ ...newService, quantity: Number(e.target.value) })} /></div>
                <div className="text-center"><label className="text-[9px] font-black uppercase text-slate-400">Unit.</label><input type="number" className="w-full px-2 py-2 bg-white rounded-xl text-center font-black text-[11px]" value={newService.unitValue || 0} onChange={e => setNewService({ ...newService, unitValue: Number(e.target.value) })} /></div>
                <div className="text-center text-rose-500"><label className="text-[9px] font-black uppercase">Desc.</label><div className="w-full px-2 py-2 bg-rose-50 rounded-xl text-center font-black text-[11px]">R$ {newService.discountValue?.toFixed(2)}</div></div>
                <div className="text-center"><label className="text-[9px] font-black uppercase text-blue-600">Total</label><div className="w-full px-2 py-2 bg-blue-600 text-white rounded-xl font-black text-[11px]">R$ {newService.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
              </div>

              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">Salvar O.S.</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-black text-[10px] uppercase tracking-widest"><Layers size={14} /><span>Produção</span></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Serviços Ativos</h2>
          <p className="text-slate-500 text-sm font-medium">Controle total de entrada e saída das Ordens de Serviço.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl transition-all shadow-sm flex items-center space-x-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
            title={showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          >
            {showFilters ? <ChevronUp size={20} /> : <Filter size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{showFilters ? 'Fechar' : 'Filtrar'}</span>
          </button>
          <button type="button" onClick={exportToExcel} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm group" title="Exportar Excel">
            <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button type="button" onClick={() => window.print()} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all shadow-sm" title="Imprimir Lista">
            <Printer size={20} />
          </button>
          <button type="button" onClick={() => { setNewService(initialNewServiceState); setIsModalOpen(true); }} className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95">
            <Plus size={20} /><span>Novo Trabalho</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 w-full lg:min-w-[300px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar por paciente, protocolo ou termo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-[1.5rem] text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-48">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-blue-500" title="Data Inicial" />
              </div>
              <div className="relative flex-1 lg:w-48">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-blue-500" title="Data Final" />
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center" title="Limpar Filtros">
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full sm:w-1/2">
              <select
                value={filterDentist}
                onChange={e => setFilterDentist(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Filtrar por Dentista (Todos)</option>
                {allDentists.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="flex-1 w-full sm:w-1/2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Filtrar por Tipo de Serviço (Todos)</option>
                {allTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto min-w-[1450px]">
          <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="px-6 py-5 text-center whitespace-nowrap">Protocolo</th>
              <th className="px-4 py-5 whitespace-nowrap">Dentista</th>
              <th className="px-4 py-5 whitespace-nowrap">Paciente</th>
              <th className="px-4 py-5 text-center whitespace-nowrap">Entrada</th>
              <th className="px-4 py-5 text-center whitespace-nowrap">Saída (Prazo)</th>
              <th className="px-4 py-5 whitespace-nowrap">Serviço</th>
              <th className="px-4 py-5 text-center whitespace-nowrap">Qtd</th>
              <th className="px-4 py-5 text-right whitespace-nowrap">Unitário</th>
              <th className="px-4 py-5 text-right whitespace-nowrap">Desconto</th>
              <th className="px-4 py-5 text-right whitespace-nowrap">Total</th>
              <th className="px-6 py-5 text-center whitespace-nowrap">Status</th>
              <th className="px-6 py-5 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[11px]">
            {filteredServices.length > 0 ? filteredServices.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-4 text-center font-mono font-bold text-slate-300 whitespace-nowrap">#{service.id}</td>
                <td className="px-4 py-4 font-black text-slate-800 whitespace-nowrap uppercase">{service.clientName}</td>
                <td className="px-4 py-4 font-bold text-slate-500 whitespace-nowrap uppercase tracking-tight">{service.patientName}</td>
                <td className="px-4 py-4 text-center text-slate-400 font-bold whitespace-nowrap">
                  {service.entryDate.split('-').reverse().join('/')}
                </td>
                <td className="px-4 py-4 text-center text-blue-600 font-black whitespace-nowrap">
                  {service.deadline.split('-').reverse().join('/')}
                </td>
                <td className="px-4 py-4 font-bold text-slate-600 whitespace-nowrap">{service.type}</td>
                <td className="px-4 py-4 text-center font-bold text-slate-600 whitespace-nowrap">{service.quantity}</td>
                <td className="px-4 py-4 text-right font-bold text-slate-600 whitespace-nowrap">R$ {service.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-4 text-right font-bold text-rose-500 whitespace-nowrap">R$ {(service.discountValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-4 text-right font-black text-slate-900 whitespace-nowrap">R$ {service.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap"><StatusBadge status={service.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-1">
                    <button type="button" onClick={() => handlePrintSingleOS(service)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Imprimir O.S."><Printer size={15} /></button>
                    <button type="button" onClick={() => handleEdit(service)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Editar"><Edit3 size={15} /></button>
                    <button type="button" onClick={(e) => handleDelete(e, service.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Excluir">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={12} className="px-8 py-20 text-center opacity-20 font-black uppercase text-xs tracking-widest">Nenhuma Ordem de Serviço encontrada com os filtros atuais</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesList;
