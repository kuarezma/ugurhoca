import type { Announcement, ContentDocument } from '@/types';

export type HomeStatsSnapshot = {
  students: number;
  quizzes: number;
  documents: number;
  assignments: number;
};

export type HomeInitialFeed = {
  announcements: Announcement[];
  documents: ContentDocument[];
  stats: HomeStatsSnapshot;
};
