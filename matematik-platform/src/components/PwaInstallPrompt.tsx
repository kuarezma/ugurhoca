'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosModalOpen, setIsIosModalOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check dismissal
    const dismissed = sessionStorage.getItem('ugurhoca_pwa_dismissed');
    if (dismissed) return;

    // iOS check
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Android/Desktop Chromium event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIosDevice) {
      iosTimer = setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setIsIosModalOpen(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('ugurhoca_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Yüzen Kurulum Şeridi */}
      <aside
        aria-label="Uygulama Yükleme Bildirimi"
        className="fixed bottom-20 sm:bottom-6 right-4 z-40 max-w-sm animate-fade-up"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-white">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Smartphone className="h-5 w-5 text-white" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold leading-tight truncate">
              Uğur Hoca Uygulamasını Yükle
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Hızlı erişim ve tam ekran deneyimi için ana ekrana ekle.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-indigo-500 active:scale-95"
            >
              <Download className="h-3 w-3" />
              <span>Yükle</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Kapat"
              className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Kurulum Bilgi Modalı */}
      {isIosModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="iOS Ana Ekrana Ekleme Rehberi"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-sm">iPhone / iPad&apos;e Yükle</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsIosModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 border border-white/5">
                <Share2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">1. Adım:</strong>
                  Safari alt çubuğundaki <strong>Paylaş</strong> simgesine dokun.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 border border-white/5">
                <PlusSquare className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">2. Adım:</strong>
                  Menüyü aşağı kaydırıp <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçeneğini seç.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsIosModalOpen(false);
                setIsVisible(false);
              }}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
export default PwaInstallPrompt;
