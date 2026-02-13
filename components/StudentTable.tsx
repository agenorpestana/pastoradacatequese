
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Trash2, Calendar, Phone, MapPin, Edit, UserCheck, UserX, GraduationCap, Fingerprint, UserPlus, BookOpen, FileText } from 'lucide-react';
import { Student, TurmaLevel, Turma } from '../types';

interface StudentTableProps {
  students: Student[];
  allClasses: Turma[];
  onDelete: (id: string) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onManageDocuments: (student: Student) => void;
  onAddNew?: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, allClasses, onDelete, onView, onEdit, onManageDocuments, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<TurmaLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Ativo' | 'Inativo' | 'Concluido'>('all');

  const filteredStudents = (students || []).filter(student => {
    const nome = student.nomeCompleto || '';
    const matricula = student.matricula || '';
    const turma = student.turma || '';
    const status = student.status || 'Ativo';
    
    const matchesSearch = 
      nome.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
      matricula.includes(searchTerm);

    const matchesTurma = selectedTurma === 'all' || turma === selectedTurma;
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    
    return matchesSearch && matchesTurma && matchesStatus;
  });

  // Função para buscar o nível da etapa baseado no nome da turma
  const getStudentLevel = (turmaNome: string) => {
    if (!turmaNome) return '---';
    const foundClass = allClasses.find(c => c.nome === turmaNome);
    return foundClass ? foundClass.nivel : '---';
  };

  return (
    <div className="space-y-6">
      {/* Header com Busca e Botão Novo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Lista de Catequizandos</h2>
        {onAddNew && (
          <button 
            onClick={onAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" /> Novo Cadastro
          </button>
        )}
      </div>

      {/* Filters Header */}
      <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl md:rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 sm:flex-none">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-[10px] md:text-xs uppercase tracking-wider"
            >
              <option value="all">Todos os Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
              <option value="Concluido">Crismados</option>
            </select>
          </div>

          <div className="flex-1 sm:flex-none">
            <select 
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-[10px] md:text-xs uppercase tracking-wider"
            >
              <option value="all">Todas as Turmas</option>
              {Object.values(TurmaLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table/List Container */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Matrícula / Catequizando</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Turma</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Nível / Etapa</th>
                <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                    onClick={() => onView(student)}
                  >
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-sm transition-transform group-hover:scale-105 border-2 border-white overflow-hidden shrink-0 ${
                          student.foto ? '' :
                          student.status === 'Concluido' ? 'bg-indigo-100 text-indigo-700' :
                          student.status === 'Inativo' ? 'bg-slate-100 text-slate-500' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {student.foto ? (
                            <img src={student.foto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <span className="text-[7px] md:text-[8px] font-black leading-none mb-1">#{student.matricula || '---'}</span>
                              <span className="font-bold uppercase text-base md:text-lg leading-none">{(student.nomeCompleto || '?').charAt(0)}</span>
                            </>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate text-sm md:text-base">{student.nomeCompleto}</p>
                          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            <span className="flex items-center gap-1 shrink-0"><Fingerprint className="w-3 h-3" /> {student.matricula || '---'}</span>
                            <span className="flex items-center gap-1 hidden sm:flex"><Calendar className="w-3 h-3" /> {student.dataNascimento ? new Date(student.dataNascimento).toLocaleDateString('pt-BR') : '--/--'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      {student.status === 'Concluido' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest whitespace-nowrap">
                          <GraduationCap className="w-3 h-3" /> Crismado
                        </span>
                      ) : student.status === 'Inativo' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-widest whitespace-nowrap">
                          <UserX className="w-3 h-3" /> Inativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest whitespace-nowrap">
                          <UserCheck className="w-3 h-3" /> Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <span className="inline-flex items-center px-3 md:px-4 py-1.5 rounded-xl text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest whitespace-nowrap">
                        {student.turma || 'Sem Turma'}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <span className="inline-flex items-center px-3 md:px-4 py-1.5 rounded-xl text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest whitespace-nowrap">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {getStudentLevel(student.turma)}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-x-2 sm:group-hover:translate-x-0">
                        <button 
                          onClick={() => onView(student)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm sm:shadow-none hover:shadow-sm bg-slate-50 sm:bg-transparent"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onManageDocuments(student)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm sm:shadow-none hover:shadow-sm bg-slate-50 sm:bg-transparent"
                          title="Anexos / Documentos"
                        >
                          <FileText className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onEdit(student)}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm sm:shadow-none hover:shadow-sm bg-slate-50 sm:bg-transparent"
                          title="Editar Cadastro"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => onDelete(student.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm sm:shadow-none hover:shadow-sm bg-slate-50 sm:bg-transparent"
                          title="Excluir"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-medium italic text-sm">
                        Nenhum catequizando encontrado para sua busca.
                      </p>
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
