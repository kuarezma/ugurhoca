import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { createPageMetadata } from '@/lib/site-metadata';
import { GuestTrialLobby } from '@/features/guest-trial/components/GuestTrialLobby';

export const metadata: Metadata = createPageMetadata({
  title: 'Misafir Deneme Salonu | Ücretsiz Örnek Sorular ve Oyunlar',
  description:
    'Üye olmadan 5, 6, 7 ve 8. sınıf MEB müfredatına uygun yeni nesil soruları ve MEB ortak yazılı tipi açık uçlu çözümleri inceleyin, zihin matematiği oyununu deneyin.',
  path: '/deneme-salonu',
});

export default function DenemeSalonuPage() {
  return (
    <div className="min-h-screen page-surface text-primary">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="relative max-w-4xl mx-auto overflow-hidden rounded-full border border-sky-200/75 dark:border-sky-400/20 bg-surface-1/75 backdrop-blur-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-[0_12px_32px_-14px_rgba(14,116,144,0.16),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_16px_38px_-14px_rgba(2,6,23,0.68),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"
          />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-brand px-3.5 sm:px-4 py-1.5 text-xs font-bold text-on-brand shadow-xs hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ücretsiz Kayıt Ol</span>
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <GuestTrialLobby />
        </div>
      </main>
    </div>
  );
}
