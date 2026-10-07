'use client';

import type { AppUser } from '@/types';
import { AdventureTopHUD } from './AdventureTopHUD';
import { AdventureLearningPath } from './AdventureLearningPath';
import { AdventureSideQuests } from './AdventureSideQuests';

interface HomeAdventureViewProps {
  user: AppUser | null;
  onOpenFlashcards?: () => void;
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
  const userGradeStr = user?.grade ? String(user.grade) : '8';

  return (
    <section className="relative px-4 pb-16 pt-4 sm:pt-6">
      <div className="relative mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* 1. Üst Oyun Durum Barı (HUD) */}
        <AdventureTopHUD user={user} />

        {/* 2. Ana Gövde (Sol: Patika, Sağ: Görevler & Liderlik) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sol Kolon: Öğrenme Patikası Düğümleri */}
          <div className="lg:col-span-8">
            <AdventureLearningPath
              initialGrade={userGradeStr}
              onOpenFlashcards={onOpenFlashcards}
              onOpenCalculator={() => onOpenCalculator?.('lgs')}
            />
          </div>

          {/* Sağ Kolon: Günlük Görevler, Liderlik & Hızlı Araçlar */}
          <div className="lg:col-span-4">
            <AdventureSideQuests
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
