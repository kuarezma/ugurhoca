import type { Metadata } from 'next';
import LoginPage from '@/features/auth/containers/LoginPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Giriş Yap',
  description:
    'Uğur Hoca Matematik hesabına giriş yap, çalışmalarına ve ödevlerine kaldığın yerden devam et.',
  path: '/giris',
});

export default function GirisRoute() {
  return <LoginPage />;
}
