'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  FileText,
  Clock,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Target,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getClientSession } from '@/lib/auth-client';
import DeferredFloatingShapes from '@/components/DeferredFloatingShapes';
import { Quiz, QuizQuestion } from '@/types/quiz';
import type { AppUser } from '@/types';

type TestsPageProps = {
  initialQuizzes?: Quiz[];
  initialUser?: AppUser | null;
  isHydrated?: boolean;
};

export default function TestsPage({
  initialQuizzes = [],
  initialUser = null,
  isHydrated = false,
}: TestsPageProps) {
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(!isHydrated);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const router = useRouter();
  const profileHref = user?.isAdmin ? '/admin' : '/profil';
  const initialUserKey = useMemo(
    () =>
      initialUser ? `${initialUser.id}:${String(initialUser.grade)}` : null,
    [initialUser],
  );
  const currentUserKey = user ? `${user.id}:${String(user.grade)}` : null;
  const visibleQuizzes = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.isAdmin) {
      return quizzes;
    }

    return quizzes.filter((quiz) => quiz.grade === Number(user.grade));
  }, [quizzes, user]);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getClientSession();
      if (!session) {
        router.push('/giris');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({ ...profile, email: session.user.email });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email ?? '',
          grade: session.user.user_metadata?.grade ?? 5,
        });
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!user) return;
      if (isHydrated && currentUserKey === initialUserKey) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let query = supabase
          .from('quizzes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!user.isAdmin && Number.isFinite(Number(user.grade))) {
          query = query.eq('grade', Number(user.grade));
        }

        const { data, error: quizError } = await query;

        if (quizError) throw quizError;
        if (data) setQuizzes(data);
      } catch (err) {
        console.error('Testler yüklenirken hata:', err);
        setError('Testler yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, [currentUserKey, initialUserKey, isHydrated, user]);

  const loadQuizQuestions = async (quizId: string) => {
    try {
      const { data, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });

      if (qError) throw qError;
      if (data) {
        if (data.length === 0) {
          throw new Error('Bu teste henüz soru eklenmemiş.');
        }
        setQuizQuestions(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Sorular yüklenirken hata:', err);
      alert(err instanceof Error ? err.message : 'Sorular yüklenemedi.');
      return false;
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    const success = await loadQuizQuestions(quiz.id);
    if (!success) return;

    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
    setStartTime(Date.now());
    setTimeLeft(quiz.time_limit * 60);
  };

  const selectAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswers({ ...answers, [currentQuestion]: index });
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(
        answers[currentQuestion + 1] !== undefined
          ? answers[currentQuestion + 1]
          : null,
      );
    } else {
      setShowResult(true);
      saveQuizResult();
    }
  };

  const calculateScore = useCallback(() => {
    if (quizQuestions.length === 0) return 0;
    let correct = 0;
    quizQuestions.forEach((q, i: number) => {
      if (answers[i] === q.correct_index) correct++;
    });
    return Math.round((correct / quizQuestions.length) * 100);
  }, [answers, quizQuestions]);

  const saveQuizResult = useCallback(async () => {
    if (!user || !selectedQuiz || !startTime) return;
    const score = calculateScore();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const { error: saveError } = await supabase.from('quiz_results').insert([
        {
          user_id: user.id,
          quiz_id: selectedQuiz.id,
          score,
          total_questions: quizQuestions.length,
          answers,
          time_spent: timeSpent,
        },
      ]);
      if (saveError) throw saveError;
    } catch (err) {
      console.error('Sonuç kaydedilirken hata:', err);
    }
  }, [
    answers,
    calculateScore,
    quizQuestions.length,
    selectedQuiz,
    startTime,
    user,
  ]);

  useEffect(() => {
    if (quizStarted && !showResult && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quizStarted && !showResult) {
      setShowResult(true);
      saveQuizResult();
    }
  }, [quizStarted, saveQuizResult, showResult, timeLeft]);

  useEffect(() => {
    if (showResult && quizQuestions.length > 0) {
      const finalScore = calculateScore();
      if (finalScore >= 80) {
        void import('canvas-confetti')
          .then(({ default: confetti }) =>
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#10b981'],
            }),
          )
          .catch(() => undefined);
      }
    }
  }, [calculateScore, quizQuestions.length, showResult]);

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
    setStartTime(null);
    setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay':
        return 'from-green-500 to-emerald-500';
      case 'Orta':
        return 'from-yellow-500 to-orange-500';
      case 'Zor':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  if (!user) return null;

  if (selectedQuiz && quizStarted && !showResult) {
    const question = quizQuestions[currentQuestion];

    return (
      <main className="testler-page min-h-screen gradient-bg flex items-center justify-center p-6">
        <DeferredFloatingShapes />

        <div className="w-full max-w-3xl relative z-10 animate-fade-up">
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={resetQuiz}
                className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Çıkış
              </button>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                  timeLeft !== null && timeLeft <= 30
                    ? 'bg-red-500/20 text-red-500 animate-pulse'
                    : 'bg-slate-800/50 text-slate-300'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{timeLeft !== null ? formatTime(timeLeft) : ''}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-400 font-semibold">
                  Soru {currentQuestion + 1} / {quizQuestions.length}
                </span>
                <span
                  className={`px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(
                    selectedQuiz.difficulty,
                  )} text-white text-sm font-semibold`}
                >
                  {selectedQuiz.difficulty}
                </span>
              </div>

              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div key={currentQuestion} className="animate-fade-up">
              <h2 className="text-2xl font-bold text-white mb-8">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options.map((option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      selectedAnswer === i
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="font-semibold mr-3">
                      {String.fromCharCode(65 + i)})
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className={`w-full mt-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white glow-button'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {currentQuestion < quizQuestions.length - 1 ? (
                <>
                  Sonraki Soru
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Testi Bitir
                  <Trophy className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (selectedQuiz && showResult) {
    const score = calculateScore();

    const handleDownloadPDF = async () => {
      setPdfLoading(true);
      try {
        const { downloadQuizPDF } = await import('@/lib/pdf-export');
        await downloadQuizPDF(selectedQuiz.title);
      } finally {
        setPdfLoading(false);
      }
    };

    return (
      <main className="testler-page min-h-screen gradient-bg flex items-center justify-center p-6">
        <DeferredFloatingShapes />

        <div className="w-full max-w-2xl relative z-10 animate-fade-up">
          <div
            id="quiz-result-pdf"
            className="glass rounded-3xl p-8 text-center"
          >
            <div
              className={`animate-fade-up w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= 70
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : score >= 40
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-br from-red-400 to-pink-500'
              }`}
              style={{ animationDelay: '120ms' }}
            >
              {score >= 70 ? (
                <Trophy className="w-16 h-16 text-white" />
              ) : score >= 40 ? (
                <Target className="w-16 h-16 text-white" />
              ) : (
                <Zap className="w-16 h-16 text-white" />
              )}
            </div>

            <h2 className="text-4xl font-bold text-white mb-2">
              {score >= 80
                ? 'Harika Çıkardın!'
                : score >= 60
                  ? 'Tebrikler!'
                  : score >= 40
                    ? 'Daha İyisini Yapabilirsin!'
                    : 'Pratiğe Devam!'}
            </h2>

            <div
              className={`text-7xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
                score >= 80
                  ? 'from-green-400 to-emerald-400'
                  : score >= 40
                    ? 'from-amber-400 to-orange-400'
                    : 'from-red-400 to-pink-400'
              }`}
            >
              {score}%
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="text-4xl font-black text-emerald-400 mb-1">
                  {
                    Object.values(answers).filter(
                      (a, i) => a === quizQuestions[i]?.correct_index,
                    ).length
                  }
                </div>
                <div className="text-emerald-500/80 font-bold uppercase text-xs tracking-wider">
                  Doğru
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <div className="text-4xl font-black text-red-400 mb-1">
                  {
                    Object.values(answers).filter(
                      (a, i) => a !== quizQuestions[i]?.correct_index,
                    ).length
                  }
                </div>
                <div className="text-red-500/80 font-bold uppercase text-xs tracking-wider">
                  Yanlış
                </div>
              </div>
            </div>

            <div className="text-left bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Sınav Analizi
              </h3>
              <div className="space-y-4">
                {quizQuestions.map((q, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === q.correct_index;
                  const isUnanswered =
                    userAnswer === undefined || userAnswer === null;

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
                        <p
                          className={`font-semibold text-sm ${
                            isCorrect ? 'text-emerald-300' : 'text-red-300'
                          }`}
                        >
                          {index + 1}. {q.question}
                        </p>
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
                          <span
                            className={`font-medium px-2 py-0.5 rounded ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : 'bg-red-500/20 text-red-200'
                            }`}
                          >
                            {isUnanswered
                              ? 'Boş Bırakıldı'
                              : q.options[userAnswer]}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span className="opacity-50 w-20 text-xs uppercase tracking-wider">
                              Doğrusu:
                            </span>
                            <span className="font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                              {q.options[q.correct_index]}
                            </span>
                          </div>
                        )}
                        {q.explanation && (
                          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startQuiz(selectedQuiz)}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              >
                <RotateCcw className="w-5 h-5" />
                Tekrar Dene
              </button>
              <button
                onClick={resetQuiz}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              >
                <ArrowLeft className="w-5 h-5" />
                Testlere Dön
              </button>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="animate-slide-up w-full mt-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ animationDelay: '240ms' }}
          >
            {pdfLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-emerald-400" />
            )}
            {pdfLoading ? 'PDF Hazırlanıyor...' : 'Sınav Raporunu PDF İndir'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="testler-page min-h-screen gradient-bg pb-20">
      <DeferredFloatingShapes />

      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link
            href={profileHref}
            className="text-slate-300 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {user.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="mb-8 animate-fade-up">
            <h1 className="text-4xl font-bold text-white mb-2">
              Online Testler
            </h1>
            <p className="text-slate-400">
              Bilginizi test edin ve kendinizi geliştirin
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-400">Yükleniyor...</p>
              </div>
            ) : visibleQuizzes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">
                  {user.isAdmin
                    ? 'Henüz Aktif Test Bulunamadı'
                    : `${user.grade}. Sınıf İçin Test Bulunamadı`}
                </h3>
                <p className="text-slate-500">
                  Yakında bu sınıf seviyesi için yeni testler eklenecektir.
                </p>
              </div>
            ) : (
              visibleQuizzes.map((quiz, i: number) => (
                <div
                  key={quiz.id}
                  className="glass rounded-2xl overflow-hidden card-hover animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}`}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.time_limit} dk
                      </span>
                      <span>{quiz.grade}. Sınıf</span>
                      <span>{quiz.difficulty}</span>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 glow-button transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4" />
                      Başla
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
