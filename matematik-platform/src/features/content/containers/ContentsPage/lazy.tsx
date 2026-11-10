import dynamic from 'next/dynamic';

export const ContentCommentsModal = dynamic(
  () => import('@/features/content/components/ContentCommentsModal'),
  { ssr: false },
);

export const ContentEditModal = dynamic(
  () => import('@/features/content/components/ContentEditModal'),
  { ssr: false },
);

export const ContentPreviewModal = dynamic(
  () => import('@/features/content/components/ContentPreviewModal'),
  { ssr: false },
);

export const ContentQuickAddModal = dynamic(
  () => import('@/features/content/components/ContentQuickAddModal'),
  { ssr: false },
);

export const ContentDeleteConfirmModal = dynamic(
  () => import('@/features/content/components/ContentDeleteConfirmModal'),
  { ssr: false },
);
