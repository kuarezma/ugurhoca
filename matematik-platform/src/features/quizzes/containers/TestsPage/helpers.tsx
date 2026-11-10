import Image from 'next/image';

import { createLogger } from '@/lib/logger';
import { decodeQuizMediaExplanation } from '@/lib/quiz-media';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';
export const log = createLogger('tests-page');

export type TestsPageProps = {
  initialQuizzes?: Quiz[];
  initialUser?: AppUser | null;
  isHydrated?: boolean;
};

export const hasOptionImage = (question: QuizQuestion, optionIndex: number) =>
  Boolean(question.option_image_urls?.[optionIndex]);

export const normalizeQuizQuestion = (question: QuizQuestion): QuizQuestion => {
  const media = decodeQuizMediaExplanation(question.explanation);
  return {
    ...question,
    explanation: media.explanation,
    option_image_urls: question.option_image_urls || media.option_image_urls,
    question_image_url: question.question_image_url || media.question_image_url,
    distractor_explanations:
      question.distractor_explanations || media.distractor_explanations,
  };
};

export function QuestionImage({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border-default bg-surface-0/40 dark:bg-surface-0/40 p-3">
      <div className="relative mx-auto h-72 w-full max-w-xl">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 40rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}

export function OptionMedia({ alt, src }: { alt: string; src: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border-default bg-surface-0/50 dark:bg-surface-0/50 p-2">
      <div className="relative h-28 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 20rem"
          className="object-contain"
        />
      </div>
    </div>
  );
}
