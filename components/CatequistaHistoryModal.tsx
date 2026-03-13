import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, CheckCircle2, XCircle, GraduationCap, Church, Bookmark, Printer } from 'lucide-react';
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
      {/* FICHA DE IMPRESSÃO OFICIAL */}
      {createPortal(
        <div className="print-only bg-white min-h-screen text-slate-900 absolute inset-0 z-[9999] hidden">
          <style>
            {`
              @media print {
                @page { margin: 15mm; }
                body { margin: 0; }
                body > *:not(.print-only) { display: none !important; }
                .print-only { 
                  display: block !important; 
                  width: 100%;
                  background: white;
                }
              }
            `}
          </style>
          
          <div className="border-[2px] border-slate-900 p-8 flex flex-col h-full">
            {/* Cabeçalho do Relatório */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl">
                  <GraduationCap className="text-white w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter">Histórico de Participação</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Relatório Individual do Catequista</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase">Data de Emissão</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Dados do Catequista */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome do Catequista</p>
                <p className="text-xl font-black text-slate-900">{catequista.nome}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Comunidade</p>
                <p className="text-sm font-bold text-slate-800">{catequista.comunidade || '---'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atuação</p>
                <p className="text-sm font-bold text-slate-800">{catequista.atuacao || '---'}</p>
              </div>
            </div>

            {/* Resumo de Assiduidade */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border-2 border-slate-900 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Atividades</p>
                <p className="text-2xl font-black text-slate-900">{totalEvents}</p>
              </div>
              <div className="border-2 border-slate-900 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Presenças</p>
                <p className="text-2xl font-black text-slate-900">{presenceCount}</p>
              </div>
              <div className="border-2 border-slate-900 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assiduidade</p>
                <p className="text-2xl font-black text-slate-900">{presenceRate}%</p>
              </div>
            </div>

            {/* Tabela de Atividades */}
            <div className="flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Data</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Atividade / Tema</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Tipo</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allActivities.map(activity => {
                    const eventDate = new Date(activity.data + (activity.data.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('pt-BR');
                    return (
                      <tr key={activity.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-xs font-bold text-slate-600">{eventDate}</td>
                        <td className="px-4 py-3 text-xs font-black text-slate-800">{activity.titulo}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-tighter">{activity.tipo}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${activity.presente ? 'text-green-600' : 'text-red-500'}`}>
                            {activity.presente ? 'Presente' : 'Ausente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé de Assinaturas */}
            <div className="mt-20 grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t-2 border-slate-900 pt-2 text-[10px] font-black uppercase tracking-widest">Assinatura do Catequista</div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-slate-900 pt-2 text-[10px] font-black uppercase tracking-widest">Coordenação de Catequese</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] md:max-h-[85vh] no-print">
        
        <div className="bg-slate-900 p-4 md:p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-blue-600 p-2 md:p-3 rounded-xl md:rounded-2xl">
              <GraduationCap className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black text-white leading-tight">{catequista.nome}</h2>
              <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Histórico de Participação</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-3 md:p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-2 md:gap-4 shrink-0">
          <div className="bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Atividades</p>
            <p className="text-sm md:text-xl font-black text-slate-900">{totalEvents}</p>
          </div>
          <div className="bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Presenças</p>
            <p className="text-sm md:text-xl font-black text-green-600">{presenceCount}</p>
          </div>
          <div className="bg-white p-2 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Assiduidade</p>
            <p className="text-sm md:text-xl font-black text-blue-600">{presenceRate}%</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 md:space-y-3 custom-scrollbar">
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
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                    activity.presente ? 'bg-white border-slate-100' : 'bg-red-50/30 border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[10px] uppercase ${
                      activity.presente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.presente ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <XCircle className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-xs md:text-sm truncate ${activity.presente ? 'text-slate-800' : 'text-red-700'}`}>{activity.titulo}</p>
                      <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <span className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" /> {eventDate}</span>
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[7px] whitespace-nowrap">{activity.tipo}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 ml-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                    activity.presente ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {activity.presente ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-10 md:py-20 text-center text-slate-300">
               <Bookmark className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-20" />
               <p className="text-xs md:text-sm font-bold uppercase tracking-widest">Nenhum registro de atividade</p>
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 md:gap-3 shrink-0">
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-white text-slate-700 font-black rounded-xl border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-2"
          >
            <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> Imprimir
          </button>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[9px] md:text-[10px]"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};