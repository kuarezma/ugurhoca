'use client';

import {
  CheckCircle2,
  Circle,
  Zap,
  Flame,
  Calculator,
  Timer,
  Edit3,
  Layers,
  Video,
  ArrowRight,
  Sparkles,
  Clock,
  Gem,
  Award,
  Lock,
  Compass,
} from 'lucide-react';
import { SafeLink } from '@/components/SafeLink';
import {
  DAILY_QUESTS_MOCK,
  DAILY_CHALLENGE_MOCK,
  BADGES_SHOWCASE_MOCK,
} from './AdventureCurriculumData';

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
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all hover:border-accent/40">
        <div className="flex items-center justify-between pb-4 border-b border-default">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs">
              <Flame className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-primary">Günlük Görevler</h3>
              <p className="text-[11px] text-secondary">Her gün 00:00'da yenilenir</p>
            </div>
          </div>
          <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-400/30">
            1/3 Tamam
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {DAILY_QUESTS_MOCK.map((quest) => (
            <div
              key={quest.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-default bg-surface-2 hover:bg-surface-3'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  {quest.completed ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-bold leading-snug ${
                        quest.completed ? 'text-primary line-through opacity-75' : 'text-primary'
                      }`}
                    >
                      {quest.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 sm:w-32 h-1.5 rounded-full bg-surface-3 overflow-hidden border border-default/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-indigo-500 transition-all duration-300"
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-secondary font-semibold">
                        {quest.progress}/{quest.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-amber-400 text-xs font-black bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Zap className="h-3 w-3 fill-amber-400" />
                  +{quest.xp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. GÜNÜN ÖZEL MEYDAN OKUMASI KARTI (Leaderboard yerine odak kartı) */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-surface-1 to-surface-2 shadow-xl p-5 sm:p-6 transition-all hover:border-indigo-400/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl"
        />

        <div className="flex items-center justify-between pb-3.5 border-b border-default/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-base font-bold text-primary">Günün Meydan Okuması</h3>
                <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Özel
                </span>
              </div>
              <p className="text-[11px] text-secondary">{DAILY_CHALLENGE_MOCK.topic}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-secondary bg-surface-2 px-2.5 py-1 rounded-xl border border-default">
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>~{DAILY_CHALLENGE_MOCK.estimatedMinutes} dk</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-bold text-primary mb-1">
            {DAILY_CHALLENGE_MOCK.title}
          </h4>
          <p className="text-xs text-secondary leading-relaxed line-clamp-2 italic mb-4">
            "{DAILY_CHALLENGE_MOCK.questionPreview}"
          </p>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-default/60">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Zap className="h-3 w-3 fill-amber-400" />
                +{DAILY_CHALLENGE_MOCK.xpReward} XP
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                <Gem className="h-3 w-3 fill-cyan-400" />
                +{DAILY_CHALLENGE_MOCK.diamondReward}
              </div>
            </div>

            <SafeLink
              href={DAILY_CHALLENGE_MOCK.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Meydan Oku</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </SafeLink>
          </div>
        </div>
      </div>

      {/* 3. BAŞARI ROZETLERİ VİTRİNİ (Kişisel Başarı ve Teşvik) */}
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all hover:border-accent/40">
        <div className="flex items-center justify-between pb-4 border-b border-default">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-primary">Başarı Rozetleri</h3>
              <p className="text-[11px] text-secondary">Kazanılan & Hedef Rozetler</p>
            </div>
          </div>
          <SafeLink
            href="/profil"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Tümü
          </SafeLink>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {BADGES_SHOWCASE_MOCK.map((badge) => (
            <div
              key={badge.id}
              className={`relative p-3 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15'
                  : 'border-default bg-surface-2/60 opacity-60 hover:opacity-85'
              }`}
            >
              <div className="text-2xl mb-1 select-none flex items-center justify-center">
                {badge.icon}
              </div>
              <h4 className="text-xs font-bold text-primary truncate">{badge.title}</h4>
              <p className="text-[10px] text-secondary truncate mt-0.5">{badge.description}</p>

              {badge.unlocked ? (
                <div className="mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 px-2 py-0.2 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Kazanıldı
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] font-bold text-tertiary">
                  <Lock className="h-2.5 w-2.5" />
                  {badge.progress ? `${badge.progress.current}/${badge.progress.max}` : 'Kilitli'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. HIZLI ERİŞİM SANDIĞI (Dokunsal 3D Butonlar) */}
      <div className="rounded-3xl border border-default bg-surface-1 shadow-xl p-5 sm:p-6 transition-all">
        <div className="flex items-center justify-between pb-3.5 border-b border-default mb-3.5">
          <h3 className="font-display text-base font-bold text-primary">
            Hızlı Araç Sandığı
          </h3>
          <span className="text-[11px] text-secondary">Sınav Yardımcıları</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenCalculator}
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 hover:border-indigo-500/40 text-left transition-all duration-150 cursor-pointer shadow-xs active:translate-y-0.5 active:shadow-none"
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
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 hover:border-rose-500/40 text-left transition-all duration-150 cursor-pointer shadow-xs active:translate-y-0.5 active:shadow-none"
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
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 hover:border-amber-500/40 text-left transition-all duration-150 cursor-pointer shadow-xs active:translate-y-0.5 active:shadow-none"
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
            className="flex items-center gap-2.5 p-3 rounded-2xl border border-default bg-surface-2 hover:bg-surface-3 hover:border-purple-500/40 text-left transition-all duration-150 cursor-pointer shadow-xs active:translate-y-0.5 active:shadow-none"
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

        {/* Canlı Ders Kartı */}
        <div className="mt-3">
          <SafeLink
            href="/canli-ders"
            className="flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-red-500/10 to-orange-500/10 hover:from-rose-500/25 text-left transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0 shadow-md">
                <Video className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white/40" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-primary block">Canlı Ders Odası</span>
                  <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded-md">
                    CANLI
                  </span>
                </div>
                <span className="text-[10px] text-rose-300">Uğur Hoca ile Soru Çözümü</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </SafeLink>
        </div>
      </div>
    </div>
  );
}

export default AdventureSideQuests;

