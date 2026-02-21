
import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, BookOpenText, Users, Clock, CheckCircle2, XCircle, FileSpreadsheet, Printer, Church } from 'lucide-react';
import { Turma, AttendanceSession, Student, ParishConfig } from '../types';

interface ClassHistoryModalProps {
  turma: Turma;
  sessions: AttendanceSession[];
  members: Student[];
  onClose: () => void;
  config: ParishConfig;
}

export const ClassHistoryModal: React.FC<ClassHistoryModalProps> = ({ turma, sessions, members, onClose, config }) => {
  const sortedSessions = [...sessions]
    .filter(s => s.turmaId === turma.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ordenar membros alfabeticamente para a planilha
  const sortedMembers = [...members].sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      
      {/* PRINT ONLY SECTION - CONSOLIDADO DO DIÁRIO */}
      {createPortal(
        <div className="print-only p-8 w-full bg-white text-slate-900 font-sans absolute inset-0 z-[100]">
          <style>{`
              @media print {
                @page { size: landscape; margin: 10mm; }
                body { -webkit-print-color-adjust: exact; }
                body > *:not(.print-only) { display: none !important; }
                .print-only { display: block !important; }
              }
          `}</style>

        {(() => {
          // Logic for Consolidated Diary
          const sessionsByMonth = sortedSessions.reduce((acc, session) => {
            // session.date is YYYY-MM-DD
            const parts = session.date.split('-');
            let month = 0;
            if (parts.length >= 3) {
               month = parseInt(parts[1]) - 1;
            } else {
               month = new Date(session.date).getMonth();
            }
            
            if (!acc[month]) acc[month] = [];
            acc[month].push(session);
            return acc;
          }, {} as Record<number, AttendanceSession[]>);

          // Sort sessions within each month by date ascending
          Object.keys(sessionsByMonth).forEach(key => {
            const monthKey = Number(key);
            sessionsByMonth[monthKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          });

          const months = Object.keys(sessionsByMonth).map(Number).sort((a, b) => a - b);

          const monthNames = [
            'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
          ];

          return (
            <>
              {/* Header */}
              <div className="mb-6 border-b-4 border-slate-900 pb-2">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">LISTA DE CHAMADA</h1>
                    <p className="text-sm font-bold text-slate-600 uppercase mt-1">Turma: {turma.nome}</p>
                    <p className="text-xs text-slate-500 uppercase mt-0.5">
                      Catequista: {turma.catequista} | Horário: {turma.horario}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black uppercase tracking-tight">ANO: {turma.ano}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              {/* Matrix Table */}
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  {/* Month Row */}
                  <tr>
                    <th className="border border-black p-2 w-10 text-center bg-slate-50 font-black" rowSpan={2}>Nº</th>
                    <th className="border border-black p-2 text-left bg-slate-50 min-w-[250px] font-black" rowSpan={2}>CATEQUIZANDO</th>
                    {months.map(month => (
                      <th 
                        key={month} 
                        colSpan={sessionsByMonth[month].length} 
                        className="border border-black p-1 text-center bg-slate-100 font-black uppercase"
                      >
                        {monthNames[month]}
                      </th>
                    ))}
                  </tr>
                  {/* Day Row */}
                  <tr>
                    {months.map(month => (
                      sessionsByMonth[month].map(session => {
                        let day = '00';
                        const parts = session.date.split('-');
                        if (parts.length >= 3) {
                            day = parts[2].substring(0, 2);
                        } else {
                            day = new Date(session.date).getDate().toString().padStart(2, '0');
                        }
                        return (
                          <th key={session.id} className="border border-black p-1 text-center w-8 font-bold bg-white">
                            {day}
                          </th>
                        );
                      })
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((student, index) => (
                    <tr key={student.id}>
                      <td className="border border-black p-1 text-center font-bold">{index + 1}</td>
                      <td className="border border-black p-1 font-medium truncate max-w-[250px] uppercase">{student.nomeCompleto}</td>
                      {months.map(month => (
                        sessionsByMonth[month].map(session => {
                          const entry = session.entries.find(e => e.studentId === student.id);
                          const isPresent = entry?.status === 'present';
                          const isAbsent = entry?.status === 'absent';
                          
                          return (
                            <td key={`${student.id}-${session.id}`} className="border border-black p-1 text-center font-bold">
                              {isPresent && <span className="text-green-600">V</span>}
                              {isAbsent && <span className="text-red-600">X</span>}
                              {!entry && <span className="text-slate-300">-</span>}
                            </td>
                          );
                        })
                      ))}
                    </tr>
                  ))}
                  {sortedMembers.length === 0 && (
                    <tr>
                      <td colSpan={2 + sortedSessions.length} className="border border-black p-4 text-center italic text-slate-500">
                        Nenhum aluno ativo nesta turma.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="mt-4 text-[10px] text-slate-500 flex justify-end">
                 <span>Legenda: V = Presente, X = Ausente</span>
              </div>

              <div className="border-t border-black pt-2 mt-4 text-center">
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
            </>
          );
        })()}
      </div>,
      document.body
    )}

      {/* UI MODAL SECTION */}
      <div className="no-print bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-amber-600 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl text-white">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Diário da Turma</h2>
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider">{turma.nome} • Planilha de Chamadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              title="Imprimir Relatório"
            >
              <Printer className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => {
              const presentCount = session.entries.filter(e => e.status === 'present').length;
              const absentCount = sortedMembers.length - presentCount;

              return (
                <div key={session.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Session Sub-header */}
                  <div className="p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-50 p-3 rounded-xl">
                        <Calendar className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-amber-600">{new Date(session.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <h4 className="text-lg font-bold text-slate-800 leading-tight">
                          Tema: {session.tema || "Tema não registrado"}
                        </h4>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{presentCount} Presentes</span>
                       <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{absentCount} Ausentes</span>
                    </div>
                  </div>

                  {/* Spreadsheet Grid */}
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catequizando</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedMembers.map((member, idx) => {
                          const entry = session.entries.find(e => e.studentId === member.id);
                          const isPresent = entry?.status === 'present';
                          
                          return (
                            <tr key={member.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-3 text-xs font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-6 py-3">
                                <span className={`text-sm font-bold ${isPresent ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                  {member.nomeCompleto}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                {isPresent ? (
                                  <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Presente</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ausente</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FileSpreadsheet className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sem registros de chamada</h3>
              <p className="text-slate-400 italic">Nenhum encontro foi registrado no diário desta turma ainda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total de Encontros: {sortedSessions.length}</p>
          <div className="flex gap-3">
             <button 
               onClick={handlePrint} 
               className="px-6 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
             >
               <Printer className="w-4 h-4" /> Imprimir Diário
             </button>
             <button 
               onClick={onClose} 
               className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
             >
               Fechar Janela
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
