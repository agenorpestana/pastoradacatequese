
import React, { useState, useEffect, useRef } from 'react';
import { Save, Printer, User, Home, Users, Church, MapPin, Calendar, ArrowRight, ArrowLeft, ClipboardList, Wine, UserPlus, CheckCircle2, Mail, Phone, ShieldCheck, Heart, FileText, BookOpen, Fingerprint, UserCheck, Camera, Upload, RotateCcw, Image as ImageIcon, BookOpenText, Star, MessageSquare, Waves, Award, X } from 'lucide-react';
import { Student, PersonFull, PersonBasic, Turma, ParishConfig } from '../types';

interface RegistrationFormProps {
  onSave: (student: Student) => void;
  onCancel?: () => void;
  initialData?: Student | null;
  allClasses?: Turma[];
  config: ParishConfig;
}

type TabType = 'crismando' | 'pais' | 'padrinhos_batismo' | 'eucaristia' | 'celebracao';

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSave, onCancel, initialData, allClasses, config }) => {
  const [activeTab, setActiveTab] = useState<TabType>('crismando');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const defaultPersonData: Partial<PersonFull> = {
    nome: '',
    telefone: '',
    whatsapp: '',
    email: '',
    rgCpf: '',
    estadoCivil: 'Solteiro(a)',
    naturalidade: '',
    ufNaturalidade: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    ufEndereco: '',
  };

  const defaultData: Partial<Student> = {
    nomeCompleto: '',
    matricula: '',
    foto: '',
    novoCatequizando: true,
    status: 'Ativo',
    sexo: 'F',
    estadoCivil: 'Solteiro(a)',
    dataNascimento: '',
    rgCpf: '',
    naturalidade: '',
    ufNaturalidade: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    ufEndereco: '',
    cep: '',
    moroCom: 'Meus Pais',
    telefone: '',
    whatsapp: '',
    email: '',
    batizado: false,
    batismoDiocese: '',
    batismoUF: '',
    batismoParoquia: '',
    batismoComunidade: '',
    batismoLocal: '',
    batismoData: '',
    batismoCelebrante: '',
    fezPrimeiraEucaristia: false,
    eucaristiaData: '',
    eucaristiaParoquia: '',
    eucaristiaComunidade: '',
    eucaristiaLocal: '',
    eucaristiaDiocese: '',
    eucaristiaUF: '',
    eucaristiaCelebrante: '',
    eucaristiaCatequistas: '',
    pai: { ...defaultPersonData, estadoCivil: 'Casado' },
    mae: { ...defaultPersonData, estadoCivil: 'Casada' },
    padrinhoBatismo: { ...defaultPersonData },
    madrinhaBatismo: { ...defaultPersonData },
    padrinhoCrisma: { ...defaultPersonData },
    inicioPreparacao: '',
    fimPreparacao: '',
    comunidade: '',
    turma: '',
    catequistas: '',
    dataCadastro: new Date().toISOString(),
    celebrante: '',
    localCelebracao: '',
    dataCelebracao: '',
    livro: '',
    folha: '',
    numeroRegistro: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState<Partial<Student>>(defaultData);

  const currentClass = allClasses?.find(c => c.nome === formData.turma);
  const displayCatequistas = currentClass?.catequista || formData.catequistas || '_______________________';

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultData);
    }
  }, [initialData]);

  // Função central de sincronização de endereço (Fonte -> Catequizando)
  const syncAddressFromSource = (moroComValue: string, currentData: Partial<Student>) => {
    let source: Partial<PersonFull> | undefined;
    
    if (moroComValue === 'Minha Mãe' || moroComValue === 'Meus Pais') {
      source = currentData.mae;
    } else if (moroComValue === 'Meu Pai') {
      source = currentData.pai;
    }

    if (source) {
      return {
        endereco: source.endereco || '',
        numero: source.numero || '',
        bairro: source.bairro || '',
        cidade: source.cidade || '',
        ufEndereco: source.ufEndereco || '',
        cep: source.cep || ''
      };
    }
    return null;
  };

  // Handler para quando o campo "Moro com" muda
  const handleMoroComChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, moroCom: val as any };
      const syncedFields = syncAddressFromSource(val, prev);
      
      if (syncedFields) {
        const finalState = { ...updated, ...syncedFields };
        
        // Se mudou para "Meus Pais", garante que ambos tenham o mesmo endereço agora
        if (val === 'Meus Pais') {
          finalState.mae = { ...prev.mae, ...syncedFields };
          finalState.pai = { ...prev.pai, ...syncedFields };
        }
        
        return finalState;
      }
      return updated;
    });
  };

  // Handler para campos de endereço do Catequizando (Sincroniza para os Pais)
  const handleCatequizandoAddressChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Sincroniza com a MÃE se 'Minha Mãe' ou 'Meus Pais'
      if (prev.moroCom === 'Minha Mãe' || prev.moroCom === 'Meus Pais') {
        updated.mae = { ...prev.mae, [field]: value };
      }
      
      // Sincroniza com o PAI se 'Meu Pai' ou 'Meus Pais'
      if (prev.moroCom === 'Meu Pai' || prev.moroCom === 'Meus Pais') {
        updated.pai = { ...prev.pai, [field]: value };
      }
      
      return updated;
    });
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nomeCompleto) {
      alert("Por favor, preencha o Nome Completo.");
      setActiveTab('crismando');
      return;
    }
    const finalMatricula = formData.matricula || Math.floor(100000 + Math.random() * 900000).toString();
    onSave({
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      matricula: finalMatricula
    } as Student);
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'crismando', label: 'Catequizando', icon: User },
    { id: 'pais', label: 'Família', icon: Home },
    { id: 'padrinhos_batismo', label: 'Sacr. do Batismo', icon: Users },
    { id: 'eucaristia', label: 'Sacr. da Eucaristia', icon: Wine },
    { id: 'celebracao', label: 'Sacr. da Crisma', icon: Church },
  ];

  const renderPersonFields = (personKey: 'mae' | 'pai' | 'padrinhoBatismo' | 'madrinhaBatismo' | 'padrinhoCrisma', title: string, colorClass: string, bgColorClass: string) => {
    const data = formData[personKey] || {};
    
    const updatePerson = (field: keyof PersonFull, value: any) => {
      const isAddressField = ['endereco', 'numero', 'bairro', 'cidade', 'ufEndereco', 'cep'].includes(field as string);
      
      setFormData(prev => {
        const updatedPerson = { ...prev[personKey], [field]: value };
        const newState = { ...prev, [personKey]: updatedPerson };
        
        // SINCRONIZAÇÃO EM TEMPO REAL (Fonte -> Catequizando e vice-versa)
        
        // Se estiver editando a MÃE e ela mora com o catequizando
        const isMotherLivingWith = personKey === 'mae' && (prev.moroCom === 'Minha Mãe' || prev.moroCom === 'Meus Pais');
        // Se estiver editando o PAI e ele mora com o catequizando
        const isFatherLivingWith = personKey === 'pai' && (prev.moroCom === 'Meu Pai' || prev.moroCom === 'Meus Pais');

        if ((isMotherLivingWith || isFatherLivingWith) && isAddressField) {
          // 1. Atualiza o endereço principal do Catequizando
          (newState as any)[field] = value;
          
          // 2. Se for "Meus Pais", atualiza o OUTRO progenitor também para manter o sincronismo residencial
          if (prev.moroCom === 'Meus Pais') {
            const otherParentKey = personKey === 'mae' ? 'pai' : 'mae';
            newState[otherParentKey] = { ...newState[otherParentKey], [field]: value };
          }
        }
        
        return newState;
      });
    };

    return (
      <div className={`${bgColorClass} p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300`}>
        <h4 className={`text-sm font-black ${colorClass} uppercase mb-6 flex items-center gap-2`}>
          <User size={18} /> {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12">
            <label className="label-style">Nome Completo</label>
            <input type="text" value={data.nome || ''} onChange={e => updatePerson('nome', e.target.value)} className="input-style" />
          </div>

          <div className="md:col-span-3">
            <label className="label-style">RG-CPF</label>
            <input type="text" value={data.rgCpf || ''} onChange={e => updatePerson('rgCpf', e.target.value)} className="input-style" />
          </div>

          <div className="md:col-span-3">
            <label className="label-style">Estado Civil</label>
            <select value={data.estadoCivil || ''} onChange={e => updatePerson('estadoCivil', e.target.value)} className="input-style">
              <option>Solteiro(a)</option>
              <option>Casado(a)</option>
              <option>Viúvo(a)</option>
              <option>Divorciado(a)</option>
              <option>U. Estável</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="label-style">Naturalidade</label>
            <input type="text" value={data.naturalidade || ''} onChange={e => updatePerson('naturalidade', e.target.value)} className="input-style" placeholder="Cidade natal" />
          </div>
          <div className="md:col-span-1">
            <label className="label-style text-center">UF</label>
            <input type="text" maxLength={2} value={data.ufNaturalidade || ''} onChange={e => updatePerson('ufNaturalidade', e.target.value.toUpperCase())} className="input-style text-center px-1" placeholder="BA" />
          </div>

          <div className="md:col-span-4">
            <label className="label-style">Telefone</label>
            <input type="tel" value={data.telefone || ''} onChange={e => updatePerson('telefone', e.target.value)} className="input-style" placeholder="(00) 00000-0000" />
          </div>
          <div className="md:col-span-4">
            <label className="label-style">WhatsApp</label>
            <input type="tel" value={data.whatsapp || ''} onChange={e => updatePerson('whatsapp', e.target.value)} className="input-style" placeholder="(00) 90000-0000" />
          </div>
          <div className="md:col-span-4">
            <label className="label-style">E-mail</label>
            <input type="email" value={data.email || ''} onChange={e => updatePerson('email', e.target.value)} className="input-style" />
          </div>

          <div className="md:col-span-3">
            <label className="label-style">CEP</label>
            <input type="text" value={data.cep || ''} onChange={e => updatePerson('cep', e.target.value)} className="input-style" />
          </div>
          <div className="md:col-span-7">
            <label className="label-style">Endereço</label>
            <input type="text" value={data.endereco || ''} onChange={e => updatePerson('endereco', e.target.value)} className="input-style" />
          </div>
          <div className="md:col-span-2">
            <label className="label-style">Número</label>
            <input type="text" value={data.numero || ''} onChange={e => updatePerson('numero', e.target.value)} className="input-style text-center" />
          </div>

          <div className="md:col-span-5">
            <label className="label-style">Bairro</label>
            <input type="text" value={data.bairro || ''} onChange={e => updatePerson('bairro', e.target.value)} className="input-style" />
          </div>
          <div className="md:col-span-5">
            <label className="label-style">Cidade</label>
            <input type="text" value={data.cidade || ''} onChange={e => updatePerson('cidade', e.target.value)} className="input-style" />
          </div>
          <div className="md:col-span-2">
            <label className="label-style text-center">UF</label>
            <input type="text" maxLength={2} value={data.ufEndereco || ''} onChange={e => updatePerson('ufEndereco', e.target.value.toUpperCase())} className="input-style text-center" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* FICHA DE IMPRESSÃO OFICIAL */}
      <div className="print-only p-4 bg-white min-h-screen text-slate-900">
        <div className="border-[2px] border-slate-900 p-5 h-full">
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-3">
            <div className="flex items-center gap-3">
              {config.logo ? <img src={config.logo} className="w-12 h-12 object-contain" /> : <Church className="w-8 h-8" />}
              <div>
                <h1 className="text-lg font-black uppercase tracking-tighter">Ficha de Inscrição Catequética</h1>
                <p className="text-[10px] font-bold">{config.parishName} - {config.city}-{config.state}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase">Matrícula</p>
              <p className="text-sm font-black">{formData.matricula || '________'}</p>
              <p className="text-[8px] uppercase font-bold text-slate-400 mt-0.5">Data: {new Date(formData.dataCadastro || '').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <section className="relative">
              {formData.foto && (
                <div className="absolute top-0 right-0 w-20 h-24 border border-slate-900 overflow-hidden bg-white">
                  <img src={formData.foto} className="w-full h-full object-cover" alt="Foto" />
                </div>
              )}
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">1. Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] pr-24">
                <p className="col-span-2"><strong>Nome:</strong> {formData.nomeCompleto}</p>
                <p><strong>RG/CPF:</strong> {formData.rgCpf || '___________'}</p>
                <p><strong>Nascimento:</strong> {formData.dataNascimento ? new Date(formData.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '___/___/___'}</p>
                <p><strong>Naturalidade:</strong> {formData.naturalidade} - {formData.ufNaturalidade}</p>
                <p><strong>Telefone/Zap:</strong> {formData.telefone} {formData.whatsapp && `/ ${formData.whatsapp}`}</p>
                <p><strong>E-mail:</strong> {formData.email}</p>
                <p className="col-span-2"><strong>Endereço:</strong> {formData.endereco}, {formData.numero} - {formData.bairro}, {formData.cidade}/{formData.ufEndereco}</p>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">2. Filiação</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                <div className="border-r border-slate-200 pr-2">
                  <p className="font-bold underline uppercase text-[7px]">Mãe</p>
                  <p><strong>Nome:</strong> {formData.mae?.nome}</p>
                  <p><strong>Telefone/Zap:</strong> {formData.mae?.telefone} {formData.mae?.whatsapp && `/ ${formData.mae?.whatsapp}`}</p>
                </div>
                <div>
                  <p className="font-bold underline uppercase text-[7px]">Pai</p>
                  <p><strong>Nome:</strong> {formData.pai?.nome}</p>
                  <p><strong>Telefone/Zap:</strong> {formData.pai?.telefone} {formData.pai?.whatsapp && `/ ${formData.pai?.whatsapp}`}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">3. Sacramentos</h3>
              <div className="grid grid-cols-1 gap-y-1 text-[9px]">
                <div className="flex flex-col gap-0.5">
                  <p><strong>Batizado(a):</strong> {formData.batizado ? 'Sim' : 'Não'} {formData.batizado && ` - Paróquia: ${formData.batismoParoquia} / ${formData.batismoUF}`}</p>
                  {formData.batizado && (
                    <p className="pl-2"><strong>Comunidade:</strong> {formData.batismoComunidade || '---'} | <strong>Local/Cidade:</strong> {formData.batismoLocal || '---'} | <strong>Celebrante:</strong> {formData.batismoCelebrante || '---'}</p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p><strong>1ª Eucaristia:</strong> {formData.fezPrimeiraEucaristia ? 'Sim' : 'Não'} {formData.fezPrimeiraEucaristia && ` - Paróquia: ${formData.eucaristiaParoquia} / ${formData.eucaristiaUF}`}</p>
                  {formData.fezPrimeiraEucaristia && (
                    <p className="pl-2"><strong>Comunidade:</strong> {formData.eucaristiaComunidade || '---'} | <strong>Local/Cidade:</strong> {formData.eucaristiaLocal || '---'} | <strong>Catequistas:</strong> {formData.eucaristiaCatequistas || '---'}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">4. Crisma</h3>
              <div className="grid grid-cols-2 gap-x-4 text-[9px]">
                <p><strong>Turma:</strong> {formData.turma || '___'}</p>
                <p><strong>Catequista:</strong> {displayCatequistas}</p>
                <p className="col-span-2"><strong>Padrinho/Madrinha:</strong> {formData.padrinhoCrisma?.nome || '____________________'}</p>
              </div>
            </section>

            {/* TERMO DE COMPROMISSO (APENAS IMPRESSÃO) */}
            <section className="mt-4 pt-3 border-t border-slate-200">
               <h3 className="text-[9px] font-black uppercase mb-1.5 tracking-widest text-center">Termo de compromisso e Responsabilidade</h3>
               <p className="text-[8px] leading-relaxed text-justify italic text-slate-700">
                 "Catequese é processo permanente de educação na fé". Ao inscrever seu(sua) filho(a) na catequese, você está se comprometendo a fazer parte deste processo, ou seja, ter um compromisso de participar com seu(sua) filho(a) das atividades da Paróquia (Missa das crianças e reuniões). É responsabilidade sua a educação religiosa de seu (sua) filho(a) pois, não se deve esquecer que 'os pais são os primeiros catequistas dos filhos'. Sem o seu compromisso e apoio, o trabalho catequético será em vão.
               </p>
               <div className="mt-4 text-right">
                 <p className="text-[8px] font-bold">{config.city}-{config.state}, _____ /_____/_________</p>
               </div>
            </section>

            <div className="mt-8 grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t border-slate-900 pt-1 text-[8px] font-bold uppercase">Assinatura do Responsável</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-900 pt-1 text-[8px] font-bold uppercase">Assinatura Catequista</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERFACE DO USUÁRIO */}
      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden no-print animate-in fade-in duration-500">
        <div className="bg-slate-900 p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <UserPlus className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Cadastro de Catequizando</h2>
              <p className="text-slate-400 text-xs">{formData.matricula ? `Matrícula: ${formData.matricula}` : 'Nova Inscrição'}</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto pr-8">
            <button type="button" onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 transition-all shadow-lg">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button type="button" onClick={handleFinalSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10">
              <Save className="w-4 h-4" /> Salvar Tudo
            </button>
          </div>

          {onCancel && (
            <button 
              onClick={onCancel}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="bg-slate-50 border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold text-[10px] md:text-xs transition-all border-b-2 whitespace-nowrap uppercase tracking-widest ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'crismando' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              {/* Form content omitted for brevity, same as original */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group w-40 h-48 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : formData.foto ? (
                      <img src={formData.foto} className="w-full h-full object-cover" alt="Foto" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button onClick={startCamera} className="p-2 bg-white rounded-full"><Camera size={16} /></button>
                      <label className="p-2 bg-white rounded-full cursor-pointer"><Upload size={16} /><input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} /></label>
                    </div>
                    {isCameraActive && (
                      <button onClick={capturePhoto} className="absolute bottom-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Capturar</button>
                    )}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-10">
                    <label className="label-style">Nome Completo</label>
                    <input type="text" value={formData.nomeCompleto} onChange={e => setFormData({...formData, nomeCompleto: e.target.value})} className="input-style" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="label-style">Sexo</label>
                    <select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value as any})} className="input-style">
                      <option value="F">Feminino</option>
                      <option value="M">Masculino</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="label-style">RG / CPF</label>
                    <input type="text" value={formData.rgCpf} onChange={e => setFormData({...formData, rgCpf: e.target.value})} className="input-style" placeholder="000.000.000-00" />
                  </div>

                  <div className="md:col-span-3">
                    <label className="label-style">Nascimento</label>
                    <input type="date" value={formData.dataNascimento} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} className="input-style" />
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

                  <div className="md:col-span-3">
                    <label className="label-style">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-style font-bold">
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Concluido">Crismado</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-4">
                    <label className="label-style">Moro com:</label>
                    <select value={formData.moroCom} onChange={e => handleMoroComChange(e.target.value)} className="input-style">
                      <option value="Meus Pais">Meus Pais</option>
                      <option value="Minha Mãe">Minha Mãe</option>
                      <option value="Meu Pai">Meu Pai</option>
                      <option value="Meus Avós">Meus Avós</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="md:col-span-6">
                    <label className="label-style">Naturalidade</label>
                    <input type="text" value={formData.naturalidade} onChange={e => setFormData({...formData, naturalidade: e.target.value})} className="input-style" placeholder="Cidade natal" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-style">UF Nasc.</label>
                    <input type="text" maxLength={2} value={formData.ufNaturalidade} onChange={e => setFormData({...formData, ufNaturalidade: e.target.value.toUpperCase()})} className="input-style" placeholder="EX: BA" />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="label-style">Telefone</label>
                    <input type="tel" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="input-style" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label-style">WhatsApp</label>
                    <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="input-style" placeholder="(00) 90000-0000" />
                  </div>
                  <div className="md:col-span-6">
                    <label className="label-style">E-mail</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-style" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-slate-100">
                <div className="md:col-span-3">
                  <label className="label-style">CEP</label>
                  <input type="text" value={formData.cep} onChange={e => handleCatequizandoAddressChange('cep', e.target.value)} className="input-style" />
                </div>
                <div className="md:col-span-8">
                  <label className="label-style">Endereço</label>
                  <input type="text" value={formData.endereco} onChange={e => handleCatequizandoAddressChange('endereco', e.target.value)} className="input-style" />
                </div>
                <div className="md:col-span-1">
                  <label className="label-style">Número</label>
                  <input type="text" value={formData.numero} onChange={e => handleCatequizandoAddressChange('numero', e.target.value)} className="input-style text-center px-1" />
                </div>
                <div className="md:col-span-5">
                  <label className="label-style">Bairro</label>
                  <input type="text" value={formData.bairro} onChange={e => handleCatequizandoAddressChange('bairro', e.target.value)} className="input-style" />
                </div>
                <div className="md:col-span-6">
                  <label className="label-style">Cidade</label>
                  <input type="text" value={formData.cidade} onChange={e => handleCatequizandoAddressChange('cidade', e.target.value)} className="input-style" />
                </div>
                <div className="md:col-span-1">
                  <label className="label-style">UF</label>
                  <input type="text" maxLength={2} value={formData.ufEndereco} onChange={e => handleCatequizandoAddressChange('ufEndereco', e.target.value.toUpperCase())} className="input-style text-center px-1" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                   <div className="bg-blue-600 p-2 rounded-lg text-white">
                      <Waves size={20} />
                   </div>
                   <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={formData.batizado} 
                        onChange={e => setFormData({...formData, batizado: e.target.checked})} 
                        className="w-5 h-5 rounded cursor-pointer accent-blue-600" 
                        id="chkBatizado" 
                      />
                      <label htmlFor="chkBatizado" className="font-bold text-slate-700 cursor-pointer text-sm">É Batizado(a)?</label>
                   </div>
                </div>

                {formData.batizado && (
                  <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100 grid grid-cols-1 md:grid-cols-12 gap-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="md:col-span-4">
                      <label className="label-style">Data do Batismo</label>
                      <input type="date" value={formData.batismoData} onChange={e => setFormData({...formData, batismoData: e.target.value})} className="input-style" />
                    </div>
                    <div className="md:col-span-8">
                      <label className="label-style">Celebrante</label>
                      <input type="text" value={formData.batismoCelebrante} onChange={e => setFormData({...formData, batismoCelebrante: e.target.value})} className="input-style" placeholder="Nome do Padre ou Diácono" />
                    </div>
                    <div className="md:col-span-6">
                      <label className="label-style">Comunidade</label>
                      <input type="text" value={formData.batismoComunidade || ''} onChange={e => setFormData({...formData, batismoComunidade: e.target.value})} className="input-style" placeholder="Ex: Matriz, Santa Rita..." />
                    </div>
                    <div className="md:col-span-6">
                      <label className="label-style">Local / Cidade</label>
                      <input type="text" value={formData.batismoLocal || ''} onChange={e => setFormData({...formData, batismoLocal: e.target.value})} className="input-style" placeholder="Ex: Itamaraju, Prado..." />
                    </div>
                    <div className="md:col-span-6">
                      <label className="label-style">Paróquia</label>
                      <input type="text" value={formData.batismoParoquia} onChange={e => setFormData({...formData, batismoParoquia: e.target.value})} className="input-style" />
                    </div>
                    <div className="md:col-span-5">
                      <label className="label-style">Diocese</label>
                      <input type="text" value={formData.batismoDiocese} onChange={e => setFormData({...formData, batismoDiocese: e.target.value})} className="input-style" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="label-style">UF</label>
                      <input type="text" maxLength={2} value={formData.batismoUF} onChange={e => setFormData({...formData, batismoUF: e.target.value.toUpperCase()})} className="input-style text-center px-1" />
                    </div>
                  </div>
                )}

                <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                   <label className="label-style">Observacoes Adicionais</label>
                   <textarea 
                     value={formData.observacoes} 
                     onChange={e => setFormData({...formData, observacoes: e.target.value})} 
                     className="input-style h-32 resize-none" 
                     placeholder="Histórico pastoral ou avisos importantes..."
                   ></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pais' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              {renderPersonFields('mae', 'Dados da Mãe', 'text-pink-700', 'bg-pink-50/20')}
              {renderPersonFields('pai', 'Dados do Pai', 'text-blue-700', 'bg-blue-50/20')}
            </div>
          )}

          {activeTab === 'padrinhos_batismo' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              {renderPersonFields('madrinhaBatismo', 'Dados da Madrinha de Batismo', 'text-pink-700', 'bg-pink-50/20')}
              {renderPersonFields('padrinhoBatismo', 'Dados do Padrinho de Batismo', 'text-blue-700', 'bg-blue-50/20')}
            </div>
          )}

          {activeTab === 'eucaristia' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100">
                 <div className="flex items-center gap-3 mb-6">
                    <input 
                      type="checkbox" 
                      checked={formData.fezPrimeiraEucaristia} 
                      onChange={e => setFormData({...formData, fezPrimeiraEucaristia: e.target.checked})} 
                      className="w-5 h-5 rounded cursor-pointer accent-amber-600" 
                      id="checkEuc" 
                    />
                    <label htmlFor="checkEuc" className="font-bold text-slate-700 cursor-pointer">Já recebeu a 1ª Eucaristia?</label>
                 </div>
                 {formData.fezPrimeiraEucaristia && (
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                     <div className="md:col-span-4">
                        <label className="label-style">Data da 1ª Eucaristia</label>
                        <input type="date" value={formData.eucaristiaData} onChange={e => setFormData({...formData, eucaristiaData: e.target.value})} className="input-style" />
                     </div>
                     <div className="md:col-span-8">
                        <label className="label-style">Celebrante</label>
                        <input type="text" value={formData.eucaristiaCelebrante} onChange={e => setFormData({...formData, eucaristiaCelebrante: e.target.value})} className="input-style" placeholder="Nome do Padre ou Bispo" />
                     </div>

                     <div className="md:col-span-6">
                        <label className="label-style">Comunidade</label>
                        <input type="text" value={formData.eucaristiaComunidade || ''} onChange={e => setFormData({...formData, eucaristiaComunidade: e.target.value})} className="input-style" placeholder="Ex: Comunidade Matriz, Santa Luzia..." />
                     </div>
                     <div className="md:col-span-6">
                        <label className="label-style">Local/Cidade</label>
                        <input type="text" value={formData.eucaristiaLocal || ''} onChange={e => setFormData({...formData, eucaristiaLocal: e.target.value})} className="input-style" placeholder="Ex: Salão Paroquial, Capela..." />
                     </div>

                     <div className="md:col-span-6">
                        <label className="label-style">Paróquia</label>
                        <input type="text" value={formData.eucaristiaParoquia} onChange={e => setFormData({...formData, eucaristiaParoquia: e.target.value})} className="input-style" />
                     </div>
                     <div className="md:col-span-5">
                        <label className="label-style">Diocese</label>
                        <input type="text" value={formData.eucaristiaDiocese} onChange={e => setFormData({...formData, eucaristiaDiocese: e.target.value})} className="input-style" />
                     </div>
                     <div className="md:col-span-1">
                        <label className="label-style text-center">UF</label>
                        <input type="text" maxLength={2} value={formData.eucaristiaUF} onChange={e => setFormData({...formData, eucaristiaUF: e.target.value.toUpperCase()})} className="input-style text-center px-1" placeholder="BA" />
                     </div>

                     <div className="md:col-span-12">
                        <label className="label-style">Catequistas da Época</label>
                        <input type="text" value={formData.eucaristiaCatequistas || ''} onChange={e => setFormData({...formData, eucaristiaCatequistas: e.target.value})} className="input-style" placeholder="Nomes dos catequistas que prepararam..." />
                     </div>
                   </div>
                 )}
               </div>
             </div>
          )}

          {activeTab === 'celebracao' && (
             <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                    <ClipboardList size={18} className="text-blue-600" /> PREPARAÇÃO
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-style">Início da Preparação</label>
                      <input type="date" value={formData.inicioPreparacao || ''} onChange={e => setFormData({...formData, inicioPreparacao: e.target.value})} className="input-style" />
                    </div>
                    <div>
                      <label className="label-style">Fim da Preparação</label>
                      <input type="date" value={formData.fimPreparacao || ''} onChange={e => setFormData({...formData, fimPreparacao: e.target.value})} className="input-style" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className="label-style">Comunidade</label>
                      <input type="text" value={formData.comunidade || ''} onChange={e => setFormData({...formData, comunidade: e.target.value})} className="input-style" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="label-style">Turma</label>
                      <select 
                        value={formData.turma || ''} 
                        onChange={e => setFormData({...formData, turma: e.target.value})} 
                        className="input-style font-bold"
                      >
                        <option value="">Selecione uma turma</option>
                        {allClasses?.map(c => (
                          <option key={c.id} value={c.nome}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label-style">Catequistas</label>
                    <input type="text" value={formData.catequistas || ''} onChange={e => setFormData({...formData, catequistas: e.target.value})} className="input-style" placeholder="Nomes dos catequistas responsáveis" />
                  </div>
                </div>

                {renderPersonFields('padrinhoCrisma', 'Padrinho / Madrinha de Crisma', 'text-slate-700', 'bg-slate-50')}

                <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-black text-indigo-800 uppercase flex items-center gap-2">
                    <Award size={18} className="text-indigo-600" /> CELEBRAÇÃO DA CRISMA
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="label-style text-indigo-700">Data da Celebração</label>
                      <input type="date" value={formData.dataCelebracao || ''} onChange={e => setFormData({...formData, dataCelebracao: e.target.value})} className="input-style border-indigo-100 bg-white" />
                    </div>
                    <div className="md:col-span-8">
                      <label className="label-style text-indigo-700">Celebrante (Bispo ou Delegado)</label>
                      <input type="text" value={formData.celebrante || ''} onChange={e => setFormData({...formData, celebrante: e.target.value})} className="input-style border-indigo-100 bg-white" placeholder="Ex: Dom Jailton de Oliveira Lino" />
                    </div>
                    <div className="md:col-span-12">
                      <label className="label-style text-indigo-700">Local / Comunidade da Celebração</label>
                      <input type="text" value={formData.localCelebracao || ''} onChange={e => setFormData({...formData, localCelebracao: e.target.value})} className="input-style border-indigo-100 bg-white" placeholder={config.parishName} />
                    </div>
                    
                    <div className="md:col-span-4">
                      <label className="label-style text-indigo-700">Livro</label>
                      <input type="text" value={formData.livro || ''} onChange={e => setFormData({...formData, livro: e.target.value})} className="input-style border-indigo-100 bg-white text-center font-bold" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="label-style text-indigo-700">Folha</label>
                      <input type="text" value={formData.folha || ''} onChange={e => setFormData({...formData, folha: e.target.value})} className="input-style border-indigo-100 bg-white text-center font-bold" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="label-style text-indigo-700">Número / Termo</label>
                      <input type="text" value={formData.numeroRegistro || ''} onChange={e => setFormData({...formData, numeroRegistro: e.target.value})} className="input-style border-indigo-100 bg-white text-center font-bold" />
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
           <button type="button" onClick={() => activeTab !== 'crismando' && setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) - 1].id)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-white transition-all disabled:opacity-30" disabled={activeTab === 'crismando'}>
             <ArrowLeft size={16} /> Anterior
           </button>
           <button type="button" onClick={() => activeTab !== 'celebracao' ? setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) + 1].id) : handleFinalSave()} className="flex items-center gap-2 px-6 py-2 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest">
             {activeTab === 'celebracao' ? 'Finalizar Cadastro' : 'Próxima Etapa'} <ArrowRight size={16} />
           </button>
        </div>

        <style>{`
          .input-style { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 2px solid #f1f5f9; background-color: #f8fafc; outline: none; transition: all 0.3s; font-size: 0.9rem; }
          .input-style:focus { border-color: #3b82f6; background-color: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
          .label-style { display: block; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
        `}</style>
      </div>
    </div>
  );
};
