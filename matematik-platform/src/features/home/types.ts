import type { Announcement, ContentDocument } from '@/types';

export type InitialHomePageData = {
  announcements: Announcement[];
  documents: ContentDocument[];
  isHydrated: boolean;
};
