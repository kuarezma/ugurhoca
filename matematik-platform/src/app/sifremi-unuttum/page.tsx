import type { Metadata } from 'next';
import ForgotPasswordPage from '@/features/auth/containers/ForgotPasswordPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Şifremi Unuttum',
  description: 'Hesabınızın şifresini sıfırlayın veya yenileme talebinde bulunun.',
  path: '/sifremi-unuttum',
  noIndex: true,
});

export default function Page() {
  return <ForgotPasswordPage />;
}
