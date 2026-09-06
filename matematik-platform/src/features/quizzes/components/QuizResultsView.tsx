'use client';

import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Target,
  AlertCircle,
  FileDown,
  Share2,
  BookOpen,
  Printer,
} from 'lucide-react';
import MathText from '@/components/MathText';
import { Mascot } from '@/components/Mascot';
import { QuizPacingCoach } from './QuizPacingCoach';
import type { Quiz, QuizQuestion } from '@/types/quiz';

export interface QuizResultsViewProps {
  score: number;
  quiz: Quiz | null;
  quizQuestions: QuizQuestion[];
  answers: { [key: number]: number };
  questionTimes: { [key: number]: number };
  startTime: number | null;
  onRetake: () => void;
  onBackToLobby: () => void;
  onOpenOutcomeAnalysis: () => void;
  onOpenMistakeModal: () => void;
  onDownloadPDF: () => void;
  pdfLoading?: boolean;
  onDownloadWord?: () => void;
  onShareResult?: () => void;
  onOpenMistakeNotebook?: () => void;
  onOpenWorksheet?: () => void;
}

export function QuizResultsView({
  score,
  quiz,
  quizQuestions,
  answers,
  questionTimes,
  startTime,
  onRetake,
  onBackToLobby,
  onOpenOutcomeAnalysis,
  onOpenMistakeModal,
  onDownloadPDF,
  pdfLoading = false,
  onDownloadWord,
  onShareResult,
  onOpenMistakeNotebook,
  onOpenWorksheet,
}: QuizResultsViewProps) {
  const correctCount = Object.values(answers).filter(
    (a, i) => a === quizQuestions[i]?.correct_index,
  ).length;

  const wrongCount = Object.values(answers).filter(
    (a, i) => a !== quizQuestions[i]?.correct_index,
  ).length;

  const mascotPose = score >= 80 ? 'celebrate' : score >= 50 ? 'waving' : 'thinking';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4">
            <Mascot pose={mascotPose} size={140} ariaLabel="Test sonucu maskot tepkisi" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            Test Tamamlandı!
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
            {quiz?.title}
          </h2>

          <div
            className={`text-6xl sm:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
              score >= 70
                ? 'from-green-400 to-emerald-400'
                : score >= 40
                ? 'from-amber-400 to-orange-400'
                : 'from-red-400 to-pink-400'
            }`}
          >
            {score}%
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="text-4xl font-black text-emerald-400 mb-1">{correctCount}</div>
              <div className="text-emerald-500/80 font-bold uppercase text-xs tracking-wider">
                Doğru
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <div className="text-4xl font-black text-red-400 mb-1">{wrongCount}</div>
              <div className="text-red-500/80 font-bold uppercase text-xs tracking-wider">
                Yanlış
              </div>
            </div>
          </div>

          {/* Sınav Tempo Koçu & Soru Başına Süre Analizi */}
          <div className="mb-8 w-full">
            <QuizPacingCoach
              mode="summary"
              questions={quizQuestions}
              questionTimes={questionTimes}
              answers={answers}
              totalSecondsSpent={startTime ? Math.floor((Date.now() - startTime) / 1000) : 0}
            />
          </div>

          {/* Soru Soru Sınav Analizi */}
          <div className="text-left bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" /> Sınav Analizi
            </h3>
            <div className="space-y-4">
              {quizQuestions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correct_index;
                const isUnanswered = userAnswer === undefined;
                const timeSpent = questionTimes[index] || 0;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <MathText
                          as="p"
                          className={`font-semibold text-sm ${
                            isCorrect ? 'text-emerald-300' : 'text-red-300'
                          }`}
                        >
                          {`${index + 1}. ${q.question}`}
                        </MathText>

                        {/* Süre & Tempo Rozeti */}
                        {timeSpent > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                                timeSpent > 150
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                  : timeSpent > 110
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                  : timeSpent >= 45
                                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>
                                {timeSpent > 150
                                  ? `⚠️ Zaman Tuzağı: ${Math.floor(timeSpent / 60)} dk ${timeSpent % 60} sn`
                                  : timeSpent > 110
                                  ? `⏳ Süre Uzadı: ${Math.floor(timeSpent / 60)} dk ${timeSpent % 60} sn`
                                  : timeSpent >= 45
                                  ? `⏱️ İdeal: ${timeSpent} sn`
                                  : `⚡ Hızlı: ${timeSpent} sn`}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="opacity-50 w-20 text-xs uppercase tracking-wider">
                          Cevabın:
                        </span>
                        <MathText
                          className={`font-medium px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-red-500/20 text-red-200'
                          }`}
                        >
                          {isUnanswered ? 'Boş Bırakıldı' : q.options[userAnswer]}
                        </MathText>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="opacity-50 w-20 text-xs uppercase tracking-wider">
                            Doğrusu:
                          </span>
                          <MathText className="font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                            {q.options[q.correct_index]}
                          </MathText>
                        </div>
                      )}

                      {/* Çeldirici Kavram Yanılgısı Teşhisi */}
                      {!isCorrect &&
                        !isUnanswered &&
                        userAnswer !== undefined &&
                        q.distractor_explanations?.[userAnswer] && (
                          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-rose-300">
                                💡 Kavram Yanılgısı Teşhisi ({String.fromCharCode(65 + userAnswer)} Şıkkı):
                              </span>
                              <p className="mt-0.5 leading-relaxed text-slate-300">
                                {q.distractor_explanations[userAnswer]}
                              </p>
                            </div>
                          </div>
                        )}

                      {q.explanation && (
                        <div className="mt-3 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <MathText as="p">{q.explanation}</MathText>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={onOpenOutcomeAnalysis}
              className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Target className="w-5 h-5 text-indigo-200" />
              Kazanım & Eksik Analizi
            </button>
            <button
              type="button"
              onClick={onOpenMistakeModal}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle className="w-5 h-5 text-slate-950" />
              Hata Defteri & Yanlışlarım
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Dene
            </button>
            <button
              type="button"
              onClick={onBackToLobby}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-5 h-5" />
              Testlere Dön
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 w-full">
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl border border-slate-700/50 transition"
            >
              <FileDown className="w-4 h-4 text-purple-400" />
              {pdfLoading ? 'PDF Hazırlanıyor...' : 'Sonuç Karnesini İndir (PDF)'}
            </button>
            {onDownloadWord && (
              <button
                type="button"
                onClick={onDownloadWord}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-white text-sm font-semibold rounded-xl border border-slate-700/50 transition"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                Testi Word (DOCX) İndir
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 w-full">
            {onShareResult && (
              <button
                type="button"
                onClick={onShareResult}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-xl border border-cyan-500/30 transition"
              >
                <Share2 className="w-4 h-4" />
                Sonucu Paylaş
              </button>
            )}
            {onOpenMistakeNotebook && (
              <button
                type="button"
                onClick={onOpenMistakeNotebook}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-sm font-semibold rounded-xl border border-amber-500/30 transition"
              >
                <BookOpen className="w-4 h-4" />
                Hata Defterimi Aç
              </button>
            )}
            {onOpenWorksheet && (
              <button
                type="button"
                onClick={onOpenWorksheet}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-xl border border-indigo-500/30 transition"
              >
                <Printer className="w-4 h-4" />
                A4 Test Yazdır
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
