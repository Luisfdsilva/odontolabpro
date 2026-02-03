
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  DollarSign, 
  CheckSquare, 
  Users, 
  Menu, 
  X,
  Bell,
  Search,
  Sliders,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';

const MenuCard: React.FC<{ to: string, icon: React.ReactNode, label: string, description: string, active: boolean, onClick: () => void, index: number }> = ({ to, icon, label, description, active, onClick, index }) => (
  <Link 
    to={to} 
    onClick={onClick}
    style={{ animationDelay: `${index * 40}ms` }}
    className={`group flex flex-col items-center justify-center p-5 rounded-[2rem] border transition-all duration-300 animate-in fade-in zoom-in-95 ${
      active 
        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105' 
        : 'bg-white/80 border-slate-100 text-slate-600 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1'
    }`}
  >
    <div className={`mb-3 p-3 rounded-xl transition-colors ${active ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
      {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
    </div>
    <span className="font-black text-[10px] uppercase tracking-widest mb-1 text-center">{label}</span>
    <span className={`text-[9px] font-medium text-center leading-tight ${active ? 'text-blue-100' : 'text-slate-400'}`}>{description}</span>
  </Link>
);

const QuickShortcut: React.FC<{ to: string, icon: React.ReactNode, label: string, color: string }> = ({ to, icon, label, color }) => (
  <Link 
    to={to} 
    className="flex flex-col items-center justify-center space-y-2 group"
  >
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-current transition-all group-hover:scale-110 group-hover:bg-opacity-20 border border-transparent group-hover:border-white/50 shadow-sm`}>
      {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    </div>
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">{label}</span>
  </Link>
);

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const menuItems = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard', description: 'Visão Geral' },
    { to: '/servicos', icon: <ClipboardList />, label: 'Serviços', description: 'O.S. Ativas' },
    { to: '/catalogo', icon: <BookOpen />, label: 'Catálogo', description: 'Preços' },
    { to: '/financeiro', icon: <DollarSign />, label: 'Financeiro', description: 'Fluxo Caixa' },
    { to: '/tarefas', icon: <CheckSquare />, label: 'Tarefas', description: 'Produção' },
    { to: '/clientes', icon: <Users />, label: 'Clientes', description: 'Dentistas' },
    { to: '/configuracoes', icon: <Sliders />, label: 'Ajustes', description: 'Sistema' },
  ];

  const handleClose = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex bg-slate-50 relative overflow-hidden font-inter">
      
      {/* Launchpad Menu - Centralizado e Menor */}
      <aside className={`fixed inset-0 w-full h-full bg-slate-900/10 backdrop-blur-2xl flex items-center justify-center transition-all duration-500 z-[1000] ${
        sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`w-full max-w-3xl p-8 md:p-12 transform transition-all duration-500 ease-out ${
          sidebarOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          
          {/* Header Compacto do Menu */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center space-x-3">
               <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <Zap size={16} fill="white" />
               </div>
               <div className="flex flex-col">
                 <h2 className="font-black text-lg tracking-tighter text-slate-900 leading-none">OdontoLab Pro</h2>
                 <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.4em] mt-1">Menu Inteligente</span>
               </div>
            </div>
            <button 
              className="p-3 bg-white hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-slate-100 shadow-xl" 
              onClick={handleClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Grade de Ícones Reduzida */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menuItems.map((item, index) => (
              <MenuCard 
                key={item.to}
                {...item}
                index={index}
                active={location.pathname === item.to}
                onClick={handleClose}
              />
            ))}
            
            {/* Botão de Fechamento Rápido / Suporte */}
            <div className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-slate-900 text-white shadow-xl group cursor-pointer animate-in fade-in zoom-in-95 transition-transform hover:scale-105" style={{ animationDelay: '300ms' }}>
                <div className="bg-white/10 p-2 rounded-xl mb-2"><ArrowRight size={20} /></div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Ajuda</p>
                <p className="font-bold text-[10px]">Suporte</p>
            </div>
          </div>

          {/* Footer do Menu Compacto */}
          <div className="mt-10 pt-6 border-t border-slate-200/50 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronizado</span>
            </div>
            <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">v2.1 Enterprise</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-full">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40 shrink-0">
          <div className="flex items-center">
            <button 
              className="p-3 text-slate-600 mr-6 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100 flex items-center space-x-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
              <span className="text-[10px] font-black uppercase tracking-widest ml-1 hidden sm:block">Menu</span>
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisa inteligente..." 
                className="pl-12 pr-6 py-2.5 bg-slate-50 border-transparent rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none w-72 shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="p-3 text-slate-500 hover:bg-slate-50 rounded-2xl relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-800 leading-none uppercase tracking-tight">Admin Master</p>
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg group-hover:scale-105 transition-transform">
                DL
              </div>
            </div>
          </div>
        </header>

        {/* Global Quick Access Bar */}
        <div className="px-6 lg:px-12 pt-6 shrink-0">
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 p-3 rounded-[2rem] flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Zap size={16} fill="white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest block leading-none">Atalhos</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 lg:space-x-12">
              <QuickShortcut to="/" icon={<LayoutDashboard />} label="Painel" color="text-amber-500" />
              <QuickShortcut to="/servicos" icon={<ClipboardList />} label="O.S." color="text-blue-500" />
              <QuickShortcut to="/catalogo" icon={<BookOpen />} label="Preços" color="text-purple-500" />
              <QuickShortcut to="/financeiro" icon={<DollarSign />} label="Caixa" color="text-emerald-500" />
              <QuickShortcut to="/tarefas" icon={<CheckSquare />} label="Tarefas" color="text-indigo-500" />
              <QuickShortcut to="/clientes" icon={<Users />} label="Clientes" color="text-rose-500" />
              <QuickShortcut to="/configuracoes" icon={<Sliders />} label="Ajustes" color="text-slate-500" />
            </div>

            <div className="hidden xl:block">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick Access</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
