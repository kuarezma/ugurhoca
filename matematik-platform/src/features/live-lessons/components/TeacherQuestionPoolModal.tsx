'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  HelpCircle,
  CheckCircle2,
  Copy,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  getStudentQuestions,
  updateStudentQuestionStatus,
  deleteStudentQuestion,
  type StudentSubmittedQuestion,
} from '@/features/live-lessons/lib/studentQuestionsStorage';
import Image from 'next/image';

type TeacherQuestionPoolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string;
  isLight?: boolean;
  onProjectQuestion?: (q: StudentSubmittedQuestion) => void;
};

export function TeacherQuestionPoolModal({
  isOpen,
  onClose,
  lessonId,
  isLight = false,
  onProjectQuestion,
}: TeacherQuestionPoolModalProps) {
  const [questions, setQuestions] = useState<StudentSubmittedQuestion[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadQuestions = useCallback(() => {
    setQuestions(getStudentQuestions(lessonId));
  }, [lessonId]);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }

    const handleUpdate = () => {
      loadQuestions();
    };
    window.addEventListener('ugurhoca:student-questions-updated', handleUpdate);
    return () => window.removeEventListener('ugurhoca:student-questions-updated', handleUpdate);
  }, [isOpen, loadQuestions]);

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'pending') return q.status !== 'resolved';
    if (filter === 'resolved') return q.status === 'resolved';
    return true;
  });

  const handleProject = (q: StudentSubmittedQuestion) => {
    // Panoya kopyala
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(`[${q.topic} - ${q.student_name}]: ${q.question_text}`);
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    updateStudentQuestionStatus(q.id, 'projected');
    onProjectQuestion?.(q);
    loadQuestions();
  };

  const handleResolve = (id: string) => {
    updateStudentQuestionStatus(id, 'resolved');
    loadQuestions();
  };

  const handleDelete = (id: string) => {
    deleteStudentQuestion(id);
    loadQuestions();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Öğrenci Soru Havuzu Masası"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl transition-all my-auto max-h-[90vh] flex flex-col ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-slate-100'
        }`}
      >
        {/* Üst Başlık & Filtreler */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-bold">
                  Öğrenci Soru Havuzu Masası
                </h2>
                <span className="rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
                  {questions.length} Soru
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Öğrencilerin derste çözülmesini istediği sorular tek tıkla tahtada.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className={`rounded-xl p-2 transition ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtre Barı */}
        <div
          className={`flex items-center gap-2 px-5 py-2.5 border-b text-xs ${
            isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-white/10'
          }`}
        >
          <span className="text-slate-400 font-semibold">Filtrele:</span>
          {(['all', 'pending', 'resolved'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyenler' : 'Çözülenler'}
            </button>
          ))}
        </div>

        {/* Soru Listesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <HelpCircle className="h-10 w-10 mx-auto opacity-30" />
              <p className="text-sm font-semibold">Henüz bu kategoride soru bulunmuyor.</p>
              <p className="text-xs max-w-sm mx-auto">
                Öğrenciler Canlı Ders sayfasından soru gönderdiklerinde anında burada listelenir.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isResolved = q.status === 'resolved';
              const isProjected = q.status === 'projected';

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isResolved
                      ? 'bg-emerald-950/15 border-emerald-500/25 opacity-75'
                      : isProjected
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-800/60 border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">
                        👤 {q.student_name}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {q.topic}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Kolay'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : q.difficulty === 'Orta'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isResolved ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Çözüldü
                        </span>
                      ) : isProjected ? (
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          Tahtada
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Soru Metni */}
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200 mb-3 whitespace-pre-wrap">
                    {q.question_text}
                  </p>

                  {/* Varsa Görsel */}
                  {q.image_url && (
                    <div className="relative h-32 w-full max-w-sm mb-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                      <Image
                        src={q.image_url}
                        alt="Öğrenci Soru Görseli"
                        fill
                        sizes="20rem"
                        className="object-contain p-2"
                      />
                    </div>
                  )}

                  {/* Aksiyon Butonları */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-400">
                      {new Date(q.created_at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleProject(q)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedId === q.id ? 'Kopyalandı!' : 'Tahtaya Yansıt'}</span>
                      </button>

                      {!isResolved && (
                        <button
                          type="button"
                          onClick={() => handleResolve(q.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Çözüldü</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        title="Havuzdan sil"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
export default TeacherQuestionPoolModal;
