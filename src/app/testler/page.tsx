'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, FileText, Clock, Trophy, ArrowLeft,
  CheckCircle2, XCircle, ChevronRight, Play, RotateCcw,
  Zap, Target, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-5"
        style={{
          width: Math.random() * 150 + 100,
          height: Math.random() * 150 + 100,
          background: ['#8b5cf6', '#ec4899', '#06b6d4'][i % 3],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}
      />
    ))}
  </div>
);

const sampleQuizzes = [
  { 
    id: 1, 
    title: 'Rasyonel Sayılar Testi', 
    grade: 7, 
    questions: 10, 
    time: 15, 
    difficulty: 'Orta',
    description: 'Rasyonel sayılar konusundaki bilginizi test edin',
    completed: false,
    bestScore: null
  },
  { 
    id: 2, 
    title: 'Üslü Sayılar Deneme', 
    grade: 8, 
    questions: 15, 
    time: 20, 
    difficulty: 'Zor',
    description: 'Üslü sayılar ve köklü sayılar',
    completed: true,
    bestScore: 85
  },
  { 
    id: 3, 
    title: 'Cebirsel İfadeler Quiz', 
    grade: 6, 
    questions: 8, 
    time: 10, 
    difficulty: 'Kolay',
    description: 'Cebirsel ifadeler ve denklemler',
    completed: false,
    bestScore: null
  },
];

const quizQuestions = {
  1: [
    { id: 1, question: '3/4 + 1/2 işleminin sonucu kaçtır?', options: ['5/4', '4/6', '3/8', '1'], correct: 0 },
    { id: 2, question: 'Aşağıdakilerden hangisi rasyonel sayıdır?', options: ['√2', 'π', '0.333...', '√5'], correct: 2 },
    { id: 3, question: '-3/5 sayısının çarpmaya göre tersi nedir?', options: ['5/3', '-5/3', '3/5', '-3/5'], correct: 1 },
    { id: 4, question: '2/3 ÷ 4/9 işleminin sonucu kaçtır?', options: ['3/2', '8/27', '6/12', '1/2'], correct: 0 },
    { id: 5, question: '1/2 + 1/3 + 1/6 işleminin sonucu kaçtır?', options: ['1', '6/11', '3/6', '2/3'], correct: 0 },
  ],
  2: [
    { id: 1, question: '2³ + 3² işleminin sonucu kaçtır?', options: ['17', '15', '19', '11'], correct: 0 },
    { id: 2, question: '5⁰ + 3⁰ işleminin sonucu kaçtır?', options: ['8', '2', '1', '0'], correct: 1 },
    { id: 3, question: '4³ × 4² işleminin sonucu kaçtır?', options: ['4⁵', '4⁶', '4⁴', '16⁵'], correct: 0 },
    { id: 4, question: '√144 + √81 işleminin sonucu kaçtır?', options: ['21', '23', '19', '15'], correct: 0 },
    { id: 5, question: '2⁴ ÷ 2² işleminin sonucu kaçtır?', options: ['2²', '2⁶', '2⁸', '1'], correct: 0 },
  ],
  3: [
    { id: 1, question: '3x + 5 = 14 denkleminin çözümü nedir?', options: ['x = 3', 'x = 5', 'x = 4', 'x = 2'], correct: 0 },
    { id: 2, question: '2x - 7 = 9 denkleminin çözümü nedir?', options: ['x = 6', 'x = 8', 'x = 7', 'x = 5'], correct: 1 },
    { id: 3, question: 'x + 4 = 10 denkleminin çözümü nedir?', options: ['x = 6', 'x = 7', 'x = 5', 'x = 4'], correct: 0 },
    { id: 4, question: '5x = 25 denkleminin çözümü nedir?', options: ['x = 6', 'x = 4', 'x = 5', 'x = 3'], correct: 2 },
    { id: 5, question: 'x/3 = 6 denkleminin çözümü nedir?', options: ['x = 18', 'x = 20', 'x = 15', 'x = 12'], correct: 0 },
  ],
};

