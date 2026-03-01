
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Church, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  UsersRound, 
  FileText, 
  Menu,
  X,
  ChevronDown,
  Settings,
  LogOut,
  UserCog,
  Camera,
  UserPlus,
  CalendarDays,
  Image as ImageIcon,
  Plus,
  ShieldCheck,
  UserCheck,
  Library,
  UserCircle,
  BarChart3
} from 'lucide-react';
import { AppView, User, ParishConfig, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser: User;
  onLogout: () => void;
  parishConfig: ParishConfig;
}

const roleLabels: Record<UserRole, string> = {
  coordenador_paroquial: 'Coordenador Paroquial',
  coordenador_comunidade: 'Coordenador/Comunidade',
  catequista: 'Catequista',
  catequista_auxiliar: 'Catequista Auxiliar'
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  currentUser, 
  onLogout,
  parishConfig
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const perms = currentUser.permissions;
  const isRestrictedRole = currentUser.role === 'catequista' || currentUser.role === 'catequista_auxiliar';
  const isLinked = !!currentUser.linkedCatequistaId;

  const handleNavClick = (view: AppView) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  const isCatequizandoView = currentView === 'list' || currentView === 'register';
  const isUsersView = currentView === 'users_list' || currentView === 'users_create';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* MOBILE HEADER (Visible only when menu is closed) */}
      {!isMobileMenuOpen && (
        <div className="md:hidden no-print w-full p-4 relative z-50 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200/50 shadow-xl rounded-2xl p-3 flex justify-between items-center">
            <div className="flex items-center gap-3 text-left">
              <div className="bg-white border border-slate-100 p-1 rounded-xl overflow-hidden w-12 h-12 flex items-center justify-center shrink-0 shadow-sm">
                {parishConfig.logo ? (
                  <img src={parishConfig.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Church className="text-blue-600 w-8 h-8" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-slate-800 text-xs leading-tight">{parishConfig.pastoralName}</span>
                <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">{parishConfig.city}-{parishConfig.state}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label="Abrir Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY (Fullscreen with integrated header) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md no-print animate-in fade-in duration-300">
          {/* Main Card Container */}
          <div className="absolute inset-4 bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* INTEGRATED HEADER (Fixed at top of menu) */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-white border border-slate-200 p-1 rounded-xl overflow-hidden w-10 h-10 flex items-center justify-center shrink-0 shadow-sm">
                  {parishConfig.logo ? (
                    <img src={parishConfig.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Church className="text-blue-600 w-6 h-6" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-slate-800 text-xs leading-tight">{parishConfig.pastoralName}</span>
                  <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">{parishConfig.city}-{parishConfig.state}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-colors"
                aria-label="Fechar Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE MENU CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Menu Principal</p>
                
                {perms.dashboard && (
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Painel</span>
                  </button>
                )}

                {perms.students_view && (!isRestrictedRole || isLinked) && (
                  <button 
                    onClick={() => handleNavClick('list')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isCatequizandoView ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Catequizandos</span>
                  </button>
                )}

                {perms.catequistas && !isRestrictedRole && (
                  <button 
                    onClick={() => handleNavClick('catequista_list')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === 'catequista_list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <UsersRound className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Catequistas</span>
                  </button>
                )}

                {perms.classes && (!isRestrictedRole || isLinked) && (
                  <button 
                    onClick={() => handleNavClick('classes_list')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView.includes('classes') ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Turmas</span>
                  </button>
                )}

                {perms.attendance_report && !isRestrictedRole && (
                  <button 
                    onClick={() => handleNavClick('attendance_report')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === 'attendance_report' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Relatório Frequência</span>
                  </button>
                )}

                <button 
                  onClick={() => handleNavClick('gallery')} 
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === 'gallery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-tight">Galeria</span>
                </button>

                {perms.library_view && (
                  <button 
                    onClick={() => handleNavClick('library')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === 'library' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <Library className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Biblioteca</span>
                  </button>
                )}

                {perms.users_management && (
                  <button 
                    onClick={() => handleNavClick('users_list')} 
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isUsersView ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <UserCog className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-tight">Usuários</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 my-4"></div>

                <div className="grid grid-cols-2 gap-3 pb-4">
                  <button onClick={() => handleNavClick('profile')} className="flex items-center justify-center gap-2 p-4 rounded-2xl text-slate-600 bg-slate-50 hover:bg-slate-100 font-bold text-xs uppercase transition-colors">
                    <Settings size={16} /> Perfil
                  </button>
                  <button onClick={onLogout} className="flex items-center justify-center gap-2 p-4 rounded-2xl text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 font-bold text-xs uppercase transition-colors">
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className={`no-print hidden md:flex flex-col fixed top-6 bottom-6 left-6 z-50 bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 ease-in-out ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="absolute -right-3 top-20 bg-white border border-slate-100 shadow-md p-1.5 rounded-full text-slate-400 hover:text-blue-600 transition-all hover:scale-110 z-10"
          aria-label={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`flex flex-col items-center gap-4 transition-all pt-10 px-4 ${isCollapsed ? 'justify-center' : 'items-center'}`}>
          <div className={`group relative bg-white border border-slate-100 p-1 rounded-[2rem] shadow-xl shadow-slate-200/50 shrink-0 overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-105 ${isCollapsed ? 'w-14 h-14' : 'w-32 h-32'}`}>
            {parishConfig.logo ? (
              <img src={parishConfig.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Church className={`text-blue-600 transition-all ${isCollapsed ? 'w-8 h-8' : 'w-16 h-16'}`} />
            )}
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 text-center">
              <h1 className="text-lg font-serif font-black text-slate-800 leading-tight">{parishConfig.pastoralName}</h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{parishConfig.parishName}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          {perms.dashboard && (
            <button
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <LayoutDashboard className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Painel</span>}
            </button>
          )}

          {perms.students_view && (!isRestrictedRole || isLinked) && (
            <button
              onClick={() => setView('list')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${isCatequizandoView ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <Users className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Catequizandos</span>}
            </button>
          )}

          {perms.catequistas && !isRestrictedRole && (
            <button onClick={() => setView('catequista_list')} className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView.includes('catequista') ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}>
              <UsersRound size={isCollapsed ? 24 : 20} className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Catequistas</span>}
            </button>
          )}

          {perms.classes && (!isRestrictedRole || isLinked) && (
            <button onClick={() => setView('classes_list')} className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView.includes('classes') ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}>
              <BookOpen size={isCollapsed ? 24 : 20} className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Turmas</span>}
            </button>
          )}

          {perms.classes && !isRestrictedRole && (
            <button onClick={() => setView('niveis_list')} className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'niveis_list' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}>
              <ShieldCheck size={isCollapsed ? 24 : 20} className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Níveis/Etapas</span>}
            </button>
          )}

          <button onClick={() => setView('gallery')} className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'gallery' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}>
            <ImageIcon size={isCollapsed ? 24 : 20} className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`} />
            {!isCollapsed && <span className="font-bold text-sm tracking-tight">Galeria</span>}
          </button>

          {perms.library_view && (
            <button onClick={() => setView('library')} className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'library' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}>
              <Library size={isCollapsed ? 24 : 20} className={`transition-transform duration-300 ${!isCollapsed && 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Biblioteca</span>}
            </button>
          )}

          {perms.attendance_report && !isRestrictedRole && (
             <button
              onClick={() => setView('attendance_report')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'attendance_report' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <BarChart3 className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Relatório Freq.</span>}
            </button>
          )}

          {perms.reports && !isRestrictedRole && (
            <button
              onClick={() => setView('reports')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'reports' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <FileText className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Relatórios</span>}
            </button>
          )}

          {perms.users_management && (
            <button
              onClick={() => setView('users_list')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${isUsersView ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <UserCog className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Usuários</span>}
            </button>
          )}

          {currentUser.role === 'coordenador_paroquial' && (
            <button
              onClick={() => setView('config')}
              className={`w-full flex items-center transition-all duration-300 rounded-2xl group ${isCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'} ${currentView === 'config' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-500 hover:bg-white'}`}
            >
              <Settings className={`transition-transform duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="font-bold text-sm tracking-tight">Configuração</span>}
            </button>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-50 space-y-2">
           <button 
             onClick={() => setView('profile')}
             className={`w-full bg-slate-50/50 hover:bg-white hover:shadow-md rounded-2xl p-3 flex items-center gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}
             title="Ver Perfil"
           >
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold uppercase text-[10px] ${currentUser.role === 'coordenador_paroquial' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-600'}`}>
                   {currentUser.nome.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <p className="text-[11px] font-black text-slate-800 truncate leading-none">{currentUser.nome}</p>
                  <p className="text-[9px] text-slate-400 font-bold truncate uppercase mt-1 tracking-tighter">{roleLabels[currentUser.role] || currentUser.role}</p>
                </div>
              )}
           </button>

           <button 
             onClick={onLogout}
             className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${isCollapsed ? 'justify-center' : 'px-4'} text-slate-400 hover:text-red-600 hover:bg-red-50`}
             title="Sair do Sistema"
           >
              <LogOut className={`shrink-0 transition-transform ${isCollapsed ? 'w-6 h-6' : 'w-4 h-4 group-hover:translate-x-1'}`} />
              {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Sair</span>}
           </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO */}
      <main className={`flex-1 transition-all duration-500 ease-in-out px-4 pb-4 md:p-8 ${isCollapsed ? 'md:ml-32' : 'md:ml-80'}`}>
        <div className="max-w-6xl mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};
