import type { Metadata } from 'next';
import { SitePageNavigation } from '@/components/SitePageNavigation';
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
      <SitePageNavigation
        accountHref="/kayit"
        accountLabel="Ücretsiz Kayıt Ol"
      />

      <main className="px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28">
        <div className="max-w-4xl mx-auto">
          <GuestTrialLobby />
        </div>
      </main>
    </div>
  );
}
