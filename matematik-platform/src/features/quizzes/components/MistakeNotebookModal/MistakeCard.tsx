import {
  CheckCircle2,
  Trash2,
  Sparkles,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { toLocalDateKey } from '@/lib/localDate';
import {
  type SavedMistakeQuestion,
  type MistakeReason,
  MISTAKE_REASON_LABELS,
} from '@/features/quizzes/lib/mistakeStorage';

type MistakeCardProps = {
  item: SavedMistakeQuestion;
  index: number;
  onAdvanceReview: (questionText: string, correct: boolean) => void;
  onToggleMastered: (questionText: string, current: boolean) => void;
  onRemove: (questionText: string) => void;
  onSetReason: (questionText: string, reason?: MistakeReason) => void;
  onAskTeacher: (
    index: number,
    questionText: string,
    quizTitle?: string,
  ) => void;
};

export function MistakeCard({
  item,
  index,
  onAdvanceReview,
  onToggleMastered,
  onRemove,
  onSetReason,
  onAskTeacher,
}: MistakeCardProps) {
  const q = item.question;
  const today = toLocalDateKey();
  const stage = item.reviewStage ?? 0;
  const isDue =
    !item.mastered && (!item.nextReviewDate || item.nextReviewDate <= today);

  const stageMeta = [
    {
      label: '1. Kutu (1 gün)',
      icon: '🌱',
      bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      label: '2. Kutu (3 gün)',
      icon: '🌿',
      bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },
    {
      label: '3. Kutu (7 gün)',
      icon: '🌳',
      bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      label: '4. Kutu (14 gün)',
      icon: '🛡️',
      bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      label: '5. Kutu (30 gün)',
      icon: '💎',
      bg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      label: 'Kalıcı Öğrenildi',
      icon: '🏆',
      bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
  ];
  const currentStage = stageMeta[Math.min(stage, 5)];

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        item.mastered
          ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/15'
          : isDue
            ? 'border-rose-300 dark:border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/5'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-bold">
            {index + 1}
          </span>
          {item.quizTitle && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {item.quizTitle}
            </span>
          )}
          {/* Aralıklı Tekrar Aşama Rozeti */}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${currentStage.bg}`}
            title="Aralıklı Tekrar Aşaması (Leitner Kutusu)"
          >
            <span>{currentStage.icon}</span>
            <span>{currentStage.label}</span>
          </span>

          {isDue && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold animate-pulse">
              🚨 Bugün Tekrarı
            </span>
          )}
          {!isDue && item.nextReviewDate && !item.mastered && (
            <span className="text-[10px] font-medium text-slate-400">
              🗓️ Sonraki: {item.nextReviewDate}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!item.mastered && (
            <>
              <button
                type="button"
                onClick={() => onAdvanceReview(q.question, true)}
                title="Bu soruyu doğru hatırladım, sonraki aralıklı aşamaya ilerlet"
                className="flex h-7 px-2 items-center gap-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Hatırladım</span>
              </button>
              <button
                type="button"
                onClick={() => onAdvanceReview(q.question, false)}
                title="Bu soruda zorlandım, aralıklı tekrarı yarına baştan başlat"
                className="flex h-7 px-2 items-center gap-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Zorlandım</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onToggleMastered(q.question, item.mastered)}
            title={item.mastered ? 'Bekleyene Al' : 'Öğrenildi Olarak İşaretle'}
            className={`flex h-7 px-2.5 items-center gap-1 rounded-lg text-xs font-semibold transition-colors ${
              item.mastered
                ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/15'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{item.mastered ? 'Tekrar Aç' : 'Tamamlandı'}</span>
          </button>

          <button
            type="button"
            onClick={() => onAskTeacher(index, q.question, item.quizTitle)}
            title="Bu soruyu Uğur Hoca'ya sor"
            className="flex h-7 px-2 items-center gap-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hocama Sor</span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(q.question)}
            title="Defterden Sil"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Soru Metni */}
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100 py-1">
        <MathText>{q.question}</MathText>
      </div>

      {/* Seçenekler */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {q.options.map((opt, optIdx) => {
          const isCorrect = optIdx === q.correct_index;
          return (
            <div
              key={optIdx}
              className={`flex items-center gap-2 rounded-xl p-2.5 border ${
                isCorrect
                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold'
                  : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-white/10'
                }`}
              >
                {String.fromCharCode(65 + optIdx)}
              </span>
              <span className="flex-1">
                <MathText>{opt}</MathText>
              </span>
              {isCorrect && (
                <span className="text-[10px] font-bold text-accent-success-ink dark:text-emerald-400">
                  Doğru Cevap
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Kavram Yanılgısı Teşhisi (varsa) */}
      {item.userSelectedOption !== undefined &&
        item.userSelectedOption !== q.correct_index &&
        q.distractor_explanations?.[item.userSelectedOption] && (
          <div className="mt-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 p-3 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
            <div>
              <span className="font-bold block text-rose-700 dark:text-rose-400">
                💡 Kavram Yanılgısı Teşhisi (
                {String.fromCharCode(65 + item.userSelectedOption)} Şıkkı):
              </span>
              <p className="mt-0.5 leading-relaxed text-slate-700 dark:text-slate-300">
                {q.distractor_explanations[item.userSelectedOption]}
              </p>
            </div>
          </div>
        )}

      {/* Çözüm Açıklaması (varsa) */}
      {q.explanation && (
        <div className="mt-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 p-2.5 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold">Çözüm İpucu: </span>
          <MathText>{q.explanation}</MathText>
        </div>
      )}

      {/* Hata Nedeni Etiketleme */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
          Hata Nedeni:
        </span>
        {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map(
          (rKey) => {
            const isSelected = item.reason === rKey;
            const meta = MISTAKE_REASON_LABELS[rKey];
            return (
              <button
                key={rKey}
                type="button"
                onClick={() =>
                  onSetReason(q.question, isSelected ? undefined : rKey)
                }
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-primary shadow-sm font-bold scale-[1.02] text-slate-950 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.shortLabel}</span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
