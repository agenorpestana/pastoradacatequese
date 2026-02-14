
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Previne o mini-infobar padrão do Chrome
      e.preventDefault();
      // Guarda o evento para ser disparado depois
      setDeferredPrompt(e);
      // Mostra o botão
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra o prompt nativo de instalação
    deferredPrompt.prompt();

    // Espera a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
    } else {
      console.log('Usuário recusou a instalação');
    }

    // Limpa o prompt, pois ele só pode ser usado uma vez
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1000] animate-in slide-in-from-bottom-4 duration-500 no-print">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-blue-900/20 flex items-center gap-4 max-w-sm border border-slate-700">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-black text-sm">Instalar Aplicativo</p>
          <p className="text-[10px] text-slate-400 font-medium">Adicione à tela inicial para acesso rápido e offline.</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
            <X className="w-4 h-4 text-slate-400" />
            </button>
            <button 
            onClick={handleInstallClick}
            className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-50 transition-colors"
            >
            Instalar
            </button>
        </div>
      </div>
    </div>
  );
};
