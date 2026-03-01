
import React, { useState } from 'react';
import { Users, UserPlus, Shield, ShieldCheck, Mail, Lock, Edit, Trash2, CheckCircle2, ArrowLeft, Save, ShieldAlert, Key, BookOpen, Check, UserCircle, X, Link } from 'lucide-react';
import { User, UserPermissions, Turma, UserRole, Catequista } from '../types';
import { Pagination } from './Pagination';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  currentUser: User;
}

const roleLabels: Record<UserRole, string> = {
  coordenador_paroquial: 'Coordenador Paroquial',
  coordenador_comunidade: 'Coordenador/Comunidade',
  catequista: 'Catequista',
  catequista_auxiliar: 'Catequista Auxiliar'
};

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onCreateNew, currentUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(u => u.email !== 'suporte@unityautomacoes.com.br');
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Usuários</h2>
          <p className="text-slate-500 text-sm">Controle de acessos e níveis de hierarquia da pastoral.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Novo Cadastro
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Hierarquia</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações Permitidas</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${u.role === 'coordenador_paroquial' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-600'}`}>
                      {u.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.nome}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'coordenador_paroquial' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {u.role === 'coordenador_paroquial' ? <ShieldCheck className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-wrap gap-1 max-w-xs">
                     {u.role === 'coordenador_paroquial' ? (
                       <span className="bg-slate-900 text-white text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Acesso Total</span>
                     ) : (
                       <>
                         {Object.entries(u.permissions).filter(([k,v]) => v && k !== 'allowedClassIds').slice(0, 4).map(([key]) => (
                           <span key={key} className="bg-slate-100 text-slate-500 text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">
                             {key.replace('_', ' ')}
                           </span>
                         ))}
                         {Object.values(u.permissions).filter((v, i) => v && Object.keys(u.permissions)[i] !== 'allowedClassIds').length > 4 && (
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">+{Object.values(u.permissions).filter((v, i) => v && Object.keys(u.permissions)[i] !== 'allowedClassIds').length - 4} mais</span>
                         )}
                       </>
                     )}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(u)} className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 shadow-sm"><Edit className="w-4 h-4" /></button>
                    {u.id !== currentUser.id && (
                      <button onClick={() => onDelete(u.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

interface UserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
  initialData?: User;
  availableClasses: Turma[];
  catequistas: Catequista[];
}

export const UserForm: React.FC<UserFormProps> = ({ onSave, onCancel, initialData, availableClasses, catequistas }) => {
  const [formData, setFormData] = useState<Partial<User>>(initialData || {
    nome: '',
    email: '',
    senha: '',
    role: 'catequista',
    linkedCatequistaId: '',
    permissions: {
      dashboard: true,
      students_view: true,
      students_create: false,
      students_edit: false,
      students_delete: false,
      students_print: false,
      students_confirmed_view: false,
      students_confirmed_manage: false,
      classes: false,
      catequistas: false,
      formations: false,
      reports: false,
      attendance_report: false,
      certificates: false,
      attendance: false,
      users_management: false,
      library_view: true,
      library_upload: false,
      library_delete: false,
      gallery_view: true,
      gallery_upload: false,
      gallery_delete: false,
      allowedClassIds: []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      permissions: formData.role === 'coordenador_paroquial' ? {
        dashboard: true, students_view: true, students_create: true, students_edit: true,
        students_delete: true, students_print: true, students_confirmed_view: true, students_confirmed_manage: true,
        classes: true, catequistas: true, formations: true, reports: true, certificates: true, 
        attendance: true, users_management: true, attendance_report: true,
        library_view: true, library_upload: true, library_delete: true,
        gallery_view: true, gallery_upload: true, gallery_delete: true,
        allowedClassIds: []
      } : formData.permissions
    } as User;
    onSave(newUser);
  };

  const togglePerm = (key: keyof UserPermissions) => {
    if (formData.role === 'coordenador_paroquial') return;
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions!, [key]: !prev.permissions![key] }
    }));
  };

  const toggleClass = (classId: string) => {
    const current = formData.permissions?.allowedClassIds || [];
    const updated = current.includes(classId) 
      ? current.filter(id => id !== classId)
      : [...current, classId];
    
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions!, allowedClassIds: updated }
    }));
  };

  const permGroups = [
    { title: 'Catequizandos', perms: [
      { k: 'students_view', l: 'Ver Lista de Catequizandos' },
      { k: 'students_create', l: 'Cadastrar Novos (Ficha)' },
      { k: 'students_edit', l: 'Editar Dados (por Turma)' },
      { k: 'students_delete', l: 'Excluir Registros' },
      { k: 'students_print', l: 'Permitir Impressão de Fichas' },
      { k: 'students_confirmed_view', l: 'Visualizar Crismados' },
      { k: 'students_confirmed_manage', l: 'Editar/Excluir Crismados' },
    ]},
    { title: 'Pedagógico', perms: [
      { k: 'attendance', l: 'Lançar Chamadas/Frequência (por Turma)' },
      { k: 'classes', l: 'Gerenciar Turmas (por Turma)' },
      { k: 'catequistas', l: 'Gerenciar Catequistas' },
      { k: 'formations', l: 'Gerenciar Formações' },
    ]},
    { title: 'Administrativo', perms: [
      { k: 'dashboard', l: 'Ver Painel de Estatísticas' },
      { k: 'reports', l: 'Ver Relatórios Anuais' },
      { k: 'attendance_report', l: 'Ver Relatório de Frequência' },
      { k: 'certificates', l: 'Emitir Certificados de Crisma' },
      { k: 'library_view', l: 'Ver Biblioteca de Materiais' },
      { k: 'library_upload', l: 'Anexar Materiais na Biblioteca' },
      { k: 'library_delete', l: 'Excluir Materiais da Biblioteca' },
      { k: 'gallery_view', l: 'Ver Galeria de Momentos' },
      { k: 'gallery_upload', l: 'Anexar Fotos na Galeria' },
      { k: 'gallery_delete', l: 'Excluir Fotos da Galeria' },
      { k: 'users_management', l: 'Gerenciar Outros Usuários' },
    ]}
  ];

  const activeCatequistas = catequistas.filter(c => c.status === 'Ativo');

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <Key className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {initialData ? 'Editar Usuário' : 'Novo Cadastro de Acesso'}
              </h2>
              <p className="text-slate-400 text-sm">Defina exatamente o nível de hierarquia e o que este usuário poderá ver.</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Added autoComplete="off" to form and specific attributes to inputs to prevent browser autofill */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* DADOS BÁSICOS */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg"><Shield className="w-4 h-4 text-blue-600" /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Identificação do Usuário</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-style">Nome Completo</label>
                  <input 
                    required 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})} 
                    className="input-style" 
                    placeholder="Ex: Maria José de Souza" 
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label-style">E-mail de Login</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="input-style" 
                    placeholder="usuario@catequese.com"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label-style">Senha de Acesso</label>
                  <input 
                    required 
                    type="password" 
                    value={formData.senha} 
                    onChange={e => setFormData({...formData, senha: e.target.value})} 
                    className="input-style font-mono" 
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="label-style">Nível de Hierarquia</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="input-style font-bold">
                    <option value="coordenador_paroquial">Coordenador Paroquial</option>
                    <option value="coordenador_comunidade">Coordenador/Comunidade</option>
                    <option value="catequista">Catequista</option>
                    <option value="catequista_auxiliar">Catequista Auxiliar</option>
                  </select>
                </div>

                {(formData.role === 'catequista' || formData.role === 'catequista_auxiliar') && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-sky-50 border border-sky-100 p-4 rounded-2xl">
                    <label className="label-style text-sky-700 flex items-center gap-2">
                      <Link className="w-3 h-3" /> VINCULAR AO CATEQUISTA
                    </label>
                    <select 
                      value={formData.linkedCatequistaId || ''} 
                      onChange={e => setFormData({...formData, linkedCatequistaId: e.target.value})} 
                      className="input-style bg-white border-sky-200 mt-1"
                    >
                      <option value="">-- Selecione o Catequista --</option>
                      {activeCatequistas.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-sky-500 mt-2 font-medium leading-tight">
                      Ao selecionar, este usuário verá automaticamente apenas as turmas onde <strong>{activeCatequistas.find(c => c.id === formData.linkedCatequistaId)?.nome || 'o catequista'}</strong> é responsável.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* PERMISSÕES */}
            <div className="md:col-span-7 space-y-8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg"><ShieldAlert className="w-4 h-4 text-indigo-600" /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Permissões e Acessos Detalhados</h4>
              </div>

              <div className={`space-y-6 ${formData.role === 'coordenador_paroquial' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                {permGroups.map((group, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-2">{group.title}</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {group.perms.map(p => {
                        const active = formData.permissions?.[p.k as keyof UserPermissions];
                        const isWritingPerm = p.k === 'attendance' || p.k === 'classes' || p.k === 'students_edit';
                        
                        return (
                          <div key={p.k} className="space-y-2">
                            <button
                              key={p.k}
                              type="button"
                              onClick={() => togglePerm(p.k as keyof UserPermissions)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${active ? 'bg-white border-blue-600 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-400'}`}
                            >
                              <span className={`text-xs font-bold ${active ? 'text-blue-700' : ''}`}>{p.l}</span>
                              {active ? <CheckCircle2 className="w-5 h-5 text-blue-600" /> : <div className="w-5 h-5 border-2 border-slate-200 rounded-full"></div>}
                            </button>

                            {/* SEÇÃO DE TURMAS ESPECÍFICAS (Exibida apenas se não houver catequista vinculado) */}
                            {isWritingPerm && active && !formData.linkedCatequistaId && (
                              <div className="mt-2 ml-4 p-4 bg-white rounded-2xl border-2 border-dashed border-blue-100 animate-in slide-in-from-top-2 duration-300 shadow-inner">
                                <div className="flex items-center gap-2 mb-3">
                                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Vincular Manualmente às Turmas:</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                  {availableClasses.map(turma => {
                                    const isSelected = formData.permissions?.allowedClassIds?.includes(turma.id);
                                    return (
                                      <button
                                        key={turma.id}
                                        type="button"
                                        onClick={() => toggleClass(turma.id)}
                                        className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all ${isSelected ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-slate-50 text-slate-500 border border-transparent'}`}
                                      >
                                        <span className="text-[10px] font-bold">{turma.nome}</span>
                                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 border border-slate-200 rounded"></div>}
                                      </button>
                                    );
                                  })}
                                  {availableClasses.length === 0 && <p className="text-[10px] italic text-slate-400 text-center py-2">Nenhuma turma cadastrada.</p>}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-3 italic">* Se nenhuma for selecionada, o usuário terá acesso a todas as turmas.</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {formData.role === 'coordenador_paroquial' && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center animate-pulse">
                  <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest">O Coordenador Paroquial possui controle total e irrestrito de todos os módulos do sistema.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
              <ArrowLeft className="w-5 h-5" /> Cancelar
            </button>
            <button type="submit" className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-xs">
              <Save className="w-5 h-5" /> {initialData ? 'Atualizar Usuário' : 'Salvar Novo Usuário'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 1rem;
          border: 2px solid #f1f5f9;
          background-color: #f8fafc;
          outline: none;
          transition: all 0.3s;
          font-size: 0.95rem;
          color: #1e293b;
        }
        .input-style:focus {
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .label-style {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};
