import type { Metadata } from 'next';
import ResetPasswordPage from '@/features/auth/containers/ResetPasswordPage';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Yeni Şifre Belirle',
  description: 'Hesabınız için yeni bir şifre belirleyin.',
  path: '/sifre-sifirla',
  noIndex: true,
});

export default function Page() {
  return <ResetPasswordPage />;
}
