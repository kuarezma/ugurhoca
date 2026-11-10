'use client';

import { useState, useId, useMemo, useCallback, useEffect } from 'react';
import { Calculator, Printer, X } from 'lucide-react';
import { applyAnswerChange } from '@/lib/examInputs';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import {
  getSavedExamTrials,
  saveExamTrial,
  deleteExamTrial,
  type SavedExamTrial,
} from '@/lib/examHistoryStorage';
import {
  calculateLgsScore,
  calculateYksScoreTable,
  createInitialLgsInputs,
  createInitialYksInputs,
  lgsSubjects,
  type LgsInputs,
  type LgsSubjectKey,
  type YksInputs,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';

import {
  LGS_TARGET_PRESETS,
  YKS_TARGET_PRESETS,
  type LgsResultData,
  type LgsGapAnalysis,
  type YksGapAnalysis,
} from './ExamScoreCalculatorModal/types';
import { PrintReportSection } from './ExamScoreCalculatorModal/PrintReportSection';
import { LgsCalculatorTab } from './ExamScoreCalculatorModal/LgsCalculatorTab';
import { YksCalculatorTab } from './ExamScoreCalculatorModal/YksCalculatorTab';
import { ExamTrialHistorySection } from './ExamScoreCalculatorModal/ExamTrialHistorySection';

export { LGS_TARGET_PRESETS, YKS_TARGET_PRESETS };

type ExamScoreCalculatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'lgs' | 'yks';
};

