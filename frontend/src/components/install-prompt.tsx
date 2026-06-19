'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }

  if (isInstalled) return null;

  if (isIOS) {
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center text-sm">
        <p className="font-medium">Instalar App</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Para instalar, toque em{' '}
          <span className="inline-block rounded bg-muted px-1 font-mono text-xs">
            Compartilhar
          </span>{' '}
          ↓{' '}
          <span className="inline-block rounded bg-muted px-1 font-mono text-xs">
            Adicionar à Tela Inicial
          </span>
        </p>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
    >
      📱 Instalar App
    </button>
  );
}
