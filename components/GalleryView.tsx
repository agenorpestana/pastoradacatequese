
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Search, 
  Calendar, 
  Trash2, 
  X, 
  Upload, 
  Maximize2,
  Camera,
  Sparkles,
  Loader2,
  CheckSquare,
  Square,
  BookOpen,
  Edit
} from 'lucide-react';
import { GalleryImage, Turma } from '../types';

interface GalleryViewProps {
  images: GalleryImage[];
  onUpload: (image: GalleryImage) => void;
  onEdit?: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  canUpload: boolean;
  canDelete: boolean;
  availableClasses?: Turma[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ images, onUpload, onEdit, onDelete, onDeleteMultiple, canUpload, canDelete, availableClasses = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // State for Editing
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [tempImageData, setTempImageData] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setTempImageData(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = () => {
    if ((!tempImageData && !editingImage) || !newImageTitle) return;
    setIsProcessing(true);

    const now = new Date();
    // Format date as 'YYYY-MM-DD HH:MM:SS' compatible with MySQL DATETIME
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

    if (editingImage && onEdit) {
      // Logic for Editing
      const updatedImg: GalleryImage = {
        ...editingImage,
        url: tempImageData || editingImage.url, // Keep old url if no new file selected
        title: newImageTitle,
        turmaId: selectedTurmaId || undefined,
        // Optional: Update date on edit? usually better to keep original date or add updated_at.
        // Keeping original date for now as it represents the event date often.
      };

      setTimeout(() => {
        onEdit(updatedImg);
        resetForm();
      }, 800);

    } else {
      // Logic for Creating
      if (!tempImageData) return; // Should not happen due to validation
      const newImg: GalleryImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: tempImageData,
        title: newImageTitle,
        date: formattedDate,
        turmaId: selectedTurmaId || undefined
      };

      setTimeout(() => {
        onUpload(newImg);
        resetForm();
      }, 800);
    }
  };

  const resetForm = () => {
    setTempImageData(null);
    setNewImageTitle('');
    setSelectedTurmaId('');
    setIsUploading(false);
    setEditingImage(null);
    setIsProcessing(false);
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingImage(img);
    setNewImageTitle(img.title);
    setSelectedTurmaId(img.turmaId || '');
    setTempImageData(null); // Reset temp data, we show current image URL in UI
    setIsUploading(true); // Re-use the upload modal
  };

  const toggleSelect = (e: React.MouseEvent | React.ChangeEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteMultiple) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    } else {
      // Fallback para deletar um por um se não houver função em massa
      if (confirm(`Deseja excluir as ${selectedIds.length} fotos selecionadas?`)) {
        selectedIds.forEach(id => onDelete(id));
        setSelectedIds([]);
      }
    }
  };

  const getTurmaName = (id?: string) => {
    if (!id) return null;
    const turma = availableClasses.find(t => t.id === id);
    return turma ? turma.nome : null;
  };

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER MARIANO */}
      <header className="bg-white p-8 rounded-[2.5rem] border border-sky-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-sky-600 p-4 rounded-3xl shadow-xl shadow-sky-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ImageIcon className="text-white w-8 h-8 relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Galeria de Graças</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
               <Sparkles size={12} className="text-amber-500" /> Registro dos momentos sagrados da nossa comunidade.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar lembranças..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border border-sky-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {canDelete && selectedIds.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 uppercase tracking-widest text-xs animate-in zoom-in duration-300"
              >
                <Trash2 className="w-4 h-4" /> Excluir ({selectedIds.length})
              </button>
            )}
            {canUpload && (
              <button 
                onClick={() => {
                  setEditingImage(null);
                  setNewImageTitle('');
                  setTempImageData(null);
                  setSelectedTurmaId('');
                  setIsUploading(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-amber-400 text-white font-black rounded-2xl hover:bg-amber-500 transition-all shadow-xl shadow-amber-200 uppercase tracking-widest text-xs"
              >
                <Plus className="w-4 h-4" /> Nova Foto
              </button>
            )}
          </div>
        </div>
      </header>

      {/* GRID DE IMAGENS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.length > 0 ? (
          filteredImages.map(img => {
            const isSelected = selectedIds.includes(img.id);
            const turmaName = getTurmaName(img.turmaId);
            
            return (
              <div key={img.id} className={`group bg-white rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 relative ${isSelected ? 'border-sky-400 ring-2 ring-sky-100' : 'border-sky-50'}`}>
                <div 
                  className="relative h-64 overflow-hidden cursor-pointer"
                  onClick={() => setPreviewImage(img)}
                >
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  
                  {/* BADGE DA TURMA */}
                  {turmaName && (
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen size={10} className="text-amber-400" />
                        {turmaName}
                      </p>
                    </div>
                  )}

                  {/* CHECKBOX UI */}
                  <div 
                    className={`absolute top-4 left-4 z-20 transition-all duration-300 ${isSelected ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 scale-100'}`}
                    onClick={(e) => toggleSelect(e, img.id)}
                  >
                    <div className={`p-2 rounded-xl border-2 shadow-lg transition-all ${isSelected ? 'bg-sky-600 border-sky-400 text-white' : 'bg-white/80 border-white text-sky-600 backdrop-blur-md'}`}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </div>

                  {/* OVERLAY DE AÇÕES */}
                  <div className={`absolute inset-0 bg-sky-900/40 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center gap-4 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div 
                      className="p-3.5 bg-white text-sky-600 rounded-2xl hover:scale-110 hover:bg-sky-50 transition-all shadow-xl border border-sky-100"
                      title="Ampliar Imagem"
                    >
                      <Maximize2 size={22} />
                    </div>

                    {canUpload && onEdit && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditModal(img);
                        }}
                        className="p-3.5 bg-white text-amber-500 rounded-2xl hover:scale-110 hover:bg-amber-50 transition-all shadow-xl border border-amber-100 group/edit"
                        title="Editar Detalhes"
                      >
                        <Edit size={22} />
                      </button>
                    )}
                    
                    {canDelete && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(img.id);
                        }}
                        className="p-3.5 bg-white text-rose-500 rounded-2xl hover:scale-110 hover:bg-rose-50 transition-all shadow-xl border border-rose-100 group/del"
                        title="Excluir Permanentemente"
                      >
                        <Trash2 size={22} className="group-hover/del:animate-bounce" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6 border-t border-sky-50 bg-white">
                  <h4 className="font-bold text-slate-800 truncate text-base mb-1.5">{img.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={12} className="text-amber-500" />
                      {new Date(img.date).toLocaleDateString('pt-BR')}
                    </div>
                    {isSelected && (
                      <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Selecionado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-sky-100 animate-pulse">
             <div className="w-24 h-24 bg-sky-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-sky-100">
                <ImageIcon className="w-12 h-12 text-sky-200" />
             </div>
             <h3 className="text-slate-400 font-black uppercase tracking-widest text-sm">A galeria aguarda por momentos de fé</h3>
             {canUpload && (
               <button 
                 onClick={() => {
                   setEditingImage(null);
                   setNewImageTitle('');
                   setTempImageData(null);
                   setSelectedTurmaId('');
                   setIsUploading(true);
                 }}
                 className="mt-6 text-sky-600 font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2 mx-auto"
               >
                 <Plus size={14} /> Carregar primeira lembrança
               </button>
             )}
          </div>
        )}
      </div>

      {/* MODAL UPLOAD / EDIT MARIANO */}
      {isUploading && canUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-sky-100 flex flex-col max-h-[90vh]">
            <div className="bg-sky-600 p-8 flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={120} /></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <Camera className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{editingImage ? 'Editar Lembrança' : 'Eternizar Momento'}</h2>
                  <p className="text-sky-100 text-xs font-bold uppercase tracking-widest opacity-80">
                    {editingImage ? 'Atualize os detalhes da foto' : 'Selecione uma imagem da pastoral'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsUploading(false)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all relative z-10">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {editingImage ? 'Substituir Imagem (Opcional)' : 'Selecione o Arquivo'}
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all overflow-hidden relative ${tempImageData || editingImage ? 'border-sky-500 bg-sky-50/30' : 'border-sky-100 hover:border-sky-400 hover:bg-sky-50/50'}`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  {tempImageData ? (
                    <>
                      <img src={tempImageData} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-white text-sky-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Trocar Imagem</span>
                      </div>
                    </>
                  ) : editingImage ? (
                    <>
                      <img src={editingImage.url} className="w-full h-full object-cover" alt="Current" />
                      <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-white text-sky-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Substituir Imagem</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 bg-sky-50 rounded-3xl text-sky-300 shadow-inner"><Upload size={32} /></div>
                      <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Clique para buscar fotos</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Título da Lembrança</label>
                <input 
                  type="text" 
                  value={newImageTitle}
                  onChange={e => setNewImageTitle(e.target.value)}
                  placeholder="Ex: Primeira Eucaristia da Turma São João..."
                  className="w-full px-6 py-4 bg-sky-50/30 border border-sky-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vincular a uma Turma (Opcional)</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300 w-5 h-5" />
                  <select
                    value={selectedTurmaId}
                    onChange={e => setSelectedTurmaId(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-sky-50/30 border border-sky-100 rounded-2xl outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="">-- Sem Turma Específica (Geral) --</option>
                    {availableClasses.map(turma => (
                      <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={(!tempImageData && !editingImage) || !newImageTitle || isProcessing}
                  onClick={handleUploadSubmit}
                  className="flex-[2] py-4 bg-sky-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-sky-700 transition-all shadow-xl shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
                  {editingImage ? 'Salvar Alterações' : 'Publicar na Galeria'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW LUMINOSO */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[110] bg-sky-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-8 right-8 text-white hover:scale-125 transition-all bg-white/10 p-4 rounded-full border border-white/10 shadow-2xl">
            <X size={32} />
          </button>
          <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-10" onClick={e => e.stopPropagation()}>
            <div className="w-full h-[70vh] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-sky-400/10 blur-[120px] rounded-full animate-pulse"></div>
              <img src={previewImage.url} className="max-w-full max-h-full object-contain rounded-[2rem] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/20 relative z-10" alt={previewImage.title} />
            </div>
            <div className="bg-white/10 backdrop-blur-xl px-16 py-8 rounded-[3.5rem] border border-white/10 text-center max-w-2xl relative z-10 shadow-2xl">
               <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{previewImage.title}</h3>
               <div className="flex flex-col items-center gap-2">
                 <div className="flex items-center justify-center gap-3 text-amber-300 text-xs font-black uppercase tracking-[0.4em]">
                    <Sparkles size={16} />
                    {new Date(previewImage.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </div>
                 {getTurmaName(previewImage.turmaId) && (
                   <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2 border border-white/20 px-3 py-1 rounded-full">
                     Turma: {getTurmaName(previewImage.turmaId)}
                   </span>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
