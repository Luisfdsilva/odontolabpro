
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit3, Trash2, Clock, AlertCircle, CheckCircle2, Circle, X, Save, CheckSquare
} from 'lucide-react';
import { Task } from '../types';
import { useData } from '../contexts/DataContext';

const PRIORITY_OPTIONS: Task['priority'][] = ['Baixa', 'Média', 'Alta'];

const TasksBoard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialTaskState: Partial<Task> = {
    title: '',
    description: '',
    priority: 'Média',
    completed: false,
    dueDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Task>>(initialTaskState);

  // Estados de Busca e Modal

  const filteredTasks = useMemo(() => {
    return tasks.filter(t =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      if (a.completed === b.completed) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return a.completed ? 1 : -1;
    });
  }, [tasks, searchTerm]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(t => t.priority === 'Alta' && !t.completed).length;
    return { completed, pending, highPriority };
  }, [tasks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      if (editingId) {
        await updateTask(editingId, formData);
      } else {
        await addTask(formData as Omit<Task, 'id'>);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar tarefa.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente remover esta tarefa?")) {
      try {
        await deleteTask(id);
      } catch (err) {
        console.error(err);
        alert("Erro ao remover tarefa.");
      }
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await updateTask(id, { completed: !task.completed });
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialTaskState);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-xl"><CheckSquare size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">{editingId ? 'Editar Tarefa' : 'Nova Tarefa Operacional'}</h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título da Tarefa</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Conferir estoque de resina" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição / Detalhes</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Opcional: detalhes adicionais sobre o que deve ser feito..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridade</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none">
                    {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={closeModal} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>{editingId ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header e Estatísticas */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-1">
            <CheckSquare size={14} /><span>Produtividade</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Tarefas Internas</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Organize as demandas diárias do seu laboratório.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pendentes</span>
              <span className="text-xl font-black text-slate-800">{stats.pending}</span>
            </div>
            {stats.highPriority > 0 && (
              <>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Urgentes</span>
                  <span className="text-xl font-black text-rose-500">{stats.highPriority}</span>
                </div>
              </>
            )}
          </div>
          <button onClick={() => { setFormData(initialTaskState); setIsModalOpen(true); }} className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-700 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <Plus size={20} /><span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input
          type="text"
          placeholder="Pesquisar tarefas por título ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Lista de Tarefas */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`group bg-white p-5 rounded-[2rem] border transition-all duration-300 hover:shadow-md ${task.completed
                ? 'border-slate-50 opacity-60'
                : 'border-slate-100 shadow-sm'
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-5 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1.5 transition-all transform hover:scale-110 ${task.completed ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-400'
                    }`}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-lg tracking-tight leading-tight ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-medium mt-1 pr-4">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest space-x-1.5">
                      <Clock size={14} className="text-slate-300" />
                      <span>{task.dueDate.split('-').reverse().join('/')}</span>
                    </div>
                    <div className={`flex items-center text-[9px] font-black uppercase tracking-[0.15em] space-x-1.5 px-3 py-1 rounded-full border ${task.priority === 'Alta' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        task.priority === 'Média' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      <AlertCircle size={12} /><span>{task.priority}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Editar Tarefa"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Excluir Tarefa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200">
            <CheckCircle2 size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Nenhuma tarefa pendente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksBoard;
