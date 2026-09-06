'use client';

import { useState, useEffect, useId, useMemo } from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';

interface TopicCoverageStatus {
  hasLecture: boolean;     // Konu Anlatımı (Video / Doküman)
  hasExamples: boolean;    // Çözümlü Örnekler
  hasQuiz: boolean;        // Konu Testi / Quiz
  hasWorksheet: boolean;   // Çalışma Kâğıdı / PDF
}

type GradeCoverageMap = Record<string, TopicCoverageStatus>;
type AllGradesCoverageMap = Record<string, GradeCoverageMap>;

const STORAGE_KEY = 'ugurhoca_curriculum_coverage_matrix_v1';

const GRADE_LABELS: Record<string, string> = {
  '5': '5. Sınıf',
  '6': '6. Sınıf',
  '7': '7. Sınıf',
  '8': '8. Sınıf (LGS)',
  '9': '9. Sınıf',
  '10': '10. Sınıf',
  '11': '11. Sınıf',
  '12': '12. Sınıf / YKS',
};

// Varsayılan kapsam durumu (Mevcut platform içeriğine uygun gerçekçi başlangıç)
function getDefaultCoverageForGrade(grade: string, topics: readonly string[]): GradeCoverageMap {
  const result: GradeCoverageMap = {};
  topics.forEach((topic, idx) => {
    // 8. sınıf ve ilk konularda daha yüksek kapsam
    const isCore = grade === '8' || idx < 3;
    result[topic] = {
      hasLecture: isCore,
      hasExamples: isCore,
      hasQuiz: isCore || idx % 2 === 0,
      hasWorksheet: isCore || idx % 3 === 0,
    };
  });
  return result;
}

interface CurriculumCoverageMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGrade?: string;
  initialGrade?: string;
}

