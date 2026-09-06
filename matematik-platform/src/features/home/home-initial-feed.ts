import type { Announcement } from '@/types';

export type HomeStatsSnapshot = {
  students: number;
  quizzes: number;
  documents: number;
  assignments: number;
};

/**
 * Ana sayfanın sunucudan aldığı ilk veri. Yalnızca gerçekten render edilen
 * alanları içerir; kullanılmayan alan eklemek her istekte TTFB'ye yazılır.
 */
export type HomeInitialFeed = {
  announcements: Announcement[];
};
