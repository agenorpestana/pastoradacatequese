import React from 'react';
import { X, Calendar, CheckCircle2, XCircle, GraduationCap, Church, Bookmark } from 'lucide-react';
import { Catequista, FormationEvent, ParishEvent } from '../types';

interface CatequistaHistoryModalProps {
  catequista: Catequista;
  formations: FormationEvent[];
  parishEvents: ParishEvent[];
  onClose: () => void;
}

export const CatequistaHistoryModal: React.FC<CatequistaHistoryModalProps> = ({ 
  catequista, 
  formations, 
  parishEvents,
  onClose 
}) => {
  // Normalizar eventos e formações para um formato comum
  const allActivities = [
    ...formations.map(f => ({
      id: f.id,
      titulo: f.tema,
      data: f.inicio,
      tipo: 'Formação',
      presente: f.presentes?.includes(catequista.id)
    })),
    ...parishEvents.map(e => ({
      id: e.id,
      titulo: e.titulo,
      data: e.dataInicio,
      tipo: e.tipo,
      presente: e.presentes?.includes(catequista.id)
    }))
  ]
  .filter(activity => new Date(activity.data) <= new Date()) // Apenas atividades passadas
  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const totalEvents = allActivities.length;
  const presenceCount = allActivities.filter(a => a.presente).length;
  const presenceRate = totalEvents > 0 ? ((presenceCount / totalEvents) * 100).toFixed(0) : '0';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{catequista.nome}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Histórico de Participação</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"><X /></button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Atividades</p>
            <p className="text-xl font-black text-slate-900">{totalEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Presenças</p>
            <p className="text-xl font-black text-green-600">{presenceCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Assiduidade</p>
            <p className="text-xl font-black text-blue-600">{presenceRate}%</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {allActivities.length > 0 ? (
            allActivities.map(activity => {
              const eventDate = new Date(activity.data + (activity.data.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    activity.presente ? 'bg-white border-slate-100' : 'bg-red-50/30 border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase ${
                      activity.presente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.presente ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${activity.presente ? 'text-slate-800' : 'text-red-700'}`}>{activity.titulo}</p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {eventDate}</span>
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[8px]">{activity.tipo}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    activity.presente ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.presente ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-slate-300">
               <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-sm font-bold uppercase tracking-widest">Nenhum registro de atividade passiva</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};