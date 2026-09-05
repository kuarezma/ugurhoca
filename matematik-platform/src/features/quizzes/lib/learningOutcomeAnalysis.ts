import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';
import type { QuizQuestion } from '@/types/quiz';

export type OutcomeMasteryStatus = 'critical' | 'developing' | 'mastered';

export type OutcomeAnalysisItem = {
  topic: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  accuracy: number;
  status: OutcomeMasteryStatus;
  worksheetHref: string;
  summaryHref: string;
};

export type QuizOutcomeAnalysisResult = {
  overallAccuracy: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  items: OutcomeAnalysisItem[];
  criticalCount: number;
  needsRemediation: boolean;
};

/**
 * Belirli bir metin veya başlık içinden bilinen müfredat konusunu tespit eder.
 */
export function detectTopicFromText(text: string, grade: number | string = 8): string {
  const gradeKey = String(grade);
  const candidateTopics = GRADE_TOPIC_OPTIONS[gradeKey] || GRADE_TOPIC_OPTIONS['8'];

  const lower = text.toLocaleLowerCase('tr-TR');

  for (const topic of candidateTopics) {
    if (lower.includes(topic.toLocaleLowerCase('tr-TR'))) {
      return topic;
    }
  }

  // Sık kullanılan anahtar kelimeler
  const KEYWORD_MAP: Record<string, string> = {
    üslü: 'Üslü İfadeler',
    karekök: 'Kareköklü İfadeler',
    çarpan: 'Çarpanlar ve Katlar',
    katlar: 'Çarpanlar ve Katlar',
    ebob: 'Çarpanlar ve Katlar',
    ekok: 'Çarpanlar ve Katlar',
    olasılık: 'Olasılık',
    rasyonel: 'Rasyonel Sayılar',
    denklem: 'Doğrusal Denklemler',
    eşitsizlik: 'Eşitsizlikler',
    üçgen: 'Üçgenler',
    pisagor: 'Üçgenler',
    cebir: 'Cebirsel İfadeler',
    veri: 'Veri Analizi',
    geometri: 'Geometrik Cisimler',
  };

  for (const [kw, t] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      return t;
    }
  }

  return candidateTopics[0] || 'Genel Matematik';
}

/**
 * Test sonuçlarını kazanım/konu bazında analiz eder.
 */
export function analyzeQuizLearningOutcomes(params: {
  questions: QuizQuestion[];
  answers: Record<number, number>;
  quizTitle?: string;
  grade?: number | string;
}): QuizOutcomeAnalysisResult {
  const { questions, answers, quizTitle = '', grade = 8 } = params;

  if (questions.length === 0) {
    return {
      overallAccuracy: 100,
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      emptyCount: 0,
      items: [],
      criticalCount: 0,
      needsRemediation: false,
    };
  }

  const defaultTopicFromTitle = detectTopicFromText(quizTitle, grade);

  // Konu bazında gruplama
  const topicMap = new Map<
    string,
    { total: number; correct: number; wrong: number; empty: number }
  >();

  let totalCorrect = 0;
  let totalWrong = 0;
  let totalEmpty = 0;

  questions.forEach((q, idx) => {
    // Soru metni ya da açıklamasından daha spesifik bir konu var mı bak
    const questionText = `${q.question} ${q.explanation || ''}`;
    const matchedTopic = detectTopicFromText(questionText, grade) || defaultTopicFromTitle;
    const topic = matchedTopic === 'Genel Matematik' ? defaultTopicFromTitle : matchedTopic;

    if (!topicMap.has(topic)) {
      topicMap.set(topic, { total: 0, correct: 0, wrong: 0, empty: 0 });
    }
    const stat = topicMap.get(topic)!;
    stat.total += 1;

    const userAnswer = answers[idx];
    if (userAnswer === undefined || userAnswer === null) {
      stat.empty += 1;
      totalEmpty += 1;
    } else if (userAnswer === q.correct_index) {
      stat.correct += 1;
      totalCorrect += 1;
    } else {
      stat.wrong += 1;
      totalWrong += 1;
    }
  });

  const items: OutcomeAnalysisItem[] = Array.from(topicMap.entries()).map(
    ([topic, stat]) => {
      const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      let status: OutcomeMasteryStatus = 'mastered';
      if (accuracy < 50) {
        status = 'critical';
      } else if (accuracy < 80) {
        status = 'developing';
      }

      const cleanGrade = String(grade);
      const worksheetHref = `/icerikler?type=yaprak-test&grade=${cleanGrade}&search=${encodeURIComponent(topic)}`;
      const summaryHref = `/icerikler?type=ozet&grade=${cleanGrade}&search=${encodeURIComponent(topic)}`;

      return {
        topic,
        totalQuestions: stat.total,
        correctCount: stat.correct,
        wrongCount: stat.wrong,
        emptyCount: stat.empty,
        accuracy,
        status,
        worksheetHref,
        summaryHref,
      };
    },
  );

  // Kritik eksikleri ve başarı oranı düşük konuları en üste sırala
  items.sort((a, b) => a.accuracy - b.accuracy);

  const overallAccuracy =
    questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;
  const criticalCount = items.filter((i) => i.status === 'critical').length;
  const needsRemediation = items.some((i) => i.status !== 'mastered');

  return {
    overallAccuracy,
    totalQuestions: questions.length,
    correctCount: totalCorrect,
    wrongCount: totalWrong,
    emptyCount: totalEmpty,
    items,
    criticalCount,
    needsRemediation,
  };
}
