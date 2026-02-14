
import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS devices (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Optional: Add a delay to show on iOS
      setTimeout(() => setIsVisible(true), 3000);
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto z-[1000] animate-in slide-in-from-bottom-4 duration-500 no-print">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-blue-900/40 flex flex-col md:flex-row items-center gap-4 max-w-sm border border-slate-700 mx-auto">
        <div className="flex items-center gap-4 w-full">
          <div className="bg-blue-600 p-2.5 rounded-xl shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black text-sm">Instalar Aplicativo</p>
            <p className="text-[10px] text-slate-400 font-medium">Acesso rápido e offline.</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {isIos ? (
          <div className="w-full bg-slate-800 p-3 rounded-xl text-xs text-slate-300 border border-slate-700 mt-2 md:mt-0">
            <p className="mb-2">Para instalar no iOS:</p>
            <div className="flex items-center gap-2 mb-1">
              <span>1. Toque em</span>
              <Share className="w-4 h-4 text-blue-400" />
              <span>(Compartilhar)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>2. Selecione</span>
              <span className="font-bold text-white">"Adicionar à Tela de Início"</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full md:w-auto bg-white text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-lg"
          >
            Instalar Agora
          </button>
        )}
      </div>
    </div>
  );
};
