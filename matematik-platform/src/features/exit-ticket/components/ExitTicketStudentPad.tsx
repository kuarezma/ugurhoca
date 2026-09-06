'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Send,
  User,
  Hash,
} from 'lucide-react';
import MathText from '@/components/MathText';
import type { ExitTicketSession } from '../types';
import {
  getSessionByCode,
  submitExitTicketResponse,
} from '../lib/exitTicketStorage';

export interface ExitTicketStudentPadProps {
  initialCode?: string;
  onExit?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_THEMES = [
  {
    letterBg: 'bg-rose-500 text-white',
    border: 'border-rose-500/40 hover:border-rose-400 bg-rose-500/10 active:bg-rose-500/20',
    selected: 'border-rose-500 bg-rose-500/25 ring-2 ring-rose-500',
  },
  {
    letterBg: 'bg-sky-500 text-white',
    border: 'border-sky-500/40 hover:border-sky-400 bg-sky-500/10 active:bg-sky-500/20',
    selected: 'border-sky-500 bg-sky-500/25 ring-2 ring-sky-500',
  },
  {
    letterBg: 'bg-amber-500 text-white',
    border: 'border-amber-500/40 hover:border-amber-400 bg-amber-500/10 active:bg-amber-500/20',
    selected: 'border-amber-500 bg-amber-500/25 ring-2 ring-amber-500',
  },
  {
    letterBg: 'bg-emerald-500 text-white',
    border: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 active:bg-emerald-500/20',
    selected: 'border-emerald-500 bg-emerald-500/25 ring-2 ring-emerald-500',
  },
];

export function ExitTicketStudentPad({ initialCode = '', onExit }: ExitTicketStudentPadProps) {
  const [code, setCode] = useState(initialCode);
  const [studentName, setStudentName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [session, setSession] = useState<ExitTicketSession | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Tablar arası veya aynı sekmede local storage değişikliklerini anlık algılama
  const refreshSession = useCallback(() => {
    if (!session) return;
    const latest = getSessionByCode(session.code);
    if (latest) {
      setSession(latest);
    }
  }, [session]);

  useEffect(() => {
    if (!isJoined || !session) return;

    // 1.2 saniyede bir veya storage event'i ile oturum durumunu güncelle (öğretmen soru değiştirdiğinde veya dağılımı açtığında)
    const interval = setInterval(refreshSession, 1200);
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('exit_ticket')) {
        refreshSession();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isJoined, session, refreshSession]);

  // Önceden girilmiş kod varsa otomatik bulmayı dene
  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      const found = getSessionByCode(initialCode);
      if (found) {
        setSession(found);
      }
    }
  }, [initialCode]);

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setJoinError(null);

    const cleanCode = code.trim();
    const cleanName = studentName.trim();

    if (!cleanCode || cleanCode.length < 6) {
      setJoinError('Lütfen 6 haneli katılım kodunu girin.');
      return;
    }
    if (!cleanName) {
      setJoinError('Lütfen adınızı veya takma adınızı girin.');
      return;
    }

    const found = getSessionByCode(cleanCode);
    if (!found) {
      setJoinError('Bu koda sahip aktif bir çıkış bileti oturumu bulunamadı. Lütfen tahtadaki kodu kontrol edin.');
      return;
    }

    setSession(found);
    setIsJoined(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!session) return;
    const qIndex = session.currentQuestionIndex;

    const updated = submitExitTicketResponse(session.id, qIndex, studentName, optionIndex);
    if (updated) {
      setSession({ ...updated });
    }
  };

  // Henüz oturuma katılmamışsa PIN & Ad Soyad Ekranı
  if (!isJoined || !session) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-white">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 p-0.5 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">Çıkış Bileti Öğrenci Girişi</h2>
          <p className="text-sm text-slate-400 mt-1">
            Akıllı tahtada veya ekranda gördüğünüz 6 haneli PIN kodunu girin.
          </p>
        </div>

        {joinError && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <span>{joinError}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="ticket-pin-input" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-amber-400" /> 6 Haneli Katılım Kodu (PIN)
            </label>
            <input
              id="ticket-pin-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Örn: 582914"
              className="w-full text-center tracking-widest font-mono text-2xl font-bold bg-slate-950/80 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 outline-none text-amber-300 placeholder:text-slate-600 transition"
            />
          </div>

          <div>
            <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" /> Adınız / Takma Adınız
            </label>
            <input
              id="student-name-input"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Örn: Mehmet Ali"
              maxLength={30}
              className="w-full bg-slate-950/80 border border-white/10 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl px-4 py-3 outline-none text-white placeholder:text-slate-600 transition text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-[0.99] transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>Derse Bağlan</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Örnek demo test oturumu için PIN kodu: <strong className="text-slate-400 font-mono">123456</strong>
        </div>
      </div>
    );
  }

  const currentQIndex = session.currentQuestionIndex;
  const currentQ = session.questions[currentQIndex];
  const isSessionCompleted = session.status === 'completed';

  // Öğrencinin bu soruya verdiği cevap
  const studentResponse = session.responses.find(
    (r) => r.questionIndex === currentQIndex && r.studentName.toLowerCase() === studentName.trim().toLowerCase(),
  );
  const hasAnswered = studentResponse !== undefined;
  const isRevealed = session.showDistribution || isSessionCompleted;

  // Tüm oturum bittiyse sonuç özet kartı
  if (isSessionCompleted) {
    const studentAllResponses = session.responses.filter(
      (r) => r.studentName.toLowerCase() === studentName.trim().toLowerCase(),
    );
    const correctAnswers = studentAllResponses.filter((r) => {
      const q = session.questions[r.questionIndex];
      return q && r.selectedIndex === q.correctIndex;
    }).length;

    return (
      <div className="w-full max-w-lg mx-auto p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl text-white text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center mb-5 text-emerald-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          Bilet Tamamlandı!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Harika Katılım, {studentName}!</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
          Ders sonu değerlendirmeni başarıyla tamamladın. Öğretmenin sonuçları incelediğinde eksiklerini birlikte kapatacaksınız.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-around">
          <div>
            <span className="block text-xs text-slate-500 uppercase font-semibold">Toplam Soru</span>
            <span className="text-2xl font-black text-white">{session.questions.length}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="block text-xs text-slate-500 uppercase font-semibold">Doğru Cevabın</span>
            <span className="text-2xl font-black text-emerald-400">{correctAnswers}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="block text-xs text-slate-500 uppercase font-semibold">Başarın</span>
            <span className="text-2xl font-black text-amber-400">
              %{Math.round((correctAnswers / Math.max(1, session.questions.length)) * 100)}
            </span>
          </div>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3 px-6 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-white transition"
          >
            Çıkış Yap
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 text-white">
      {/* Üst Durum Çubuğu */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {session.title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Öğrenci:</span>
          <span className="font-bold text-amber-400">{studentName}</span>
        </div>
      </div>

      {/* Soru Kartı */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              Soru {currentQIndex + 1} / {session.questions.length}
            </span>
            <span className="text-xs text-slate-400">Tek Seferde Cevapla</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Tahta ile Eşzamanlı</span>
          </div>
        </div>

        {/* Soru Metni */}
        <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed min-h-[50px]">
          <MathText>{currentQ?.prompt || 'Soru yükleniyor...'}</MathText>
        </div>

        {/* Seçenekler (Mobil Pad Uyumlu Büyük Dokunmatik Butonlar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQ?.options.map((option, idx) => {
            const isSelected = studentResponse?.selectedIndex === idx;
            const isCorrect = isRevealed && idx === currentQ.correctIndex;
            const isWrongSelected = isRevealed && isSelected && !isCorrect;
            const theme = OPTION_THEMES[idx % OPTION_THEMES.length];

            let buttonStyle = `${theme.border}`;
            if (isSelected && !isRevealed) {
              buttonStyle = `${theme.selected}`;
            }
            if (isCorrect) {
              buttonStyle = 'border-emerald-500 bg-emerald-500/25 ring-2 ring-emerald-500';
            } else if (isWrongSelected) {
              buttonStyle = 'border-rose-500 bg-rose-500/25 ring-2 ring-rose-500';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isRevealed}
                className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 relative overflow-hidden group ${buttonStyle}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md ${
                    isCorrect
                      ? 'bg-emerald-500 text-white'
                      : isWrongSelected
                      ? 'bg-rose-500 text-white'
                      : theme.letterBg
                  }`}
                >
                  {OPTION_LETTERS[idx]}
                </div>

                <div className="flex-1 pt-1 text-sm sm:text-base text-slate-200 group-hover:text-white transition">
                  <MathText>{option}</MathText>
                </div>

                {/* Yanıt Durumu İkonu */}
                {isSelected && !isRevealed && (
                  <div className="text-amber-400 self-center flex-shrink-0">
                    <Send className="w-5 h-5 animate-pulse" />
                  </div>
                )}
                {isCorrect && (
                  <div className="text-emerald-400 self-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {isWrongSelected && (
                  <div className="text-rose-400 self-center flex-shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Cevap Verildi Bilgilendirmesi (Sonuçlar henüz açılmadıysa) */}
        {hasAnswered && !isRevealed && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3 text-amber-300 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold">Cevabın Alındı: {OPTION_LETTERS[studentResponse.selectedIndex]} Şıkkı</p>
              <p className="text-xs text-amber-400/80">
                Öğretmen sınıf dağılımını açtığında doğru cevabı ve pedagojik açıklamayı burada göreceksin. Şıkkını değiştirmek istersen başka bir şıkka dokunabilirsin.
              </p>
            </div>
          </div>
        )}

        {/* Dağılım ve Kavram Yanılgısı Teşhisi (Öğretmen Dağılımı Açtığında) */}
        {isRevealed && (
          <div className="flex flex-col gap-3 mt-1 pt-4 border-t border-white/10">
            {/* Yanlış Seçilmişse Kavram Yanılgısı Teşhis Kartı */}
            {hasAnswered &&
              studentResponse.selectedIndex !== currentQ.correctIndex &&
              currentQ.distractorExplanations?.[studentResponse.selectedIndex] && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 sm:p-5 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-300 text-sm flex items-center gap-2">
                      💡 Kavram Yanılgısı Teşhisi: Neden {OPTION_LETTERS[studentResponse.selectedIndex]} Şıkkını Seçtin?
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                      {currentQ.distractorExplanations[studentResponse.selectedIndex]}
                    </p>
                  </div>
                </div>
              )}

            {/* Doğru Yapılmışsa Tebrik */}
            {hasAnswered && studentResponse.selectedIndex === currentQ.correctIndex && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-400" />
                <div className="text-sm">
                  <span className="font-bold">Tebrikler, doğru cevap! </span>
                  Kazanımı eksiksiz kavramışsın.
                </div>
              </div>
            )}

            {/* Sorunun Genel Çözüm Açıklaması */}
            {currentQ.explanation && (
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs sm:text-sm text-sky-200">
                <span className="font-bold text-sky-300 block mb-1">📖 Çözüm Adımı:</span>
                <MathText>{currentQ.explanation}</MathText>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
