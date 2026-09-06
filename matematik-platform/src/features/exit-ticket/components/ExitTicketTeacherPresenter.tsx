'use client';

import { useState } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  Copy,
  Check,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { ExitTicketSession } from '../types';
import { calculateDistribution, saveSession } from '../lib/exitTicketStorage';

export interface ExitTicketTeacherPresenterProps {
  session: ExitTicketSession;
  onUpdateSession: (updated: ExitTicketSession) => void;
  onEndSession?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  'border-rose-500/40 bg-rose-500/10 text-rose-300',
  'border-sky-500/40 bg-sky-500/10 text-sky-300',
  'border-amber-500/40 bg-amber-500/10 text-amber-300',
  'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
];
const OPTION_BAR_COLORS = ['bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-emerald-500'];

export function ExitTicketTeacherPresenter({
  session,
  onUpdateSession,
  onEndSession,
}: ExitTicketTeacherPresenterProps) {
  const [copied, setCopied] = useState(false);
  const currentQIndex = session.currentQuestionIndex;
  const currentQ = session.questions[currentQIndex];
  const dist = calculateDistribution(session, currentQIndex);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const toggleDistribution = () => {
    const next = { ...session, showDistribution: !session.showDistribution };
    saveSession(next);
    onUpdateSession(next);
  };

  const changeQuestion = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= session.questions.length) return;
    const next = { ...session, currentQuestionIndex: newIndex, showDistribution: false };
    saveSession(next);
    onUpdateSession(next);
  };

  const handleCompleteSession = () => {
    const next: ExitTicketSession = {
      ...session,
      status: 'completed',
      showDistribution: true,
    };
    saveSession(next);
    onUpdateSession(next);
    onEndSession?.();
  };

  const isCompleted = session.status === 'completed';

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-white">
      {/* Üst Bilgi & Akıllı Tahta PIN Paneli */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-full bg-violet-500/20 border border-violet-500/40 px-2.5 py-0.5 text-xs font-bold text-violet-300">
              Ders Sonu Çıkış Bileti
            </span>
            <span className="text-xs text-slate-400">
              {session.grade}. Sınıf • {session.questions.length} Soru
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {session.title}
          </h1>
        </div>

        {/* Katılım PIN Kutusu */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/30 rounded-2xl px-4 py-2.5 shadow-inner">
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Öğrenci Katılım Kodu
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-amber-300">
              {session.code}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Kodu Kopyala"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Soru Sekmeleri ve Durum */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {session.questions.map((q, idx) => (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => changeQuestion(idx)}
              className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                currentQIndex === idx
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-400'
                  : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Soru {idx + 1}</span>
              {session.responses.filter((r) => r.questionIndex === idx).length > 0 && (
                <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[10px]">
                  {session.responses.filter((r) => r.questionIndex === idx).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{dist.totalResponses} Cevap</span>
          </div>
        </div>
      </div>

      {/* Aktif Soru ve Seçenekler Kartı */}
      {currentQ && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Soru #{currentQIndex + 1}
              </span>
              <div className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                <MathText>{currentQ.prompt}</MathText>
              </div>
            </div>
          </div>

          {/* 4 Şık ve Canlı Dağılım Çubukları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {currentQ.options.map((optionText, optIdx) => {
              const isCorrect = optIdx === currentQ.correctIndex;
              const count = dist.counts[optIdx];
              const pct = dist.percentages[optIdx];
              const showCheck = session.showDistribution && isCorrect;

              return (
                <div
                  key={optIdx}
                  className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition flex flex-col justify-between min-h-[96px] ${
                    session.showDistribution
                      ? isCorrect
                        ? 'border-emerald-400 bg-emerald-500/20 text-white ring-2 ring-emerald-500/50 shadow-lg'
                        : 'border-white/10 bg-slate-950/40 text-slate-400 opacity-80'
                      : OPTION_COLORS[optIdx]
                  }`}
                >
                  {/* Canlı Dağılım İlerleme Çubuğu */}
                  {session.showDistribution && (
                    <div
                      className={`absolute bottom-0 left-0 top-0 opacity-20 transition-all duration-700 ${OPTION_BAR_COLORS[optIdx]}`}
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                          session.showDistribution && isCorrect
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {OPTION_LETTERS[optIdx]}
                      </span>
                      <MathText className="font-semibold text-sm sm:text-base text-white">
                        {optionText}
                      </MathText>
                    </div>

                    {showCheck && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Doğru
                      </span>
                    )}
                  </div>

                  {/* Canlı Yüzde ve Kişi Sayısı */}
                  {session.showDistribution && (
                    <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">{count} Öğrenci</span>
                      <span className={isCorrect ? 'text-emerald-300 font-extrabold' : 'text-slate-400'}>
                        %{pct}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Kavram Yanılgısı Teşhis Kartı (Dağılım açıldığında) */}
          {session.showDistribution && currentQ.distractorExplanations && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Kavram Yanılgısı & Hata Teşhisi</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs text-amber-100">
                {Object.entries(currentQ.distractorExplanations).map(([idxStr, explanation]) => {
                  const idx = parseInt(idxStr, 10);
                  const count = dist.counts[idx];
                  if (count === 0 && !isCompleted) return null;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-start gap-2"
                    >
                      <span className="font-bold text-amber-400 shrink-0">
                        {OPTION_LETTERS[idx]} Şıkkı ({count} öğrenci):
                      </span>
                      <MathText as="span">{explanation}</MathText>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Öğretmen Kontrol Çubuğu */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDistribution}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition active:scale-95 shadow-md"
              >
                {session.showDistribution ? (
                  <>
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <span>Dağılımı Gizle</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Cevap Dağılımını Göster</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => changeQuestion(currentQIndex - 1)}
                className="inline-flex items-center gap-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" /> Önceki
              </button>

              {currentQIndex < session.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => changeQuestion(currentQIndex + 1)}
                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95"
                >
                  Sonraki Soru <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteSession}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg transition active:scale-95"
                >
                  <Award className="w-4 h-4" /> Çıkış Biletini Tamamla
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Oturum Tamamlandığında: Bir Sonraki Ders Tekrar Raporu */}
      {isCompleted && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-teal-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Ders Sonu Çıkış Bileti Raporu
              </h2>
              <p className="text-xs text-slate-300">
                Sınıfın anlık kavrama durumu ve bir sonraki derste pekiştirilmesi gereken noktalar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {session.questions.map((q, idx) => {
              const qDist = calculateDistribution(session, idx);
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-1.5 text-center"
                >
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Soru #{idx + 1} Kavrama
                  </span>
                  <div className="text-2xl font-black text-white">
                    %{qDist.correctPercentage}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {qDist.correctCount} / {qDist.totalResponses} Doğru
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default ExitTicketTeacherPresenter;
