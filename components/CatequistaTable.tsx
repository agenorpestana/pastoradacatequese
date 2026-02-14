
import React, { useState } from 'react';
import { Search, Edit, Trash2, Calendar, Phone, Mail, UserCheck, History, MapPin, UserPlus, MessageCircle, UsersRound } from 'lucide-react';
import { Catequista } from '../types';

interface CatequistaTableProps {
  catequistas: Catequista[];
  onDelete: (id: string) => void;
  onEdit: (catequista: Catequista) => void;
  onViewHistory: (catequista: Catequista) => void;
  onAddNew?: () => void;
}

export const CatequistaTable: React.FC<CatequistaTableProps> = ({ catequistas, onDelete, onEdit, onViewHistory, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = catequistas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.rgCpf && c.rgCpf.includes(searchTerm)) ||
    (c.comunidade && c.comunidade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER CARD - Standardized Style */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-sky-600 p-4 rounded-3xl shadow-xl shadow-sky-100 text-white">
            <UsersRound className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-black text-slate-800 tracking-tight">Corpo de Catequistas</h2>
            <p className="text-slate-500 text-sm font-medium">Gestão de voluntários e educadores da fé.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border border-sky-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-medium"
            />
          </div>

          {onAddNew && (
            <button 
              onClick={onAddNew}
              className="flex items-center gap-2 px-8 py-3 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-200 uppercase tracking-widest text-xs w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-4 h-4" /> Novo
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sky-50/50 border-b border-sky-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qual Com. pertence</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contatos</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/30 group transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 font-black uppercase text-lg border-2 border-white shadow-sm">
                          {c.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{c.nome}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{c.sexo === 'M' ? 'Masc' : 'Fem'} • {c.desde ? `Desde ${new Date(c.desde).getFullYear()}` : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        c.status === 'Ativo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {c.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        {c.comunidade || 'Paróquia Central'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                          {c.whatsapp || 'Não informado'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => onViewHistory(c)} 
                          className="p-2.5 bg-white text-slate-400 hover:text-sky-600 rounded-xl border border-sky-50 shadow-sm transition-all"
                          title="Histórico de Presença"
                        >
                          <History className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => onEdit(c)} className="p-2.5 bg-white text-slate-400 hover:text-amber-500 rounded-xl border border-sky-50 shadow-sm transition-all">
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => onDelete(c.id)} className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-sky-50 shadow-sm transition-all">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto opacity-30">
                      <Search className="w-12 h-12 mx-auto mb-4 text-sky-200" />
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Nenhum catequista encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
