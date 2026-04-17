'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'uh-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Daha önce kapatılmışsa gösterme
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION_MS) return;

    // Zaten yüklüyse gösterme (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Küçük bekleme: kullanıcıya sayfayı önce görme şansı ver
      setTimeout(() => setShow(true), 3500);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    setDeferredPrompt(null);
    setShow(false);
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[200] animate-slide-up sm:left-auto sm:right-6 sm:w-[380px]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/10 blur-xl" />

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.15)',
        }}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
              <Smartphone className="h-7 w-7 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold leading-tight text-white">
                    Uygulamayı Kur
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Uğur Hoca Matematik
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Ana ekranına ekle, hızlı erişim ve daha akıcı deneyim kazan.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-transform transition-opacity hover:scale-[1.02] disabled:opacity-60"
                >
                  {installing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {installing ? 'Kuruluyor...' : 'Kur'}
                </button>

                <button
                  onClick={handleDismiss}
                  className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Şimdi Değil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
