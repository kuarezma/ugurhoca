'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineRetryButton() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setOnline(navigator.onLine);
    update();
    const onOnline = () => {
      setOnline(true);
      window.location.reload();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-6 text-sm font-semibold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      {online ? 'Tekrar dene' : 'Bağlantıyı yeniden dene'}
    </button>
  );
}
