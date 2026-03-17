
import React, { useState, useRef } from 'react';
import { 
  Archive, 
  Upload, 
  Search, 
  FileText, 
  File, 
  Calendar, 
  FileCheck, 
  Trash2, 
  Download, 
  Plus,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ArchiveFile, User } from '../types';
import { Pagination } from './Pagination';

interface ArchiveViewProps {
  files: ArchiveFile[];
  onUpload: (file: ArchiveFile) => void;
  onDelete: (id: string) => void;
  user: User;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ files, onUpload, onDelete, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newFile, setNewFile] = useState<Partial<ArchiveFile>>({
    name: '',
    description: '',
    url: '',
    type: '',
  });

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewFile(prev => ({
        ...prev,
        url: reader.result as string,
        name: prev.name || file.name,
        type: file.type
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!newFile.name || !newFile.url) return;
    
    onUpload({
      id: Math.random().toString(36).substr(2, 9),
      name: newFile.name,
      description: newFile.description,
      url: newFile.url,
      type: newFile.type || 'application/octet-stream',
      uploadDate: new Date().toISOString().split('T')[0]
    });

    setShowUploadModal(false);
    setNewFile({ name: '', description: '', url: '', type: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl shadow-slate-100">
            <Archive className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Arquivo Morto</h2>
            <p className="text-slate-500 text-sm">Armazenamento de documentos e arquivos avulsos da pastoral.</p>
          </div>
        </div>

        {user.permissions.archive_upload && (
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Novo Arquivo
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Arquivo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Upload</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFiles.map(file => (
                <tr key={file.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{file.type.split('/')[1] || 'arquivo'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-500 max-w-xs truncate">{file.description || 'Sem descrição'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{new Date(file.uploadDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <a 
                        href={file.url} 
                        download={file.name}
                        className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                        title="Baixar Arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {user.permissions.archive_delete && (
                        <button 
                          onClick={() => onDelete(file.id)}
                          className="p-2.5 bg-white text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-100 shadow-sm"
                          title="Excluir Arquivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Archive className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest opacity-50">Nenhum arquivo encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredFiles.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 relative">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                  <Upload className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Novo Arquivo</h3>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Upload para Arquivo Morto</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Arquivo</label>
                <input 
                  type="text"
                  value={newFile.name}
                  onChange={e => setNewFile({...newFile, name: e.target.value})}
                  placeholder="Ex: Documento Auxiliar 2024"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição (Opcional)</label>
                <textarea 
                  value={newFile.description}
                  onChange={e => setNewFile({...newFile, description: e.target.value})}
                  placeholder="Breve descrição do conteúdo..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selecionar Arquivo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${newFile.url ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : newFile.url ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-600" />
                      <p className="text-xs font-bold text-emerald-700">Arquivo selecionado com sucesso!</p>
                      <p className="text-[10px] text-emerald-600/60 truncate max-w-[200px]">{newFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-400">Clique para selecionar o arquivo</p>
                      <p className="text-[9px] text-slate-300 uppercase tracking-widest">PDF, DOCX, Imagens, etc.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!newFile.name || !newFile.url}
                  className="flex-2 px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                >
                  Salvar Arquivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
