
import React from 'react';
import { X, Printer, Users, User, Phone, BookOpen, Calendar } from 'lucide-react';
import { Turma, Student } from '../types';

interface ClassMembersModalProps {
  turma: Turma;
  members: Student[];
  onClose: () => void;
  onViewStudent: (student: Student) => void;
}

export const ClassMembersModal: React.FC<ClassMembersModalProps> = ({ turma, members, onClose, onViewStudent }) => {
  const handlePrint = () => {
    window.print();
  };

  const boys = members.filter(m => m.sexo === 'M').length;
  const girls = members.filter(m => m.sexo === 'F').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* PRINT ONLY SECTION */}
      <div className="print-only p-10 w-full bg-white text-slate-900 font-sans">
        <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Lista de Chamada</h1>
            <p className="text-sm font-bold text-slate-600">Turma: {turma.nome}</p>
            <p className="text-xs text-slate-500">Catequista: {turma.catequista} | Horário: {turma.diaSemana}, {turma.horario}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase">Mês: ____________________</p>
            <p className="text-[10px] text-slate-400 mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 px-3 py-2 text-left text-xs font-black uppercase w-10">Nº</th>
              <th className="border border-slate-300 px-3 py-2 text-left text-xs font-black uppercase">Catequizando</th>
              {[1, 2, 3, 4, 5].map(i => (
                <th key={i} className="border border-slate-300 px-1 py-2 text-center text-[8px] font-black uppercase w-8">Dia</th>
              ))}
              <th className="border border-slate-300 px-3 py-2 text-left text-xs font-black uppercase w-24">Obs.</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.sort((a,b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((m, index) => (
                <tr key={m.id}>
                  <td className="border border-slate-300 px-3 py-2 text-xs font-bold text-center">{index + 1}</td>
                  <td className="border border-slate-300 px-3 py-2 text-xs font-medium">{m.nomeCompleto}</td>
                  {[1, 2, 3, 4, 5].map(i => (
                    <td key={i} className="border border-slate-300 px-1 py-2"></td>
                  ))}
                  <td className="border border-slate-300 px-3 py-2"></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} className="border border-slate-300 p-10 text-center italic text-slate-400">Nenhum aluno vinculado.</td></tr>
            )}
          </tbody>
        </table>

        <div className="mt-12 grid grid-cols-2 gap-20">
          <div className="border-t border-slate-900 pt-2 text-center text-[10px] font-bold uppercase">Assinatura do Catequista</div>
          <div className="border-t border-slate-900 pt-2 text-center text-[10px] font-bold uppercase">Coordenação de Catequese</div>
        </div>
      </div>

      {/* UI MODAL SECTION */}
      <div className="no-print bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{turma.nome}</h2>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{turma.nivel}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {turma.ano}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
            <p className="text-xl font-black text-slate-900">{members.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Masculino</p>
            <p className="text-xl font-black text-blue-600">{boys}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Feminino</p>
            <p className="text-xl font-black text-pink-600">{girls}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Lista de Membros</h3>
          </div>
          
          {members.length > 0 ? (
            members.sort((a,b) => a.nomeCompleto.localeCompare(b.nomeCompleto)).map((student) => (
              <div 
                key={student.id} 
                className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all cursor-pointer group"
                onClick={() => onViewStudent(student)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black uppercase text-sm border-2 border-white shadow-sm">
                    {student.nomeCompleto.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.nomeCompleto}</p>
                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().getFullYear() - new Date(student.dataNascimento).getFullYear()} anos</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {student.telefone}</span>
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${student.sexo === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {student.sexo}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 italic">Nenhum catequizando vinculado a esta turma.</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Calendar className="w-4 h-4" />
            Catequista: {turma.catequista}
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Printer className="w-5 h-5" />
            Imprimir Diário de Classe
          </button>
        </div>
      </div>
    </div>
  );
};
