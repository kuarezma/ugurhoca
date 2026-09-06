import type { Metadata } from 'next';
import { ChallengePageContainer } from '@/features/challenge/containers/ChallengePageContainer';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Meydan Okuma & Günlük Hedefler',
  description:
    'Günün matematik meydan okuması, günlük soru hedefi, LGS matematik taktik köşesi ve başarı yol haritası ile hedeflerine adım adım ulaş.',
  path: '/meydan-okuma',
});

export default function MeydanOkumaPage() {
  return <ChallengePageContainer />;
}
