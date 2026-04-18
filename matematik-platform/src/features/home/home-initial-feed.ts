import type { Announcement, ContentDocument } from '@/types';

export type HomeInitialFeed = {
  announcements: Announcement[];
  documents: ContentDocument[];
  writings: ContentDocument[];
};
