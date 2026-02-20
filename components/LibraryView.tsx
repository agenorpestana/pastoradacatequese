
import React, { useState, useRef } from 'react';
import { 
  Library, 
  Upload, 
  Search, 
  FileText, 
  Book, 
  Calendar, 
  FileCheck, 
  ClipboardList, 
  Trash2, 
  Download, 
  Plus, 
  X, 
  Filter,
  FileBox,
  Eye,
  Loader2
} from 'lucide-react';
import { LibraryFile } from '../types';

interface LibraryViewProps {
  files: LibraryFile[];
  onUpload: (file: LibraryFile) => void;
  onDelete: (id: string) => void;
  canUpload: boolean;
  canDelete: boolean;
}

const CATEGORIES = [
  'Livro', 'Revista', 'Apostila', 'Calendário', 'Roteiro', 'Planejamento', 'Outros'
] as const;

export const LibraryView: React.FC<LibraryViewProps> = ({ files, onUpload, onDelete, canUpload, canDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | 'Todas'>('Todas');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newFile, setNewFile] = useState<{
    name: string;
    category: typeof CATEGORIES[number];
    data: string | null;
    type: string;
  }>({
    name: '',
    category: 'Livro',
    data: null,
    type: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (150MB limit to be safe within 200MB server limit with base64 overhead)
      if (file.size > 150 * 1024 * 1024) {
        alert("O arquivo é muito grande. O tamanho máximo permitido é 150MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFile({
          ...newFile,
          name: newFile.name || file.name,
          data: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = () => {
    if (!newFile.data || !newFile.name) return;
    setIsProcessing(true);
    
    const fileToUpload: LibraryFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFile.name,
      category: newFile.category,
      url: newFile.data,
      type: newFile.type,
      uploadDate: new Date().toISOString()
    };

    setTimeout(() => {
      onUpload(fileToUpload);
      setNewFile({ name: '', category: 'Livro', data: null, type: '' });
      setIsUploading(false);
      setIsProcessing(false);
    }, 800);
  };

  const handleDownload = (file: LibraryFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (file: LibraryFile) => {
    // Convert Data URL to Blob to allow opening in new tab (Chrome blocks top-frame navigation to data: URLs)
    fetch(file.url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          alert("Por favor, permita popups para visualizar o arquivo.");
        }
      })
      .catch(e => {
        console.error("Erro ao abrir arquivo:", e);
        // Fallback: try to download if view fails
        handleDownload(file);
      });
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Livro': return <Book className="w-5 h-5" />;
      case 'Calendário': return <Calendar className="w-5 h-5" />;
      case 'Apostila': return <FileText className="w-5 h-5" />;
      case 'Roteiro': return <ClipboardList className="w-5 h-5" />;
      case 'Planejamento': return <FileCheck className="w-5 h-5" />;
      default: return <FileBox className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-100">
            <Library className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Biblioteca do Catequista</h2>
            <p className="text-slate-500 text-sm">Materiais de apoio, formações e planejamentos pastorais.</p>
          </div>
        </div>

        {canUpload && (
          <button 
            onClick={() => setIsUploading(true)}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-xs w-full md:w-auto"
          >
            <Plus className="w-4 h-4" /> Novo Material
          </button>
        )}
      </header>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome do arquivo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('Todas')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === 'Todas' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => (
            <div key={file.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between h-48">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${file.category === 'Livro' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                  {getCategoryIcon(file.category)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleView(file)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver"><Eye size={18} /></button>
                  {canDelete && (
                    <button onClick={() => onDelete(file.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 text-base line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{file.name}</h4>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">{file.category}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(file.uploadDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Botão de Download Flutuante (Hover) */}
              <button 
                onClick={() => handleDownload(file)}
                className="absolute right-6 bottom-6 bg-slate-900 text-white p-3 rounded-2xl shadow-xl transform translate-y-20 group-hover:translate-y-0 transition-transform duration-300"
              >
                <Download size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Library className="w-10 h-10 text-slate-200" />
             </div>
             <p className="text-slate-400 font-bold italic text-sm">Nenhum material encontrado.</p>
          </div>
        )}
      </div>

      {/* MODAL UPLOAD */}
      {isUploading && canUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <Upload className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Adicionar à Biblioteca</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Carregue um arquivo para formação</p>
                </div>
              </div>
              <button onClick={() => setIsUploading(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Arquivo Digital</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all overflow-hidden relative ${newFile.data ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  {newFile.data ? (
                    <div className="text-center p-6">
                      <div className="p-4 bg-white rounded-2xl shadow-sm inline-block mb-3"><FileText className="w-8 h-8 text-blue-600" /></div>
                      <p className="font-bold text-blue-900 text-sm truncate max-w-xs">{newFile.name}</p>
                      <p className="text-[10px] text-blue-400 mt-1 uppercase font-black">Clique para alterar o arquivo</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-100 rounded-2xl text-slate-400"><Upload size={24} /></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clique para selecionar</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1 block">Título do Material</label>
                  <input 
                    type="text" 
                    value={newFile.name}
                    onChange={e => setNewFile({...newFile, name: e.target.value})}
                    placeholder="Ex: Livro do Catequista 2024"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1 block">Categoria</label>
                  <select 
                    value={newFile.category}
                    onChange={e => setNewFile({...newFile, category: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-slate-800 text-[10px] uppercase tracking-widest"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={!newFile.data || !newFile.name || isProcessing}
                  onClick={handleUploadSubmit}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Library className="w-4 h-4" />}
                  Publicar Material
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
