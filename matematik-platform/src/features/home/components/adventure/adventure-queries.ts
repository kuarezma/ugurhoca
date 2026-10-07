import { supabase } from '@/lib/supabase/client';
import type {
  AdventureProgressData,
  AdventureProgressRow,
} from './adventure-progress';

export async function loadAdventureProgress(
  userId: string,
): Promise<AdventureProgressData> {
  const [profile, progress, quizzes, badges] = await Promise.all([
    supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_progress')
      .select('topic, mastery_level')
      .eq('user_id', userId),
    supabase
      .from('quiz_results')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_badges')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);
  if ([profile, progress, quizzes, badges].some((result) => result.error)) {
    throw new Error('İlerlemen yüklenemedi. Yeniden deneyebilirsin.');
  }
  if (
    !profile.data ||
    !progress.data ||
    quizzes.count === null ||
    badges.count === null
  ) {
    throw new Error('İlerleme verileri alınamadı.');
  }
  return {
    currentStreak: profile.data.current_streak ?? 0,
    quizCount: quizzes.count,
    badgeCount: badges.count,
    topics: progress.data as AdventureProgressRow[],
  };
}
