
import React, { useState } from 'react';
import { Save, UserCheck, ArrowLeft, Calendar, Phone, Mail, MapPin, ShieldCheck, MessageCircle, Sparkles, X } from 'lucide-react';
import { Catequista } from '../types';
import { maskPhone, maskCpfCnpj } from '../utils/masks';

interface CatequistaFormProps {
  onSave: (catequista: Catequista) => void;
  onCancel: () => void;
  initialData?: Catequista;
}

export const CatequistaForm: React.FC<CatequistaFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Catequista>>(initialData || {
    sexo: 'F',
    status: 'Ativo',
    estadoCivil: 'Solteiro(a)',
    whatsapp: '',
    telefone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCatequista = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Catequista;
    onSave(newCatequista);
  };

  return (
    <div className="bg-white shadow-2xl rounded-[2.5rem] border border-sky-100 overflow-hidden mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-sky-600 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} className="text-white" /></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/20 p-3 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
            <UserCheck className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {initialData ? 'Editar Catequista' : 'Novo Catequista'}
            </h2>
            <p className="text-sky-100 text-sm font-medium uppercase tracking-widest opacity-80">Cadastro de membros do corpo docente mariano</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors z-20"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-sky-100 rounded-lg"><ShieldCheck className="w-4 h-4 text-sky-600" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Identificação e Pessoal</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-9">
              <label className="label-style">Nome Completo</label>
              <input required type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="input-style" placeholder="Ex: Maria de Fátima Souza" />
            </div>
            <div className="md:col-span-3">
              <label className="label-style">Status Pastoral</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-style font-black text-sky-600">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="label-style">Sexo</label>
              <select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value as any})} className="input-style">
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="label-style">Data de Nasc.</label>
              <input required type="date" value={formData.dataNascimento || ''} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} className="input-style" />
            </div>
            <div className="md:col-span-3">
              <label className="label-style">CPF</label>
              <input type="text" value={formData.rgCpf || ''} onChange={e => setFormData({...formData, rgCpf: maskCpfCnpj(e.target.value)})} className="input-style" placeholder="000.000.000-00" />
            </div>
            <div className="md:col-span-3">
              <label className="label-style">Estado Civil</label>
              <select value={formData.estadoCivil} onChange={e => setFormData({...formData, estadoCivil: e.target.value})} className="input-style">
                <option>Solteiro(a)</option>
                <option>Casado(a)</option>
                <option>Viúvo(a)</option>
                <option>Divorciado(a)</option>
                <option>U. Estável</option>
              </select>
            </div>

            <div className="md:col-span-10">
              <label className="label-style">Naturalidade</label>
              <input type="text" value={formData.naturalidade || ''} onChange={e => setFormData({...formData, naturalidade: e.target.value})} className="input-style" placeholder="Cidade natal" />
            </div>
            <div className="md:col-span-2">
              <label className="label-style">UF</label>
              <input type="text" maxLength={2} value={formData.ufNaturalidade || ''} onChange={e => setFormData({...formData, ufNaturalidade: e.target.value.toUpperCase()})} className="input-style text-center font-bold" placeholder="BA" />
            </div>

            <div className="md:col-span-8">
              <label className="label-style">Comunidade de Atuação</label>
              <input type="text" value={formData.comunidade || ''} onChange={e => setFormData({...formData, comunidade: e.target.value})} className="input-style" placeholder="Ex: Matriz, Nossa Senhora das Graças..." />
            </div>
            <div className="md:col-span-4">
              <label className="label-style">Início na Catequese</label>
              <input type="date" value={formData.desde || ''} onChange={e => setFormData({...formData, desde: e.target.value})} className="input-style" />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-sky-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-100 rounded-lg"><Phone className="w-4 h-4 text-amber-600" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Contatos e Comunicação</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label-style">Telefone Fixo</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-4 h-4" />
                <input type="tel" value={formData.telefone || ''} onChange={e => setFormData({...formData, telefone: maskPhone(e.target.value)})} className="input-style pl-11" placeholder="(00) 0000-0000" />
              </div>
            </div>
            <div>
              <label className="label-style">WhatsApp</label>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 w-5 h-5" />
                <input type="tel" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} className="input-style pl-11 border-green-50 focus:border-green-400" placeholder="(00) 90000-0000" />
              </div>
            </div>
            <div>
              <label className="label-style">E-mail Pessoal</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-4 h-4" />
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="input-style pl-11" placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-sky-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-sky-50 rounded-lg"><MapPin className="w-4 h-4 text-sky-500" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Endereço Residencial</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-9">
              <label className="label-style">Rua / Avenida</label>
              <input type="text" value={formData.endereco || ''} onChange={e => setFormData({...formData, endereco: e.target.value})} className="input-style" placeholder="Endereço completo" />
            </div>
            <div className="md:col-span-3">
              <label className="label-style">Nº</label>
              <input type="text" value={formData.numero || ''} onChange={e => setFormData({...formData, numero: e.target.value})} className="input-style text-center" placeholder="00" />
            </div>
            <div className="md:col-span-5">
              <label className="label-style">Bairro</label>
              <input type="text" value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="input-style" placeholder="Bairro" />
            </div>
            <div className="md:col-span-4">
              <label className="label-style">Cidade</label>
              <input type="text" value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="input-style" placeholder="Cidade" />
            </div>
            <div className="md:col-span-1">
              <label className="label-style">UF</label>
              <input type="text" maxLength={2} value={formData.ufEndereco || ''} onChange={e => setFormData({...formData, ufEndereco: e.target.value.toUpperCase()})} className="input-style text-center font-bold" placeholder="BA" />
            </div>
            <div className="md:col-span-2">
              <label className="label-style">CEP</label>
              <input type="text" maxLength={10} value={formData.cep || ''} onChange={e => setFormData({...formData, cep: e.target.value})} className="input-style text-center" placeholder="00.000-000" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-sky-50">
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-all">
            <ArrowLeft className="w-5 h-5" /> Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-amber-400 text-white font-black hover:bg-amber-500 shadow-xl shadow-amber-100 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-xs">
            <Save className="w-6 h-6" /> {initialData ? 'Atualizar Cadastro' : 'Salvar Catequista'}
          </button>
        </div>
      </form>

      <style>{`
        .input-style {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 1.25rem;
          border: 2px solid #F0F7FF;
          background-color: #FFFFFF;
          outline: none;
          transition: all 0.3s;
          font-size: 0.95rem;
          color: #1E293B;
          font-weight: 500;
        }
        .input-style:focus {
          border-color: #0EA5E9;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
        }
        .label-style {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};
