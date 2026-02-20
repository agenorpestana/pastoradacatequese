
import React, { useEffect, useState } from 'react';
import { 
  X, Printer, Sparkles, Loader2, Quote, User, Phone, 
  MapPin, Church, Users, Wine, BookOpen, Fingerprint, 
  CheckCircle, XCircle, BarChart, Calendar, BookOpenText,
  Award, FileBadge, Waves
} from 'lucide-react';
import { Student, AttendanceSession, Turma, ParishConfig } from '../types';
import { generateSpiritualGoal } from '../services/geminiService';

interface StudentDetailsModalProps {
  student: Student;
  attendanceSessions: AttendanceSession[];
  classes: Turma[];
  onClose: () => void;
  onGenerateCertificate?: (student: Student) => void;
  config: ParishConfig;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ 
  student, 
  attendanceSessions, 
  classes,
  onClose,
  onGenerateCertificate,
  config
}) => {
  const [goal, setGoal] = useState<string | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(false);

  const currentClass = classes.find(c => c.nome === student.turma);
  const displayCatequistas = currentClass?.catequista || student.catequistas || '_______________________';

  const studentSessions = (attendanceSessions || [])
    .filter(session => session.entries.some(e => e.studentId === student.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSessions = studentSessions.length;
  const presentSessions = studentSessions.filter(s => 
    s.entries.find(e => e.studentId === student.id)?.status === 'present'
  ).length;
  const absentSessions = totalSessions - presentSessions;
  
  const presenceRate = totalSessions > 0 ? ((presentSessions / totalSessions) * 100).toFixed(0) : '0';
  const absenceRate = totalSessions > 0 ? ((absentSessions / totalSessions) * 100).toFixed(0) : '0';

  useEffect(() => {
    const fetchGoal = async () => {
      setGoal(null);
      setLoadingGoal(true);
      const result = await generateSpiritualGoal(student);
      setGoal(result);
      setLoadingGoal(false);
    };
    fetchGoal();
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      
      {/* FICHA DE IMPRESSÃO OFICIAL (VISÍVEL APENAS NO PRINT) */}
      <div className="print-only p-4 bg-white min-h-screen text-slate-900 absolute inset-0 z-[100]">
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
              <p className="text-sm font-black">{student.matricula || '________'}</p>
              <p className="text-[8px] uppercase font-bold text-slate-400 mt-0.5">Data: {new Date(student.dataCadastro || '').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <section className="relative">
              {student.foto && (
                <div className="absolute top-0 right-0 w-20 h-24 border border-slate-900 overflow-hidden bg-white">
                  <img src={student.foto} className="w-full h-full object-cover" alt="Foto" />
                </div>
              )}
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">1. Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] pr-24">
                <p className="col-span-2"><strong>Nome:</strong> {student.nomeCompleto}</p>
                <p><strong>RG/CPF:</strong> {student.rgCpf || '___________'}</p>
                <p><strong>Nascimento:</strong> {student.dataNascimento ? new Date(student.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '___/___/___'}</p>
                <p><strong>Naturalidade:</strong> {student.naturalidade} - {student.ufNaturalidade}</p>
                <p><strong>Telefone/Zap:</strong> {student.telefone} {student.whatsapp && `/ ${student.whatsapp}`}</p>
                <p><strong>E-mail:</strong> {student.email}</p>
                <p className="col-span-2"><strong>Endereço:</strong> {student.endereco}, {student.numero} - {student.bairro}, {student.cidade}/{student.ufEndereco}</p>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">2. Filiação</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                <div className="border-r border-slate-200 pr-2">
                  <p className="font-bold underline uppercase text-[7px]">Mãe</p>
                  <p><strong>Nome:</strong> {student.mae?.nome}</p>
                  <p><strong>Telefone/Zap:</strong> {student.telefone} {student.whatsapp && `/ ${student.whatsapp}`}</p>
                </div>
                <div>
                  <p className="font-bold underline uppercase text-[7px]">Pai</p>
                  <p><strong>Nome:</strong> {student.pai?.nome}</p>
                  <p><strong>Telefone/Zap:</strong> {student.telefone} {student.whatsapp && `/ ${student.whatsapp}`}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">3. Sacramentos</h3>
              <div className="grid grid-cols-1 gap-y-1 text-[9px]">
                <div className="flex flex-col gap-0.5">
                  <p><strong>Batizado(a):</strong> {student.batizado ? 'Sim' : 'Não'} {student.batizado && ` - Paróquia: ${student.batismoParoquia} / ${student.batismoUF}`}</p>
                  {student.batizado && (
                    <p className="pl-2"><strong>Comunidade:</strong> {student.batismoComunidade || '---'} | <strong>Local/Cidade:</strong> {student.batismoLocal || '---'} | <strong>Celebrante:</strong> {student.batismoCelebrante || '---'}</p>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p><strong>1ª Eucaristia:</strong> {student.fezPrimeiraEucaristia ? 'Sim' : 'Não'} {student.fezPrimeiraEucaristia && ` - Paróquia: ${student.eucaristiaParoquia} / ${student.eucaristiaUF}`}</p>
                  {student.fezPrimeiraEucaristia && (
                    <p className="pl-2"><strong>Comunidade:</strong> {student.eucaristiaComunidade || '---'} | <strong>Local/Cidade:</strong> {student.eucaristiaLocal || '---'} | <strong>Catequistas:</strong> {student.eucaristiaCatequistas || '---'}</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase border-l-4 border-slate-900 mb-1.5 tracking-widest">4. Crisma</h3>
              <div className="grid grid-cols-2 gap-x-4 text-[9px]">
                <p><strong>Turma:</strong> {student.turma || '___'}</p>
                <p><strong>Catequista:</strong> {displayCatequistas}</p>
                <p className="col-span-2"><strong>Padrinho/Madrinha:</strong> {student.padrinhoCrisma?.nome || '____________________'}</p>
              </div>
            </section>

            {/* TERMO DE COMPROMISSO (APENAS IMPRESSÃO) */}
            <section className="mt-4 pt-3 border-t border-slate-200">
               <h3 className="text-[9px] font-black uppercase mb-1.5 tracking-widest text-center">Termo de compromisso e Responsabilidade</h3>
               <p className="text-[8px] leading-relaxed text-justify italic text-slate-700">
                 "Catequese é processo permanente de educação na fé". Ao inscrever seu(sua) filho(a) na catequese, você está se comprometendo a fazer parte deste processo, ou seja, ter um compromisso de participar com seu(sua) filho(a) das atividades da Paróquia (Missa das crianças e reuniões). É responsabilidade sua a educação religiosa de seu (sua) filho(a) pois, não se deve esquecer que 'os pais são os primeiros catequistas dos filhos'. Sem o seu compromisso e apoio, o trabalho catequético será em vão.
               </p>
               <div className="mt-8 text-right">
                 <p className="text-[8px] font-bold">{config.city}-{config.state}, _____ /_____/_________</p>
               </div>
            </section>

            <div className="mt-12 grid grid-cols-2 gap-12">
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
      {/* Rest of the component modal UI ... */}
      <div className="no-print bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="relative h-32 md:h-40 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-10 left-6 md:left-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1 border-4 border-white shadow-2xl flex items-center justify-center text-blue-600 font-black text-4xl md:text-5xl uppercase overflow-hidden">
              {student.foto ? <img src={student.foto} className="w-full h-full object-cover" alt="" /> : (student.nomeCompleto || '?').charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-12 px-6 md:px-10 pb-10 space-y-8 overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{student.nomeCompleto}</h2>
              <div className="flex gap-2 mt-2">
                <span className="px-4 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase">{student.turma || 'Sem Turma'}</span>
                <span className="px-4 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">{student.sexo === 'M' ? 'Masc' : 'Fem'}</span>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-lg">
                <Printer size={16} /> Imprimir Ficha Oficial
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-7 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nascimento</p>
                  <p className="font-bold text-slate-800 text-xs">{student.dataNascimento ? new Date(student.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contatos</p>
                  <p className="font-bold text-slate-800 text-[10px]">Tel: {student.telefone || '---'}</p>
                  <p className="font-bold text-slate-800 text-[10px]">Zap: {student.whatsapp || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batizado</p>
                  <p className="font-bold text-slate-800 text-xs">{student.batizado ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                   <BarChart size={16} className="text-blue-600" /> Histórico de Presença
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                    <p className="text-[9px] font-black text-green-600 uppercase mb-1">Presença</p>
                    <p className="text-2xl font-black text-green-700">{presenceRate}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                    <p className="text-[9px] font-black text-red-600 uppercase mb-1">Faltas</p>
                    <p className="text-2xl font-black text-red-700">{absenceRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-6">
              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Sparkles size={14} /> Mensagem da Pastoral (IA)
                 </h4>
                 {loadingGoal ? (
                    <div className="flex items-center gap-2 text-blue-400 font-bold justify-center py-6 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Gerando acolhida...
                    </div>
                 ) : (
                    <p className="text-slate-700 text-sm leading-relaxed italic">"{goal || 'Que Deus ilumine sua caminhada de fé!'}"</p>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
