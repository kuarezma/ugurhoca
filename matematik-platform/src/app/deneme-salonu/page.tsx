import type { Metadata } from 'next';
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
    <main className="min-h-screen bg-canvas text-primary px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <GuestTrialLobby />
      </div>
    </main>
  );
}
