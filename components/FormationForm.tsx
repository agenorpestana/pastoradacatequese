
import React, { useState } from 'react';
import { Save, GraduationCap, ArrowLeft, Calendar, Clock, BookOpen, X } from 'lucide-react';
import { FormationEvent } from '../types';

interface FormationFormProps {
  onSave: (event: FormationEvent) => void;
  onCancel: () => void;
  initialData?: FormationEvent;
}

export const FormationForm: React.FC<FormationFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<FormationEvent>>(initialData || {
    tema: '',
    inicio: '',
    fim: '',
    presentes: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFormation = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      presentes: formData.presentes || []
    } as FormationEvent;
    onSave(newFormation);
  };

  return (
    <div className="bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden mb-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-8 relative">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {initialData ? 'Editar Formação' : 'Nova Formação'}
            </h2>
            <p className="text-slate-400 text-sm">Agendamento de treinamentos e retiros para o corpo docente.</p>
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

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg"><BookOpen className="w-4 h-4 text-indigo-600" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Pauta do Evento</h4>
          </div>
          
          <div>
            <label className="label-style">Tema da Formação</label>
            <input 
              required 
              type="text" 
              value={formData.tema || ''} 
              onChange={e => setFormData({...formData, tema: e.target.value})} 
              className="input-style" 
              placeholder="Ex: Introdução ao Novo Catecismo, Espiritualidade do Catequista..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
              </div>
              <input 
                required 
                type="datetime-local" 
                value={formData.inicio || ''} 
                onChange={e => setFormData({...formData, inicio: e.target.value})} 
                className="input-style bg-white" 
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Término</span>
              </div>
              <input 
                required 
                type="datetime-local" 
                value={formData.fim || ''} 
                onChange={e => setFormData({...formData, fim: e.target.value})} 
                className="input-style bg-white" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5" /> Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5">
            <Save className="w-6 h-6" /> {initialData ? 'Atualizar Evento' : 'Salvar Formação'}
          </button>
        </div>
      </form>

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
