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
            className="relative w-full flex items-center justify-between overflow-hidden rounded-2xl border border-default bg-surface-1/75 px-4 py-3 backdrop-blur-2xl shadow-[0_10px_28px_-14px_rgba(14,116,144,0.16),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_14px_32px_-14px_rgba(2,6,23,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] text-left transition-all active:scale-[0.99]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 opacity-85"
            />
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-fg">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-xs font-bold text-primary truncate">
                  ⏱️ Sınav Sayaçları (LGS & YKS)
                </div>
                <div className="text-xs text-secondary font-semibold truncate">
                  {isMobileOpen
                    ? 'Sayaçları gizlemek için dokunun'
                    : 'Kalan süre ve hedef netleri gör'}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-tertiary transition-transform duration-300 ${
                isMobileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isMobileOpen && (
            <div
              id="mobile-countdown-content"
              className="mt-2.5 space-y-2 animate-fade-in"
            >
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
