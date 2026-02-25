
import React, { useState } from 'react';
import { X, CalendarDays, Clock, MapPin, Save, Bookmark, Sparkles, ChevronRight } from 'lucide-react';
import { ParishEvent } from '../types';

interface EventFormModalProps {
  onSave: (event: ParishEvent) => void;
  onClose: () => void;
  initialDate?: string;
  eventToEdit?: ParishEvent | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ onSave, onClose, initialDate, eventToEdit }) => {
  const [formData, setFormData] = useState<Partial<ParishEvent>>(eventToEdit || {
    titulo: '',
    dataInicio: initialDate || new Date().toISOString().split('T')[0],
    horarioInicio: '',
    dataFim: initialDate || new Date().toISOString().split('T')[0],
    horarioFim: '',
    local: '',
    tipo: 'Reunião',
    tipoCustomizado: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.dataInicio) return;

    const newEvent: ParishEvent = {
      id: eventToEdit?.id || Math.random().toString(36).substr(2, 9),
      titulo: formData.titulo!,
      dataInicio: formData.dataInicio!,
      horarioInicio: formData.horarioInicio || '--:--',
      dataFim: formData.dataFim || formData.dataInicio!,
      horarioFim: formData.horarioFim || '--:--',
      local: formData.local || 'Paróquia',
      tipo: formData.tipo as any,
      tipoCustomizado: formData.tipo === 'Outros' ? formData.tipoCustomizado : undefined,
      presentes: eventToEdit?.presentes,
      locked: eventToEdit?.locked
    };

    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <CalendarDays className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Agendar Evento</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Preencha os detalhes do compromisso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Título do Evento</label>
            <div className="relative">
              <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                required
                type="text" 
                placeholder="Ex: Reunião de Pais, Encontro de Formação..."
                value={formData.titulo}
                onChange={e => setFormData({...formData, titulo: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            {/* INÍCIO */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Início
              </p>
              <div className="space-y-3">
                <input 
                  required
                  type="date" 
                  value={formData.dataInicio}
                  onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-sm"
                />
                <input 
                  type="time" 
                  value={formData.horarioInicio}
                  onChange={e => setFormData({...formData, horarioInicio: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 text-sm"
                />
              </div>
            </div>

            {/* FIM */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Encerramento
              </p>
              <div className="space-y-3">
                <input 
                  required
                  type="date" 
                  value={formData.dataFim}
                  onChange={e => setFormData({...formData, dataFim: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-all font-bold text-slate-700 text-sm"
                />
                <input 
                  type="time" 
                  value={formData.horarioFim}
                  onChange={e => setFormData({...formData, horarioFim: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-red-500 transition-all font-bold text-slate-700 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Local</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Ex: Salão Paroquial, Igreja Matriz..."
                value={formData.local}
                onChange={e => setFormData({...formData, local: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Compromisso</label>
            <div className="grid grid-cols-5 gap-2">
              {['Formação', 'Reunião', 'Celebração', 'Retiro', 'Outros'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, tipo: type as any})}
                  className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                    formData.tipo === type 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {formData.tipo === 'Outros' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text" 
                  placeholder="Especifique o tipo (ex: Mutirão, Festa...)"
                  value={formData.tipoCustomizado}
                  onChange={e => setFormData({...formData, tipoCustomizado: e.target.value})}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-blue-700 placeholder:text-blue-300 text-sm"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
             <button 
               type="button"
               onClick={onClose}
               className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
             >
               Cancelar
             </button>
             <button 
               type="submit"
               className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
             >
               <Save className="w-4 h-4" /> Salvar na Agenda
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
