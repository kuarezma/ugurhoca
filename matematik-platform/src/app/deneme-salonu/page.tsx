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
      <header className="border-b border-border-subtle bg-surface-1/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <Link
            href="/kayit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-brand px-3 sm:px-4 py-1.5 text-xs font-bold text-on-brand shadow-xs hover:opacity-90 transition-opacity"
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
