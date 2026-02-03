
import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Mail, Phone, ExternalLink, X, UserPlus, Stethoscope,
  Fingerprint, LayoutGrid, List, Activity, Users, Trash2, Edit3
} from 'lucide-react';
import { Client } from '../types';
import { useData } from '../contexts/DataContext';

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Dr. Ricardo Silva', contact: '(11) 98888-7777', email: 'ricardo@odontoclinica.com', cro: 'SP-12345', specialty: 'Implantodontia', status: 'Ativo', address: 'Rua das Flores, 123 - SP' },
  { id: '2', name: 'Dra. Ana Costa', contact: '(11) 97777-6666', email: 'ana@perio.com.br', cro: 'RJ-54321', specialty: 'Periodontia', status: 'Ativo', address: 'Av. Paulista, 1000 - SP' },
];

const SPECIALTIES = [
  'Clínica Geral', 'Implantodontia', 'Ortodontia', 'Endodontia',
  'Periodontia', 'Prótese Dentária', 'Odontopediatria',
  'Estética / Harmonização', 'Multidisciplinar'
];

const getSpecialtyColor = (specialty?: string) => {
  switch (specialty) {
    case 'Implantodontia': return 'from-blue-500 to-indigo-600';
    case 'Ortodontia': return 'from-blue-500 to-indigo-600';
    case 'Estética / Harmonização': return 'from-rose-400 to-pink-600';
    case 'Multidisciplinar': return 'from-slate-700 to-slate-900';
    default: return 'from-blue-500 to-blue-700';
  }
};

const ClientsList: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cro && c.cro.includes(searchTerm))
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.name || !editingClient?.contact) {
      alert("Preencha ao menos o nome e contato.");
      return;
    }

    try {
      if (editingClient.id) {
        await updateClient(editingClient.id, {
          name: editingClient.name,
          contact: editingClient.contact,
          email: editingClient.email,
          cro: editingClient.cro,
          specialty: editingClient.specialty,
          address: editingClient.address
        });
      } else {
        await addClient({
          name: editingClient.name,
          contact: editingClient.contact,
          email: editingClient.email || '',
          cro: editingClient.cro || '',
          specialty: editingClient.specialty || 'Clínica Geral',
          address: editingClient.address || '',
          status: 'Ativo'
        });
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar profissional.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja EXCLUIR permanentemente este profissional e todos os seus dados?")) {
      try {
        await deleteClient(id);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir profissional.");
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingClient({ name: '', contact: '', email: '', cro: '', specialty: 'Clínica Geral', address: '' });
    setIsModalOpen(true);
  };

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl"><UserPlus size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">{editingClient?.id ? 'Editar Profissional' : 'Novo Cliente / CRO'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingClient?.name || ''} onChange={e => setEditingClient({ ...editingClient!, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CRO / Inscrição *</label>
                  <input type="text" placeholder="Ex: SP-12345" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingClient?.cro || ''} onChange={e => setEditingClient({ ...editingClient!, cro: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contato *</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingClient?.contact || ''} onChange={e => setEditingClient({ ...editingClient!, contact: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingClient?.email || ''} onChange={e => setEditingClient({ ...editingClient!, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={editingClient?.specialty || ''} onChange={e => setEditingClient({ ...editingClient!, specialty: e.target.value })}>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1"><Users size={14} /><span>Relacionamento</span></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Dentistas</h2>
        </div>
        <button onClick={openNewModal} className="flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95">
          <Plus size={20} /><span>Novo Cadastro</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Pesquisar profissionais..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-transparent text-sm font-bold outline-none" />
        </div>
        <div className="flex items-center space-x-1 pr-2">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} /></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden relative">
              <div className={`h-20 bg-gradient-to-br ${getSpecialtyColor(client.specialty)}`}></div>
              <div className="px-6 pb-6 pt-10 relative">
                <div className="absolute -top-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-lg p-1">
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${getSpecialtyColor(client.specialty)} flex items-center justify-center text-white font-black text-xl`}>{client.name.charAt(0)}</div>
                </div>
                <div className="absolute top-2 right-4 flex space-x-1">
                  <button onClick={() => handleEdit(client)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 bg-white/20 hover:bg-rose-500 text-white rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
                <h4 className="font-black text-slate-800 text-lg tracking-tight truncate">{client.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">CRO: {client.cro || 'N/D'}</p>
                <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-slate-600">
                  <Phone size={14} className="text-blue-500" /><span>{client.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Profissional</th>
                <th className="px-6 py-5">Especialidade</th>
                <th className="px-6 py-5">CRO</th>
                <th className="px-6 py-5">Contato</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-4 font-black text-slate-800 uppercase">{client.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-500">{client.specialty}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">{client.cro}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{client.contact}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center space-x-1">
                      <button onClick={() => handleEdit(client)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
