import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Mascot } from '@/components/Mascot';
import { OfflineRetryButton } from '@/app/offline/OfflineRetryButton';

export const metadata: Metadata = {
  title: 'Çevrimdışısın | Uğur Hoca',
  description:
    'İnternet bağlantısı bulunamadı. Önceden görüntülenen sayfalar hâlâ erişilebilir.',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Mascot pose="sleep" size={160} ariaLabel="Uyuyan maskot Pi" />
      <div className="max-w-md space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary dark:text-brand-primary-soft">
          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
          Çevrimdışı
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          İnternet bağlantın yok
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Görünüşe göre internet bağlantın koptu. Ziyaret ettiğin bazı sayfalar
          hâlâ çalışıyor olabilir. Bağlantı geri geldiğinde tekrar denemek için
          aşağıdaki butonu kullan.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <OfflineRetryButton />
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Ana sayfaya git
        </Link>
      </div>
      <p className="text-xs text-slate-400">
        <RefreshCw className="inline h-3 w-3" aria-hidden="true" /> Bağlantı
        geri geldiğinde sayfa kendiliğinden yenilenir.
      </p>
    </main>
  );
}
