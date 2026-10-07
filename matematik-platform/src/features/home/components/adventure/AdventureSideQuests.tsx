'use client';

import {
  CheckCircle2,
  Circle,
  Zap,
  Trophy,
  Flame,
  Calculator,
  Timer,
  Edit3,
  Layers,
  Video,
  ArrowRight,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import { DAILY_QUESTS_MOCK, LEADERBOARD_MOCK } from './AdventureCurriculumData';

interface AdventureSideQuestsProps {
  onOpenCalculator?: () => void;
  onOpenPomodoro?: () => void;
  onOpenScratchpad?: () => void;
  onOpenFlashcards?: () => void;
}

export function AdventureSideQuests({
  onOpenCalculator,
  onOpenPomodoro,
  onOpenScratchpad,
  onOpenFlashcards,
}: AdventureSideQuestsProps) {
  return (
    <div className="space-y-6">
      {/* 1. GÜNLÜK GÖREVLER KARTI */}
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-primary">Günlük Görevler</h3>
              <p className="text-[11px] text-secondary">Her gün 00:00'da sıfırlanır</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            1/3 Bitti
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {DAILY_QUESTS_MOCK.map((quest) => (
            <div
              key={quest.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-default bg-surface-2 hover:bg-surface-3'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  {quest.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        quest.completed ? 'text-primary line-through opacity-80' : 'text-primary'
                      }`}
                    >
                      {quest.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-500"
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-secondary font-medium">
                        {quest.progress}/{quest.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-amber-400 text-xs font-bold">
                  <Zap className="h-3 w-3 fill-amber-400" />
                  +{quest.xp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. HAFTALIK LİDERLİK TABLOSU */}
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-default">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-primary">Haftalık Lig</h3>
              <p className="text-[11px] text-secondary">Altın Lig Sıralaması</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-400/25">
            🏆 İlk 3 Ödül Alır
          </span>
        </div>

        <div className="mt-3.5 divide-y divide-default">
          {LEADERBOARD_MOCK.map((student) => (
            <div
              key={student.rank}
              className={`flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors ${
                student.isCurrentUser
                  ? 'bg-indigo-500/15 font-bold border border-indigo-500/30'
                  : 'hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 text-center text-xs font-black text-secondary">
                  {student.medal || `${student.rank}.`}
                </span>
                <span className="text-base select-none">{student.avatar}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-primary truncate">
                    {student.name}
                  </h4>
                  <span className="text-[10px] text-secondary block">{student.grade}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-primary shrink-0">
                <Zap className="h-3 w-3 text-indigo-400" />
                {student.xp} <span className="text-[10px] text-tertiary">XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HIZLI ERİŞİM SANDIĞI */}
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all">
        <h3 className="font-display text-base font-bold text-primary mb-3">
          Hızlı Araç Sandığı
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenCalculator}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">Hesaplayıcı</span>
              <span className="text-[10px] text-secondary">LGS/YKS Puan</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenPomodoro}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <Timer className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">Pomodoro</span>
              <span className="text-[10px] text-secondary">Odak Sayacı</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenScratchpad}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Edit3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">Karalama</span>
              <span className="text-[10px] text-secondary">Çizim Tahtası</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenFlashcards}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary block truncate">Kartlar</span>
              <span className="text-[10px] text-secondary">Formül Ezberi</span>
            </div>
          </button>
        </div>

        <div className="mt-3">
          <SafeLink
            href="/canli-ders"
            className="flex items-center justify-between p-3 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-red-500/10 to-orange-500/10 hover:from-rose-500/25 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0 shadow-md">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary block">Canlı Ders Odası</span>
                <span className="text-[10px] text-rose-300">Uğur Hoca ile Canlı Yayın</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </SafeLink>
        </div>
      </div>
    </div>
  );
}

export default AdventureSideQuests;
