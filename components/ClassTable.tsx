
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
    <div className="space-y-6">
      {/* Header com Título e Botão Novo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Turmas Catequéticas</h2>
          <p className="text-slate-500 text-sm">Organização por níveis e etapas de formação.</p>
        </div>
        {onAddNew && (
          <button 
            onClick={onAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Nova Turma
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nível / Ano</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catequista</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.length > 0 ? (
                classes.map((turma) => (
                  <tr key={turma.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group/item"
                        onClick={() => onViewMembers(turma)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors">{turma.nome}</p>
                          <p className="text-xs text-slate-500">{turma.diaSemana}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                          {turma.nivel}
                        </span>
                        <p className="text-xs font-medium text-slate-400">Ano: {turma.ano}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <User className="w-4 h-4 text-slate-400" />
                        {turma.catequista}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {turma.horario}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => onTakeAttendance(turma)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl border border-transparent hover:border-green-200 transition-all"
                          title="Fazer Chamada"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onViewHistory(turma)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200 transition-all"
                          title="Diário da Turma (Planilha)"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onViewMembers(turma)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Ver Membros"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onEdit(turma)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Editar Turma"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(turma.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
                          title="Excluir Turma"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
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
