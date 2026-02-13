
import React from 'react';
import { Calendar, Clock, Edit, Trash2, ClipboardCheck, GraduationCap, Users } from 'lucide-react';
import { FormationEvent } from '../types';

interface FormationTableProps {
  formations: FormationEvent[];
  onDelete: (id: string) => void;
  onEdit: (event: FormationEvent) => void;
  onAttendance: (event: FormationEvent) => void;
}

export const FormationTable: React.FC<FormationTableProps> = ({ formations, onDelete, onEdit, onAttendance }) => {
  const formatDate = (iso: string) => {
    if (!iso) return '---';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatus = (inicio: string, fim: string) => {
    const now = new Date();
    const start = new Date(inicio);
    const end = new Date(fim);
    if (now < start) return { label: 'Agendado', class: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Concluído', class: 'bg-green-100 text-green-700' };
    return { label: 'Em Andamento', class: 'bg-amber-100 text-amber-700 animate-pulse' };
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tema da Formação</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {formations.length > 0 ? (
              formations.map((f) => {
                const status = getStatus(f.inicio, f.fim);
                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{f.tema}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> {(f.presentes || []).length} Presentes
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(f.inicio)}</p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-200" /> {formatDate(f.fim)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => onAttendance(f)}
                          className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all border border-green-100"
                          title="Lançar Presença"
                        >
                          <ClipboardCheck className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onEdit(f)}
                          className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete(f.id)}
                          className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="max-w-xs mx-auto opacity-20">
                     <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                     <p className="text-sm font-bold uppercase tracking-widest">Nenhuma formação agendada</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
