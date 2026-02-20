
import React, { useState, useEffect } from 'react';
import { 
  Award, Printer, Search, GraduationCap, Church, Star, 
  ShieldCheck, FileCheck, User, Users, Calendar, 
  MapPin, Wine, Cross, Check, Square, CheckSquare,
  FileBadge, Loader2, Sparkles, Plus
} from 'lucide-react';
import { Student, ParishConfig } from '../types';

interface CertificateGeneratorProps {
  students: Student[];
  config: ParishConfig;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ students, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printQueue, setPrintQueue] = useState<Student[]>([]);

  const crismados = (students || []).filter(s => 
    s.status === 'Concluido' && 
    (s.nomeCompleto || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === crismados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(crismados.map(s => s.id));
    }
  };

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    
    const studentsToPrint = crismados.filter(s => selectedIds.includes(s.id));
    setPrintQueue(studentsToPrint);
    setIsGenerating(true);

    setTimeout(() => {
      window.print();
      setIsGenerating(false);
      setPrintQueue([]);
    }, 800);
  };

  const handlePrintSingle = (student: Student) => {
    setPrintQueue([student]);
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
      setPrintQueue([]);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SEÇÃO DE IMPRESSÃO - MODELO SOLENE DE CERTIFICADO */}
      <div className="print-only fixed inset-0 bg-white z-[100] p-0 font-serif">
        {printQueue.map((student, index) => (
          <div key={student.id} className={`certificate-page ${index > 0 ? 'page-break' : ''}`}>
            <div className="m-4 border-[12px] border-double border-slate-900 h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] p-12 flex flex-col items-center justify-between relative bg-white overflow-hidden">
              
              <div className="absolute top-6 left-6 w-24 h-24 border-t-4 border-l-4 border-slate-900/20"></div>
              <div className="absolute top-6 right-6 w-24 h-24 border-t-4 border-r-4 border-slate-900/20"></div>
              <div className="absolute bottom-6 left-6 w-24 h-24 border-b-4 border-l-4 border-slate-900/20"></div>
              <div className="absolute bottom-6 right-6 w-24 h-24 border-b-4 border-r-4 border-slate-900/20"></div>

              <div className="flex flex-col items-center gap-2">
                {config.logo ? <img src={config.logo} className="w-32 h-32 object-contain" /> : <Church className="w-20 h-20 text-slate-900" />}
                <div className="h-px w-48 bg-slate-300"></div>
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-xl font-bold uppercase tracking-[0.3em] text-slate-800">{config.dioceseName}</h1>
                <h2 className="text-2xl font-black text-slate-900 uppercase font-serif">{config.parishName} - {config.city}-{config.state}</h2>
                <p className="text-xs font-bold text-slate-500 italic mt-2">"Recebei, por este sinal, o Espírito Santo, o Dom de Deus"</p>
              </div>

              <div className="py-8 text-center">
                <h3 className="text-6xl font-black text-slate-900 tracking-tight mb-2">Lembrança da Crisma</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-0.5 w-16 bg-slate-900"></div>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Certificado de Confirmação</span>
                  <div className="h-0.5 w-16 bg-slate-900"></div>
                </div>
              </div>

              <div className="w-full max-w-5xl text-center space-y-10 px-10">
                <div className="space-y-4">
                  <p className="text-2xl leading-relaxed text-slate-700">
                    Certificamos para os devidos fins que o(a) cristão(ã)
                  </p>
                  <h4 className="text-6xl font-black text-slate-950 uppercase py-4 border-b-2 border-slate-200">
                    {student.nomeCompleto}
                  </h4>
                </div>

                <div className="text-xl leading-loose text-slate-800">
                  tendo feito a sua preparação catequética, recebeu o <strong>Sacramento da Confirmação (Crisma)</strong>, 
                  pela imposition das mãos e unção do Crisma, no dia <strong>{student.dataCelebracao ? new Date(student.dataCelebracao + 'T00:00:00').toLocaleDateString('pt-BR') : '___/___/___'}</strong>, 
                  nesta Igreja Paroquial, tendo como celebrante o <strong>{student.celebrante || 'Exmo. e Revmo. Bispo Diocesano'}</strong>.
                </div>

                <div className="flex justify-center gap-12 text-xl font-bold text-slate-900 pt-4">
                  <p>Padrinho / Madrinha: <span className="underline decoration-slate-300 underline-offset-8">{student.padrinhoCrisma?.nome || '__________________________________'}</span></p>
                </div>
              </div>

              <div className="w-full flex flex-col items-center gap-10 pb-6">
                <div className="border border-slate-200 bg-slate-50/50 px-10 py-4 rounded-2xl flex gap-8">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Registrado no Livro: <span className="text-slate-900">{student.livro || '___'}</span></p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Folha: <span className="text-slate-900">{student.folha || '___'}</span></p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Termo: <span className="text-slate-900">{student.numeroRegistro || '___'}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-32 w-full max-w-4xl px-20 pt-10">
                  <div className="text-center">
                    <div className="border-t border-slate-900 pt-3">
                      <p className="text-sm font-bold uppercase tracking-tight text-slate-900">Pároco ou Celebrante</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">Assinatura</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-900 pt-3">
                      <p className="text-sm font-bold uppercase tracking-tight text-slate-900">Secretaria Paroquial</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase">Selo e Carimbo</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.4em]">
                    {config.city}-{config.state}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 w-full max-w-2xl mx-auto">
                    <p className="text-[8px] font-bold uppercase text-slate-400">
                      {config.address} - {config.city}/{config.state}
                    </p>
                    <div className="flex justify-center gap-4 mt-1 text-[8px] font-bold uppercase text-slate-400">
                      {config.phone && <span>Tel: {config.phone}</span>}
                      {config.whatsapp && <span>Zap: {config.whatsapp}</span>}
                      {config.email && <span>Email: {config.email}</span>}
                    </div>
                    <div className="flex justify-center gap-4 mt-0.5 text-[8px] font-bold uppercase text-slate-300">
                      {config.instagram && <span>Insta: {config.instagram}</span>}
                      {config.facebook && <span>Face: {config.facebook}</span>}
                      {config.website && <span>Site: {config.website}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Rest of the component selection UI remains ... */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6 no-print animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100">
            <Award className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Geração de Certificados</h2>
            <p className="text-slate-500 text-sm">Emissão solene para os catequizandos crismados.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
            />
          </div>
          
          <button 
            disabled={selectedIds.length === 0 || isGenerating}
            onClick={handlePrintSelected}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
              selectedIds.length > 0 
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            Gerar {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      <div className="no-print bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div className="flex items-center gap-4">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors"
              >
                {selectedIds.length === crismados.length && crismados.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                {selectedIds.length === crismados.length && crismados.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              <span className="text-[10px] font-black text-slate-300 uppercase">|</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Crismados Encontrados: <span className="text-slate-900">{crismados.length}</span>
              </p>
           </div>
           {selectedIds.length > 0 && (
             <div className="animate-in slide-in-from-right-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {selectedIds.length} selecionado(s)
                </p>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 divide-x divide-y divide-slate-100">
          {crismados.length > 0 ? (
            crismados.map(student => {
              const isSelected = selectedIds.includes(student.id);
              return (
                <div 
                  key={student.id} 
                  className={`p-6 transition-all group flex flex-col h-full ${
                    isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border transition-all ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-400 border-slate-100'
                        }`}>
                          {student.foto ? (
                            <img src={student.foto} className="w-full h-full object-cover rounded-2xl" alt="" />
                          ) : (
                            (student.nomeCompleto || '?').charAt(0)
                          )}
                        </div>
                        <button 
                          onClick={() => toggleSelect(student.id)}
                          className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 border-white text-white scale-110 shadow-lg' : 'bg-white border-slate-200 text-slate-200 hover:border-blue-400 hover:text-blue-400'
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate">{student.nomeCompleto}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Turma: {student.turma || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3 pt-4 border-t border-slate-100/50">
                     <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-400 font-bold uppercase tracking-tighter">Data Crisma:</span>
                       <span className="text-slate-700 font-black">{student.dataCelebracao ? new Date(student.dataCelebracao + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/D'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-400 font-bold uppercase tracking-tighter">Livro / Folha:</span>
                       <span className="text-slate-700 font-black">{student.livro || '---'} / {student.folha || '---'}</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => handlePrintSingle(student)}
                    className="w-full mt-6 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group/btn"
                  >
                    <FileBadge className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 
                    <span className="text-[10px] uppercase tracking-widest font-black">Emissão Individual</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum Crismado</h3>
              <p className="text-slate-400 font-medium italic text-sm max-w-xs mx-auto">
                Para emitir certificados, altere o status do catequizando para <span className="text-indigo-600 font-black">"Crismado"</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
