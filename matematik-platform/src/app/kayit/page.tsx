import type { Metadata } from 'next';
import RegisterPage from '@/features/auth/containers/RegisterPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Kayıt Ol',
  description:
    'Uğur Hoca Matematik platformuna ücretsiz kaydol; çalışma kağıtları, testler ve ödevlerini takip et.',
  path: '/kayit',
});

export default function KayitRoute() {
  return <RegisterPage />;
}
