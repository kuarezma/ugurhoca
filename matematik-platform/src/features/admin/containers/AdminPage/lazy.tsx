import dynamic from 'next/dynamic';

export const AdminMainModal = dynamic(
  () => import('@/features/admin/components/AdminMainModal'),
  { loading: () => null },
);

export const AdminNotificationDetailModal = dynamic(
  () => import('@/features/admin/components/AdminNotificationDetailModal'),
  { loading: () => null },
);

export const AdminNotificationsPanel = dynamic(
  () => import('@/features/admin/components/AdminNotificationsPanel'),
  { loading: () => null },
);

export const AdminStudentProfileDrawer = dynamic(
  () => import('@/features/admin/components/AdminStudentProfileDrawer'),
  { loading: () => null },
);

export const AdminSubmissionsModal = dynamic(
  () => import('@/features/admin/components/AdminSubmissionsModal'),
  { loading: () => null },
);

export const AdminSpotlightModal = dynamic(
  () => import('@/features/admin/components/AdminSpotlightModal'),
  { loading: () => null },
);

export const AdminBroadcastModal = dynamic(
  () =>
    import('@/features/admin/components/AdminBroadcastModal').then(
      (mod) => mod.AdminBroadcastModal,
    ),
  { loading: () => null },
);

export const AdminDiagnosticsCard = dynamic(
  () =>
    import('@/features/admin/components/AdminDiagnosticsCard').then(
      (mod) => mod.AdminDiagnosticsCard,
    ),
  { loading: () => null },
);

export const AdminTabPanels = dynamic(
  () => import('@/features/admin/components/AdminTabPanels'),
  {
    loading: () => (
      <div className="bg-surface-1 rounded-3xl p-8 text-center animate-fade-in">
        <div className="mx-auto h-10 w-10 rounded-full border-2 border-tone-warn-border border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-tertiary">Admin paneli yükleniyor...</p>
      </div>
    ),
  },
);
