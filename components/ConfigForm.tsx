
import React, { useState, useRef } from 'react';
import { Settings, Save, Church, MapPin, Phone, Globe, Instagram, Facebook, Mail, Camera, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { ParishConfig } from '../types';
import { maskPhone } from '../utils/masks';

interface ConfigFormProps {
  config: ParishConfig;
  onSave: (config: ParishConfig) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<ParishConfig>(config);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert("Configurações salvas com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <Settings className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Configurações do Sistema</h2>
              <p className="text-slate-400 text-sm">Personalize os dados que aparecem nos relatórios e fichas.</p>
            </div>
          </div>
          <button 
            form="config-form"
            type="submit" 
            className="hidden md:flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs"
          >
            <Save className="w-4 h-4" /> Salvar Tudo
          </button>
        </div>

        <form id="config-form" onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          {/* LOGO E NOME */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex flex-col items-center">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">Logo da Pastoral/Paróquia</label>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="group relative w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-400 transition-all"
               >
                 {formData.logo ? (
                   <img src={formData.logo} className="w-full h-full object-cover" alt="Logo" />
                 ) : (
                   <div className="text-center p-4">
                     <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Clique para Carregar</p>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg"><Church className="w-4 h-4 text-blue-600" /></div>
                  <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Identificação Institucional</h4>
                </div>
                <div>
                  <label className="label-style">Nome do Sistema / Pastoral</label>
                  <input required value={formData.pastoralName} onChange={e => setFormData({...formData, pastoralName: e.target.value})} className="input-style" placeholder="Ex: Pastoral da Catequese" />
                </div>
                <div>
                  <label className="label-style">Nome da Paróquia</label>
                  <input required value={formData.parishName} onChange={e => setFormData({...formData, parishName: e.target.value})} className="input-style" placeholder="Ex: Paróquia Nossa Senhora de Fátima" />
                </div>
                <div>
                  <label className="label-style">Nome da Diocese</label>
                  <input required value={formData.dioceseName} onChange={e => setFormData({...formData, dioceseName: e.target.value})} className="input-style" placeholder="Ex: Diocese de Teixeira de Freitas-Caravelas" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* LOCALIZAÇÃO E CONTATOS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-100 rounded-lg"><MapPin className="w-4 h-4 text-amber-600" /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Endereço e Localização</h4>
              </div>
              <div className="space-y-4">
                <div><label className="label-style">Endereço Completo</label><input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-style" placeholder="Rua, Número, Bairro" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2"><label className="label-style">Cidade</label><input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-style" /></div>
                  <div><label className="label-style">UF</label><input maxLength={2} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} className="input-style text-center" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-100 rounded-lg"><Phone className="w-4 h-4 text-green-600" /></div>
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Contatos Oficiais</h4>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-style">Telefone Fixo</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} className="input-style" />
                  </div>
                  <div>
                    <label className="label-style">WhatsApp</label>
                    <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} className="input-style" />
                  </div>
                </div>
                <div><label className="label-style">E-mail da Paróquia/Pastoral</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-style" /></div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* REDES SOCIAIS */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg"><Globe className="w-4 h-4 text-indigo-600" /></div>
              <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Presença Digital</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="input-style pl-12" placeholder="@instagram" />
              </div>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="input-style pl-12" placeholder="facebook.com/pagina" />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="input-style pl-12" placeholder="www.paroquia.com.br" />
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 md:hidden">
            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl uppercase tracking-widest text-xs">
              <Save className="w-4 h-4 inline mr-2" /> Salvar Configurações
            </button>
          </div>
        </form>
      </div>

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