export default function TestsPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const router = useRouter();
  const profileHref = user?.isAdmin ? '/admin' : '/profil';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
          email: session.user.email,
          grade: session.user.user_metadata?.grade ?? 5
        });
      }
    };
    checkSession();
  }, [router]);

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const selectAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswers({ ...answers, [currentQuestion]: index });
  };

  const nextQuestion = () => {
    if (currentQuestion < (quizQuestions[selectedQuiz.id as keyof typeof quizQuestions]?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] !== undefined ? answers[currentQuestion + 1] : null);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    const questions = quizQuestions[selectedQuiz.id as keyof typeof quizQuestions] || [];
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'from-green-500 to-emerald-500';
      case 'Orta': return 'from-yellow-500 to-orange-500';
      case 'Zor': return 'from-red-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  if (!user) return null;

  if (selectedQuiz && quizStarted && !showResult) {
    const questions = quizQuestions[selectedQuiz.id as keyof typeof quizQuestions] || [];
    const question = questions[currentQuestion];

    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <FloatingShapes />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl relative z-10"
        >
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <button onClick={resetQuiz} className="text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Çıkış
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-5 h-5" />
                <span>{selectedQuiz.time} dk</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-400 font-semibold">
                  Soru {currentQuestion + 1} / {questions.length}
                </span>
                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getDifficultyColor(selectedQuiz.difficulty)} text-white text-sm font-semibold`}>
                  {selectedQuiz.difficulty}
                </span>
              </div>
              
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-8">
                  {question.question}
                </h2>

                <div className="space-y-4">
                  {question.options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectAnswer(i)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedAnswer === i
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      <span className="font-semibold mr-3">{String.fromCharCode(65 + i)})</span>
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className={`w-full mt-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white glow-button'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {currentQuestion < questions.length - 1 ? (
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
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (selectedQuiz && showResult) {
    const score = calculateScore();
    const questions = quizQuestions[selectedQuiz.id as keyof typeof quizQuestions] || [];

    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <FloatingShapes />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl relative z-10"
        >
          <div className="glass rounded-3xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= 70 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                score >= 40 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                'bg-gradient-to-br from-red-400 to-pink-500'
              }`}
            >
              {score >= 70 ? (
                <Trophy className="w-16 h-16 text-white" />
              ) : score >= 40 ? (
                <Target className="w-16 h-16 text-white" />
              ) : (
                <Zap className="w-16 h-16 text-white" />
              )}
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-2">
              {score >= 70 ? 'Tebrikler!' : score >= 40 ? 'İyi Deneme!' : 'Bir Dahaki Sefere!'}
            </h2>
            
            <div className="text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {score}%
            </div>

            <p className="text-slate-400 mb-8">
              {score >= 70 ? 'Harika bir performans!' : score >= 40 ? 'Biraz daha pratik yapmalısın.' : 'Konuyu tekrar çalışmanı öneririz.'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">
                  {Object.values(answers).filter((a, i) => a === questions[i]?.correct).length}
                </div>
                <div className="text-slate-400">Doğru</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400">
                  {Object.values(answers).filter((a, i) => a !== questions[i]?.correct).length}
                </div>
                <div className="text-slate-400">Yanlış</div>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(selectedQuiz)}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Tekrar Dene
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="flex-1 py-4 glass text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Geri Dön
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={profileHref} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link href={profileHref} className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            {user.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Online Testler</h1>
            <p className="text-slate-400">
              Bilginizi test edin ve kendinizi geliştirin
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleQuizzes.filter(q => q.grade === user.grade).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">{user.grade}. Sınıf İçin Test Bulunamadı</h3>
                <p className="text-slate-500">Yakında bu sınıf seviyesi için yeni testler eklenecektir.</p>
              </div>
            ) : sampleQuizzes.filter(q => q.grade === user.grade).map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl overflow-hidden card-hover"
              >
                <div className={`h-2 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    {quiz.bestScore && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold">{quiz.bestScore}%</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {quiz.questions} soru
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.time} dk
                    </span>
                    <span>{quiz.grade}. Sınıf</span>
                  </div>

                  {quiz.completed ? (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startQuiz(quiz)}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Tekrar Çöz
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startQuiz(quiz)}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 glow-button"
                    >
                      <Play className="w-4 h-4" />
                      Başla
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


    </main>
  );
}
