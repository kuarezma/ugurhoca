'use client';

import { useState, useId, useMemo } from 'react';
import {
  X,
  BarChart3,
  Sparkles,
  TrendingUp,
  Filter,
  Lightbulb,
  Award,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  EXAM_TOPIC_WEIGHT_DATA,
  YIELD_LEVEL_META,
  type YieldLevel,
} from '../data/examTopicWeightData';

type ExamTopicWeightMatrixModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialExam?: 'lgs' | 'yks_tyt' | 'yks_ayt';
};

export function ExamTopicWeightMatrixModal({
  isOpen,
  onClose,
  initialExam = 'lgs',
}: ExamTopicWeightMatrixModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [selectedExam, setSelectedExam] = useState<'lgs' | 'yks_tyt' | 'yks_ayt'>(initialExam);
  const [selectedYield, setSelectedYield] = useState<YieldLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'avg' | 'alpha'>('avg');

  const currentCategory = useMemo(() => {
    return (
      EXAM_TOPIC_WEIGHT_DATA.find((c) => c.id === selectedExam) ||
      EXAM_TOPIC_WEIGHT_DATA[0]
    );
  }, [selectedExam]);

  const filteredTopics = useMemo(() => {
    let list = [...currentCategory.topics];
    if (selectedYield !== 'all') {
      list = list.filter((t) => t.yieldLevel === selectedYield);
    }
    if (sortBy === 'avg') {
      list.sort((a, b) => b.avgQuestions - a.avgQuestions);
    } else {
      list.sort((a, b) => a.topicName.localeCompare(b.topicName, 'tr'));
    }
    return list;
  }, [currentCategory, selectedYield, sortBy]);

  const totalTopics = currentCategory.topics.length;
  const criticalCount = currentCategory.topics.filter((t) => t.yieldLevel === 'critical').length;
  const quickWinCount = currentCategory.topics.filter((t) => t.yieldLevel === 'quick_win').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        {/* Başlık */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                MEB & ÖSYM Çıkmış Soru Dağılım Matrisi 📊
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Son 5 yılın soru ağırlıkları, kritik konular ve stratejik getiri rehberi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="self-end sm:self-center flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sınav Seçim Sekmeleri */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-5 py-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {EXAM_TOPIC_WEIGHT_DATA.map((exam) => {
              const active = selectedExam === exam.id;
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExam(exam.id);
                    setSelectedYield('all');
                  }}
                  className={`rounded-xl px-3.5 py-1.5 font-bold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15'
                  }`}
                >
                  {exam.shortTitle}
                </button>
              );
            })}
          </div>

          {/* Hızlı İstatistik Rozeti */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {criticalCount} Kritik Konu
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <Award className="h-3.5 w-3.5" />
              {quickWinCount} Hızlı Net
            </span>
          </div>
        </div>

        {/* Filtre ve Sıralama Çubuğu */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 px-5 py-2.5 bg-white dark:bg-slate-900 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1 inline-flex items-center gap-1">
              <Filter className="h-3 w-3" /> Getiri:
            </span>
            <button
              type="button"
              onClick={() => setSelectedYield('all')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                selectedYield === 'all'
                  ? 'bg-slate-800 dark:bg-white/20 text-white font-bold'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tümü ({totalTopics})
            </button>
            {(['critical', 'guaranteed', 'quick_win', 'high'] as YieldLevel[]).map((level) => {
              const meta = YIELD_LEVEL_META[level];
              const count = currentCategory.topics.filter((t) => t.yieldLevel === level).length;
              const active = selectedYield === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedYield(active ? 'all' : level)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium border transition-all ${
                    active
                      ? 'border-indigo-500 bg-indigo-500 text-white font-bold'
                      : 'border-transparent ' + meta.badgeClass
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                  <span>{meta.label} ({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Sırala:</span>
            <button
              type="button"
              onClick={() => setSortBy('avg')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                sortBy === 'avg'
                  ? 'bg-slate-800 dark:bg-white/20 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Soru Sayısına Göre
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                sortBy === 'alpha'
                  ? 'bg-slate-800 dark:bg-white/20 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>

        {/* Stratejik Tavsiye Şeridi */}
        <div className="border-b border-indigo-100 dark:border-indigo-500/10 bg-indigo-50/60 dark:bg-indigo-950/30 px-5 py-2.5">
          <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500" />
            <p className="leading-relaxed">
              <strong className="font-bold">Uğur Hoca Stratejisi:</strong> Önce yeşil (hızlı net) ve sarı (garanti soru) konuları bitirerek taban puanını sabitle; ardından kırmızı (kritik ağırlıklı 3+ soru) konularla dereceye odaklan!
            </p>
          </div>
        </div>

        {/* Konu Listesi ve Matris Tablosu (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 [scrollbar-width:thin]">
          {filteredTopics.map((topic, index) => {
            const yieldMeta = YIELD_LEVEL_META[topic.yieldLevel];
            return (
              <div
                key={topic.id}
                className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-800/50 p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {topic.topicName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${yieldMeta.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${yieldMeta.dotColor}`} />
                          {yieldMeta.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Ort. <strong className="text-slate-800 dark:text-slate-200">{topic.avgQuestions}</strong> soru/yıl
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Yıl Çıkmış Soru Dağılım Çizelgesi */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-50 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                    {(['2021', '2022', '2023', '2024', '2025'] as const).map((year) => {
                      const count = topic.years[year];
                      return (
                        <div
                          key={year}
                          className="flex flex-col items-center justify-center px-2 py-1 rounded-lg bg-white dark:bg-white/5 min-w-[34px]"
                        >
                          <span className="text-[10px] text-slate-400 font-medium">{year}</span>
                          <span
                            className={`text-xs font-black ${
                              count >= 3
                                ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                                : count > 0
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stratejik Taktik Notu */}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 px-3 py-2 text-xs">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {topic.tacticalNote}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
