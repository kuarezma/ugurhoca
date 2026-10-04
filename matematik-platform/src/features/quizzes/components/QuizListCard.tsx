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
      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`h-1.5 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}`}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white dark:text-white" />
          </div>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-white/10 text-slate-300 border border-white/10">
            {quiz.grade}. Sınıf
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
          {quiz.title}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
          {quiz.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            {quiz.time_limit} dk
          </span>
          <span className="capitalize">{quiz.difficulty}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onStart(quiz)}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            Teste Başla
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onWorksheetPreview(quiz);
            }}
            className="px-3.5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            title="A4 Yazdırılabilir Yaprak Test"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="text-xs hidden sm:inline">Yaprak Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const QuizListCard = memo(QuizListCardInner);
