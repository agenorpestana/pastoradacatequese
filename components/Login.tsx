
import React, { useState } from 'react';
import { Church, Mail, Lock, LogIn, Loader2, Sparkles, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (usernameOrEmail: string, pass: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulando um delay de rede para elegância
    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError('Acesso negado. Verifique suas credenciais.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleForgotPass = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Para recuperar sua senha, entre em contato com o Coordenador Geral da Pastoral ou a Secretaria Paroquial.");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 mb-6 group transition-transform hover:scale-110">
                <Church className="text-blue-600 w-12 h-12" />
              </div>
              <h1 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Pastoral da Catequese</h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Paróquia N. Sra. de Fátima - Itamaraju-Ba
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Usuário ou E-mail</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    required 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Seu nome ou e-mail" 
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Senha</label>
                  <a 
                    href="#" 
                    onClick={handleForgotPass}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-tighter hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="input-field pr-12" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-600 font-bold animate-in slide-in-from-top-2 text-center">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button disabled={isLoading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-70">
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Autenticando...</> : <><LogIn className="w-5 h-5" /> Acessar Sistema</>}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest">Acesso Restrito à Coordenação</span>
            </div>
          </div>
        </div>
        <p className="text-center mt-6 text-slate-400 text-[10px] font-medium uppercase tracking-widest">
          © 2026 Paróquia N. Sra. de Fátima - Itamaraju-Ba <span className="mx-2 opacity-50">|</span> Dev: <span className="font-bold text-slate-500">AgeTecnologia</span>
        </p>
      </div>
      <style>{`
        .input-field {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          outline: none;
          transition: all 0.3s;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .input-field:focus {
          border-color: #3b82f6;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};
