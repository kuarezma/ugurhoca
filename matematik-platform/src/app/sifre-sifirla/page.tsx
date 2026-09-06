import type { Metadata } from 'next';
import ResetPasswordPage from '@/features/auth/containers/ResetPasswordPage';

export const metadata: Metadata = {
  title: 'Yeni Şifre Belirle | Uğur Hoca Matematik',
  description: 'Hesabınız için yeni bir şifre belirleyin.',
};

export default function Page() {
  return <ResetPasswordPage />;
}
