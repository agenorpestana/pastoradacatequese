
import React, { useState } from 'react';
import { Save, User, Mail, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileFormProps {
  currentUser: UserType;
  onSave: (updatedData: Partial<UserType>) => void;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ currentUser, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: currentUser.nome,
    email: currentUser.email,
    senha: currentUser.senha
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
              <User className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Meu Perfil</h2>
              <p className="text-slate-400 text-sm">Atualize seu nome de exibição e senha de acesso.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {showSuccess && (
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-700 font-bold animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-5 h-5" />
              Perfil atualizado com sucesso!
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="label-style">Seu Nome de Usuário</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  required 
                  type="text" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  className="input-style pl-12" 
                />
              </div>
            </div>

            <div>
              <label className="label-style">E-mail de Login</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="input-style pl-12 bg-slate-50 cursor-not-allowed" 
                  disabled
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">O e-mail é fixo e não pode ser alterado por segurança.</p>
            </div>

            <div>
              <label className="label-style">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  required 
                  type="text" 
                  value={formData.senha} 
                  onChange={e => setFormData({...formData, senha: e.target.value})} 
                  className="input-style pl-12" 
                  placeholder="Defina uma nova senha"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
              <ArrowLeft className="w-5 h-5" /> Voltar
            </button>
            <button type="submit" className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-xs">
              <Save className="w-5 h-5" /> Salvar Perfil
            </button>
          </div>
        </form>
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
