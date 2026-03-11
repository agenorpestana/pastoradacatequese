
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Calendar, Save, Users, Search, BookOpenText, Lock, Unlock, ChevronDown, History } from 'lucide-react';
import { Turma, Student, AttendanceSession, AttendanceEntry } from '../types';

interface ClassAttendanceModalProps {
  turma: Turma;
  members: Student[];
  onClose: () => void;
  onSave: (session: AttendanceSession) => void;
  existingSessions: AttendanceSession[];
}

export const ClassAttendanceModal: React.FC<ClassAttendanceModalProps> = ({ 
  turma, 
  members, 
  onClose, 
  onSave,
  existingSessions 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tema, setTema] = useState('');
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lastLoadedKey, setLastLoadedKey] = useState<string | null>(null);

  // Carregar dados se já existir uma sessão para esta data
  useEffect(() => {
    const currentKey = `${turma.id}-${selectedDate}`;
    
    // Se a chave mudou, ou se ainda não carregamos nada, carregamos os dados
    if (lastLoadedKey !== currentKey) {
      const existing = existingSessions.find(s => s.turmaId === turma.id && s.date === selectedDate);
      if (existing) {
        setEntries(existing.entries);
        setTema(existing.tema || '');
        setIsLocked(!!existing.locked);
      } else {
        // Inicializar todos como presentes por padrão para facilitar
        setEntries(members.map(m => ({ studentId: m.id, status: 'present' })));
        setTema('');
        setIsLocked(false);
      }
      setLastLoadedKey(currentKey);
    }
  }, [selectedDate, members, turma.id, existingSessions, lastLoadedKey]);

  const toggleStatus = (studentId: string) => {
    if (isLocked) return;
    setEntries(prev => prev.map(entry => {
      if (entry.studentId === studentId) {
        return { 
          ...entry, 
          status: entry.status === 'present' ? 'absent' : 'present' 
        };
      }
      return entry;
    }));
  };

  const handleSave = () => {
    const session: AttendanceSession = {
      id: `${turma.id}-${selectedDate}`,
      turmaId: turma.id,
      date: selectedDate,
      tema: tema,
      entries: entries,
      locked: isLocked
    };
    onSave(session);
    alert(isLocked ? 'Chamada trancada e salva com sucesso!' : 'Frequência salva com sucesso!');
  };

  const handleLock = () => {
    if (isLocked) return;
    if (confirm('Ao trancar a chamada, você não poderá mais alterar as presenças. Deseja continuar?')) {
      const session: AttendanceSession = {
        id: `${turma.id}-${selectedDate}`,
        turmaId: turma.id,
        date: selectedDate,
        tema: tema,
        entries: entries,
        locked: true
      };
      onSave(session);
      setIsLocked(true);
      alert('Chamada trancada e salva com sucesso!');
    }
  };

  const classSessions = existingSessions
    .filter(s => s.turmaId === turma.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSelectSession = (date: string) => {
    if (date === 'new') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } else {
      setSelectedDate(date);
    }
  };

  const filteredMembers = members.filter(m => 
    m.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = entries.filter(e => e.status === 'present').length;
  const absentCount = entries.filter(e => e.status === 'absent').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[98vh] md:max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-3 md:p-8 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-green-600 p-1.5 md:p-3 rounded-lg md:rounded-2xl">
              <CheckCircle className="text-white w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black text-white leading-tight">Diário de Frequência</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{turma.nome}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Filters and Tema */}
        <div className="p-3 md:p-6 bg-slate-50 border-b border-slate-100 space-y-2 md:space-y-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="flex-1">
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 block px-1">Histórico de Chamadas</label>
              <div className="relative">
                <History className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <select 
                  onChange={(e) => handleSelectSession(e.target.value)}
                  value={classSessions.find(s => s.date === selectedDate) ? selectedDate : 'new'}
                  className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="new">-- Nova Chamada --</option>
                  {classSessions.map(s => (
                    <option key={s.id} value={s.date}>
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR')} {s.tema ? `- ${s.tema}` : ''} {s.locked ? '🔒' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4">
            <div className="col-span-1 md:col-span-4">
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 block px-1">Data da Aula</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-9 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm font-bold text-slate-700 disabled:opacity-50"
                />
              </div>
            </div>
            <div className="col-span-1 md:col-span-8">
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 block px-1">Tema do Encontro</label>
              <div className="relative">
                <BookOpenText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="text" 
                  placeholder="Ex: O Sacramento..."
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-9 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm font-bold text-slate-700 placeholder:font-normal disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <div className="flex-1">
              <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 block px-1">Filtrar por Nome</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4">
            <div className="flex-1 bg-green-50 p-1.5 rounded-lg text-center border border-green-100">
               <p className="text-[7px] md:text-[9px] font-black text-green-600 uppercase">Presentes</p>
               <p className="text-sm md:text-lg font-black text-green-700 leading-none">{presentCount}</p>
            </div>
            <div className="flex-1 bg-red-50 p-1.5 rounded-lg text-center border border-red-100">
               <p className="text-[7px] md:text-[9px] font-black text-red-600 uppercase">Ausentes</p>
               <p className="text-sm md:text-lg font-black text-red-700 leading-none">{absentCount}</p>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2">
          {filteredMembers.sort((a,b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((student) => {
            const entry = entries.find(e => e.studentId === student.id);
            const isPresent = entry?.status === 'present';
            
            return (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-2 md:p-4 rounded-lg md:rounded-2xl border transition-all group ${
                  isPresent ? 'bg-white border-slate-100 hover:border-green-200' : 'bg-red-50/30 border-red-100'
                } ${isLocked ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                onClick={() => toggleStatus(student.id)}
              >
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-[10px] md:text-sm transition-colors shadow-sm ${
                    isPresent ? 'bg-green-100 text-green-700' : 'bg-red-600 text-white'
                  }`}>
                    {student.nomeCompleto.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs md:text-base transition-colors truncate ${isPresent ? 'text-slate-800' : 'text-red-700'}`}>
                      {student.nomeCompleto}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                      {isPresent ? 'Presença Confirmada' : 'Falta Lançada'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-1">
                   <div className={`px-2 md:px-4 py-1 md:py-2 rounded-md md:rounded-xl font-black text-[7px] md:text-[10px] uppercase transition-all ${
                     isPresent 
                       ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                       : 'bg-red-100 text-red-600'
                   }`}>
                     {isPresent ? 'Presença' : 'Falta'}
                   </div>
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="py-10 md:py-20 text-center">
              <Users className="w-10 h-10 md:w-12 md:h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 italic text-sm">Nenhum catequisando encontrado.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center">
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 md:py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-lg md:rounded-xl transition-all text-xs md:text-sm"
          >
            Fechar
          </button>
          
          <div className="flex gap-2 md:gap-3 w-full md:w-auto">
            {!isLocked ? (
              <>
                <button 
                  onClick={handleLock}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 md:py-4 bg-slate-200 text-slate-700 font-bold rounded-lg md:rounded-2xl hover:bg-slate-300 transition-all shadow-lg shadow-slate-100 text-[10px] md:text-sm"
                >
                  <Lock className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  Trancar
                </button>

                <button 
                  onClick={handleSave}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-10 py-2.5 md:py-4 bg-green-600 text-white font-bold rounded-lg md:rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 text-[10px] md:text-sm"
                >
                  <Save className="w-3.5 h-3.5 md:w-5 md:h-5" />
                  Salvar
                </button>
              </>
            ) : (
              <div className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 font-black rounded-xl md:rounded-2xl border border-amber-100 uppercase tracking-widest text-[9px] md:text-[10px]">
                <Lock className="w-3.5 h-3.5" /> Chamada Trancada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
