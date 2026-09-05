'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Calendar,
  Settings2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  getDailyGoal,
  setDailyTarget,
  getYesterdayDateString,
  type DailyGoalData,
} from '@/lib/dailyGoalStorage';
import { featuredExams } from '@/lib/examDates';

type PersonalStreakHubProps = {
  isLight: boolean;
};

export function PersonalStreakHub({ isLight }: PersonalStreakHubProps) {
  const [goalData, setGoalData] = useState<DailyGoalData>(() => getDailyGoal());
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState('20');

  useEffect(() => {
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

  // Son 14 günlük aktivite dizisi
  const past14Days = useMemo(() => {
    const list = [];
    const today = new Date();
    const history = goalData.history || {};

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const count = i === 0 ? goalData.solved : (history[dateKey] || 0);
      const isTargetReached = count >= goalData.target;
      const dayName = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(d);

      list.push({
        dateKey,
        dayNumber: d.getDate(),
        dayName,
        count,
        isTargetReached,
        isToday: i === 0,
      });
    }
    return list;
  }, [goalData.history, goalData.solved, goalData.target]);

  const progressPercent = Math.min(100, Math.round((goalData.solved / goalData.target) * 100));
  const isGoalReached = goalData.solved >= goalData.target;

  const handleSaveTarget = () => {
    const num = parseInt(newTargetInput, 10);
    if (!isNaN(num) && num >= 5 && num <= 300) {
      const updated = setDailyTarget(num);
      setGoalData(updated);
      setIsEditingTarget(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-800/60 border-slate-700/80 shadow-xl backdrop-blur-md'
      }`}
    >
      {/* Üst Bar: Başlık & Gizlilik Rozeti */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500 border border-orange-500/25">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`font-display text-lg sm:text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bireysel Çalışma Disiplini & Seri
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Her gün düzenli bir adım: Başarı süreklilikle inşa edilir.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Lock className="h-3 w-3" />
          <span>Sadece Sana Özel (Sıralama Yok)</span>
        </div>
      </div>

      {/* 3 Ana Metrik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Seri Sayacı */}
        <div
          className={`rounded-2xl border p-4 flex items-center justify-between ${
            isLight ? 'bg-orange-50/60 border-orange-200/80' : 'bg-orange-950/20 border-orange-500/25'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
              Günlük Seri
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {goalData.streak}
              </span>
              <span className="text-xs font-semibold text-orange-500">Gün Üst Üste</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                  (goalData.freezeTokens || 0) > 0
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                    : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
                }`}
                title="Seri Kalkanı: Giremediğin günlerde çalışma serinin sıfırlanmasını otomatik önler."
              >
                <ShieldCheck className="h-3 w-3" />
                <span>{goalData.freezeTokens ?? 1} Kalkan</span>
              </span>
              {goalData.lastFreezeUsedDate === getYesterdayDateString() && (
                <span className="text-[10px] font-medium text-emerald-400">
                  🛡️ Dün serin korundu!
                </span>
              )}
            </div>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {goalData.streak > 0 ? 'Harika gidiyorsun! Zinciri kırma.' : 'Bugün hedefine ulaş, seriyi başlat!'}
            </p>
          </div>
          <Flame className="h-10 w-10 text-orange-500 shrink-0" />
        </div>

        {/* Günlük Hedef & İlerleme */}
        <div
          className={`rounded-2xl border p-4 flex flex-col justify-between ${
            isLight ? 'bg-indigo-50/60 border-indigo-200/80' : 'bg-indigo-950/20 border-indigo-500/25'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Bugünkü Soru Hedefin
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewTargetInput(String(goalData.target));
                  setIsEditingTarget((p) => !p);
                }}
                className="text-indigo-400 hover:text-indigo-300 p-1"
                title="Günlük soru hedefini değiştir"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {goalData.solved}
              </span>
              <span className="text-xs font-semibold text-indigo-400">/ {goalData.target} Soru</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>%{progressPercent} Tamamlandı</span>
              {isGoalReached && <span className="text-emerald-400 font-bold">🎉 Hedef Bitti!</span>}
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Yaklaşan Sınav Geri Sayımı */}
        <div
          className={`rounded-2xl border p-4 flex flex-col justify-between ${
            isLight ? 'bg-cyan-50/60 border-cyan-200/80' : 'bg-cyan-950/20 border-cyan-500/25'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500">
              Hedef Sınav Sayacı
            </span>
            <div className="mt-2 space-y-1.5">
              {featuredExams.map((exam) => {
                const diffTime = new Date(exam.targetDate).getTime() - Date.now();
                const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                return (
                  <div key={exam.id} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {exam.title.replace(" Kalan Süre", "")}:
                    </span>
                    <span className="font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-lg">
                      {daysLeft} Gün Kaldı
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className={`text-[10px] mt-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Her gün 15 soru, sınava kadar ~1.200 ekstra pratik demektir.
          </p>
        </div>
      </div>

      {/* Hedef Düzenleme Açılır Alanı */}
      <AnimatePresence>
        {isEditingTarget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-4 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-white/10'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                Yeni Günlük Soru Hedefi:
              </span>
              <div className="flex items-center gap-2">
                {[10, 20, 30, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewTargetInput(String(num))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      newTargetInput === String(num)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {num} Soru
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSaveTarget}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTarget(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                İptal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 14 Günlük Alışkanlık Isı Haritası (Heatmap) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Son 14 Günlük Alışkanlık Isı Haritası</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-md bg-emerald-500/80 inline-block" /> Hedef Tamam
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-md bg-amber-500/70 inline-block" /> Soru Çözüldü
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-md bg-slate-700/50 inline-block" /> Dinlenme
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {past14Days.map((day) => {
            let bgColor = isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/50 border-white/5';
            let textColor = isLight ? 'text-slate-600' : 'text-slate-400';

            if (day.isTargetReached) {
              bgColor = 'bg-emerald-500 text-white border-emerald-400 shadow-sm';
              textColor = 'text-white';
            } else if (day.count > 0) {
              bgColor = isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/30 border-amber-500/40 text-amber-200';
              textColor = isLight ? 'text-amber-900' : 'text-amber-200';
            }

            return (
              <div
                key={day.dateKey}
                title={`${day.dateKey} (${day.dayName}): ${day.count} soru çözüldü`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-transform hover:scale-105 cursor-default ${bgColor} ${
                  day.isToday ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : ''
                }`}
              >
                <span className="text-[10px] font-semibold opacity-75">{day.dayName}</span>
                <span className={`text-sm font-bold ${textColor}`}>{day.dayNumber}</span>
                <span className="text-[10px] font-mono mt-0.5">
                  {day.count > 0 ? `${day.count}s` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default PersonalStreakHub;
