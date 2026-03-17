
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BarChart3, Calendar, Printer, School, UserCheck, TrendingUp, Search, FileSpreadsheet } from 'lucide-react';
import { Turma, AttendanceSession, Catequista, ParishConfig, Student } from '../types';
import { Pagination } from './Pagination';

interface AttendanceReportProps {
  classes: Turma[];
  attendanceSessions: AttendanceSession[];
  catequistas: Catequista[];
  config: ParishConfig;
  students: Student[];
  onViewHistory: (turma: Turma) => void;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ 
  classes, 
  attendanceSessions, 
  catequistas, 
  config, 
  students,
  onViewHistory
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentClassPage, setCurrentClassPage] = useState(1);
  const itemsPerPage = 10;

  // Cálculos Estatísticos
  const stats = useMemo(() => {
    // Filtrar sessões pelo ano
    const sessionsInYear = attendanceSessions.filter(s => new Date(s.date).getFullYear() === selectedYear);

    // 1. Estatísticas por Turma
    const classStats = classes.map(turma => {
      const classSessions = sessionsInYear.filter(s => s.turmaId === turma.id);
      let totalEntries = 0;
      let presentEntries = 0;

      classSessions.forEach(s => {
        s.entries.forEach(e => {
          totalEntries++;
          if (e.status === 'present') presentEntries++;
        });
      });

      const rate = totalEntries > 0 ? (presentEntries / totalEntries) * 100 : 0;
      
      return {
        id: turma.id,
        nome: turma.nome,
        catequista: turma.catequista,
        sessionsCount: classSessions.length,
        attendanceRate: rate
      };
    });

    // 2. Estatísticas por Catequista (Agregado das turmas que ele leciona)
    // Nota: Como o nome do catequista é uma string na turma, agrupamos por nome
    const catechistStatsMap = new Map<string, { totalSessions: number, rateSum: number, count: number }>();

    classStats.forEach(cs => {
      if (!cs.catequista) return;
      const current = catechistStatsMap.get(cs.catequista) || { totalSessions: 0, rateSum: 0, count: 0 };
      catechistStatsMap.set(cs.catequista, {
        totalSessions: current.totalSessions + cs.sessionsCount,
        rateSum: current.rateSum + cs.attendanceRate,
        count: current.count + 1
      });
    });

    const catechistStats = Array.from(catechistStatsMap.entries()).map(([name, data]) => ({
      name,
      totalSessions: data.totalSessions,
      avgRate: data.count > 0 ? data.rateSum / data.count : 0
    }));

    return {
      classStats: classStats.sort((a, b) => b.attendanceRate - a.attendanceRate),
      catechistStats: catechistStats.sort((a, b) => b.avgRate - a.avgRate),
      totalSessionsInYear: sessionsInYear.length,
      globalRate: classStats.length > 0 ? classStats.reduce((acc, curr) => acc + curr.attendanceRate, 0) / classStats.length : 0
    };
  }, [classes, attendanceSessions, selectedYear]);

  const filteredClassStats = stats.classStats.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.catequista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClassPages = Math.ceil(filteredClassStats.length / itemsPerPage);
  const paginatedClassStats = filteredClassStats.slice(
    (currentClassPage - 1) * itemsPerPage,
    currentClassPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SEÇÃO APENAS PARA IMPRESSÃO (RELATÓRIO GERAL) */}
      {createPortal(
        <div className="print-attendance-report fixed inset-0 z-[200] bg-white p-8 hidden">
          <style>{`
            @media print {
              @page { margin: 0; size: auto; }
              body { -webkit-print-color-adjust: exact; margin: 0; background: white !important; }
              #root, .no-print { display: none !important; }
              .print-attendance-report { 
                display: block !important; 
                padding: 15mm; 
                height: 100vh; 
                position: absolute !important;
                top: 0;
                left: 0;
                width: 100%;
                background: white;
                z-index: 99999;
              }
              /* Ocultar outros modais de impressão */
              .print-student-ficha, .print-class-members, .print-attendance-diary, .print-class-history { display: none !important; }
            }
          `}</style>
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-widest">PARÓQUIA: {config.parishName}</h1>
          <h2 className="text-lg font-bold text-slate-600">DIOCESE: {config.dioceseName} - Relatório Geral de Frequência - {selectedYear}</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-slate-300 p-4 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Média Global</p>
            <p className="text-2xl font-black">{stats.globalRate.toFixed(1)}%</p>
          </div>
          <div className="border border-slate-300 p-4 text-center">
             <p className="text-[10px] uppercase font-bold text-slate-500">Total de Encontros</p>
             <p className="text-2xl font-black">{stats.totalSessionsInYear}</p>
          </div>
          <div className="border border-slate-300 p-4 text-center">
             <p className="text-[10px] uppercase font-bold text-slate-500">Turmas Ativas</p>
             <p className="text-2xl font-black">{classes.filter(c => c.ativa).length}</p>
          </div>
        </div>

        <h3 className="text-sm font-black uppercase border-b border-slate-300 mb-4 pb-1">Desempenho por Turma</h3>
        <table className="w-full text-left border-collapse mb-8 text-xs">
          <thead>
             <tr className="bg-slate-100">
               <th className="p-2 border border-slate-300">Turma</th>
               <th className="p-2 border border-slate-300">Catequista</th>
               <th className="p-2 border border-slate-300 text-center">Encontros</th>
               <th className="p-2 border border-slate-300 text-center">Frequência</th>
             </tr>
          </thead>
          <tbody>
            {stats.classStats.map(c => (
              <tr key={c.id}>
                <td className="p-2 border border-slate-300 font-bold">{c.nome}</td>
                <td className="p-2 border border-slate-300">{c.catequista}</td>
                <td className="p-2 border border-slate-300 text-center">{c.sessionsCount}</td>
                <td className="p-2 border border-slate-300 text-center font-bold">
                  {c.attendanceRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 text-center text-[10px] text-slate-400">
           Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </div>

        <div className="border-t-2 border-slate-900 pt-2 mt-4 text-center">
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
        </div>,
        document.body
      )}

      {/* HEADER TELA */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-4 rounded-3xl shadow-xl shadow-emerald-100">
            <TrendingUp className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Relatório de Frequência</h2>
            <p className="text-slate-500 text-sm">Análise detalhada de assiduidade por turmas e catequistas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl">
             <Calendar className="w-4 h-4 text-slate-400" />
             <input 
               type="number" 
               value={selectedYear}
               onChange={e => setSelectedYear(parseInt(e.target.value))}
               className="w-16 text-sm font-bold text-slate-700 outline-none"
             />
           </div>
           <button 
             onClick={() => window.print()}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
           >
             <Printer className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Imprimir Geral</span>
           </button>
        </div>
      </div>

      {/* SEARCH E FILTROS */}
      <div className="no-print bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Filtrar por nome da turma ou catequista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* ESTATÍSTICAS GERAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
           <UserCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Média Global</p>
           <h3 className="text-5xl font-black">{stats.globalRate.toFixed(1)}%</h3>
           <p className="text-xs opacity-70 mt-2 font-medium">Frequência média em {selectedYear}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total de Encontros</p>
           <h3 className="text-4xl font-black text-slate-800">{stats.totalSessionsInYear}</h3>
           <p className="text-xs text-slate-400 mt-2 font-medium">Aulas registradas no sistema</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Melhor Turma</p>
           <h3 className="text-lg font-black text-slate-800 truncate">{stats.classStats[0]?.nome || '---'}</h3>
           <p className="text-xs text-green-600 mt-2 font-black">{stats.classStats[0]?.attendanceRate.toFixed(1)}% de presença</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 no-print">
        {/* LISTA POR TURMA */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <School className="text-emerald-600 w-5 h-5" />
               <h3 className="font-bold text-slate-800">Desempenho por Turma</h3>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-4 custom-scrollbar">
             {paginatedClassStats.map(c => (
               <div key={c.id} className="group p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className="font-bold text-slate-800 text-sm">{c.nome}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.catequista}</p>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className={`text-lg font-black ${c.attendanceRate >= 75 ? 'text-emerald-600' : c.attendanceRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {c.attendanceRate.toFixed(0)}%
                      </span>
                      <button 
                        onClick={() => {
                          const turma = classes.find(cl => cl.id === c.id);
                          if (turma) onViewHistory(turma);
                        }}
                        className="text-[10px] flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <FileSpreadsheet className="w-3 h-3" /> Diário
                      </button>
                   </div>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${c.attendanceRate >= 75 ? 'bg-emerald-500' : c.attendanceRate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                     style={{ width: `${c.attendanceRate}%` }}
                   ></div>
                 </div>
                 <p className="text-[9px] text-slate-400 text-right mt-1.5 font-medium">{c.sessionsCount} encontros realizados</p>
               </div>
              ))}
             {filteredClassStats.length === 0 && <p className="text-center text-slate-400 italic py-10">Nenhuma turma encontrada.</p>}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Pagination 
              currentPage={currentClassPage}
              totalPages={totalClassPages}
              onPageChange={setCurrentClassPage}
              totalItems={filteredClassStats.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
