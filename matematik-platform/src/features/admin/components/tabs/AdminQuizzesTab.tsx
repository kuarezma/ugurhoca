"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Trash2 } from "lucide-react";
import type { AdminQuiz } from "@/features/admin/types";

type AdminQuizzesTabProps = {
  onAddQuestion: (quiz: AdminQuiz) => Promise<void> | void;
  onDeleteQuiz: (id: string) => void;
  onEditQuiz: (quiz: AdminQuiz) => void;
  quizzes: AdminQuiz[];
};

export default function AdminQuizzesTab({
  onAddQuestion,
  onDeleteQuiz,
  onEditQuiz,
  quizzes,
}: AdminQuizzesTabProps) {
  return (
    <motion.div
      key="quizzes"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Testler</h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Matematik testlerini yönet
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz test yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>{quiz.grade}. Sınıf</span>
                    <span>•</span>
                    <span>{quiz.difficulty}</span>
                    <span>•</span>
                    <span>{quiz.time_limit} dk</span>
                  </div>
                </div>
                {!quiz.is_active && (
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs">
                    Pasif
                  </span>
                )}
              </div>
              {quiz.description && (
                <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>
              )}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onEditQuiz(quiz)}
                  className="flex-1 py-2 bg-slate-700/50 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  Düzenle
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAddQuestion(quiz)}
                  className="flex-1 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors"
                >
                  Soru Ekle
                </motion.button>
                <button
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
