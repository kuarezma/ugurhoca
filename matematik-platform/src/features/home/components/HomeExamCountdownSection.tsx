'use client';

import { ExamCountdown } from '@/components/ExamCountdown';
import { featuredExams } from '@/lib/examDates';

type HomeExamCountdownSectionProps = {
  isLight: boolean;
};

export function HomeExamCountdownSection({
  isLight,
}: HomeExamCountdownSectionProps) {
  return (
    <section className="defer-section px-4 pt-2 pb-3 sm:py-6">
      <div className="mx-auto grid max-w-6xl gap-2 sm:grid-cols-2">
        {featuredExams
          .filter((exam) => exam.featured)
          .map((exam) => (
            <ExamCountdown key={exam.id} exam={exam} isLight={isLight} />
          ))}
      </div>
    </section>
  );
}
