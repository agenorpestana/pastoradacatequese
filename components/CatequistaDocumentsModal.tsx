
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Trash2, Eye, Download, Plus, File, Loader2 } from 'lucide-react';
import { Catequista, StudentDocument } from '../types';

interface CatequistaDocumentsModalProps {
  catequista: Catequista;
  onClose: () => void;
  onUpdateDocuments: (documents: StudentDocument[]) => void;
}

export const CatequistaDocumentsModal: React.FC<CatequistaDocumentsModalProps> = ({ catequista, onClose, onUpdateDocuments }) => {
  const [documents, setDocuments] = useState<StudentDocument[]>(catequista.documentos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: StudentDocument = {
          id: Math.random().toString(36).substr(2, 9),
          nome: file.name,
          url: reader.result as string,
          tipo: file.type,
          dataUpload: new Date().toISOString()
        };
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        onUpdateDocuments(updatedDocs);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este documento permanentemente?')) {
      const updatedDocs = documents.filter(d => d.id !== id);
      setDocuments(updatedDocs);
      onUpdateDocuments(updatedDocs);
    }
  };

  const handleView = (doc: StudentDocument) => {
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 p-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-amber-600 p-3 rounded-2xl shadow-lg">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Documentos em Anexo</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{catequista.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"><X /></button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Buscar documento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Anexar Arquivo
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-amber-200 transition-all group shadow-sm">
                <div className="flex items-center gap-4 truncate">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                    <File size={24} />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-sm truncate">{doc.nome}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Enviado em: {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleView(doc)}
                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
               <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum documento anexado</p>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="mt-4 text-amber-600 text-xs font-black uppercase tracking-widest hover:underline"
               >
                 Clique para enviar o primeiro arquivo
               </button>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
