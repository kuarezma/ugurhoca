'use client';

import { useMemo } from 'react';
import {
  Timer,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Flag,
} from 'lucide-react';
import type { QuizQuestion } from '@/types/quiz';

export type QuestionTimeRecord = {
  questionIndex: number;
  seconds: number;
  isCorrect?: boolean;
  isAnswered?: boolean;
};

type QuizPacingCoachProps = {
  mode: 'live' | 'summary';
  // Canlı mod props
  currentQuestionIndex?: number;
  questionElapsedSeconds?: number;
  recommendedSecondsPerQuestion?: number;
  onFlagCurrentQuestion?: () => void;
  // Özet mod props
  questionTimes?: Record<number, number>;
  questions?: QuizQuestion[];
  answers?: Record<number, number>;
  totalSecondsSpent?: number;
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} sn`;
  return `${m} dk ${s > 0 ? `${s} sn` : ''}`.trim();
}

export function QuizPacingCoach({
  mode,
  questionElapsedSeconds = 0,
  recommendedSecondsPerQuestion = 120, // LGS / YKS standart 2 dakika (120 saniye)
  onFlagCurrentQuestion,
  questionTimes = {},
  questions = [],
  answers = {},
  totalSecondsSpent = 0,
}: QuizPacingCoachProps) {
  // ÖZET MOD İstatistikleri (Tüm hooklar en üstte çağrılır)
  const stats = useMemo(() => {
    if (mode !== 'summary') {
      return {
        advice: '',
        adviceType: 'good' as const,
        avgSeconds: 0,
        balancedCount: 0,
        fastCount: 0,
        records: [],
        slowCount: 0,
        topSlowQuestions: [],
      };
    }

    const totalQ = questions.length || 1;
    const records: QuestionTimeRecord[] = questions.map((q, idx) => {
      const time = questionTimes[idx] || 0;
      const userAns = answers[idx];
      const isAnswered = userAns !== undefined;
      const isCorrect = isAnswered && userAns === q.correct_index;
      return { questionIndex: idx, seconds: time, isCorrect, isAnswered };
    });

    // En çok vakit harcanan 3 soru
    const sortedByTime = [...records].sort((a, b) => b.seconds - a.seconds);
    const topSlowQuestions = sortedByTime.slice(0, 3);

    // Hızlı (<60s), Dengeli (60-120s), Yavaş (>120s)
    const fastCount = records.filter((r) => r.seconds > 0 && r.seconds < 60).length;
    const balancedCount = records.filter((r) => r.seconds >= 60 && r.seconds <= 130).length;
    const slowCount = records.filter((r) => r.seconds > 130).length;

    const avgSeconds = totalSecondsSpent > 0 ? Math.round(totalSecondsSpent / totalQ) : 0;

    let advice = 'Harika tempo yönetimi! Süreyi sınav boyunca son derece dengeli kullandın.';
    let adviceType: 'good' | 'warning' | 'danger' = 'good';

    if (slowCount >= 3) {
      advice =
        'Bazı sorularda 2 dakikanın üzerinde fazla oyalandın. LGS ve YKS\'de turlama tekniğini uygulayarak zorlandığın soruları sona bırakmak netini artıracaktır.';
      adviceType = 'danger';
    } else if (slowCount >= 1) {
      advice =
        'Genel tempon iyi ancak birkaç soruda süre uzamış. Çözüm yolu hemen görünmüyorsa soruya bayrak koyup devam etmeyi alışkanlık haline getirebilirsin.';
      adviceType = 'warning';
    }

    return {
      advice,
      adviceType,
      avgSeconds,
      balancedCount,
      fastCount,
      records,
      slowCount,
      topSlowQuestions,
    };
  }, [mode, questions, questionTimes, answers, totalSecondsSpent]);

  // CANLI MOD: Sınav Çözülürken Anlık Tempo Uyarısı
  if (mode === 'live') {
    const isWarning =
      questionElapsedSeconds >= recommendedSecondsPerQuestion * 0.8 &&
      questionElapsedSeconds < recommendedSecondsPerQuestion * 1.25;
    const isDanger = questionElapsedSeconds >= recommendedSecondsPerQuestion * 1.25;

    let statusText = 'Normal Tempo';
    let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

    if (isDanger) {
      statusText = 'Turlama Önerisi!';
      statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    } else if (isWarning) {
      statusText = 'Süreye Dikkat';
      statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }

    return (
      <div className="flex items-center gap-2">
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${statusBadge}`}
          title={`Bu soruda geçen süre: ${formatDuration(questionElapsedSeconds)} (Önerilen: ~${formatDuration(recommendedSecondsPerQuestion)})`}
        >
          <Timer className="h-3.5 w-3.5" />
          <span className="font-mono">{formatDuration(questionElapsedSeconds)}</span>
          <span className="hidden sm:inline text-[11px] font-bold">({statusText})</span>
        </div>

        {isDanger && onFlagCurrentQuestion && (
          <button
            type="button"
            onClick={onFlagCurrentQuestion}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition shadow-sm"
            title="Turlama tekniği: Bu soruyu işaretleyip sonraki soruya geç"
          >
            <Flag className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">Bayrakla & Geç</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5 text-left">
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-white">
              Sınav Tempo Koçu & Soru Süre Analizi
            </h3>
            <p className="text-[11px] text-slate-400">
              LGS ve YKS taktiği: Soru başına harcanan süre ve turlama analizi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
          <Clock className="h-3.5 w-3.5" />
          <span>Ortalama: {formatDuration(stats.avgSeconds)} / soru</span>
        </div>
      </div>

      {/* Tempo Dağılım Çubukları */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="text-lg font-extrabold text-emerald-300 font-mono">{stats.fastCount}</div>
          <div className="text-[11px] font-semibold text-emerald-200">Hızlı Çözülen</div>
          <div className="text-[10px] text-emerald-400/80">&lt; 1 dakika</div>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3">
          <div className="text-lg font-extrabold text-cyan-300 font-mono">{stats.balancedCount}</div>
          <div className="text-[11px] font-semibold text-cyan-200">İdeal Dengeli</div>
          <div className="text-[10px] text-cyan-400/80">1 - 2 dakika</div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="text-lg font-extrabold text-amber-300 font-mono">{stats.slowCount}</div>
          <div className="text-[11px] font-semibold text-amber-200">Süresi Uzayan</div>
          <div className="text-[10px] text-amber-400/80">&gt; 2 dakika</div>
        </div>
      </div>

      {/* En Çok Vakit Harcanan Sorular */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-indigo-400" />
          <span>En Çok Vakit Harcanan Sorular:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {stats.topSlowQuestions.map((q) => (
            <div
              key={q.questionIndex}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Soru {q.questionIndex + 1}</span>
                {q.isCorrect ? (
                  <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 font-semibold">
                    Doğru
                  </span>
                ) : q.isAnswered ? (
                  <span className="rounded bg-rose-500/20 text-rose-300 text-[10px] px-1.5 py-0.5 font-semibold">
                    Yanlış
                  </span>
                ) : (
                  <span className="rounded bg-slate-500/20 text-slate-300 text-[10px] px-1.5 py-0.5 font-semibold">
                    Boş
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-amber-300">
                {formatDuration(q.seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tüm Soruların Tempo Şeridi (Pacing Strip Heatmap) */}
      {stats.records.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Soru Bazlı Tempo Şeridi:</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              Yeşil: Hızlı · Mavi: Dengeli · Kırmızı: Uzayan
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1.5">
            {stats.records.map((r) => {
              const isSlow = r.seconds > 130;
              const isWarning = r.seconds > 90 && r.seconds <= 130;
              const isFast = r.seconds > 0 && r.seconds <= 90;

              const borderBg = isSlow
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : isWarning
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : isFast
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/40 border-white/5 text-slate-400';

              return (
                <div
                  key={r.questionIndex}
                  title={`Soru ${r.questionIndex + 1}: ${formatDuration(r.seconds)} (${
                    r.isCorrect ? 'Doğru' : r.isAnswered ? 'Yanlış' : 'Boş'
                  })`}
                  className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition hover:scale-105 cursor-default ${borderBg}`}
                >
                  <span className="text-[10px] font-bold">S{r.questionIndex + 1}</span>
                  <span className="text-[9px] font-mono leading-none mt-0.5">
                    {r.seconds > 0 ? formatDuration(r.seconds) : '-'}
                  </span>
                  <span className="text-[9px] font-bold mt-0.5">
                    {r.isCorrect ? '✓' : r.isAnswered ? '✕' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pedagojik Koç Tavsiyesi */}
      <div
        className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs leading-relaxed ${
          stats.adviceType === 'danger'
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            : stats.adviceType === 'warning'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
        }`}
      >
        {stats.adviceType === 'good' ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        )}
        <div>
          <div className="font-bold mb-0.5">Tempo Koçu Notu:</div>
          <p>{stats.advice}</p>
        </div>
      </div>
    </div>
  );
}
