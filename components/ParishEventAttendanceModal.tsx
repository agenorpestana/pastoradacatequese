
import React, { useState } from 'react';
import { X, Save, UserCheck, CheckCircle2, Search, Users, Lock } from 'lucide-react';
import { ParishEvent, Catequista } from '../types';

interface ParishEventAttendanceModalProps {
  event: ParishEvent;
  catequistas: Catequista[];
  onClose: () => void;
  onSave: (eventId: string, presentIds: string[], locked?: boolean) => void;
}

export const ParishEventAttendanceModal: React.FC<ParishEventAttendanceModalProps> = ({ 
  event, 
  catequistas, 
  onClose, 
  onSave 
}) => {
  const [presentIds, setPresentIds] = useState<string[]>(event.presentes || []);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleAttendance = (id: string) => {
    if (event.locked) return;
    setPresentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleLock = () => {
    if (confirm('Tem certeza que deseja trancar as chamadas? Ninguém mais poderá alterar.')) {
      onSave(event.id, presentIds, true);
    }
  };

  const filtered = catequistas
    .filter(c => c.status === 'Ativo')
    .filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[98vh] md:max-h-[85vh]">
        
        <div className="bg-slate-900 p-4 md:p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-blue-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg">
              <UserCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black text-white leading-tight">Chamada de Catequistas</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{event.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-3 md:p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 md:w-4 md:h-4" />
            <input 
              type="text" 
              placeholder="Buscar catequista..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-blue-600 px-4 md:px-6 py-2 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-white shadow-lg shadow-blue-100">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-black">{presentIds.length}</span>
            <span className="text-[8px] md:text-[10px] font-bold uppercase opacity-80">Presentes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-slate-50/30 custom-scrollbar">
          {filtered.length > 0 ? (
            filtered.map(catequista => {
              const isPresent = presentIds.includes(catequista.id);
              return (
                <button
                  key={catequista.id}
                  onClick={() => toggleAttendance(catequista.id)}
                  className={`w-full flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                    isPresent ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/10' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-xs md:text-sm uppercase transition-colors ${
                      isPresent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {catequista.nome.charAt(0)}
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`font-bold text-xs md:text-base transition-colors truncate ${isPresent ? 'text-blue-900' : 'text-slate-800'}`}>{catequista.nome}</p>
                      <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{catequista.comunidade || 'Paróquia Central'}</p>
                    </div>
                  </div>
                  {isPresent ? (
                    <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg flex-shrink-0"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /></div>
                  ) : (
                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-slate-200 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-10 md:py-20 text-center text-slate-300">
               <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-20" />
               <p className="text-xs md:text-sm font-bold uppercase tracking-widest">Nenhum catequista encontrado</p>
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between gap-3 md:gap-4 shrink-0">
          {!event.locked ? (
            <button 
              onClick={handleLock}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-red-50 text-red-600 font-black rounded-xl md:rounded-2xl hover:bg-red-100 transition-all uppercase tracking-widest text-[9px] md:text-xs"
            >
              <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" /> Trancar
            </button>
          ) : (
            <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-slate-200 text-slate-500 font-black rounded-xl md:rounded-2xl uppercase tracking-widest text-[9px] md:text-xs">
              <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" /> Trancada
            </div>
          )}
          
          {!event.locked && (
            <button 
              onClick={() => onSave(event.id, presentIds)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 md:px-12 py-3 md:py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] md:text-xs"
            >
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4" /> Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
