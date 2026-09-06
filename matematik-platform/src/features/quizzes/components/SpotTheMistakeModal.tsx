'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { FLAWED_SOLUTIONS_DATA, type FlawedSolutionItem } from '../data/flawedSolutionsData';
import MathText from '@/components/MathText';

interface SpotTheMistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotTheMistakeModal({ isOpen, onClose }: SpotTheMistakeModalProps) {
  const containerRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentItem: FlawedSolutionItem = FLAWED_SOLUTIONS_DATA[currentIndex];
  const isSelected = selectedStep !== null;
  const isCorrectChoice = selectedStep === currentItem.flawedStepNumber;

  const handleSelectStep = (stepNum: number) => {
    if (selectedStep !== null) return;
    setSelectedStep(stepNum);
    if (stepNum === currentItem.flawedStepNumber) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < FLAWED_SOLUTIONS_DATA.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedStep(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedStep(null);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="flaw-modal-title"
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-white outline-none"
      >
        {/* Üst Başlık & İlerleme */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pedagojik Etkinlik
                </span>
                <span className="text-xs text-slate-400">
                  Soru {currentIndex + 1} / {FLAWED_SOLUTIONS_DATA.length}
                </span>
              </div>
              <h2 id="flaw-modal-title" className="font-display text-base sm:text-lg font-bold text-white mt-0.5">
                “Hatayı Bul”: Çözüm Adımlarını İncele
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Dedektif Puanı</span>
              <span className="text-sm font-black text-amber-400">{score} P</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Gövde */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isCompleted ? (
            /* Tamamlanma Ekranı */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Tebrikler! Tüm Çözümleri İnceledin</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                10 yaygın kavram yanılgısını ve hatalı çözüm adımını analiz ettin. Bu analizler sınavda işlem hatası yapma riskini %40 azaltır!
              </p>
              <div className="inline-block px-6 py-3 rounded-2xl bg-slate-950 border border-white/10">
                <span className="text-xs text-slate-400 block font-bold uppercase">Toplam Skor</span>
                <span className="text-3xl font-black text-amber-400">{score} / 100</span>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Çöz</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          ) : (
            /* Soru & Adımlar */
            <>
              {/* Problem Kartı */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-400">{currentItem.topic}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {currentItem.difficulty}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {currentItem.problemStatement}
                </h3>
              </div>

              {/* Yönerge */}
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  Öğrencinin çözümünde <strong>ilk hata hangi adımda yapılmıştır?</strong> İlgili adıma tıklayın.
                </span>
              </div>

              {/* Çözüm Adımları Butonları */}
              <div className="space-y-2.5">
                {currentItem.steps.map((step) => {
                  const isThisSelected = selectedStep === step.stepNumber;
                  const isThisFlawed = step.stepNumber === currentItem.flawedStepNumber;

                  let cardStyle =
                    'border-white/10 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-400/40 text-slate-200';

                  if (isSelected) {
                    if (isThisFlawed) {
                      cardStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500/50';
                    } else if (isThisSelected && !isThisFlawed) {
                      cardStyle = 'border-amber-500/60 bg-amber-500/15 text-amber-200';
                    } else {
                      cardStyle = 'border-white/5 bg-slate-950/40 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={step.stepNumber}
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleSelectStep(step.stepNumber)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${cardStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
                          {step.stepNumber}
                        </span>
                        <div className="text-sm font-medium pt-0.5">
                          <MathText>{step.content}</MathText>
                        </div>
                      </div>

                      {isSelected && isThisFlawed && (
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-400 shrink-0">
                          <XCircle className="w-4 h-4" />
                          <span>Hatalı Adım</span>
                        </div>
                      )}

                      {isSelected && isThisSelected && !isThisFlawed && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Doğruydu</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Açıklama & Pedagojik Analiz Kartı */}
              {isSelected && (
                <div
                  className={`p-4 sm:p-5 rounded-2xl border animate-fade-in text-xs sm:text-sm leading-relaxed ${
                    isCorrectChoice
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-2">
                    {isCorrectChoice ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300">Harika Teşhis! İlk hatayı doğru buldun.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-rose-300">
                          Seçtiğin adım doğruydu. İlk hata {currentItem.flawedStepNumber}. adımda yapılmıştı.
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-1 text-slate-200">
                    <strong>Neden Hatalı:</strong> {currentItem.flawExplanation}
                  </p>

                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Adımın Doğrusu:</span>
                      <span className="text-white font-semibold">
                        <MathText>{currentItem.correctStepContent}</MathText>
                      </span>
                    </div>
                    <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-3 pt-2 sm:pt-0">
                      <span className="text-[11px] text-slate-400 block">Doğru Sonuç:</span>
                      <span className="text-emerald-400 font-bold">
                        <MathText>{currentItem.correctFinalResult}</MathText>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alt Bar */}
        {!isCompleted && isSelected && (
          <div className="border-t border-white/10 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Kavram Yanılgısı: <strong>{currentItem.conceptMisconception}</strong>
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
            >
              <span>{currentIndex + 1 === FLAWED_SOLUTIONS_DATA.length ? 'Sonuçları Gör' : 'Sonraki Çözüm'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
