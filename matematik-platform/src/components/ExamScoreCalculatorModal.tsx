'use client';

import { useState, useId, useMemo } from 'react';
import {
  X,
  Calculator,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  GraduationCap,
} from 'lucide-react';
import {
  calculateLgsScore,
  calculateYksScoreTable,
  createInitialLgsInputs,
  createInitialYksInputs,
  lgsSubjects,
  tytSubjectKeys,
  aytSubjectKeys,
  yksSubjects,
  type LgsInputs,
  type LgsSubjectKey,
  type YksInputs,
  type YksScoreType,
  type YksSubjectKey,
} from '@/lib/examCalculators';

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

  // LGS State
  const [lgsInputs, setLgsInputs] = useState<LgsInputs>(createInitialLgsInputs);

  // YKS State
  const [yksInputs, setYksInputs] = useState<YksInputs>(createInitialYksInputs);
  const [diplomaScore, setDiplomaScore] = useState<number>(85);
  const [selectedYksType, setSelectedYksType] = useState<YksScoreType>('SAY');

  // LGS Calculations
  const lgsResult = useMemo(() => {
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
      estimatedPercentile = '%14.1 - %25.0';
      targetBand = 'Anadolu Liseleri';
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
    const activeRow = table.rows.find((r) => r.scoreType === selectedYksType) || table.rows[0];

    let tytNet = 0;
    for (const key of tytSubjectKeys) {
      const inp = yksInputs[key] || { correct: 0, wrong: 0 };
      tytNet += Math.max(0, inp.correct - inp.wrong / 4);
    }

    let aytNet = 0;
    for (const key of aytSubjectKeys) {
      const inp = yksInputs[key] || { correct: 0, wrong: 0 };
      aytNet += Math.max(0, inp.correct - inp.wrong / 4);
    }

    return {
      activeRow,
      tytNet: Number(tytNet.toFixed(2)),
      aytNet: Number(aytNet.toFixed(2)),
    };
  }, [yksInputs, diplomaScore, selectedYksType]);

  if (!isOpen) return null;

  const handleLgsChange = (
    subject: LgsSubjectKey,
    field: 'correct' | 'wrong',
    value: number,
    maxQuestions: number,
  ) => {
    setLgsInputs((prev) => {
      const current = prev[subject] || { correct: 0, wrong: 0 };
      const nextVal = Math.max(0, Math.min(maxQuestions, Number.isNaN(value) ? 0 : value));
      const otherVal = field === 'correct' ? current.wrong : current.correct;

      // Toplam doğru + yanlış soru sayısını aşamaz
      const clampedNext = nextVal + otherVal > maxQuestions ? maxQuestions - otherVal : nextVal;

      return {
        ...prev,
        [subject]: {
          ...current,
          [field]: Math.max(0, clampedNext),
        },
      };
    });
  };

  const handleYksChange = (
    subject: YksSubjectKey,
    field: 'correct' | 'wrong',
    value: number,
    maxQuestions: number,
  ) => {
    setYksInputs((prev) => {
      const current = prev[subject] || { correct: 0, wrong: 0 };
      const nextVal = Math.max(0, Math.min(maxQuestions, Number.isNaN(value) ? 0 : value));
      const otherVal = field === 'correct' ? current.wrong : current.correct;
      const clampedNext = nextVal + otherVal > maxQuestions ? maxQuestions - otherVal : nextVal;

      return {
        ...prev,
        [subject]: {
          ...current,
          [field]: Math.max(0, clampedNext),
        },
      };
    });
  };

  const handleResetLgs = () => setLgsInputs(createInitialLgsInputs());
  const handleResetYks = () => {
    setYksInputs(createInitialYksInputs());
    setDiplomaScore(85);
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
        {/* Başlık ve Sekmeler */}
        <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 id={titleId} className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                İnteraktif Sınav Puanı & Net Hesaplayıcı
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Doğru ve yanlışlarını girerek MEB/ÖSYM formülüyle anında net ve puanını hesapla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sekme Seçici */}
            <div className="flex rounded-xl bg-slate-200/80 dark:bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('lgs')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'lgs'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
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

        {/* İçerik Alanı (Kaydırılabilir) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
          {activeTab === 'lgs' ? (
            /* LGS HESAPLAMA PANELİ */
            <div className="space-y-6">
              {/* Sonuç Özeti Bento Kartı */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    <span>LGS Puanı</span>
                  </div>
                  <div className="mt-1 font-display text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
                    {lgsResult.score.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    500 tam puan üzerinden
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Toplam Net</span>
                  </div>
                  <div className="mt-1 font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {lgsResult.totalNet}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    90 soru arasından (3 yanlış 1 doğruyu götürür)
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-200/80 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30 p-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    <span>Tahmini Dilim</span>
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-purple-700 dark:text-purple-300">
                    {lgsResult.estimatedPercentile}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400" title={lgsResult.targetBand}>
                    {lgsResult.targetBand}
                  </div>
                </div>
              </div>

              {/* Ders Giriş Tablosu */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
                  <div className="col-span-5 sm:col-span-4">Ders Adı (Soru)</div>
                  <div className="col-span-2 text-center">Doğru</div>
                  <div className="col-span-2 text-center">Yanlış</div>
                  <div className="col-span-1 text-center hidden sm:block">Boş</div>
                  <div className="col-span-3 text-right">Net</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {lgsSubjects.map((sub) => {
                    const current = lgsInputs[sub.key] || { correct: 0, wrong: 0 };
                    const empty = Math.max(0, sub.questions - (current.correct + current.wrong));
                    const net = Math.max(0, current.correct - current.wrong / 3);

                    return (
                      <div key={sub.key} className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="col-span-5 sm:col-span-4 font-semibold text-slate-800 dark:text-slate-200">
                          {sub.label}
                          <span className="ml-1 text-xs text-slate-400 font-normal">({sub.questions}s)</span>
                        </div>
                        <div className="col-span-2 px-1">
                          <input
                            type="number"
                            min="0"
                            max={sub.questions}
                            value={current.correct || ''}
                            placeholder="0"
                            onChange={(e) => handleLgsChange(sub.key, 'correct', parseInt(e.target.value, 10), sub.questions)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2 py-1.5 text-center font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2 px-1">
                          <input
                            type="number"
                            min="0"
                            max={sub.questions}
                            value={current.wrong || ''}
                            placeholder="0"
                            onChange={(e) => handleLgsChange(sub.key, 'wrong', parseInt(e.target.value, 10), sub.questions)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2 py-1.5 text-center font-bold text-red-500 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1 text-center font-medium text-slate-400 text-xs hidden sm:block">
                          {empty}
                        </div>
                        <div className="col-span-3 text-right font-display font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {net.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetLgs}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Değerleri Sıfırla
                </button>
                <div className="text-[11px] text-slate-400">
                  MEB 2026 katsayılarına göre standart sapmasız yaklaşık hesaplamadır.
                </div>
              </div>
            </div>
          ) : (
            /* YKS HESAPLAMA PANELİ */
            <div className="space-y-6">
              {/* Puan Türü ve Diploma Notu Seçimi */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hedef Alan:</span>
                  {(['SAY', 'EA', 'SOZ', 'TYT'] as YksScoreType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedYksType(type)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedYksType === type
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                          : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {type === 'SAY' ? 'Sayısal' : type === 'EA' ? 'Eşit Ağırlık' : type === 'SOZ' ? 'Sözel' : 'Sadece TYT'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                  <label htmlFor="obp-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Diploma Notu (OBP):
                  </label>
                  <input
                    id="obp-input"
                    type="number"
                    min="50"
                    max="100"
                    value={diplomaScore}
                    onChange={(e) => setDiplomaScore(Math.max(50, Math.min(100, parseInt(e.target.value, 10) || 50)))}
                    className="w-16 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2 py-1 text-center text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* YKS Sonuç Özeti Bento */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5">
                  <div className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Yerleştirme Puanı
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
                    {yksResult.activeRow.placementScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">OBP Eklenmiş</div>
                </div>

                <div className="rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30 p-3.5">
                  <div className="text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400">
                    Tahmini Sıralama
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-purple-700 dark:text-purple-300 tabular-nums">
                    {yksResult.activeRow.placementRank > 0 ? `~${yksResult.activeRow.placementRank.toLocaleString('tr-TR')}` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Başarı Sırası Bandı</div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    TYT Toplam Net
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {yksResult.tytNet}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">120 soru üzerinden</div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
                  <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    AYT Toplam Net
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {yksResult.aytNet}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Seçilen testler üzerinden</div>
                </div>
              </div>

              {/* YKS Ders Giriş Tablosu */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* TYT Bölümü */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                  <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
                    <span>TYT Testleri (120 Soru)</span>
                    <span>Net: {yksResult.tytNet}</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {tytSubjectKeys.map((key) => {
                      const meta = yksSubjects.find((s) => s.key === key);
                      const current = yksInputs[key] || { correct: 0, wrong: 0 };
                      const net = Math.max(0, current.correct - current.wrong / 4);
                      return (
                        <div key={key} className="flex items-center justify-between p-2.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {meta?.label} ({meta?.questions}s)
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={meta?.questions || 40}
                              placeholder="D"
                              value={current.correct || ''}
                              onChange={(e) => handleYksChange(key, 'correct', parseInt(e.target.value, 10), meta?.questions || 40)}
                              className="w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold"
                            />
                            <input
                              type="number"
                              min="0"
                              max={meta?.questions || 40}
                              placeholder="Y"
                              value={current.wrong || ''}
                              onChange={(e) => handleYksChange(key, 'wrong', parseInt(e.target.value, 10), meta?.questions || 40)}
                              className="w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-red-500"
                            />
                            <span className="w-12 text-right font-bold text-indigo-600 dark:text-indigo-400">
                              {net.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AYT Bölümü */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                  <div className="bg-purple-600 text-white px-4 py-2 text-xs font-bold flex justify-between items-center">
                    <span>AYT Testleri (Seçilenler)</span>
                    <span>Net: {yksResult.aytNet}</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {aytSubjectKeys.map((key) => {
                      const meta = yksSubjects.find((s) => s.key === key);
                      const current = yksInputs[key] || { correct: 0, wrong: 0 };
                      const net = Math.max(0, current.correct - current.wrong / 4);
                      return (
                        <div key={key} className="flex items-center justify-between p-2.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {meta?.label} ({meta?.questions}s)
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={meta?.questions || 40}
                              placeholder="D"
                              value={current.correct || ''}
                              onChange={(e) => handleYksChange(key, 'correct', parseInt(e.target.value, 10), meta?.questions || 40)}
                              className="w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold"
                            />
                            <input
                              type="number"
                              min="0"
                              max={meta?.questions || 40}
                              placeholder="Y"
                              value={current.wrong || ''}
                              onChange={(e) => handleYksChange(key, 'wrong', parseInt(e.target.value, 10), meta?.questions || 40)}
                              className="w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1 text-center font-bold text-red-500"
                            />
                            <span className="w-12 text-right font-bold text-purple-600 dark:text-purple-400">
                              {net.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetYks}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Değerleri Sıfırla
                </button>
                <div className="text-[11px] text-slate-400">
                  ÖSYM 2026 katsayılarına ve geçmiş yıl yığılım verilerine göre yaklaşık tahmindir.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
