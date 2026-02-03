
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Wallet,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Service, Transaction } from '../types';
import { useData } from '../contexts/DataContext';

const BentoStat: React.FC<{ title: string, value: string, trend?: string, positive?: boolean, icon: React.ReactNode, className?: string }> = ({ title, value, trend, positive, icon, className }) => (
  <div className={`bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-[10px] font-black ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">{title}</h3>
      <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { services, transactions, loading } = useData();

  // Cálculos Dinâmicos
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 7 dias atrás
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    // Faturamento Semanal (Receitas pagas nos últimos 7 dias)
    const weeklyRevenue = transactions
      .filter(t => t.type === 'Receita' && t.status === 'Pago' && new Date(t.date) >= lastWeek)
      .reduce((acc, t) => acc + t.amount, 0);

    // Peças Entregues (Total histórico ou do mês - aqui usamos total para o card)
    const deliveredCount = services.filter(s => s.status === 'Entregue').length;

    // Serviços Ativos (Pendente ou Em Produção)
    const activeServices = services.filter(s => s.status === 'Pendente' || s.status === 'Em Produção').length;

    // Dados para o texto de boas-vindas
    const pendingStart = services.filter(s => s.status === 'Pendente').length;
    const dueToday = services.filter(s => s.deadline === todayStr && s.status !== 'Entregue').length;

    return {
      weeklyRevenue,
      deliveredCount,
      activeServices,
      pendingStart,
      dueToday
    };
  }, [services, transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[140px]">

        {/* Welcome Block */}
        <div className="md:col-span-8 md:row-span-3 bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-100 flex flex-col justify-between transition-all hover:shadow-blue-200">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100/60 flex items-center gap-2">
              <Activity size={12} className="animate-pulse" /> Painel Operacional Realtime
            </span>
            <h2 className="text-5xl font-black mt-4 leading-tight">Olá!<br />Seu laboratório<br />está online.</h2>
            <p className="text-blue-50/70 mt-6 text-base font-medium max-w-sm">
              {stats.pendingStart > 0 || stats.dueToday > 0 ? (
                <>Otimize sua produção: Existem <span className="text-white font-bold">{stats.pendingStart} novos serviços</span> aguardando início e <span className="text-white font-bold">{stats.dueToday} entregas</span> prioritárias para hoje.</>
              ) : (
                <>Tudo em ordem por aqui! Não há pendências urgentes ou entregas para o dia de hoje até o momento.</>
              )}
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-3 mt-8">
            <Link to="/servicos" className="bg-white text-blue-600 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95">Nova O.S.</Link>
            <Link to="/financeiro" className="bg-blue-500/50 text-white border border-white/20 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500/80 transition-all active:scale-95">Financeiro</Link>
          </div>

          {/* Efeitos Visuais de Fundo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full -mr-20 -mt-20 blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-10 w-60 h-60 bg-white rounded-full -mb-32 opacity-[0.05]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-10 right-20 opacity-10 rotate-12"><Clock size={120} /></div>
          </div>
        </div>

        {/* Right Stats Column - Conectadas aos dados reais */}
        <BentoStat
          className="md:col-span-4 md:row-span-1"
          title="Faturamento (7 dias)"
          value={`R$ ${stats.weeklyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          trend={stats.weeklyRevenue > 0 ? "Em alta" : "Aguardando"}
          positive={stats.weeklyRevenue > 0}
          icon={<Wallet />}
        />

        <BentoStat
          className="md:col-span-4 md:row-span-1"
          title="Peças Entregues"
          value={stats.deliveredCount.toString()}
          trend="Total"
          positive={true}
          icon={<CheckCircle2 />}
        />

        <BentoStat
          className="md:col-span-4 md:row-span-1"
          title="Produção Ativa"
          value={stats.activeServices.toString()}
          trend={stats.activeServices > 10 ? "Alta Demanda" : "Normal"}
          positive={stats.activeServices < 15}
          icon={<AlertCircle />}
        />

      </div>
    </div>
  );
};

export default Dashboard;
