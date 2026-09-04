'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Flame,
  Plus,
  Minus,
  CheckCircle2,
  Settings2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  getDailyGoal,
  setDailyTarget,
  incrementQuestionsSolved,
  decrementQuestionsSolved,
  type DailyGoalData,
} from '@/lib/dailyGoalStorage';
import { fireConfetti } from '@/components/ConfettiBurst';

export function HomeDailyGoalWidget({ isLight }: { isLight: boolean }) {
  const [goalData, setGoalData] = useState<DailyGoalData>(() => getDailyGoal());
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState('20');

  useEffect(() => {
    // Initial fetch from localStorage
    setGoalData(getDailyGoal());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DailyGoalData>;
      if (customEvent.detail) {
        setGoalData(customEvent.detail);
      } else {
        setGoalData(getDailyGoal());
      }
    };

    window.addEventListener('ugurhoca:daily-goal-updated', handleUpdate);
    return () => window.removeEventListener('ugurhoca:daily-goal-updated', handleUpdate);
  }, []);

  const progressPercent = Math.min(100, Math.round((goalData.solved / goalData.target) * 100));
  const isCompleted = goalData.solved >= goalData.target;
  const remaining = Math.max(0, goalData.target - goalData.solved);

  const handleAdd = (amount: number) => {
    const prevSolved = goalData.solved;
    const updated = incrementQuestionsSolved(amount);
    setGoalData(updated);

    if (prevSolved < goalData.target && updated.solved >= updated.target) {
      void fireConfetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleDecrement = () => {
    const updated = decrementQuestionsSolved(1);
    setGoalData(updated);
  };

  const handleSaveTarget = () => {
    const num = parseInt(newTargetInput, 10);
    if (!isNaN(num) && num >= 5 && num <= 500) {
      const updated = setDailyTarget(num);
      setGoalData(updated);
      setIsEditingTarget(false);
    }
  };

  return (
    <section className="relative px-4 py-4 sm:py-6" aria-label="Günlük Soru Hedefim">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
            isLight
              ? 'border-slate-200/90 bg-white/95 shadow-bento'
              : 'border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 -bottom-6 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Info & Streak */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-bold shadow-sm">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      className={`font-display text-sm sm:text-base font-bold flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      Günlük Soru Hedefim
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Hedef Tamam!
                        </span>
                      )}
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isCompleted
                        ? 'Harika bir disiplin! Bugün hedefini aştın, çalışmaya devam edebilirsin 🚀'
                        : remaining > 0
                        ? `Bugünkü hedefe ulaşmak için ${remaining} soru kaldı.`
                        : 'Hedefine ulaştın!'}
                    </p>
                  </div>
                </div>

                {/* Streak Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm ${
                    goalData.streak > 0
                      ? isLight
                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                        : 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                      : isLight
                      ? 'border-slate-200 bg-slate-100 text-slate-600'
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                  title="Üst üste soru hedefini tamamladığın gün sayısı"
                >
                  <Flame
                    className={`h-4 w-4 ${
                      goalData.streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    {goalData.streak > 0
                      ? `${goalData.streak} Günlük Seri`
                      : 'Bugün Seriye Başla'}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Numbers */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                    <strong data-testid="solved-count" className="text-sm font-bold text-emerald-500">{goalData.solved}</strong> / {goalData.target} Soru
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      %{progressPercent}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTargetInput(String(goalData.target));
                        setIsEditingTarget(!isEditingTarget);
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 ${
                        isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                      aria-label="Günlük hedefi düzenle"
                    >
                      <Settings2 className="h-3 w-3" /> Hedef: {goalData.target}
                    </button>
                  </div>
                </div>

                {/* Bar */}
                <div
                  className={`h-3 w-full overflow-hidden rounded-full ${
                    isLight ? 'bg-slate-100' : 'bg-white/10'
                  }`}
                  role="progressbar"
                  aria-valuenow={goalData.solved}
                  aria-valuemin={0}
                  aria-valuemax={goalData.target}
                  aria-label={`Günlük hedef ilerlemesi: ${goalData.solved} / ${goalData.target}`}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons & Zero Leakage badge */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 lg:pt-0">
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleAdd(1)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95"
                  aria-label="1 soru çözüldü ekle"
                >
                  <Plus className="h-3.5 w-3.5" /> +1 Soru
                </button>
                <button
                  type="button"
                  onClick={() => handleAdd(5)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600/30 transition active:scale-95"
                  aria-label="5 soru çözüldü ekle"
                >
                  <Sparkles className="h-3.5 w-3.5" /> +5 Soru
                </button>
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={goalData.solved <= 0}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                    isLight
                      ? 'border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40'
                      : 'border-white/10 text-slate-400 hover:bg-white/10 disabled:opacity-30'
                  }`}
                  aria-label="1 soru geri al"
                  title="Geri al"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div
                className={`hidden md:flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${
                  isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'
                }`}
                title="Soru ve seri verileriniz yalnızca tarayıcınızda güvenle saklanır, sunucuya aktarılmaz."
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Gizli & Yerel</span>
              </div>
            </div>
          </div>

          {/* Target Editing Drawer / Expandable */}
          <AnimatePresence>
            {isEditingTarget && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 pt-3 border-t overflow-hidden ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Günlük Hedef Belirle:
                  </span>
                  {[10, 20, 30, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const updated = setDailyTarget(preset);
                        setGoalData(updated);
                        setIsEditingTarget(false);
                      }}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        goalData.target === preset
                          ? 'bg-emerald-600 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {preset} Soru
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={newTargetInput}
                      onChange={(e) => setNewTargetInput(e.target.value)}
                      className={`w-16 rounded-lg border px-2 py-1 text-xs font-bold ${
                        isLight
                          ? 'border-slate-300 bg-white text-slate-900'
                          : 'border-white/20 bg-slate-800 text-white'
                      }`}
                      aria-label="Özel hedef sayısı"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTarget}
                      className="rounded-lg bg-brand-primary px-2.5 py-1 font-bold text-white hover:bg-brand-primary/90"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
