import type { Metadata } from 'next';
import ProfilePage from '@/features/profile/containers/ProfilePage';
import { loadInitialProfileDashboardData } from '@/features/profile/server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Profil',
    description: 'Hesap bilgilerin, mesajların ve profil ayarların.',
    path: '/profil',
  }),
  robots: { index: false, follow: false },
};

export default async function ProfilPage() {
  const initialData = await loadInitialProfileDashboardData();

  return <ProfilePage initialData={initialData} />;
}
