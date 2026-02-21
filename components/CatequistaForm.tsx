
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Save, UserCheck, ArrowLeft, Calendar, Phone, Mail, MapPin, ShieldCheck, MessageCircle, Sparkles, X, Camera, Heart, FileText, Printer } from 'lucide-react';
import { Catequista, ParishConfig } from '../types';
import { maskPhone, maskCpfCnpj } from '../utils/masks';

interface CatequistaFormProps {
  onSave: (catequista: Catequista) => void;
  onCancel: () => void;
  initialData?: Catequista;
  config: ParishConfig;
}

export const CatequistaForm: React.FC<CatequistaFormProps> = ({ onSave, onCancel, initialData, config }) => {
  const [formData, setFormData] = useState<Partial<Catequista>>(initialData || {
    sexo: 'F',
    status: 'Ativo',
    estadoCivil: 'Solteiro(a)',
    whatsapp: '',
    telefone: '',
    email: '',
    matricula: Math.floor(100000 + Math.random() * 900000).toString() // Generate random 6-digit matricula
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!formData.matricula) {
      setFormData(prev => ({ ...prev, matricula: Math.floor(100000 + Math.random() * 900000).toString() }));
    }
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, foto: imageData });
        stopCamera();
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCatequista = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Catequista;
    onSave(newCatequista);
  };

  return (
    <div className="relative">
      {/* PRINT ONLY SECTION (PORTAL) */}
      {createPortal(
        <div className="print-only p-10 w-full bg-white text-slate-900 font-sans absolute inset-0 z-[9999] hidden">
          <style>{`
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
              body > *:not(.print-only) { display: none !important; }
              .print-only { 
                display: block !important; 
                padding: 10mm; 
                height: 100vh; 
                position: absolute !important;
                top: 0;
                left: 0;
                width: 100%;
                background: white;
              }
              .no-print { display: none !important; }
            }
          `}</style>

          <div className="border-[2px] border-slate-900 p-5 h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  {config.logo ? (
                    <img src={config.logo} className="w-12 h-12 object-contain" />
                  ) : (
                    <UserCheck className="w-8 h-8" />
                  )}
                  <div>
                    <h1 className="text-lg font-black uppercase tracking-tighter">Ficha de Inscrição de Catequista</h1>
                    <p className="text-[10px] font-bold">{config.dioceseName} - {config.city}-{config.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase">Matrícula</p>
                  <p className="text-sm font-black">{formData.matricula || '________'}</p>
                  <p className="text-[8px] uppercase font-bold text-slate-400 mt-0.5">
                    Data: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <section className="relative">
                  {formData.foto && (
                    <div className="absolute top-0 right-0 w-20 h-24 border border-slate-900 overflow-hidden bg-white">
                      <img src={formData.foto} className="w-full h-full object-cover" alt="Foto" />
                    </div>
                  )}
                  <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">1. Dados Pessoais</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] pr-24">
                    <p className="col-span-2"><strong>Nome:</strong> {formData.nome}</p>
                    <p><strong>CPF:</strong> {formData.rgCpf || '___________'}</p>
                    <p><strong>Nascimento:</strong> {formData.dataNascimento ? new Date(formData.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '___/___/___'}</p>
                    <p><strong>Estado Civil:</strong> {formData.estadoCivil || 'Solteiro(a)'}</p>
                    <p><strong>Status:</strong> {formData.status || 'Ativo'}</p>
                    <p><strong>Naturalidade:</strong> {formData.naturalidade} - {formData.ufNaturalidade}</p>
                    <p><strong>Telefone/Zap:</strong> {formData.telefone} {formData.whatsapp && `/ ${formData.whatsapp}`}</p>
                    <p><strong>E-mail:</strong> {formData.email}</p>
                    <p className="col-span-2"><strong>Endereço:</strong> {formData.endereco}, {formData.numero} - {formData.bairro}, {formData.cidade}/{formData.ufEndereco}</p>
                    <p className="col-span-2"><strong>Comunidade de Atuação:</strong> {formData.comunidade || 'Paróquia Central'}</p>
                    <p className="col-span-2"><strong>Início na Catequese:</strong> {formData.desde ? new Date(formData.desde + 'T00:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                  </div>
                </section>

                {formData.estadoCivil === 'Casado(a)' && (
                  <section>
                    <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">2. Dados do Cônjuge</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                      <p className="col-span-2"><strong>Nome do Cônjuge:</strong> {formData.conjuge || '---'}</p>
                      <p><strong>CPF do Cônjuge:</strong> {formData.conjugeRgCpf || '---'}</p>
                      <p><strong>Telefone do Cônjuge:</strong> {formData.conjugeTelefone || '---'}</p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer */}
            <div>
              <div className="mt-24 grid grid-cols-2 gap-12 pb-4">
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-1 text-[8px] font-bold uppercase">Assinatura do Catequista</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-1 text-[8px] font-bold uppercase">Coordenação de Catequese</div>
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-2 mt-auto text-center">
                <p className="text-[8px] font-bold uppercase">
                  {config.address} - {config.city}/{config.state}
                </p>
                <div className="flex justify-center gap-4 mt-1 text-[8px] font-bold uppercase">
                  {config.phone && <span>Tel: {config.phone}</span>}
                  {config.whatsapp && <span>Zap: {config.whatsapp}</span>}
                  {config.email && <span>Email: {config.email}</span>}
                </div>
                <div className="flex justify-center gap-4 mt-0.5 text-[8px] font-bold uppercase text-slate-600">
                  {config.instagram && <span>Insta: {config.instagram}</span>}
                  {config.facebook && <span>Face: {config.facebook}</span>}
                  {config.website && <span>Site: {config.website}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-sky-100 overflow-hidden mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 no-print">
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
          <div className="flex gap-2 w-full md:w-auto pr-8">
            <button 
              type="button" 
              onClick={() => window.print()} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 transition-all shadow-lg"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button type="submit" form="catequista-form" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-400 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-amber-500 transition-all shadow-xl shadow-amber-100">
              <Save className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Salvar'}
            </button>
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

      <form id="catequista-form" onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-sky-100 rounded-lg"><ShieldCheck className="w-4 h-4 text-sky-600" /></div>
            <h4 className="font-black text-slate-800 uppercase tracking-wide text-xs">Identificação e Pessoal</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* FOTO E MATRÍCULA */}
            <div className="md:col-span-12 flex flex-col md:flex-row gap-6 items-center mb-4">
              <div className="relative group w-32 h-32 rounded-full border-4 border-sky-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {isCameraActive ? (
                   <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : formData.foto ? (
                  <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-slate-300" />
                )}
                
                {/* Overlay Buttons */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity ${isCameraActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   {!isCameraActive ? (
                     <>
                       <button type="button" onClick={startCamera} className="p-2 bg-white rounded-full hover:bg-sky-50 transition-colors" title="Tirar Foto">
                         <Camera size={16} className="text-sky-600" />
                       </button>
                       <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full hover:bg-sky-50 transition-colors" title="Escolher da Galeria">
                         <FileText size={16} className="text-sky-600" />
                       </button>
                     </>
                   ) : (
                     <button type="button" onClick={capturePhoto} className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-sky-600">
                       Capturar
                     </button>
                   )}
                </div>
                
                {/* Hidden Canvas for Capture */}
                <canvas ref={canvasRef} className="hidden" />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </div>

              <div className="flex-1 w-full">
                 <label className="label-style">Nº de Registro (Matrícula)</label>
                 <input 
                   type="text" 
                   value={formData.matricula || ''} 
                   readOnly 
                   className="input-style bg-slate-100 text-slate-500 font-mono tracking-widest" 
                 />
                 <p className="text-[10px] text-slate-400 mt-1">Gerado automaticamente pelo sistema.</p>
              </div>
            </div>

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

            {/* DADOS DO CÔNJUGE (CONDICIONAL) */}
            {formData.estadoCivil === 'Casado(a)' && (
              <div className="md:col-span-12 bg-pink-50/50 border border-pink-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <h5 className="text-xs font-black text-pink-700 uppercase tracking-widest">Dados do Cônjuge</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="label-style">Nome do Cônjuge</label>
                    <input 
                      type="text" 
                      value={formData.conjuge || ''} 
                      onChange={e => setFormData({...formData, conjuge: e.target.value})} 
                      className="input-style bg-white" 
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="label-style">CPF do Cônjuge</label>
                    <input 
                      type="text" 
                      value={formData.conjugeRgCpf || ''} 
                      onChange={e => setFormData({...formData, conjugeRgCpf: maskCpfCnpj(e.target.value)})} 
                      className="input-style bg-white" 
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="label-style">Telefone do Cônjuge</label>
                    <input 
                      type="tel" 
                      value={formData.conjugeTelefone || ''} 
                      onChange={e => setFormData({...formData, conjugeTelefone: maskPhone(e.target.value)})} 
                      className="input-style bg-white" 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            )}

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
    </div>
  );
};
