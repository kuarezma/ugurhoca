'use client';

import { useId, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Award,
  Lock,
  Sparkles,
  Flame,
  Target,
  Clock,
  BookOpen,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react';
import type { UserBadge } from '@/features/progress/types';
import { BadgeCelebrationModal, type CelebrationBadge } from './BadgeCelebrationModal';

type BadgesShowcaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  earnedBadges?: UserBadge[];
  currentStreak?: number;
  totalQuestionsSolved?: number;
  isLight?: boolean;
};

type BadgeDefinition = {
  id: string;
  name: string;
  category: 'seri' | 'isabet' | 'odak' | 'oyun';
  description: string;
  requirement: string;
  icon: typeof Award;
  gradient: string;
  checkUnlocked: (context: {
    earnedBadgeIds: Set<string>;
    streak: number;
    questionsSolved: number;
  }) => boolean;
};

const ALL_BADGES: BadgeDefinition[] = [
  {
    id: 'first_step',
    name: 'İlk Adım',
    category: 'seri',
    description: 'Matematik serüvenine başladın! İlk testini veya oturumunu kaydet.',
    requirement: '1 test veya oturum tamamla',
    icon: Target,
    gradient: 'from-blue-500 to-cyan-500',
    checkUnlocked: ({ earnedBadgeIds, questionsSolved }) =>
      earnedBadgeIds.has('first_step') || questionsSolved > 0,
  },
  {
    id: 'streak_3',
    name: 'Alev Serisi',
    category: 'seri',
    description: '3 gün boyunca aralıksız matematik çalışarak alışkanlık kazandın.',
    requirement: '3 günlük çalışma serisi yap',
    icon: Flame,
    gradient: 'from-amber-500 to-orange-500',
    checkUnlocked: ({ earnedBadgeIds, streak }) =>
      earnedBadgeIds.has('streak_3') || streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Haftalık Maraton',
    category: 'seri',
    description: 'Tam 7 gün boyunca her gün soru çözerek haftalık disiplini sağladın.',
    requirement: '7 günlük çalışma serisi yap',
    icon: Flame,
    gradient: 'from-orange-500 to-rose-600',
    checkUnlocked: ({ earnedBadgeIds, streak }) =>
      earnedBadgeIds.has('streak_7') || streak >= 7,
  },
  {
    id: 'streak_30',
    name: '30 Günlük Efsane',
    category: 'seri',
    description: 'Bir ay boyunca her gün matematik çalışarak zirveye adını yazdırdın.',
    requirement: '30 günlük çalışma serisi yap',
    icon: Sparkles,
    gradient: 'from-yellow-400 via-amber-500 to-red-600',
    checkUnlocked: ({ earnedBadgeIds, streak }) =>
      earnedBadgeIds.has('streak_30') || streak >= 30,
  },
  {
    id: 'sharpshooter',
    name: 'Keskin Nişancı',
    category: 'isabet',
    description: 'Bir testte tüm soruları doğru cevaplayarak tam puan aldın.',
    requirement: 'Bir testte %100 başarı sağla',
    icon: Award,
    gradient: 'from-emerald-500 to-teal-600',
    checkUnlocked: ({ earnedBadgeIds }) =>
      earnedBadgeIds.has('sharpshooter') || earnedBadgeIds.has('perfect_score'),
  },
  {
    id: 'century_solver',
    name: 'Yüzler Kulübü',
    category: 'isabet',
    description: 'Platformda toplam 100 soru çözme barajını başarıyla aştın.',
    requirement: 'Toplam 100 soru çöz',
    icon: Target,
    gradient: 'from-indigo-500 to-purple-600',
    checkUnlocked: ({ earnedBadgeIds, questionsSolved }) =>
      earnedBadgeIds.has('century_solver') || questionsSolved >= 100,
  },
  {
    id: 'master_500',
    name: '500 Soru Üstadı',
    category: 'isabet',
    description: 'Tam 500 soru çözerek konu hakimiyetini en üst seviyeye taşıdın.',
    requirement: 'Toplam 500 soru çöz',
    icon: Award,
    gradient: 'from-purple-600 to-pink-600',
    checkUnlocked: ({ earnedBadgeIds, questionsSolved }) =>
      earnedBadgeIds.has('master_500') || questionsSolved >= 500,
  },
  {
    id: 'mistake_hunter',
    name: 'Hata Avcısı',
    category: 'odak',
    description: 'Hata defterindeki yanlış soruları tekrar çözerek kazanım açığını kapattın.',
    requirement: 'Hata defterinden telafi testi tamamla',
    icon: BookOpen,
    gradient: 'from-amber-600 to-yellow-500',
    checkUnlocked: ({ earnedBadgeIds }) =>
      earnedBadgeIds.has('mistake_hunter') || earnedBadgeIds.has('recovery_completed'),
  },
  {
    id: 'deep_focus',
    name: 'Derin Odak',
    category: 'odak',
    description: 'Pomodoro zamanlayıcısı ile kesintisiz bir odaklanma seansı bitirdin.',
    requirement: '1 Pomodoro odak oturumu tamamla',
    icon: Clock,
    gradient: 'from-rose-500 to-pink-600',
    checkUnlocked: ({ earnedBadgeIds }) =>
      earnedBadgeIds.has('deep_focus') || earnedBadgeIds.has('pomodoro_done'),
  },
  {
    id: 'night_owl',
    name: 'Gece Baykuşu',
    category: 'odak',
    description: 'Saat 22:00\'den sonra azimle soru çözerek hedefine bir adım daha yaklaştın.',
    requirement: 'Gece 22:00\'den sonra çalış',
    icon: Sparkles,
    gradient: 'from-indigo-900 via-purple-800 to-slate-900',
    checkUnlocked: ({ earnedBadgeIds }) => earnedBadgeIds.has('night_owl'),
  },
  {
    id: 'game_explorer',
    name: 'Oyun Kaşifi',
    category: 'oyun',
    description: 'Eğitici matematik oyunlarından en az birini oynayarak skor kaydettin.',
    requirement: 'Matematik oyunu oyna',
    icon: Gamepad2,
    gradient: 'from-teal-400 to-emerald-500',
    checkUnlocked: ({ earnedBadgeIds }) =>
      earnedBadgeIds.has('game_explorer') || earnedBadgeIds.has('game_played'),
  },
  {
    id: 'speed_champion',
    name: 'Hızlı Hesap Ustası',
    category: 'oyun',
    description: 'Matematik Ninja veya Hızlı Şoför oyununda 1.000+ puan barajını geçtin.',
    requirement: 'Oyunda 1000+ puan kazan',
    icon: Award,
    gradient: 'from-fuchsia-500 to-rose-500',
    checkUnlocked: ({ earnedBadgeIds }) =>
      earnedBadgeIds.has('speed_champion') || earnedBadgeIds.has('high_scorer'),
  },
];

