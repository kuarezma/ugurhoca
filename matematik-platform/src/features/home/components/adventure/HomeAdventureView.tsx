'use client';

import { useState } from 'react';
import { ADVENTURE_CURRICULUM } from './AdventureCurriculumData';
import { calculateAdventureTopics } from './adventure-progress';
import { useAdventureProgress } from './useAdventureProgress';
import type { AppUser } from '@/types';
import { AdventureTopHUD } from './AdventureTopHUD';
import { AdventureLearningPath } from './AdventureLearningPath';
import { AdventureSideQuests } from './AdventureSideQuests';

interface HomeAdventureViewProps {
  user: AppUser | null;
  onOpenFlashcards?: (subject?: string) => void;
  onOpenScratchpad?: () => void;
  onOpenCalculator?: (tab?: 'lgs' | 'yks') => void;
  onOpenPomodoro?: () => void;
}

export function HomeAdventureView({
  user,
  onOpenFlashcards,
  onOpenScratchpad,
  onOpenCalculator,
  onOpenPomodoro,
}: HomeAdventureViewProps) {
  const userGradeStr =
    user?.grade === 'Mezun' ? '12' : String(user?.grade || 8);
  const [gradeSelection, setGradeSelection] = useState<{
    userId?: string;
    grade: string;
  } | null>(null);
  const selectedGrade =
    gradeSelection?.userId === user?.id && gradeSelection
      ? gradeSelection.grade
      : userGradeStr;
  const progress = useAdventureProgress(user?.id);
  const topics = calculateAdventureTopics(
    ADVENTURE_CURRICULUM[selectedGrade] || ADVENTURE_CURRICULUM['8'],
    progress.data?.topics || [],
  );
  const activeTopic = topics.find((topic) => topic.status === 'active') || null;
  const completedTopics = topics.filter(
    (topic) => topic.status === 'completed',
  ).length;

  return (
    <section className="relative px-4 pb-16 pt-4 sm:pt-6">
      <div className="relative mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* 1. Üst Oyun Durum Barı (HUD) */}
        <AdventureTopHUD
          user={user}
          progress={progress.data}
          loading={progress.loading}
          error={progress.error}
          onRetry={progress.retry}
          completedTopics={completedTopics}
          totalTopics={topics.length}
          activeTopic={activeTopic}
        />

        {/* 2. Ana Gövde (Sol: Patika, Sağ: Görevler & Liderlik) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sol Kolon: Öğrenme Patikası Düğümleri */}
          <div className="lg:min-w-0 lg:col-span-8">
            <AdventureLearningPath
              selectedGrade={selectedGrade}
              onGradeChange={(grade) =>
                setGradeSelection({ userId: user?.id, grade })
              }
              topics={topics}
              showProgress={Boolean(user && progress.data)}
              onOpenFlashcards={onOpenFlashcards}
            />
          </div>

          {/* Sağ Kolon: Günlük Görevler, Liderlik & Hızlı Araçlar */}
          <div className="lg:col-span-4 lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top))]">
            <AdventureSideQuests
              activeTopic={activeTopic}
              onOpenCalculator={() => onOpenCalculator?.('lgs')}
              onOpenPomodoro={onOpenPomodoro}
              onOpenScratchpad={onOpenScratchpad}
              onOpenFlashcards={onOpenFlashcards}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeAdventureView;
