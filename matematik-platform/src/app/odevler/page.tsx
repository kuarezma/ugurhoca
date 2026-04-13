import AssignmentsPage from '@/features/assignments/containers/AssignmentsPage';
import { loadInitialAssignmentsPageData } from '@/features/assignments/server';

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