export function BadgesShowcaseModal({
  isOpen,
  onClose,
  earnedBadges = [],
  currentStreak = 0,
  totalQuestionsSolved = 0,
  isLight = false,
}: BadgesShowcaseModalProps) {
  const titleId = useId();
  const [celebratingBadge, setCelebratingBadge] = useState<CelebrationBadge | null>(null);

  const earnedBadgeIds = useMemo(() => {
    return new Set(
      earnedBadges.map((b) => b.id || b.name?.toLowerCase().replace(/\s+/g, '_') || ''),
    );
  }, [earnedBadges]);

  const { evaluatedBadges, earnedCount } = useMemo(() => {
    const list = ALL_BADGES.map((b) => {
      const isUnlocked = b.checkUnlocked({
        earnedBadgeIds,
        streak: currentStreak,
        questionsSolved: totalQuestionsSolved,
      });
      return { ...b, isUnlocked };
    });
    const count = list.filter((b) => b.isUnlocked).length;
    return { evaluatedBadges: list, earnedCount: count };
  }, [currentStreak, earnedBadgeIds, totalQuestionsSolved]);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          role="dialog"
          aria-labelledby={titleId}
          aria-modal="true"
          className={`relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl z-10 my-auto ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/20'
              : 'bg-slate-900/95 border-white/10 text-white shadow-black/60'
          } backdrop-blur-xl`}
        >
          {/* Başlık */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white shadow-md shadow-amber-500/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h2 id={titleId} className="text-base sm:text-lg font-bold font-display leading-tight">
                  Matematik Başarı Rozetleri 🏆
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Çalıştıkça, test çözdükçe ve serini korudukça yeni rozetlerin kilidini aç.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="border-b border-slate-200 dark:border-white/10 px-5 py-3 sm:px-6 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Rozet Koleksiyonu</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{earnedCount} / {ALL_BADGES.length} Kazanıldı</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Rozet Kartları Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
            {evaluatedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                    badge.isUnlocked
                      ? isLight
                        ? 'border-amber-200 bg-amber-50/60 shadow-sm'
                        : 'border-amber-500/30 bg-gradient-to-br from-white/5 to-amber-500/10 shadow-lg shadow-amber-500/5'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 opacity-75'
                      : 'border-white/5 bg-slate-950/40 opacity-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${
                          badge.isUnlocked
                            ? `bg-gradient-to-br ${badge.gradient} text-white`
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {badge.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="h-3 w-3" />
                          Kazanıldı
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-transparent">
                          <Lock className="h-3 w-3" />
                          Kilitli
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300/80 font-medium">
                    <span>🎯 {badge.requirement}</span>
                    {badge.isUnlocked && (
                      <button
                        type="button"
                        onClick={() =>
                          setCelebratingBadge({
                            id: badge.id,
                            name: badge.name,
                            description: badge.description,
                            requirement: badge.requirement,
                            gradient: badge.gradient,
                          })
                        }
                        className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition"
                        title="Başarı kartını görüntüle ve indir"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Kartı Gör</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alt Bilgi */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 px-5 py-3.5 sm:px-6 bg-slate-50/70 dark:bg-white/[0.02]">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Düzenli soru çözerek ve testleri tamamlayarak koleksiyonunu genişletebilirsin.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>

    {celebratingBadge && (
      <BadgeCelebrationModal
        isOpen={!!celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
        badge={celebratingBadge}
        studentName="Öğrenci"
      />
    )}
  </>
);
}
