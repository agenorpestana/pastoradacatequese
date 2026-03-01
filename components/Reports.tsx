
import React, { useState, useMemo } from 'react';
import { FileText, Calendar, TrendingUp, Users, BookOpen, UserCheck, ArrowRight, BarChart3 } from 'lucide-react';
import { Student, Turma, AttendanceSession } from '../types';
import { Pagination } from './Pagination';

interface ReportsProps {
  students: Student[];
  classes: Turma[];
  attendanceSessions: AttendanceSession[];
}

export const Reports: React.FC<ReportsProps> = ({ students, classes, attendanceSessions }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = useMemo(() => {
    // Filtro de alunos novos no ano
    const newInYear = students.filter(s => {
      const d = new Date(s.dataCadastro);
      return d.getFullYear() === selectedYear;
    });

    // Filtro de crismados no ano (baseado na data da celebração)
    const concludedInYear = students.filter(s => {
      if (s.status !== 'Concluido' || !s.dataCelebracao) return false;
      const d = new Date(s.dataCelebracao + 'T00:00:00');
      return d.getFullYear() === selectedYear;
    });

    // Filtro de frequências no ano
    const sessionsInYear = attendanceSessions.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === selectedYear;
    });

    let totalPossible = 0;
    let totalPresent = 0;

    sessionsInYear.forEach(session => {
      session.entries.forEach(entry => {
        totalPossible++;
        if (entry.status === 'present') totalPresent++;
      });
    });

    const attendanceRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    return {
      newInYear: newInYear.length,
      attendanceRate: attendanceRate.toFixed(1),
      totalSessions: sessionsInYear.length,
      activeStudents: students.filter(s => s.status === 'Ativo').length,
      concludedInYear: concludedInYear.length
    };
  }, [students, attendanceSessions, selectedYear]);

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const paginatedClasses = classes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-3xl">
            <BarChart3 className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Relatório Anual</h2>
            <p className="text-slate-500 text-sm">Consolidado estatístico das atividades do ano.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Ano de Referência:</span>
          <input 
            type="number" 
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="w-28 bg-white border-2 border-slate-100 text-center text-sm font-black text-slate-900 px-4 py-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform" />
          <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
          <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Taxa de Frequência</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black tracking-tighter">{stats.attendanceRate}%</h3>
            <span className="text-sm font-bold opacity-60">no ano</span>
          </div>
          <p className="text-sm mt-4 font-medium opacity-80">Baseado em {stats.totalSessions} encontros registrados em {selectedYear}.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-2xl"><UserCheck className="w-6 h-6 text-green-600" /></div>
            <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-lg uppercase tracking-widest">Inscrições</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Novos Ingressantes</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.newInYear}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Catequizandos que iniciaram a jornada no ano de {selectedYear}.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 p-3 rounded-2xl"><Users className="w-6 h-6 text-indigo-600" /></div>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg uppercase tracking-widest">Sucesso</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Crismados no Ano</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight">{stats.concludedInYear}</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Total de sacramentos da confirmação realizados em {selectedYear}.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h4 className="text-xl font-bold text-slate-800">Desempenho Anual por Turma</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Comparativo de engajamento</p>
          </div>
          <BookOpen className="text-slate-300 w-8 h-8" />
        </div>
        <div className="divide-y divide-slate-100">
          {paginatedClasses.length > 0 ? (
            paginatedClasses.map(turma => {
              const sessions = attendanceSessions.filter(s => 
                s.turmaId === turma.id && 
                new Date(s.date).getFullYear() === selectedYear
              );
              let p = 0; let t = 0;
              sessions.forEach(s => s.entries.forEach(e => { t++; if(e.status === 'present') p++; }));
              const rate = t > 0 ? (p/t*100).toFixed(0) : '0';

              return (
                <div key={turma.id} className="p-8 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-50 transition-all gap-6">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">
                      {turma.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg leading-tight">{turma.nome}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{turma.catequista}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média de Frequência</p>
                      <p className={`text-2xl font-black ${parseInt(rate) > 75 ? 'text-green-600' : parseInt(rate) > 50 ? 'text-amber-500' : 'text-red-500'}`}>{rate}%</p>
                    </div>
                    <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          parseInt(rate) > 75 ? 'bg-green-500' : parseInt(rate) > 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold italic">Nenhuma turma cadastrada para análise.</p>
            </div>
          )}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={classes.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};