export function ExamScoreCalculatorModal({
  isOpen,
  onClose,
  initialTab = 'lgs',
}: ExamScoreCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'lgs' | 'yks'>(initialTab);
  const titleId = useId();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // LGS State
  const [lgsInputs, setLgsInputs] = useState<LgsInputs>(createInitialLgsInputs);

  // YKS State
  const [yksInputs, setYksInputs] = useState<YksInputs>(createInitialYksInputs);
  const [diplomaScore, setDiplomaScore] = useState<number>(85);
  const [selectedYksType, setSelectedYksType] = useState<YksScoreType>('SAY');

  // Deneme Takibi & Hedef Simülatörü State
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [savedTrials, setSavedTrials] = useState<SavedExamTrial[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedLgsTarget, setSelectedLgsTarget] = useState(
    LGS_TARGET_PRESETS[1].name,
  );
  const [selectedYksTarget, setSelectedYksTarget] = useState(
    YKS_TARGET_PRESETS[0].name,
  );

  const reloadTrials = useCallback(() => {
    setSavedTrials(getSavedExamTrials(activeTab));
  }, [activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    reloadTrials();
    window.addEventListener('ugurhoca:exam-trials-updated', reloadTrials);
    window.addEventListener('storage', reloadTrials);
    return () => {
      window.removeEventListener('ugurhoca:exam-trials-updated', reloadTrials);
      window.removeEventListener('storage', reloadTrials);
    };
  }, [isOpen, reloadTrials]);

  // LGS Calculations
  const lgsResult: LgsResultData = useMemo(() => {
    const lgsCalc = calculateLgsScore(lgsInputs);
    const score = lgsCalc.estimatedScore;
    let totalNet = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    for (const sub of lgsSubjects) {
      const input = lgsInputs[sub.key] || { correct: 0, wrong: 0 };
      const net = Math.max(0, input.correct - input.wrong / 3);
      totalNet += net;
      totalCorrect += input.correct;
      totalWrong += input.wrong;
    }

    let estimatedPercentile = '—';
    let targetBand = 'Genel Lise / Mesleki';
    if (score >= 480) {
      estimatedPercentile = '%0.1 - %0.5';
      targetBand = 'Seçkin Fen Liseleri (Galatasaray, Kabataş, Ankara Fen)';
    } else if (score >= 450) {
      estimatedPercentile = '%0.6 - %2.0';
      targetBand = 'Nitelikli Fen & Sosyal Bilimler Liseleri';
    } else if (score >= 400) {
      estimatedPercentile = '%2.1 - %6.0';
      targetBand = 'Köklü Anadolu Liseleri';
    } else if (score >= 350) {
      estimatedPercentile = '%6.1 - %14.0';
      targetBand = 'Proje Anadolu & İmam Hatip Liseleri';
    } else if (score >= 300) {
      estimatedPercentile = '%14.1 - %30.0';
      targetBand = 'Sınavla Alan Anadolu Liseleri';
    }

    return {
      score,
      totalNet: Number(totalNet.toFixed(2)),
      totalCorrect,
      totalWrong,
      estimatedPercentile,
      targetBand,
    };
  }, [lgsInputs]);

  // YKS Calculations
  const yksResult = useMemo(() => {
    const table = calculateYksScoreTable(yksInputs, diplomaScore);
    const activeRow = table.rows.find((r) => r.scoreType === selectedYksType) ||
      table.rows[0] || {
        scoreType: 'SAY' as YksScoreType,
        rawScore: 0,
        placementScore: 0,
        rawRank: 0,
        placementRank: 0,
      };

    const tytMat = Math.max(
      0,
      (yksInputs.tytMatematik?.correct || 0) -
        (yksInputs.tytMatematik?.wrong || 0) / 4,
    );
    const aytMat = Math.max(
      0,
      (yksInputs.aytMatematik?.correct || 0) -
        (yksInputs.aytMatematik?.wrong || 0) / 4,
    );

    let tytNet = 0;
    let aytNet = 0;
    for (const key of Object.keys(yksInputs) as YksSubjectKey[]) {
      const inp = yksInputs[key];
      if (!inp) continue;
      const net = Math.max(0, inp.correct - inp.wrong / 4);
      if (key.startsWith('tyt')) {
        tytNet += net;
      } else {
        aytNet += net;
      }
    }

    return {
      rows: table.rows,
      activeRow,
      tytMatNet: Number(tytMat.toFixed(1)),
      aytMatNet: Number(aytMat.toFixed(1)),
      tytNet: Number(tytNet.toFixed(1)),
      aytNet: Number(aytNet.toFixed(1)),
    };
  }, [yksInputs, diplomaScore, selectedYksType]);

  // Hedef Lise Gap Analizi
  const lgsGapAnalysis: LgsGapAnalysis = useMemo(() => {
    const preset =
      LGS_TARGET_PRESETS.find((p) => p.name === selectedLgsTarget) ||
      LGS_TARGET_PRESETS[0];
    const diff = Number((preset.score - lgsResult.score).toFixed(2));
    const isReached = diff <= 0;

    const mathInput = lgsInputs.matematik || { correct: 0, wrong: 0 };
    const currentMathNet = Math.max(0, mathInput.correct - mathInput.wrong / 3);
    const mathHeadroom = Math.max(0, 20 - currentMathNet);

    const fenInput = lgsInputs.fen || { correct: 0, wrong: 0 };
    const currentFenNet = Math.max(0, fenInput.correct - fenInput.wrong / 3);
    const fenHeadroom = Math.max(0, 20 - currentFenNet);

    const neededNet = isReached ? 0 : Math.ceil(diff / 4.34);
    const mathNeeded = Math.min(mathHeadroom, neededNet);
    const fenNeeded = Math.min(fenHeadroom, neededNet);

    return {
      targetScore: preset.score,
      diff,
      isReached,
      mathNeeded,
      fenNeeded,
    };
  }, [lgsInputs, lgsResult.score, selectedLgsTarget]);

  // Hedef Üniversite Gap Analizi
  const yksGapAnalysis: YksGapAnalysis = useMemo(() => {
    const preset =
      YKS_TARGET_PRESETS.find((p) => p.name === selectedYksTarget) ||
      YKS_TARGET_PRESETS[0];
    const currentScore = yksResult.activeRow.placementScore;
    const diff = Number((preset.score - currentScore).toFixed(1));
    const isReached = diff <= 0;
    const aytMathNeeded = Math.max(0, Math.ceil(Math.max(0, diff) / 3.0));

    return {
      targetScore: preset.score,
      diff,
      isReached,
      aytMathNeeded,
    };
  }, [yksResult.activeRow.placementScore, selectedYksTarget]);

  // Handler LGS
  const handleLgsChange = (
    subject: LgsSubjectKey,
    field: 'correct' | 'wrong',
    val: number,
  ) => {
    const maxQ = lgsSubjects.find((s) => s.key === subject)?.questions || 20;
    const current = lgsInputs[subject] || { correct: 0, wrong: 0 };
    const updated = applyAnswerChange(current, field, val, maxQ);
    setLgsInputs((prev) => ({ ...prev, [subject]: updated }));
  };

  // Handler YKS
  const handleYksChange = (
    subject: YksSubjectKey,
    field: 'correct' | 'wrong',
    val: number,
    maxQuestions: number,
  ) => {
    const current = yksInputs[subject] || { correct: 0, wrong: 0 };
    const updated = applyAnswerChange(current, field, val, maxQuestions);
    setYksInputs((prev) => ({ ...prev, [subject]: updated }));
  };

  // Deneme Kaydetme Handlers
  const handleSaveLgsTrial = () => {
    const mathInput = lgsInputs.matematik || { correct: 0, wrong: 0 };
    const mathNet = Math.max(0, mathInput.correct - mathInput.wrong / 3);
    const trialCount = savedTrials.length + 1;
    saveExamTrial({
      examType: 'lgs',
      title: `LGS Deneme #${trialCount}`,
      score: lgsResult.score,
      mathNet,
      totalNet: lgsResult.totalNet,
      details: {
        correctCount: lgsResult.totalCorrect,
        wrongCount: lgsResult.totalWrong,
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    reloadTrials();
  };

  const handleSaveYksTrial = () => {
    const trialCount = savedTrials.length + 1;
    saveExamTrial({
      examType: 'yks',
      title: `YKS (${selectedYksType}) Deneme #${trialCount}`,
      score: yksResult.activeRow.placementScore,
      totalNet: Number((yksResult.tytNet + yksResult.aytNet).toFixed(1)),
      mathNet: Number((yksResult.tytMatNet + yksResult.aytMatNet).toFixed(1)),
      details: {
        subNets: { [selectedYksType]: yksResult.activeRow.placementScore },
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    reloadTrials();
  };

  const handleDeleteTrial = (id: string) => {
    deleteExamTrial(id);
    reloadTrials();
  };

  const peakTrial = useMemo(() => {
    if (savedTrials.length === 0) return null;
    return [...savedTrials].sort((a, b) => b.score - a.score)[0];
  }, [savedTrials]);

  const handleResetLgs = () => setLgsInputs(createInitialLgsInputs());
  const handleResetYks = () => {
    setYksInputs(createInitialYksInputs());
    setDiplomaScore(85);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-exam-score-area, .print-exam-score-area * { visibility: visible !important; }
          .print-exam-score-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 8mm !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md no-print"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="print-exam-score-area relative z-10 flex max-h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top)+env(safe-area-inset-bottom)))] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl transition-all"
      >
        {/* A4 Yazdırılabilir Deneme Karnesi */}
        <PrintReportSection
          activeTab={activeTab}
          selectedYksType={selectedYksType}
          selectedLgsTarget={selectedLgsTarget}
          selectedYksTarget={selectedYksTarget}
          lgsResult={lgsResult}
          yksResult={yksResult}
          lgsInputs={lgsInputs}
          yksInputs={yksInputs}
          lgsGapAnalysis={lgsGapAnalysis}
          yksGapAnalysis={yksGapAnalysis}
        />

        {/* Başlık ve Sekmeler */}
        <div className="no-print flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md bg-brand-secondary text-slate-950 dark:text-slate-950">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2
                id={titleId}
                className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                İnteraktif Sınav Puanı & Net Hesaplayıcı
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Doğru ve yanlışlarını girerek MEB/ÖSYM formülüyle anında net ve
                puanını hesapla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="A4 Karne Yazdır"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <Printer className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">A4 Karne Yazdır</span>
            </button>

            <div className="flex rounded-xl bg-slate-200/80 dark:bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('lgs')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'lgs'
                    ? 'bg-white dark:bg-slate-800 text-tone-success-fg dark:text-brand-primary-soft shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                LGS (8. Sınıf)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('yks')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'yks'
                    ? 'bg-white dark:bg-slate-800 text-tone-success-fg dark:text-brand-primary-soft shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                YKS (TYT & AYT)
              </button>
            </div>

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

        {/* İçerik Alanı */}
        <div className="no-print flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
          {activeTab === 'lgs' ? (
            <div className="space-y-6">
              <ExamTrialHistorySection
                examType="lgs"
                savedTrials={savedTrials}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                saveSuccess={saveSuccess}
                onSaveTrial={handleSaveLgsTrial}
                onDeleteTrial={handleDeleteTrial}
                peakTrial={peakTrial}
                targetNet={15}
              />

              <LgsCalculatorTab
                lgsInputs={lgsInputs}
                lgsResult={lgsResult}
                lgsGapAnalysis={lgsGapAnalysis}
                selectedLgsTarget={selectedLgsTarget}
                setSelectedLgsTarget={setSelectedLgsTarget}
                onInputChange={handleLgsChange}
                onReset={handleResetLgs}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <ExamTrialHistorySection
                examType="yks"
                savedTrials={savedTrials}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                saveSuccess={saveSuccess}
                onSaveTrial={handleSaveYksTrial}
                onDeleteTrial={handleDeleteTrial}
                peakTrial={peakTrial}
                targetNet={30}
              />

              <YksCalculatorTab
                yksInputs={yksInputs}
                diplomaScore={diplomaScore}
                setDiplomaScore={setDiplomaScore}
                selectedYksType={selectedYksType}
                setSelectedYksType={setSelectedYksType}
                selectedYksTarget={selectedYksTarget}
                setSelectedYksTarget={setSelectedYksTarget}
                yksResult={yksResult}
                yksGapAnalysis={yksGapAnalysis}
                onInputChange={handleYksChange}
                onReset={handleResetYks}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
