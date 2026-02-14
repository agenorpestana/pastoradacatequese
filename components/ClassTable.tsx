
import React from 'react';
import { BookOpen, User, Clock, Trash2, Edit, Users, ClipboardCheck, FileSpreadsheet, Plus } from 'lucide-react';
import { Turma } from '../types';

interface ClassTableProps {
  classes: Turma[];
  onDelete: (id: string) => void;
  onEdit: (turma: Turma) => void;
  onViewMembers: (turma: Turma) => void;
  onTakeAttendance: (turma: Turma) => void;
  onViewHistory: (turma: Turma) => void;
  onAddNew?: () => void;
}

export const ClassTable: React.FC<ClassTableProps> = ({ 
  classes, 
  onDelete, 
  onEdit, 
  onViewMembers,
  onTakeAttendance,
  onViewHistory,
  onAddNew
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER CARD - Standardized Style */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 text-white">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-black text-slate-800 tracking-tight">Turmas Catequéticas</h2>
            <p className="text-slate-500 text-sm font-medium">Organização por níveis e etapas de formação.</p>
          </div>
        </div>

        {onAddNew && (
          <button 
            onClick={onAddNew}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Nova Turma
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível / Ano</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catequista</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.length > 0 ? (
                classes.map((turma) => (
                  <tr key={turma.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group/item"
                        onClick={() => onViewMembers(turma)}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all shadow-sm">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors">{turma.nome}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{turma.diaSemana}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black bg-blue-100 text-blue-700 uppercase tracking-widest border border-blue-200">
                          {turma.nivel}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ano: {turma.ano}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-bold">
                        <User className="w-4 h-4 text-indigo-400" />
                        {turma.catequista}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                        {turma.horario}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => onTakeAttendance(turma)}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl border border-transparent hover:border-green-200 transition-all"
                          title="Fazer Chamada"
                        >
                          <ClipboardCheck className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onViewHistory(turma)}
                          className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200 transition-all"
                          title="Diário da Turma (Planilha)"
                        >
                          <FileSpreadsheet className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onViewMembers(turma)}
                          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Ver Membros"
                        >
                          <Users className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onEdit(turma)}
                          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Editar Turma"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onDelete(turma.id)}
                          className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Excluir Turma"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                    Nenhuma turma cadastrada. Comece criando uma nova turma!
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
