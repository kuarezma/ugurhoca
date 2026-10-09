'use client';

import { memo } from 'react';
import { Clock, FileText, Play, Printer } from 'lucide-react';
import type { Quiz } from '@/types/quiz';

type QuizListCardProps = {
  quiz: Quiz;
  index: number;
  onStart: (quiz: Quiz) => void | Promise<void>;
  onWorksheetPreview: (quiz: Quiz) => void | Promise<void>;
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Kolay':
      return 'from-green-500 to-emerald-500';
    case 'Orta':
      return 'from-yellow-500 to-orange-500';
    case 'Zor':
      return 'from-red-500 to-pink-500';
    default:
      return 'from-blue-500 to-cyan-500';
  }
};

function QuizListCardInner({
  quiz,
  index,
  onStart,
  onWorksheetPreview,
}: QuizListCardProps) {
  return (
    <div
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`h-1.5 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}`}
      />
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-brand-secondary group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-slate-950 dark:text-slate-950" />
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
              {quiz.grade}. Sınıf
            </span>
          </div>

          <h3 className="font-display text-xl font-black text-primary mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
            {quiz.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mb-6">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-indigo-500" />
              {quiz.time_limit} dk
            </span>
            <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
              {quiz.difficulty}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => onStart(quiz)}
            className="flex-1 py-3 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-950 shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            Teste Başla
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onWorksheetPreview(quiz);
            }}
            className="px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 active:scale-95"
            title="A4 Yazdırılabilir Yaprak Test"
          >
            <Printer className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs hidden sm:inline">Yaprak Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const QuizListCard = memo(QuizListCardInner);
