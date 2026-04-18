import type { Metadata } from 'next';
import ProfilePage from '@/features/profile/containers/ProfilePage';
import { loadInitialProfileDashboardData } from '@/features/profile/server';

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Hesap bilgilerin, mesajların ve profil ayarların.',
  robots: { index: false, follow: false },
};

export default async function ProfilPage() {
  const initialData = await loadInitialProfileDashboardData();

  return <ProfilePage initialData={initialData} />;
}
