'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import type { QuizPsychometricReport } from '@/features/quizzes/lib/itemAnalysis';

export interface AdminItemAnalysisCardProps {
  report: QuizPsychometricReport;
  quizTitle?: string;
}

export function AdminItemAnalysisCard({ report, quizTitle = 'Test Analizi' }: AdminItemAnalysisCardProps) {
  const [filterProblematicOnly, setFilterProblematicOnly] = useState(false);

  const displayedItems = filterProblematicOnly
    ? report.items.filter((i) => i.isProblematic)
    : report.items;

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-white">
      {/* Üst Başlık & Özet Metrikler */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
              Psikometrik Madde Analizi
            </span>
            <span className="text-xs text-slate-400">
              {report.totalSubmissions} Katılımcı
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            {quizTitle} — Soru Kalite & Ayırt Edicilik Paneli
          </h3>
        </div>

        {/* Güvenilirlik & Problemli Soru Sayaçları */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/60 border border-white/10 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Test Güvenilirliği (KR-20)</span>
            <span className="text-base font-black text-emerald-400">
              {report.overallReliabilityEstimate.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFilterProblematicOnly(!filterProblematicOnly)}
            className={`px-3.5 py-2 rounded-2xl border text-center transition ${
              filterProblematicOnly
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <span className="block text-[10px] uppercase font-bold">Sorunlu Soru</span>
            <span className="text-base font-black text-rose-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {report.problematicItemsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Soru Listesi Tablosu / Kartları */}
      <div className="mt-5 space-y-3">
        {displayedItems.length === 0 ? (
          <div className="text-center p-8 text-slate-400 text-sm">
            {filterProblematicOnly
              ? 'Tebrikler! Bu testte problemli veya ters ayırt edici soru tespit edilmedi.'
              : 'Henüz analiz edilecek soru bulunmuyor.'}
          </div>
        ) : (
          displayedItems.map((item, idx) => (
            <div
              key={item.questionId}
              className={`p-4 rounded-2xl border transition ${
                item.isProblematic
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : 'border-white/5 bg-slate-950/40'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Soru Kökü */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300">
                      Soru {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.discriminationIndex >= 0.3
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.discriminationIndex >= 0.2
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      D: {item.discriminationIndex} ({item.discriminationLabel})
                    </span>
                    <span className="text-xs text-slate-400">
                      p (Güçlük): {item.difficultyIndex} ({item.difficultyLabel})
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-1">{item.questionText}</p>
                </div>

                {/* Çeldirici Dağılımı (A, B, C, D) */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 shrink-0">
                  {item.distractorCounts.map((count, optIdx) => (
                    <span
                      key={optIdx}
                      className="px-2 py-1 rounded bg-slate-900 border border-white/5"
                    >
                      {String.fromCharCode(65 + optIdx)}: <strong className="text-white">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pedagojik Öneri & Teşhis */}
              <div className="mt-3 pt-2 border-t border-white/5 text-xs text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>{item.recommendation}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
