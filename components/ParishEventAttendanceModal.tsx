
import React, { useState } from 'react';
import { X, Save, UserCheck, CheckCircle2, Search, Users } from 'lucide-react';
import { ParishEvent, Catequista } from '../types';

interface ParishEventAttendanceModalProps {
  event: ParishEvent;
  catequistas: Catequista[];
  onClose: () => void;
  onSave: (eventId: string, presentIds: string[]) => void;
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
    setPresentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = catequistas
    .filter(c => c.status === 'Ativo')
    .filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <UserCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Chamada de Catequistas</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{event.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"><X /></button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar catequista ativo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-blue-600 px-6 py-2 rounded-xl flex items-center justify-center gap-3 text-white shadow-lg shadow-blue-100">
            <Users className="w-4 h-4" />
            <span className="text-sm font-black">{presentIds.length}</span>
            <span className="text-[10px] font-bold uppercase opacity-80">Presentes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-slate-50/30">
          {filtered.length > 0 ? (
            filtered.map(catequista => {
              const isPresent = presentIds.includes(catequista.id);
              return (
                <button
                  key={catequista.id}
                  onClick={() => toggleAttendance(catequista.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isPresent ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/10' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase transition-colors ${
                      isPresent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {catequista.nome.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold transition-colors ${isPresent ? 'text-blue-900' : 'text-slate-800'}`}>{catequista.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{catequista.comunidade || 'Paróquia Central'}</p>
                    </div>
                  </div>
                  {isPresent ? (
                    <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-slate-200 rounded-full"></div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-20 text-center text-slate-300">
               <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-sm font-bold uppercase tracking-widest">Nenhum catequista ativo encontrado</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={() => onSave(event.id, presentIds)}
            className="flex items-center gap-2 px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
          >
            <Save className="w-4 h-4" /> Finalizar Chamada
          </button>
        </div>
      </div>
    </div>
  );
};
