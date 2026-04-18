import type { Metadata } from 'next';
import AssignmentsPage from '@/features/assignments/containers/AssignmentsPage';
import { loadInitialAssignmentsPageData } from '@/features/assignments/server';

export const metadata: Metadata = {
  title: 'Ödevler',
  description: 'Atanan ödevleri görüntüle, teslim et ve geri bildirim al.',
  robots: { index: false, follow: false },
};

export default async function OdevlerPage() {
  const initialData = await loadInitialAssignmentsPageData();

  return (
    <AssignmentsPage
      initialAssignments={initialData.initialAssignments}
      initialSubmissions={initialData.initialSubmissions}
      initialUser={initialData.initialUser}
      isHydrated={initialData.isHydrated}
    />
  );
}
