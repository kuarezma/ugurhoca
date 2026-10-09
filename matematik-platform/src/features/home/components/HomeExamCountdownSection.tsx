'use client';

import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { ExamCountdown } from '@/components/ExamCountdown';
import { featuredExams } from '@/lib/examDates';

type HomeExamCountdownSectionProps = {
  onOpenCalculator?: (examType: 'lgs' | 'yks') => void;
  userGrade?: number | string | null;
};

export function HomeExamCountdownSection({
  onOpenCalculator,
  userGrade,
}: HomeExamCountdownSectionProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const exams = featuredExams.filter((exam) => exam.featured);

  return (
    <section className="defer-section px-4 pt-2 pb-3 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Mobilde Tek Satırlık Şık Katlanır Menü (Akordeon) */}
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-countdown-content"
            className="w-full flex items-center justify-between rounded-2xl border border-default dark:border-slate-600 bg-white/95 dark:bg-slate-900/90 px-4 py-3 shadow-xs backdrop-blur-md text-left transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                  ⏱️ Sınav Sayaçları (LGS & YKS)
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                  {isMobileOpen ? 'Sayaçları gizlemek için dokunun' : 'Kalan süre ve hedef netleri gör'}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                isMobileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isMobileOpen && (
            <div id="mobile-countdown-content" className="mt-2.5 space-y-2 animate-fade-in">
              {exams.map((exam) => (
                <ExamCountdown
                  key={exam.id}
                  exam={exam}
                  onOpenCalculator={onOpenCalculator}
                  userGrade={userGrade}
                />
              ))}
            </div>
          )}
        </div>

        {/* Masaüstünde Açık İki Sütunlu Grid Düzeni (Korunur) */}
        <div className="hidden sm:grid gap-2 sm:grid-cols-2">
          {exams.map((exam) => (
            <ExamCountdown
              key={exam.id}
              exam={exam}
              onOpenCalculator={onOpenCalculator}
              userGrade={userGrade}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
