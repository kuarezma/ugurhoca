'use client';

import { useState } from 'react';
import { X, Trophy, BarChart3, Play } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

export type LeagueParticipant = {
  rank: number;
  alias: string;
  avatarBg: string;
  correct: number;
  wrong: number;
  empty: number;
  netScore: number;
  isSelf?: boolean;
};

export type WeeklyMockLeagueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartExam?: () => void;
  participants?: LeagueParticipant[];
};

export function WeeklyMockLeagueModal({
  isOpen,
  onClose,
  onStartExam,
  participants = [],
}: WeeklyMockLeagueModalProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'analysis'>(
    'leaderboard',
  );
  const containerRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const hasParticipants = participants.length > 0;
  const averageNet = hasParticipants
    ? (
        participants.reduce((sum, p) => sum + p.netScore, 0) /
        participants.length
      ).toFixed(2)
    : null;
  const selfParticipant = participants.find((p) => p.isSelf);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 dark:bg-slate-950/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label="Haftalık LGS Deneme Ligi"
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 outline-none"
      >
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-brand-accent/10 dark:bg-brand-accent/15">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white dark:text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                  Haftalık LGS Deneme Ligi
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deneme sonuçları ve platform başarı sıralaması
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Katılımcı Sayısı
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {hasParticipants ? `${participants.length} Öğrenci` : 'Henüz Yok'}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Ortalama Net
            </div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {averageNet ? `${averageNet} Net` : '—'}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Senin Sıralaman
            </div>
            <div className="text-lg font-black text-accent-success-ink dark:text-emerald-400 mt-0.5">
              {selfParticipant
                ? `${selfParticipant.rank}. / ${participants.length}`
                : '—'}
            </div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-3 bg-slate-50/50 dark:bg-slate-900/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'border-brand-primary text-tone-success-fg dark:text-brand-primary-soft'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Sıralama Listesi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analysis')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'border-brand-primary text-tone-success-fg dark:text-brand-primary-soft'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Soru & Zorluk Analizi</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
            {!hasParticipants ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center space-y-4">
                <Trophy className="w-10 h-10 text-amber-500/60 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-md mx-auto">
                  Bu hafta için henüz lig sıralaması oluşmadı.
                </p>
                {onStartExam && (
                  <button
                    type="button"
                    onClick={() => {
                      onStartExam();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Sınava Başla</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex justify-between px-3">
                  <span>Sıra & Öğrenci Rumuzu</span>
                  <span>Doğru / Yanlış / Net</span>
                </div>

                {participants.map((p, index) => (
                  <div
                    key={`${p.alias}-${index}`}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      p.isSelf
                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          p.rank === 1
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                            : p.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : p.rank === 3
                                ? 'bg-amber-700 text-white dark:text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p.rank}
                      </span>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg ${p.avatarBg} text-white dark:text-white font-black text-xs flex items-center justify-center`}
                        >
                          {p.alias[0]}
                        </div>
                        <span
                          className={`text-sm font-bold ${p.isSelf ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}
                        >
                          {p.alias}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="text-accent-success-ink dark:text-emerald-400 font-bold">
                          {p.correct} D
                        </span>
                        <span>·</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {p.wrong} Y
                        </span>
                        <span>·</span>
                        <span>{p.empty} B</span>
                      </div>

                      <div className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-amber-600 dark:text-amber-300 text-sm">
                        {p.netScore.toFixed(2)} Net
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* TAB 2: ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs">
            <div className="rounded-2xl border border-dashed border-border-default bg-surface-1 p-8 text-center">
              <p className="text-secondary">
                Deneme sınavı tamamlandığında soru dağılımı ve kazanım analizi
                burada görüntülenir.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-wrap items-center justify-end gap-2 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
            >
              Kapat
            </button>
            {onStartExam && (
              <button
                type="button"
                onClick={() => {
                  onStartExam();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-black transition active:scale-95 bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Deneme Sınavına Katıl</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
