
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Calendar, Save, Users, Search, BookOpenText, Lock, Unlock } from 'lucide-react';
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

  // Carregar dados se já existir uma sessão para esta data
  useEffect(() => {
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
  }, [selectedDate, members, turma.id, existingSessions]);

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
    if (isLocked) {
      if (confirm('Deseja realmente destravar esta chamada?')) {
        setIsLocked(false);
      }
    } else {
      if (confirm('Ao trancar a chamada, você não poderá mais alterar as presenças. Deseja continuar?')) {
        setIsLocked(true);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = entries.filter(e => e.status === 'present').length;
  const absentCount = entries.filter(e => e.status === 'absent').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-2xl">
              <CheckCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Diário de Frequência</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{turma.nome}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters and Tema */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">Data da Aula</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm font-bold text-slate-700 disabled:opacity-50"
                />
              </div>
            </div>
            <div className="md:col-span-8">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">Tema do Encontro</label>
              <div className="relative">
                <BookOpenText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Ex: O Sacramento da Eucaristia..."
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm font-bold text-slate-700 placeholder:font-normal disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block px-1">Filtrar por Nome</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Pesquisar catequisando..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 p-2 rounded-xl text-center border border-green-100">
               <p className="text-[9px] font-black text-green-600 uppercase">Presentes</p>
               <p className="text-lg font-black text-green-700">{presentCount}</p>
            </div>
            <div className="flex-1 bg-red-50 p-2 rounded-xl text-center border border-red-100">
               <p className="text-[9px] font-black text-red-600 uppercase">Ausentes</p>
               <p className="text-lg font-black text-red-700">{absentCount}</p>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {filteredMembers.sort((a,b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((student) => {
            const entry = entries.find(e => e.studentId === student.id);
            const isPresent = entry?.status === 'present';
            
            return (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                  isPresent ? 'bg-white border-slate-100 hover:border-green-200' : 'bg-red-50/30 border-red-100'
                }`}
                onClick={() => toggleStatus(student.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-colors shadow-sm ${
                    isPresent ? 'bg-green-100 text-green-700' : 'bg-red-600 text-white'
                  }`}>
                    {student.nomeCompleto.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold transition-colors ${isPresent ? 'text-slate-800' : 'text-red-700'}`}>
                      {student.nomeCompleto}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {isPresent ? 'Presença Confirmada' : 'Falta Lançada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
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
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 italic">Nenhum catequisando encontrado.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
          >
            Fechar
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleLock}
              className={`flex items-center gap-2 px-6 py-4 font-bold rounded-2xl transition-all shadow-xl ${
                isLocked 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-amber-100' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-slate-100'
              }`}
            >
              {isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              {isLocked ? 'Destrancar' : 'Trancar Chamada'}
            </button>

            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100"
            >
              <Save className="w-5 h-5" />
              Salvar Diário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
