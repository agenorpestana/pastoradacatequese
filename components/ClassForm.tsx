
import React, { useState, useEffect } from 'react';
import { Save, BookOpen, User, Clock, ArrowLeft, Users, Search, Plus, X, Check, ChevronDown, UserCheck } from 'lucide-react';
import { Turma, TurmaLevel, Student, Catequista } from '../types';

interface ClassFormProps {
  onSave: (turma: Turma, studentIds: string[]) => void;
  onCancel: () => void;
  initialData?: Turma;
  allStudents: Student[];
  catequistas: Catequista[];
}

export const ClassForm: React.FC<ClassFormProps> = ({ onSave, onCancel, initialData, allStudents, catequistas }) => {
  const [formData, setFormData] = useState<Partial<Turma>>(initialData || {
    nome: '',
    nivel: TurmaLevel.SEMENTINHA,
    catequista: '',
    diaSemana: 'Sábado',
    horario: '',
    ano: new Date().getFullYear().toString(),
    ativa: true
  });

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  
  // Catequista Multi-Select State
  const [isCatequistaOpen, setIsCatequistaOpen] = useState(false);
  const activeCatequistas = catequistas.filter(c => c.status === 'Ativo');

  // Inicializar alunos selecionados se estiver editando
  useEffect(() => {
    if (initialData) {
      const inThisClass = allStudents
        .filter(s => s.turma === initialData.nome)
        .map(s => s.id);
      setSelectedStudentIds(inThisClass);
    }
  }, [initialData, allStudents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTurma = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Turma;
    onSave(newTurma, selectedStudentIds);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Logic for Multi-Select Catequistas
  const getSelectedCatequistas = (): string[] => {
    if (!formData.catequista) return [];
    return formData.catequista.split(', ').filter(Boolean);
  };

  const toggleCatequista = (name: string) => {
    let current = getSelectedCatequistas();
    if (current.includes(name)) {
      current = current.filter(n => n !== name);
    } else {
      current.push(name);
    }
    setFormData({ ...formData, catequista: current.join(', ') });
  };

  const filteredStudents = allStudents.filter(s => 
    s.nomeCompleto.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden mb-10">
      <div className="bg-slate-900 p-8 relative">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {initialData ? 'Editar Turma' : 'Nova Turma'}
            </h2>
            <p className="text-slate-400 text-sm">Configure os detalhes e a composição do grupo.</p>
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

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-lg"><BookOpen className="w-4 h-4 text-blue-600" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Dados Básicos</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="label-style">Nome da Turma</label>
              <input 
                required 
                type="text" 
                value={formData.nome || ''} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                className="input-style" 
                placeholder="Ex: Turma São Francisco 2024" 
              />
            </div>

            <div className="md:col-span-1">
              <label className="label-style">Comunidade</label>
              <input 
                type="text" 
                value={formData.comunidade || ''} 
                onChange={e => setFormData({...formData, comunidade: e.target.value})} 
                className="input-style" 
                placeholder="Ex: Matriz, Capela..." 
              />
            </div>

            <div>
              <label className="label-style">Nível / Etapa</label>
              <select 
                value={formData.nivel} 
                onChange={e => setFormData({...formData, nivel: e.target.value})} 
                className="input-style"
              >
                {Object.values(TurmaLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="label-style">Catequistas Responsáveis</label>
              <div 
                onClick={() => setIsCatequistaOpen(!isCatequistaOpen)}
                className="input-style cursor-pointer flex justify-between items-center bg-white"
              >
                <span className={`truncate ${!formData.catequista ? 'text-gray-400 font-normal' : ''}`}>
                  {formData.catequista || 'Selecione os catequistas...'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              
              {/* Dropdown de Catequistas */}
              {isCatequistaOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                  {activeCatequistas.length > 0 ? (
                    activeCatequistas.map(cat => {
                      const isSelected = getSelectedCatequistas().includes(cat.nome);
                      return (
                        <div 
                          key={cat.id}
                          onClick={() => toggleCatequista(cat.nome)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                            isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {cat.nome.charAt(0)}
                            </div>
                            <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                              {cat.nome}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-slate-400 italic text-xs">
                      Nenhum catequista ativo cadastrado.
                    </div>
                  )}
                </div>
              )}
              {/* Invisible overlay to close dropdown */}
              {isCatequistaOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setIsCatequistaOpen(false)}></div>
              )}
            </div>

            <div>
              <label className="label-style">Dia da Semana</label>
              <select 
                value={formData.diaSemana} 
                onChange={e => setFormData({...formData, diaSemana: e.target.value})} 
                className="input-style"
              >
                <option>Segunda-feira</option>
                <option>Terça-feira</option>
                <option>Quarta-feira</option>
                <option>Quinta-feira</option>
                <option>Sexta-feira</option>
                <option>Sábado</option>
                <option>Domingo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-style">Horário</label>
                <input 
                  required 
                  type="time" 
                  value={formData.horario || ''} 
                  onChange={e => setFormData({...formData, horario: e.target.value})} 
                  className="input-style" 
                />
              </div>
              <div>
                <label className="label-style">Ano</label>
                <input 
                  required 
                  type="number" 
                  value={formData.ano || ''} 
                  onChange={e => setFormData({...formData, ano: e.target.value})} 
                  className="input-style" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE COMPOSIÇÃO DA TURMA (Apenas para Edição) */}
        {initialData && (
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg"><Users className="w-4 h-4 text-indigo-600" /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Composição da Turma ({selectedStudentIds.length})</h4>
              </div>
              <button 
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-200"
              >
                <Plus className="w-4 h-4" /> Importar Catequizandos
              </button>
            </div>

            {selectedStudentIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allStudents.filter(s => selectedStudentIds.includes(s.id)).map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase">
                        {student.nomeCompleto.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate">{student.nomeCompleto}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleStudent(student.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Esta turma ainda não possui membros cadastrados.</p>
                <button 
                  type="button" 
                  onClick={() => setIsSelectorOpen(true)}
                  className="mt-4 text-blue-600 text-sm font-bold hover:underline"
                >
                  Clique para importar catequizandos do banco de dados
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-transparent"
          >
            <ArrowLeft className="w-5 h-5" /> Cancelar
          </button>
          <button 
            type="submit" 
            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5"
          >
            <Save className="w-6 h-6" /> Salvar Alterações
          </button>
        </div>
      </form>

      {/* SELETOR MODAL */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Selecionar Catequizandos</h3>
                <p className="text-sm text-slate-500">Escolha quem fará parte desta turma.</p>
              </div>
              <button 
                onClick={() => setIsSelectorOpen(false)}
                className="p-2 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-all border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 bg-white border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredStudents.map(student => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {student.nomeCompleto.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{student.nomeCompleto}</p>
                        <p className="text-xs text-slate-500">
                          {student.turma ? `Turma atual: ${student.turma}` : 'Sem turma vinculada'}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-full"></div>
                    )}
                  </button>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-slate-400 italic">
                  Nenhum catequizando encontrado para sua busca.
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};
