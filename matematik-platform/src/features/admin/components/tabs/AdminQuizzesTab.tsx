'use client';

import { CheckCircle2, Trash2, Printer } from 'lucide-react';
import type { AdminQuiz } from '@/features/admin/types';

type AdminQuizzesTabProps = {
  onAddQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onDeleteQuiz: (id: string) => void;
  onEditQuiz: (quiz: AdminQuiz) => void;
  onPrintWorksheet?: (quiz: AdminQuiz) => void;
  quizzes: AdminQuiz[];
};

export default function AdminQuizzesTab({
  onAddQuestion,
  onDeleteQuiz,
  onEditQuiz,
  onPrintWorksheet,
  quizzes,
}: AdminQuizzesTabProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Testler</h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Matematik testlerini yönet
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center border border-white/10">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz test yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className="glass rounded-2xl p-4 sm:p-6 animate-slide-up border border-white/10 hover:border-white/20 transition-all duration-300 card-hover flex flex-col justify-between"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug">
                      {quiz.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <span className="font-semibold text-cyan-300">{quiz.grade}. Sınıf</span>
                      <span>•</span>
                      <span>{quiz.difficulty}</span>
                      <span>•</span>
                      <span>{quiz.time_limit} dk</span>
                    </div>
                  </div>
                  {quiz.is_active ? (
                    <span className="shrink-0 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 rounded-full text-xs font-semibold">
                      Aktif
                    </span>
                  ) : (
                    <span className="shrink-0 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/25 text-amber-300 rounded-full text-xs font-semibold">
                      Pasif
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-slate-400 text-xs sm:text-sm mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => onEditQuiz(quiz)}
                  className="flex-1 py-2 px-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onAddQuestion(quiz)}
                  className="flex-1 py-2 px-3 bg-brand-primary/20 border border-brand-primary/30 text-violet-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-brand-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Soru Ekle
                </button>
                {onPrintWorksheet && (
                  <button
                    type="button"
                    onClick={() => onPrintWorksheet(quiz)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                    title="A4 Yaprak Test Yazdır / İndir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
