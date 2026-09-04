'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  BookOpen,
  PenTool,
  RotateCcw,
  Sparkles,
  ListChecks,
} from 'lucide-react';
import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';

type TopicChecklistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialGrade?: string;
};

type TopicStatus = {
  studied: boolean; // Konu Anlatımı
  solved: boolean;  // Soru Çözümü
  reviewed: boolean; // Tekrar
};

type ChecklistData = Record<string, Record<string, TopicStatus>>;

const STORAGE_KEY = 'ugur_hoca_topic_checklist_v1';

const GRADE_LABELS: Record<string, string> = {
  '8': '8. Sınıf (LGS)',
  '12': '12. Sınıf / YKS',
  '11': '11. Sınıf',
  '10': '10. Sınıf',
  '9': '9. Sınıf',
  '7': '7. Sınıf',
  '6': '6. Sınıf',
  '5': '5. Sınıf',
};

export function TopicChecklistModal({
  isOpen,
  onClose,
  initialGrade = '8',
}: TopicChecklistModalProps) {
  const titleId = useId();
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [checklist, setChecklist] = useState<ChecklistData>({});

  // LocalStorage'dan yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Değişiklikleri kaydet
  const saveChecklist = (next: ChecklistData) => {
    setChecklist(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const topics = useMemo(() => {
    return GRADE_TOPIC_OPTIONS[selectedGrade] || GRADE_TOPIC_OPTIONS['8'] || [];
  }, [selectedGrade]);

  const currentGradeData = useMemo(() => {
    return checklist[selectedGrade] || {};
  }, [checklist, selectedGrade]);

  // Tamamlanma yüzdesi
  const stats = useMemo(() => {
    let completedSteps = 0;
    const totalSteps = topics.length * 3;

    for (const topic of topics) {
      const status = currentGradeData[topic];
      if (status?.studied) completedSteps++;
      if (status?.solved) completedSteps++;
      if (status?.reviewed) completedSteps++;
    }

    const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    return { completedSteps, totalSteps, percent };
  }, [topics, currentGradeData]);

  if (!isOpen) return null;

  const handleToggle = (topic: string, field: keyof TopicStatus) => {
    const gradeMap = { ...currentGradeData };
    const currentStatus = gradeMap[topic] || { studied: false, solved: false, reviewed: false };
    const nextStatus = {
      ...currentStatus,
      [field]: !currentStatus[field],
    };

    gradeMap[topic] = nextStatus;

    saveChecklist({
      ...checklist,
      [selectedGrade]: gradeMap,
    });
  };

  const handleResetGrade = () => {
    const next = { ...checklist };
    delete next[selectedGrade];
    saveChecklist(next);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <div
        className="fixed inset-0 -z-10 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        {/* Başlık ve Sınıf Seçimi */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                MEB Matematik Konu Takip Çizelgesi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Müfredat konularını adım adım işaretle, hazırlık sürecini kontrol altında tut.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sınıf Seçici Dropdown */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(GRADE_LABELS).map(([grade, label]) => (
                <option key={grade} value={grade}>
                  {label}
                </option>
              ))}
            </select>

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

        {/* İlerleme Göstergesi Bento Bar */}
        <div className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 sm:px-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>{GRADE_LABELS[selectedGrade]} Müfredat İlerlemesi</span>
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tabular-nums">
              %{stats.percent} Tamamlandı ({stats.completedSteps}/{stats.totalSteps} Adım)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500 rounded-full"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Konu Listesi */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 [scrollbar-width:thin]">
          {topics.map((topic, index) => {
            const status = currentGradeData[topic] || { studied: false, solved: false, reviewed: false };
            const isAllCompleted = status.studied && status.solved && status.reviewed;

            return (
              <div
                key={topic}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                  isAllCompleted
                    ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {index + 1}
                  </span>
                  <span className={`text-sm font-bold ${
                    isAllCompleted ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {topic}
                  </span>
                </div>

                {/* 3 Adımlı Aksiyon Onay Kutuları */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(topic, 'studied')}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      status.studied
                        ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Konu</span>
                    {status.studied && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(topic, 'solved')}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      status.solved
                        ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>Soru (50+)</span>
                    {status.solved && <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(topic, 'reviewed')}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      status.reviewed
                        ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Tekrar</span>
                    {status.reviewed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt Bilgi ve Sıfırla */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-3 text-xs">
          <button
            type="button"
            onClick={handleResetGrade}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Bu Sınıfın Tiklerini Sıfırla
          </button>
          <span className="text-slate-400">
            Veriler tarayıcında güvenle saklanır.
          </span>
        </div>
      </div>
    </div>
  );
}
