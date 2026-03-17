
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
        <div className="print-class-history p-8 w-full bg-white text-slate-900 font-sans absolute inset-0 z-[100] hidden">
          <style>{`
              @media print {
                @page { size: landscape; margin: 10mm; }
                body { -webkit-print-color-adjust: exact; margin: 0; background: white !important; }
                #root, .no-print { display: none !important; }
                .print-class-history { 
                  display: block !important; 
                  position: absolute !important;
                  top: 0;
                  left: 0;
                  width: 100%;
                  background: white;
                  z-index: 99999;
                }
                /* Ocultar outros modais de impressão */
                .print-student-ficha, .print-class-members, .print-attendance-report, .print-attendance-diary { display: none !important; }
              }
          `}</style>

        {(() => {
          // Logic for Consolidated Diary - Group by Year and Month chronologically
          const sessionsByYearMonth = sortedSessions.reduce((acc, session) => {
            const dateParts = session.date.split('-');
            let year, month;
            if (dateParts.length >= 3) {
              year = parseInt(dateParts[0]);
              month = parseInt(dateParts[1]) - 1;
            } else {
              const d = new Date(session.date);
              year = d.getFullYear();
              month = d.getMonth();
            }
            
            const key = `${year}-${month}`;
            if (!acc[key]) acc[key] = { year, month, sessions: [] };
            acc[key].sessions.push(session);
            return acc;
          }, {} as Record<string, { year: number, month: number, sessions: AttendanceSession[] }>);

          // Sort keys chronologically
          const sortedKeys = Object.keys(sessionsByYearMonth).sort((a, b) => {
            const [yA, mA] = a.split('-').map(Number);
            const [yB, mB] = b.split('-').map(Number);
            return yA !== yB ? yA - yB : mA - mB;
          });

          // Sort sessions within each group by date ascending
          sortedKeys.forEach(key => {
            sessionsByYearMonth[key].sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          });

          const monthNames = [
            'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
            'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
          ];

          return (
            <>
              {/* Header */}
              <div className="border border-black mb-4">
                <div className="bg-slate-100 border-b border-black p-2 text-center font-black uppercase text-sm">
                   {config.pastoralName}
                </div>
                <div className="flex text-xs font-bold uppercase">
                  <div className="flex-1 p-2 border-r border-black">
                    {config.parishName} - {config.dioceseName}
                  </div>
                  <div className="flex-1 p-2">
                    <span>{turma.nome} - {turma.comunidade || '---'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase">
                <p>Catequista: {turma.catequista} | Horário: {turma.diaSemana}, {turma.horario}</p>
                <div className="text-right">
                  <p>ANO: {turma.ano}</p>
                  <p className="text-slate-400 text-[8px]">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Matrix Table */}
              <table className="w-full border-collapse border border-black text-[9px]">
                <thead>
                  {/* Year Row */}
                  <tr>
                    <th className="border border-black p-1 w-10 text-center bg-slate-50 font-black" rowSpan={3}>Nº</th>
                    <th className="border border-black p-1 text-left bg-slate-50 min-w-[200px] font-black" rowSpan={3}>CATEQUIZANDO</th>
                    {sortedKeys.map(key => (
                      <th 
                        key={`year-${key}`} 
                        colSpan={sessionsByYearMonth[key].sessions.length} 
                        className="border border-black p-0.5 text-center bg-slate-200 text-[8px] font-black"
                      >
                        {sessionsByYearMonth[key].year}
                      </th>
                    ))}
                  </tr>
                  {/* Month Row */}
                  <tr>
                    {sortedKeys.map(key => (
                      <th 
                        key={`month-${key}`} 
                        colSpan={sessionsByYearMonth[key].sessions.length} 
                        className="border border-black p-1 text-center bg-slate-100 font-black uppercase"
                      >
                        {monthNames[sessionsByYearMonth[key].month]}
                      </th>
                    ))}
                  </tr>
                  {/* Day Row */}
                  <tr>
                    {sortedKeys.map(key => (
                      sessionsByYearMonth[key].sessions.map(session => {
                        let day = '00';
                        const parts = session.date.split('-');
                        if (parts.length >= 3) {
                            day = parts[2].substring(0, 2);
                        } else {
                            day = new Date(session.date).getDate().toString().padStart(2, '0');
                        }
                        return (
                          <th key={session.id} className="border border-black p-1 text-center w-7 font-bold bg-white">
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
                      <td className="border border-black p-1 font-medium truncate max-w-[200px] uppercase">{student.nomeCompleto}</td>
                      {sortedKeys.map(key => (
                        sessionsByYearMonth[key].sessions.map(session => {
                          const entry = session.entries.find(e => e.studentId === student.id);
                          const isPresent = entry?.status === 'present';
                          const isAbsent = entry?.status === 'absent';
                          
                          return (
                            <td key={`${student.id}-${session.id}`} className="border border-black p-1 text-center font-bold">
                              {isPresent && <span className="text-green-600">P</span>}
                              {isAbsent && <span className="text-red-600">F</span>}
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
                 <span>Legenda: P = Presente, F = Falta</span>
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
      <div className="no-print bg-white w-full max-w-4xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[98vh] md:max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-amber-600 p-4 md:p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl text-white">
              <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-base md:text-2xl font-black text-white tracking-tight">Diário da Turma</h2>
              <p className="text-[9px] md:text-xs text-white/70 font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{turma.nome} • Planilha de Chamadas</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button 
              onClick={handlePrint}
              className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              title="Imprimir Relatório"
            >
              <Printer className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={onClose} className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-12 custom-scrollbar">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => {
              const presentCount = session.entries.filter(e => e.status === 'present').length;
              const absentCount = sortedMembers.length - presentCount;

              return (
                <div key={session.id} className="bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Session Sub-header */}
                  <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-amber-50 p-2 md:p-3 rounded-xl">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-sm font-black text-amber-600">{new Date(session.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <h4 className="text-sm md:text-lg font-bold text-slate-800 leading-tight">
                          Tema: {session.tema || "Tema não registrado"}
                        </h4>
                      </div>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                       <span className="bg-green-100 text-green-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest">{presentCount} Presentes</span>
                       <span className="bg-red-100 text-red-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest">{absentCount} Ausentes</span>
                    </div>
                  </div>

                  {/* Spreadsheet Grid */}
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-4 md:px-6 py-2 md:py-3 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº</th>
                          <th className="px-4 md:px-6 py-2 md:py-3 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Catequizando</th>
                          <th className="px-4 md:px-6 py-2 md:py-3 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedMembers.map((member, idx) => {
                          const entry = session.entries.find(e => e.studentId === member.id);
                          const isPresent = entry?.status === 'present';
                          
                          return (
                            <tr key={member.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 md:px-6 py-2 md:py-3 text-[10px] md:text-xs font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-4 md:px-6 py-2 md:py-3">
                                <span className={`text-xs md:text-sm font-bold truncate block max-w-[150px] md:max-w-none ${isPresent ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                  {member.nomeCompleto}
                                </span>
                              </td>
                              <td className="px-4 md:px-6 py-2 md:py-3 text-center">
                                {isPresent ? (
                                  <div className="inline-flex items-center gap-1 md:gap-1.5 text-green-600 bg-green-50 px-2 md:px-3 py-0.5 md:py-1 rounded-lg border border-green-100">
                                    <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Presente</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 md:gap-1.5 text-red-500 bg-red-50 px-2 md:px-3 py-0.5 md:py-1 rounded-lg border border-red-100">
                                    <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Ausente</span>
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
            <div className="py-12 md:py-24 text-center">
              <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-6">
                <FileSpreadsheet className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">Sem registros de chamada</h3>
              <p className="text-slate-400 italic text-xs md:text-sm">Nenhum encontro foi registrado no diário desta turma ainda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
          <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Total de Encontros: {sortedSessions.length}</p>
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
             <button 
               onClick={onClose} 
               className="flex-1 sm:flex-none px-6 md:px-10 py-3 md:py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] md:text-xs"
             >
               Fechar Janela
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
