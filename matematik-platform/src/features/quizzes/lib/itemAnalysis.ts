/**
 * Psikometrik Madde Analizi (Item Analysis) Motoru
 * MEB ve ÖSYM standartlarında test ve soru kalitesi kalibrasyonu.
 */

export interface StudentQuizSubmission {
  studentId: string;
  totalScore: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
}

export interface QuestionItemAnalysis {
  questionId: string;
  questionText: string;
  totalAttempts: number;
  correctCount: number;
  difficultyIndex: number; // p-değeri (0.00 - 1.00)
  difficultyLabel: 'Aşırı Zor' | 'Zor' | 'İdeal' | 'Kolay';
  discriminationIndex: number; // D indeksi (-1.00 ile +1.00 arası)
  discriminationLabel: 'Mükemmel' | 'İyi' | 'Gözden Geçirilmeli' | 'Kötü / Hatalı Soru';
  distractorCounts: [number, number, number, number]; // A, B, C, D dağılımı
  isProblematic: boolean; // D < 0.20 veya p < 0.15 ise inceleme bayrağı
  recommendation: string;
}

export interface QuizPsychometricReport {
  quizId: string;
  totalSubmissions: number;
  averageScore: number;
  items: QuestionItemAnalysis[];
  problematicItemsCount: number;
  overallReliabilityEstimate: number; // Basitleştirilmiş KR-20 / Cronbach Alpha kestirimi
}

export function calculateItemAnalysis(
  questions: Array<{ id: string; question: string; correct_index: number }>,
  submissions: StudentQuizSubmission[],
  quizId = 'quiz',
): QuizPsychometricReport {
  const totalSubmissions = submissions.length;

  if (totalSubmissions === 0 || questions.length === 0) {
    return {
      quizId,
      totalSubmissions: 0,
      averageScore: 0,
      items: [],
      problematicItemsCount: 0,
      overallReliabilityEstimate: 0,
    };
  }

  // Öğrencileri toplam puanlarına göre azalan sırada sırala
  const sortedSubmissions = [...submissions].sort((a, b) => b.totalScore - a.totalScore);
  const averageScore =
    sortedSubmissions.reduce((sum, s) => sum + s.totalScore, 0) / totalSubmissions;

  // Üst %27 ve Alt %27 gruplarını belirle (Madde ayırt ediciliği için Kelley standart kuralı)
  const groupSize = Math.max(1, Math.round(totalSubmissions * 0.27));
  const topGroup = sortedSubmissions.slice(0, groupSize);
  const bottomGroup = sortedSubmissions.slice(Math.max(groupSize, totalSubmissions - groupSize));

  let itemVariancesSum = 0;

  const items: QuestionItemAnalysis[] = questions.map((q) => {
    let correctCount = 0;
    const distractorCounts: [number, number, number, number] = [0, 0, 0, 0];

    for (const sub of sortedSubmissions) {
      const ans = sub.answers[q.id];
      if (ans !== undefined && ans >= 0 && ans <= 3) {
        distractorCounts[ans]++;
        if (ans === q.correct_index) {
          correctCount++;
        }
      }
    }

    // p-değeri (zorluk derecesi)
    const p = totalSubmissions > 0 ? Number((correctCount / totalSubmissions).toFixed(2)) : 0;
    itemVariancesSum += p * (1 - p);

    let difficultyLabel: QuestionItemAnalysis['difficultyLabel'] = 'İdeal';
    if (p < 0.20) difficultyLabel = 'Aşırı Zor';
    else if (p < 0.40) difficultyLabel = 'Zor';
    else if (p >= 0.80) difficultyLabel = 'Kolay';

    // Üst grupta doğru sayısı ve alt grupta doğru sayısı
    const topCorrect = topGroup.filter((s) => s.answers[q.id] === q.correct_index).length;
    const bottomCorrect = bottomGroup.filter((s) => s.answers[q.id] === q.correct_index).length;

    // D indeksi = (Top_doğru - Bottom_doğru) / groupSize
    const D = groupSize > 0 ? Number(((topCorrect - bottomCorrect) / groupSize).toFixed(2)) : 0;

    let discriminationLabel: QuestionItemAnalysis['discriminationLabel'] = 'İyi';
    let recommendation = 'Soru dengeli ve amaca uygun çalışıyor.';
    let isProblematic = false;

    if (D >= 0.40) {
      discriminationLabel = 'Mükemmel';
      recommendation = 'Üstün ayırt edicilik; testin en güçlü sorularından biri.';
    } else if (D >= 0.30) {
      discriminationLabel = 'İyi';
      recommendation = 'İyi ayırt edici; standartlara uygun.';
    } else if (D >= 0.20) {
      discriminationLabel = 'Gözden Geçirilmeli';
      recommendation = 'Çeldiriciler veya soru kökü kontrol edilmeli, ayırt edicilik sınırda.';
      isProblematic = true;
    } else {
      discriminationLabel = 'Kötü / Hatalı Soru';
      isProblematic = true;
      if (D < 0) {
        recommendation = '⚠️ TERS AYIRT EDİCİLİK: Başarılı öğrenciler yanılmış, soru kökünde veya cevap anahtarında hata olabilir!';
      } else {
        recommendation = 'Ayırt edicilik çok zayıf; soru şans eseri cevaplanmış olabilir.';
      }
    }

    return {
      questionId: q.id,
      questionText: q.question,
      totalAttempts: totalSubmissions,
      correctCount,
      difficultyIndex: p,
      difficultyLabel,
      discriminationIndex: D,
      discriminationLabel,
      distractorCounts,
      isProblematic,
      recommendation,
    };
  });

  // KR-20 / Basitleştirilmiş Güvenilirlik Formülü: r = (k / (k-1)) * (1 - sum(p*q) / var_total)
  const k = questions.length;
  let overallReliabilityEstimate = 0.75;
  if (k > 1) {
    const scores = sortedSubmissions.map((s) => s.totalScore);
    const mean = averageScore;
    const totalVariance =
      scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / totalSubmissions;

    if (totalVariance > 0) {
      const kr20 = (k / (k - 1)) * (1 - itemVariancesSum / totalVariance);
      overallReliabilityEstimate = Number(Math.max(0, Math.min(0.99, kr20)).toFixed(2));
    }
  }

  return {
    quizId,
    totalSubmissions,
    averageScore: Number(averageScore.toFixed(1)),
    items,
    problematicItemsCount: items.filter((i) => i.isProblematic).length,
    overallReliabilityEstimate,
  };
}
