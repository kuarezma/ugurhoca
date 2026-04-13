import ProfilePage from '@/features/profile/containers/ProfilePage';
import { loadInitialProfileDashboardData } from '@/features/profile/server';

export default async function ProfilPage() {
  const initialData = await loadInitialProfileDashboardData();

  return <ProfilePage initialData={initialData} />;
}
