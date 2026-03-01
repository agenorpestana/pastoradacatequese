import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { NivelEtapa } from '../types';
import { api } from '../services/api';
import { Pagination } from './Pagination';

interface NiveisListProps {
  niveis: NivelEtapa[];
  onUpdate: () => void;
}

export const NiveisList: React.FC<NiveisListProps> = ({ niveis, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSave = async () => {
    if (!nome.trim()) return;
    setIsLoading(true);
    try {
      if (editingId) {
        await api.put('niveis_etapas', editingId, { nome });
      } else {
        await api.post('niveis_etapas', { id: Math.random().toString(36).substr(2, 9), nome });
      }
      onUpdate();
      setIsAdding(false);
      setEditingId(null);
      setNome('');
    } catch (e) {
      alert('Erro ao salvar nível/etapa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este nível/etapa?')) return;
    setIsLoading(true);
    try {
      await api.delete('niveis_etapas', id);
      onUpdate();
    } catch (e) {
      alert('Erro ao excluir nível/etapa.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (nivel: NivelEtapa) => {
    setEditingId(nivel.id);
    setNome(nivel.nome);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setNome('');
  };

  const totalPages = Math.ceil(niveis.length / itemsPerPage);
  const paginatedItems = niveis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ShieldCheck className="w-8 h-8 text-white relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Níveis e Etapas</h2>
            <p className="text-slate-500 text-sm">Gerencie os níveis de formação catequética.</p>
          </div>
        </div>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Novo Nível
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-end gap-4 animate-in slide-in-from-top-4">
          <div className="flex-1">
            <label className="label-style">Nome do Nível / Etapa</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              className="input-style" 
              placeholder="Ex: 1ª Eucaristia"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={cancelEdit}
              className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading || !nome.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((nivel) => (
                <tr key={nivel.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800">{nivel.nome}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(nivel)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(nivel.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-8 py-10 text-center text-slate-400">
                  Nenhum nível ou etapa cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={niveis.length}
          itemsPerPage={itemsPerPage}
        />
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
