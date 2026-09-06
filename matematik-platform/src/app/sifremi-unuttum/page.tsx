import type { Metadata } from 'next';
import ForgotPasswordPage from '@/features/auth/containers/ForgotPasswordPage';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum | Uğur Hoca Matematik',
  description: 'Hesabınızın şifresini sıfırlayın veya yenileme talebinde bulunun.',
};

export default function Page() {
  return <ForgotPasswordPage />;
}
