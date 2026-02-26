
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Trash2, Calendar, Phone, MapPin, Edit, UserCheck, UserX, GraduationCap, Fingerprint, UserPlus, BookOpen, FileText, Users, Sparkles } from 'lucide-react';
import { Student, TurmaLevel, Turma, NivelEtapa } from '../types';

interface StudentTableProps {
  students: Student[];
  allClasses: Turma[];
  niveis: NivelEtapa[];
  onDelete: (id: string) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onManageDocuments: (student: Student) => void;
  onAddNew?: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, allClasses, niveis, onDelete, onView, onEdit, onManageDocuments, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Ativo' | 'Inativo' | 'Concluido'>('all');

  const getStudentLevel = (turmaNome: string) => {
    if (!turmaNome) return '---';
    const foundClass = allClasses.find(c => c.nome === turmaNome);
    return foundClass ? foundClass.nivel : '---';
  };

  const filteredStudents = (students || []).filter(student => {
    const nome = student.nomeCompleto || '';
    const matricula = student.matricula || '';
    const turma = student.turma || '';
    const status = student.status || 'Ativo';
    
    const matchesSearch = 
      nome.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
      matricula.includes(searchTerm);

    const matchesTurma = selectedTurma === 'all' || getStudentLevel(turma) === selectedTurma;
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    
    return matchesSearch && matchesTurma && matchesStatus;
  }).sort((a, b) => {
    const dateA = a.dataCadastro ? new Date(a.dataCadastro).getTime() : 0;
    const dateB = b.dataCadastro ? new Date(b.dataCadastro).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER CARD - Standardized Style */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Users className="w-8 h-8 text-white relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Lista de Catequizandos</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500" /> Gestão completa de matrículas e dados pessoais.
            </p>
          </div>
        </div>

        {onAddNew && (
          <button 
            onClick={onAddNew}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 uppercase tracking-widest text-xs w-full md:w-auto justify-center"
          >
            <UserPlus className="w-4 h-4" /> Novo Cadastro
          </button>
        )}
      </div>

      {/* FILTER CARD */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 sm:flex-none">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 py-3 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-[10px] md:text-xs uppercase tracking-wider"
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
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 py-3 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-[10px] md:text-xs uppercase tracking-wider"
            >
              <option value="all">Todas as Turmas</option>
              {niveis.length > 0 ? (
                niveis.map(nivel => (
                  <option key={nivel.id} value={nivel.nome}>{nivel.nome}</option>
                ))
              ) : (
                Object.values(TurmaLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Matrícula / Catequizando</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Turma</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Nível / Etapa</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ações</th>
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
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-sm transition-transform group-hover:scale-105 border-2 border-white overflow-hidden shrink-0 ${
                          student.foto ? '' :
                          student.status === 'Concluido' ? 'bg-indigo-100 text-indigo-700' :
                          student.status === 'Inativo' ? 'bg-slate-100 text-slate-500' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {student.foto ? (
                            <img src={student.foto} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <>
                              <span className="text-[7px] font-black leading-none mb-1">#{student.matricula || '---'}</span>
                              <span className="font-bold uppercase text-lg leading-none">{(student.nomeCompleto || '?').charAt(0)}</span>
                            </>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm md:text-base break-words">{student.nomeCompleto}</p>
                          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            <span className="flex items-center gap-1 shrink-0"><Fingerprint className="w-3 h-3" /> {student.matricula || '---'}</span>
                            <span className="flex items-center gap-1 hidden sm:flex"><Calendar className="w-3 h-3" /> {student.dataNascimento ? new Date(student.dataNascimento).toLocaleDateString('pt-BR') : '--/--'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
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
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest whitespace-nowrap">
                        {student.turma || 'Sem Turma'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest whitespace-nowrap">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {getStudentLevel(student.turma)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
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