export function CurriculumCoverageMatrixModal({
  isOpen,
  onClose,
  defaultGrade,
  initialGrade,
}: CurriculumCoverageMatrixModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || defaultGrade || '8');
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [coverageData, setCoverageData] = useState<AllGradesCoverageMap>({});

  // LocalStorage'dan yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCoverageData(JSON.parse(saved));
      }
    } catch {
      // sessizce geç
    }
  }, []);

  const saveCoverageData = (data: AllGradesCoverageMap) => {
    setCoverageData(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // sessizce geç
    }
  };

  const topics = useMemo(() => {
    return GRADE_TOPIC_OPTIONS[selectedGrade] || GRADE_TOPIC_OPTIONS['8'] || [];
  }, [selectedGrade]);

  const currentGradeCoverage = useMemo(() => {
    if (coverageData[selectedGrade]) {
      return coverageData[selectedGrade];
    }
    return getDefaultCoverageForGrade(selectedGrade, topics);
  }, [coverageData, selectedGrade, topics]);

  const toggleStatus = (topic: string, key: keyof TopicCoverageStatus) => {
    const gradeMap = { ...currentGradeCoverage };
    const current = gradeMap[topic] || {
      hasLecture: false,
      hasExamples: false,
      hasQuiz: false,
      hasWorksheet: false,
    };

    gradeMap[topic] = {
      ...current,
      [key]: !current[key],
    };

    saveCoverageData({
      ...coverageData,
      [selectedGrade]: gradeMap,
    });
  };

  const handleResetToDefault = () => {
    const defaults = getDefaultCoverageForGrade(selectedGrade, topics);
    saveCoverageData({
      ...coverageData,
      [selectedGrade]: defaults,
    });
  };

  // İstatistikler
  const stats = useMemo(() => {
    const totalChannels = topics.length * 4;
    let completedChannels = 0;
    let completeTopicsCount = 0;
    let incompleteTopicsCount = 0;

    topics.forEach((topic) => {
      const status = currentGradeCoverage[topic] || {
        hasLecture: false,
        hasExamples: false,
        hasQuiz: false,
        hasWorksheet: false,
      };
      let topicComplete = 0;
      if (status.hasLecture) { completedChannels++; topicComplete++; }
      if (status.hasExamples) { completedChannels++; topicComplete++; }
      if (status.hasQuiz) { completedChannels++; topicComplete++; }
      if (status.hasWorksheet) { completedChannels++; topicComplete++; }

      if (topicComplete === 4) completeTopicsCount++;
      else incompleteTopicsCount++;
    });

    const percent = totalChannels > 0 ? Math.round((completedChannels / totalChannels) * 100) : 0;
    const missingChannels = totalChannels - completedChannels;

    return {
      totalTopics: topics.length,
      totalChannels,
      completedChannels,
      missingChannels,
      completeTopicsCount,
      incompleteTopicsCount,
      percent,
    };
  }, [topics, currentGradeCoverage]);

  // Filtrelenmiş konular
  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const status = currentGradeCoverage[topic] || {
        hasLecture: false,
        hasExamples: false,
        hasQuiz: false,
        hasWorksheet: false,
      };
      const isComplete = status.hasLecture && status.hasExamples && status.hasQuiz && status.hasWorksheet;

      if (filterMode === 'complete') return isComplete;
      if (filterMode === 'incomplete') return !isComplete;
      return true;
    });
  }, [topics, currentGradeCoverage, filterMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200 print:p-0 print:static">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none"
      >
        {/* Üst Bar */}
        <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 p-4 sm:p-5 flex flex-col gap-3.5 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Kazanım Kapsam & İçerik Haritası
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hangi kazanımda anlatım, örnek, test ve çalışma kâğıdı bulunduğunu incele, eksikleri tek tıkla tespit et.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Yazdır</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sınıf Seçici & Filtreler */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Kademe:</span>
              {Object.entries(GRADE_LABELS).map(([g, label]) => {
                const active = selectedGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGrade(g)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Filtre:</span>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  filterMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Tümü ({topics.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('incomplete')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1 ${
                  filterMode === 'incomplete'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Eksikli Konular ({stats.incompleteTopicsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('complete')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1 ${
                  filterMode === 'complete'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Tam Hazır ({stats.completeTopicsCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Özet Metrik Paneli */}
        <div className="bg-slate-100/60 dark:bg-slate-950/40 px-5 py-3 border-b border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 text-[11px] block">Genel Kapsam Oranı</span>
              <strong className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                %{stats.percent}
              </strong>
            </div>

            <div className="w-32 sm:w-44 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Kapsanan İçerik</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {stats.completedChannels} / {stats.totalChannels}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[11px] block">Eksik Kanal</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {stats.missingChannels} eksik
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Önerilen varsayılan değerlere döndür"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>

        {/* Tablo İçeriği */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-white/10 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Müfredat Kazanım / Konu Başlığı</th>
                  <th className="py-3 px-3 text-center w-28">🎥 Anlatım</th>
                  <th className="py-3 px-3 text-center w-28">📝 Örnekler</th>
                  <th className="py-3 px-3 text-center w-28">🎯 Konu Testi</th>
                  <th className="py-3 px-3 text-center w-28">📄 Çalışma Kâğıdı</th>
                  <th className="py-3 px-4 text-center w-28">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {filteredTopics.map((topic, index) => {
                  const status = currentGradeCoverage[topic] || {
                    hasLecture: false,
                    hasExamples: false,
                    hasQuiz: false,
                    hasWorksheet: false,
                  };

                  const filledCount =
                    (status.hasLecture ? 1 : 0) +
                    (status.hasExamples ? 1 : 0) +
                    (status.hasQuiz ? 1 : 0) +
                    (status.hasWorksheet ? 1 : 0);

                  const isComplete = filledCount === 4;

                  return (
                    <tr
                      key={topic}
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                        !isComplete ? 'bg-rose-500/[0.02]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {topic}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {GRADE_LABELS[selectedGrade]} MEB Müfredat Alanı
                        </span>
                      </td>

                      {/* 1. Konu Anlatımı */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(topic, 'hasLecture')}
                          title="Tıkla ve durumu değiştir"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                            status.hasLecture
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}
                        >
                          {status.hasLecture ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mevcut</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Eksik</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 2. Çözümlü Örnekler */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(topic, 'hasExamples')}
                          title="Tıkla ve durumu değiştir"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                            status.hasExamples
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}
                        >
                          {status.hasExamples ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mevcut</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Eksik</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 3. Konu Testi */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(topic, 'hasQuiz')}
                          title="Tıkla ve durumu değiştir"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                            status.hasQuiz
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}
                        >
                          {status.hasQuiz ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mevcut</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Eksik</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 4. Çalışma Kâğıdı */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStatus(topic, 'hasWorksheet')}
                          title="Tıkla ve durumu değiştir"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] transition ${
                            status.hasWorksheet
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}
                        >
                          {status.hasWorksheet ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mevcut</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Eksik</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Toplam Durum Rozeti */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isComplete
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : filledCount >= 2
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {filledCount}/4 Kapsam
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Öğretmen İpucu: Durum butonlarına tıklayarak platformdaki eksik içerikleri doğrudan işaretleyebilirsiniz.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
