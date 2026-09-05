'use client';

import { useState, useEffect, useId, useMemo, useCallback } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Trash2,
  Play,
  Printer,
  Sparkles,
  RotateCcw,
  Activity,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { QuizQuestion } from '@/types/quiz';
import {
  getSavedMistakes,
  markMistakeMastered,
  removeMistakeFromBank,
  clearAllMistakes,
  updateMistakeReason,
  advanceMistakeReview,
  type SavedMistakeQuestion,
  type MistakeReason,
  MISTAKE_REASON_LABELS,
} from '@/features/quizzes/lib/mistakeStorage';
import { PrintableWorksheetModal } from './PrintableWorksheetModal';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type MistakeNotebookModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartRetakeQuiz?: (questions: QuizQuestion[]) => void;
};

export function MistakeNotebookModal({
  isOpen,
  onClose,
  onStartRetakeQuiz,
}: MistakeNotebookModalProps) {
  const titleId = useId();
  const [mistakes, setMistakes] = useState<SavedMistakeQuestion[]>([]);
  const [filter, setFilter] = useState<'due' | 'pending' | 'mastered' | 'all'>('due');
  const [reasonFilter, setReasonFilter] = useState<MistakeReason | 'all'>('all');
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const reloadMistakes = useCallback(() => {
    const list = getSavedMistakes();
    setMistakes(list);
    // Eğer bugün tekrar edilecek yoksa ve ilk açılışsa bekleyenlere geç
    const today = new Date().toISOString().split('T')[0];
    const dueCount = list.filter((m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today)).length;
    if (dueCount === 0 && filter === 'due') {
      setFilter('pending');
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      reloadMistakes();
    }
  }, [isOpen, reloadMistakes]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = mistakes.length;
    const mastered = mistakes.filter((m) => m.mastered).length;
    const pending = total - mastered;
    const due = mistakes.filter((m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today)).length;
    return { total, mastered, pending, due };
  }, [mistakes]);

  const reasonBreakdown = useMemo(() => {
    const total = mistakes.length;
    if (total === 0) return null;
    const careless = mistakes.filter((m) => m.reason === 'careless').length;
    const concept = mistakes.filter((m) => m.reason === 'concept').length;
    const reading = mistakes.filter((m) => m.reason === 'reading').length;
    const time = mistakes.filter((m) => m.reason === 'time').length;
    const untagged = total - (careless + concept + reading + time);

    const carelessPct = Math.round((careless / total) * 100);
    const conceptPct = Math.round((concept / total) * 100);
    const readingPct = Math.round((reading / total) * 100);
    const timePct = Math.round((time / total) * 100);
    const untaggedPct = Math.max(0, 100 - (carelessPct + conceptPct + readingPct + timePct));

    const tagged = [
      { key: 'careless' as const, count: careless, pct: carelessPct, label: 'İşlem Hatası' },
      { key: 'concept' as const, count: concept, pct: conceptPct, label: 'Kural / Konu Eksikliği' },
      { key: 'reading' as const, count: reading, pct: readingPct, label: 'Soru Kökünü Yanlış Okuma' },
      { key: 'time' as const, count: time, pct: timePct, label: 'Süre Baskısı' },
    ].sort((a, b) => b.count - a.count);

    const dominant = tagged[0].count > 0 ? tagged[0] : null;

    let advice: { title: string; desc: string; icon: string } | null = null;
    if (!dominant || dominant.count === 0) {
      advice = {
        title: 'Kişisel Teşhis İçin Hatalarını Etiketle',
        desc: 'Soruların altındaki butonlarla hatanın nedenini (işlem, kural, okuma, süre) belirle; platform sana özel çalışma reçetesi çıkarsın.',
        icon: '🎯',
      };
    } else if (dominant.key === 'concept') {
      advice = {
        title: 'Öncelik: Konu Kavrama & Formül Pekiştirme',
        desc: 'Hatalarının önemli bölümü kural ve konu eksiğinden kaynaklanıyor. Yeni nesil zor sorulara geçmeden önce formül özet kartlarını tekrar et ve temel kavrama testleri çöz.',
        icon: '📚',
      };
    } else if (dominant.key === 'careless') {
      advice = {
        title: 'Öncelik: İşlem Disiplini & Adım Adım Yazım',
        desc: 'Bilgi eksiğin yok ancak zihinden yapılan işlemlerde hata payı artıyor. Karalama alanını aktif kullan, her işlemi alt alta yaz ve son satırdaki işaret değişimlerini gözden geçir.',
        icon: '✏️',
      };
    } else if (dominant.key === 'reading') {
      advice = {
        title: 'Öncelik: Soru Kökü Odaklanması',
        desc: 'Soruların mantığını anlıyorsun ancak "hangisi olamaz", "kesinlikle", "en az" gibi kritik yönergeler kaçabiliyor. Soru kökünün altını çiz ve ne istendiğini kendi cümlenle özetle.',
        icon: '🔍',
      };
    } else if (dominant.key === 'time') {
      advice = {
        title: 'Öncelik: Turlama Tekniği & Zaman Yönetimi',
        desc: 'Süre baskısı hata yapmana yol açıyor. Takıldığın soruda 2 dakikayı geçme; işaret koyup geçerek önce rahat yapabildiğin soruları cebe at, zor sorulara ikinci turda dön.',
        icon: '⏱️',
      };
    }

    return {
      total,
      careless,
      concept,
      reading,
      time,
      untagged,
      carelessPct,
      conceptPct,
      readingPct,
      timePct,
      untaggedPct,
      dominant,
      advice,
    };
  }, [mistakes]);

  const filteredList = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return mistakes.filter((m) => {
      if (filter === 'due') {
        if (m.mastered) return false;
        if (m.nextReviewDate && m.nextReviewDate > today) return false;
      }
      if (filter === 'pending' && m.mastered) return false;
      if (filter === 'mastered' && !m.mastered) return false;
      if (reasonFilter !== 'all' && m.reason !== reasonFilter) return false;
      return true;
    });
  }, [mistakes, filter, reasonFilter]);

  const printableQuestions = useMemo<QuizQuestion[]>(() => {
    return filteredList.map((m) => m.question);
  }, [filteredList]);

  if (!isOpen) return null;

  const handleSetReason = (questionText: string, reason?: MistakeReason) => {
    updateMistakeReason(questionText, reason);
    reloadMistakes();
  };

  const handleToggleMastered = (questionText: string, current: boolean) => {
    markMistakeMastered(questionText, !current);
    reloadMistakes();
  };

  const handleRemove = (questionText: string) => {
    removeMistakeFromBank(questionText);
    reloadMistakes();
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm hata defterini temizlemek istediğine emin misin?')) {
      clearAllMistakes();
      reloadMistakes();
    }
  };

  const handleAdvanceReview = (questionText: string, correct: boolean) => {
    advanceMistakeReview(questionText, correct);
    reloadMistakes();
  };

  const handleStartPractice = (count?: number, dueOnly = false) => {
    const today = new Date().toISOString().split('T')[0];
    let pool = dueOnly
      ? mistakes.filter((m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today))
      : filter === 'due'
      ? mistakes.filter((m) => !m.mastered && (!m.nextReviewDate || m.nextReviewDate <= today))
      : filter === 'all'
      ? mistakes
      : filter === 'pending'
      ? mistakes.filter((m) => !m.mastered)
      : mistakes.filter((m) => m.mastered);

    // Önceliklendirme: Kazanım açığı (concept) ve dikkat hataları (attention) en başa
    pool = [...pool].sort((a, b) => {
      if (a.reason === 'concept' && b.reason !== 'concept') return -1;
      if (b.reason === 'concept' && a.reason !== 'concept') return 1;
      return 0;
    });

    const questionsToSolve = (count ? pool.slice(0, count) : pool).map((m) => m.question);

    if (!questionsToSolve.length) return;
    if (onStartRetakeQuiz) {
      onStartRetakeQuiz(questionsToSolve);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 -z-10 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        {/* Başlık */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Akıllı Hata Defterim 📓
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aralıklı tekrar algoritmasıyla (1-3-7 gün) yanlış yaptığın soruları kalıcı öğrenmeye dönüştür.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stats.due > 0 && (
              <button
                type="button"
                onClick={() => handleStartPractice(undefined, true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5 fill-white" />
                <span>Bugünkü Tekrarları Çöz ({stats.due})</span>
              </button>
            )}

            {stats.pending > 0 ? (
              <>
                {stats.pending > 5 && (
                  <button
                    type="button"
                    onClick={() => handleStartPractice(5)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm transition hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[0.98]"
                  >
                    <Play className="h-3 w-3 fill-amber-700 dark:fill-amber-300 text-amber-700 dark:text-amber-300" />
                    <span>5 Soruluk Telafi</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleStartPractice()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white/10 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 dark:hover:bg-white/20 active:scale-[0.98]"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Hatalarımdan Test Çöz ({stats.pending})</span>
                </button>
              </>
            ) : null}

            {filteredList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsWorksheetOpen(true)}
                title="Hatalarından A4 Yaprak Test Oluştur & Yazdır"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="hidden sm:inline">A4 Yaprak Test / PDF</span>
                <span className="sm:hidden">Yazdır / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sayaç ve Filtre Şeridi */}
        <div className="flex flex-col gap-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('due')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'due'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                🧠 Bugün Tekrar ({stats.due})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Bekleyen ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setFilter('mastered')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'mastered'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Öğrenilenler ({stats.mastered})
              </button>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Tümü ({stats.total})
              </button>
            </div>

            {stats.total > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-400 hover:text-red-500 transition-colors font-medium text-[11px]"
              >
                Defteri Boşalt
              </button>
            )}
          </div>

          {/* Hata Nedeni Filtresi */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Neden Filtresi:</span>
            <button
              type="button"
              onClick={() => setReasonFilter('all')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                reasonFilter === 'all'
                  ? 'bg-slate-800 dark:bg-white/20 text-white font-bold'
                  : 'text-slate-500 hover:bg-slate-200/60 dark:hover:bg-white/5'
              }`}
            >
              Tümü
            </button>
            {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map((rKey) => {
              const meta = MISTAKE_REASON_LABELS[rKey];
              const count = mistakes.filter((m) => m.reason === rKey).length;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setReasonFilter(reasonFilter === rKey ? 'all' : rKey)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-all ${
                    reasonFilter === rKey
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.shortLabel} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kök Neden Analizi & Teşhis Çubuğu */}
        {mistakes.length > 0 && reasonBreakdown && (
          <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 px-5 py-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Activity className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Kök Neden Analiz Çubuğu</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {reasonBreakdown.total} kayıtlı hatanın dağılımı
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div
                role="progressbar"
                aria-label="Hata Kök Neden Dağılımı"
                className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 p-0.5 gap-0.5"
              >
                {reasonBreakdown.carelessPct > 0 && (
                  <div
                    style={{ width: `${reasonBreakdown.carelessPct}%` }}
                    className="h-full rounded-full bg-rose-500 transition-all"
                    title={`İşlem Hatası: %${reasonBreakdown.carelessPct} (${reasonBreakdown.careless} soru)`}
                  />
                )}
                {reasonBreakdown.conceptPct > 0 && (
                  <div
                    style={{ width: `${reasonBreakdown.conceptPct}%` }}
                    className="h-full rounded-full bg-amber-500 transition-all"
                    title={`Kural / Konu Eksikliği: %${reasonBreakdown.conceptPct} (${reasonBreakdown.concept} soru)`}
                  />
                )}
                {reasonBreakdown.readingPct > 0 && (
                  <div
                    style={{ width: `${reasonBreakdown.readingPct}%` }}
                    className="h-full rounded-full bg-sky-500 transition-all"
                    title={`Soru Kökünü Yanlış Okuma: %${reasonBreakdown.readingPct} (${reasonBreakdown.reading} soru)`}
                  />
                )}
                {reasonBreakdown.timePct > 0 && (
                  <div
                    style={{ width: `${reasonBreakdown.timePct}%` }}
                    className="h-full rounded-full bg-purple-500 transition-all"
                    title={`Süre Baskısı: %${reasonBreakdown.timePct} (${reasonBreakdown.time} soru)`}
                  />
                )}
                {reasonBreakdown.untaggedPct > 0 && (
                  <div
                    style={{ width: `${reasonBreakdown.untaggedPct}%` }}
                    className="h-full rounded-full bg-slate-400/40 transition-all"
                    title={`Etiketsiz: %${reasonBreakdown.untaggedPct} (${reasonBreakdown.untagged} soru)`}
                  />
                )}
              </div>

              {/* Etiket Dağılım Rozetleri */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  İşlem (%{reasonBreakdown.carelessPct})
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Konu/Kural (%{reasonBreakdown.conceptPct})
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Okuma (%{reasonBreakdown.readingPct})
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Süre (%{reasonBreakdown.timePct})
                </span>
                {reasonBreakdown.untagged > 0 && (
                  <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-400/40" />
                    Etiketsiz ({reasonBreakdown.untagged})
                  </span>
                )}
              </div>

              {/* Pedagojik Reçete Kartı */}
              {reasonBreakdown.advice && (
                <div className="mt-1 flex items-start gap-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/30 p-2.5 text-xs">
                  <span className="text-base shrink-0 select-none">{reasonBreakdown.advice.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-indigo-950 dark:text-indigo-200">
                      {reasonBreakdown.advice.title}
                    </p>
                    <p className="mt-0.5 text-indigo-900/80 dark:text-indigo-300/80 text-[11px] leading-relaxed">
                      {reasonBreakdown.advice.desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Soru Listesi (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 [scrollbar-width:thin]">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-200">
                {filter === 'pending' ? 'Harika! Tekrar bekleyen hiç yanlış soru yok.' : 'Henüz bu kategoride soru bulunmuyor.'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Test çözerken yanlış yaptığın ya da boş bıraktığın sorular burada güvenle birikir ve dilediğin zaman pratik yapabilirsin.
              </p>
            </div>
          ) : (
            filteredList.map((item, index) => {
              const q = item.question;
              const today = new Date().toISOString().split('T')[0];
              const stage = item.reviewStage ?? 0;
              const isDue = !item.mastered && (!item.nextReviewDate || item.nextReviewDate <= today);

              const stageMeta = [
                { label: '1. Aşama (1 gün)', icon: '🌱', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
                { label: '2. Aşama (3 gün)', icon: '🌿', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
                { label: '3. Aşama (7 gün)', icon: '🌳', bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
                { label: 'Kalıcı Öğrenildi', icon: '🏆', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
              ];
              const currentStage = stageMeta[Math.min(stage, 3)];

              return (
                <div
                  key={item.id || index}
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
                            onClick={() => handleAdvanceReview(q.question, true)}
                            title="Bu soruyu doğru hatırladım, sonraki aralıklı aşamaya ilerlet"
                            className="flex h-7 px-2 items-center gap-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Hatırladım</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvanceReview(q.question, false)}
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
                        onClick={() => handleToggleMastered(q.question, item.mastered)}
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
                        onClick={() => handleRemove(q.question)}
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
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">
                            <MathText>{opt}</MathText>
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Doğru Cevap
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

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
                    {(['careless', 'concept', 'reading', 'time'] as MistakeReason[]).map((rKey) => {
                      const isSelected = item.reason === rKey;
                      const meta = MISTAKE_REASON_LABELS[rKey];
                      return (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => handleSetReason(q.question, isSelected ? undefined : rKey)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.02]'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isWorksheetOpen && (
        <PrintableWorksheetModal
          isOpen={isWorksheetOpen}
          onClose={() => setIsWorksheetOpen(false)}
          quiz={{
            id: 'hata-defteri-ozel-test',
            title: 'Hata Defteri Özel Çalışma Testi',
            grade: 8,
            time_limit: Math.max(10, printableQuestions.length * 3),
            difficulty: 'Orta',
            description: 'Akıllı hata defterindeki sorulardan derlenmiş özel yaprak test.',
            is_active: true,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          }}
          questions={printableQuestions}
        />
      )}
    </div>
  );
}
