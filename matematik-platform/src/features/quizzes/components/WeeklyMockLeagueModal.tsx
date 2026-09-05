'use client';

import { useState } from 'react';
import {
  X,
  Trophy,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Play,
} from 'lucide-react';

type LeagueParticipant = {
  rank: number;
  alias: string;
  avatarBg: string;
  correct: number;
  wrong: number;
  empty: number;
  netScore: number;
  isSelf?: boolean;
};

const MOCK_LEAGUE_RANKINGS: LeagueParticipant[] = [
  {
    rank: 1,
    alias: 'ArfMatematik 👑',
    avatarBg: 'bg-amber-500',
    correct: 20,
    wrong: 0,
    empty: 0,
    netScore: 20.0,
  },
  {
    rank: 2,
    alias: 'PiGezgini ⚡',
    avatarBg: 'bg-purple-500',
    correct: 19,
    wrong: 1,
    empty: 0,
    netScore: 18.67,
  },
  {
    rank: 3,
    alias: 'PisagorAvcısı 🏹',
    avatarBg: 'bg-rose-500',
    correct: 18,
    wrong: 2,
    empty: 0,
    netScore: 17.33,
  },
  {
    rank: 4,
    alias: 'EulerÖğrencisi 🌟',
    avatarBg: 'bg-indigo-500',
    correct: 18,
    wrong: 1,
    empty: 1,
    netScore: 17.67,
  },
  {
    rank: 5,
    alias: 'HarezmiGençlik 💡',
    avatarBg: 'bg-cyan-500',
    correct: 17,
    wrong: 3,
    empty: 0,
    netScore: 16.0,
  },
  {
    rank: 12,
    alias: 'Sen (Öğrenci) 🎯',
    avatarBg: 'bg-emerald-500',
    correct: 16,
    wrong: 3,
    empty: 1,
    netScore: 15.0,
    isSelf: true,
  },
];

type WeeklyMockLeagueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStartExam?: () => void;
};

export function WeeklyMockLeagueModal({
  isOpen,
  onClose,
  onStartExam,
}: WeeklyMockLeagueModalProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'analysis'>('leaderboard');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Haftalık LGS Deneme Ligi"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl text-white">
                  Haftalık LGS Deneme Ligi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lig #4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pazar denemesi sonuçları, net analizi ve platform başarı sıralaması
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATS BANNER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-800/40 border-b border-slate-800 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 font-medium">Katılımcı Sayısı</div>
            <div className="text-lg font-black text-white mt-0.5">148 Öğrenci</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 font-medium">Ortalama Net</div>
            <div className="text-lg font-black text-amber-400 mt-0.5">14.22 Net</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 font-medium">Senin Sıralaman</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">12. / 148</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-slate-400 font-medium">Sonraki Deneme</div>
            <div className="text-lg font-black text-cyan-400 mt-0.5">Pazar 10:00</div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-3 bg-slate-900/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Soru & Zorluk Analizi</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
            <div className="text-xs text-slate-400 mb-2 flex justify-between px-3">
              <span>Sıra & Öğrenci Rumuzu</span>
              <span>Doğru / Yanlış / Net</span>
            </div>

            {MOCK_LEAGUE_RANKINGS.map((p) => (
              <div
                key={p.rank}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  p.isSelf
                    ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
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
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.rank}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${p.avatarBg} text-white font-black text-xs flex items-center justify-center`}>
                      {p.alias[0]}
                    </div>
                    <span className={`text-sm font-bold ${p.isSelf ? 'text-emerald-300' : 'text-white'}`}>
                      {p.alias}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="hidden sm:flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400 font-bold">{p.correct} D</span>
                    <span>·</span>
                    <span className="text-rose-400 font-bold">{p.wrong} Y</span>
                    <span>·</span>
                    <span>{p.empty} B</span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 font-black text-amber-300 text-sm">
                    {p.netScore.toFixed(2)} Net
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: ANALYSIS */}
        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Deneme Zorluk Dağılımı
              </h4>
              <p className="text-slate-400">
                20 soruluk LGS matematik denemesindeki soru tiplerinin platform ortalaması başarı yüzdesi:
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-400">Kolay Sorular (7 Soru)</span>
                    <span className="text-slate-300">%78 Başarı</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-amber-400">Orta Seviye Yeni Nesil (9 Soru)</span>
                    <span className="text-slate-300">%54 Başarı</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '54%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-rose-400">Seçici / Zor Sorular (4 Soru)</span>
                    <span className="text-slate-300">%26 Başarı</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '26%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">En Çok Elenen Soru: Soru 14 (Eğim ve Doğrusal Denklem)</span>
                <p className="text-slate-300 leading-relaxed">
                  Öğrencilerin %46'sı dikey uzunluk yerine yatay uzunluğu paya yazarak işlem hatası yaptı. Eğim kuralını (m = dikey / yatay) daima zihninde tut!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 text-xs">
          <span className="text-slate-400">
            Sıralama her pazar saat 18:00&apos;de güncellenir.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition font-semibold"
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
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black shadow-lg shadow-rose-500/20 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Denemeye Başla</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
