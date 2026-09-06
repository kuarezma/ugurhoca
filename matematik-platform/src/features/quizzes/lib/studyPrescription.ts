import type { QuizQuestion } from '@/types/quiz';
import { getSavedMistakes, type SavedMistakeQuestion, type MistakeReason, MISTAKE_REASON_LABELS } from './mistakeStorage';

export interface StudyPrescription {
  id: string;
  generatedAt: string;
  focusTopic: string;
  weaknessType: string;
  weaknessEmoji: string;
  totalPendingMistakes: number;
  recommendedQuestions: QuizQuestion[];
  actionTip: string;
  estimatedMinutes: number;
}

const TOPIC_ACTION_TIPS: Record<string, string> = {
  'çarpanlar': 'EBOB ve EKOK sorularında sayıları asal çarpanlarına ayırıp ortak olanları işaretleyerek başla.',
  'üslü': 'Üslü sayılarda çarpma işleminde tabanlar aynıysa üslerin toplandığını, üssün üssünde üslerin çarpıldığını hatırla.',
  'kareköklü': 'Kök içindeki sayıyı tam kare bir sayı ile diğer sayının çarpımı şeklinde yazmayı (a√b) alışkanlık haline getir.',
  'olasılık': 'İstenen olası durumların sayısını tüm olası durumların sayısına oranlamadan önce örnek uzayı netleştir.',
  'üçgen': 'Üçgen eşitsizliğinde bir kenarın uzunluğu diğer iki kenarın farkından büyük, toplamından küçük olmalıdır.',
  'geometri': 'Geometri sorularında verilen uzunluk ve açıları mutlaka şekil üzerine eksiksiz aktar.',
  'cebirsel': 'Özdeşliklerde (a+b)² ve a²-b² açılımlarını ezberlemek yerine geometrik modelini gözünün önüne getir.',
};

export function generateStudyPrescription(customMistakes?: SavedMistakeQuestion[]): StudyPrescription | null {
  const mistakes = customMistakes ?? getSavedMistakes();
  const pending = mistakes.filter((m) => !m.mastered);

  if (pending.length === 0) {
    return null;
  }

  // 1. Konu bazlı hata sayısını grupla
  const topicCounts = new Map<string, { count: number; mistakes: SavedMistakeQuestion[] }>();
  const reasonCounts = new Map<MistakeReason, number>();

  for (const item of pending) {
    const topic = (item.quizTitle || 'Genel Matematik').trim();
    const current = topicCounts.get(topic) || { count: 0, mistakes: [] };
    current.count += 1;
    current.mistakes.push(item);
    topicCounts.set(topic, current);

    if (item.reason) {
      reasonCounts.set(item.reason, (reasonCounts.get(item.reason) || 0) + 1);
    }
  }

  // 2. En çok hata yapılan konuyu seç
  let topTopic = 'Genel Matematik';
  let maxTopicMistakes: SavedMistakeQuestion[] = [];
  let maxCount = -1;

  for (const [topic, data] of topicCounts.entries()) {
    if (data.count > maxCount) {
      maxCount = data.count;
      topTopic = topic;
      maxTopicMistakes = data.mistakes;
    }
  }

  // 3. En yaygın hata nedenini seç
  let dominantReason: MistakeReason = 'concept';
  let maxReasonCount = -1;
  for (const [reason, count] of reasonCounts.entries()) {
    if (count > maxReasonCount) {
      maxReasonCount = count;
      dominantReason = reason;
    }
  }

  const reasonInfo = MISTAKE_REASON_LABELS[dominantReason] || {
    label: 'Kural Eksikliği',
    shortLabel: 'Kural Eksikliği',
    emoji: '🟡',
  };

  // 4. Reçete soruları (en fazla 6 soru)
  const recommendedQuestions = maxTopicMistakes.slice(0, 6).map((m) => m.question);

  // 5. Konuya uygun tavsiye bul
  let actionTip = 'Hata yaptığın adımları kağıt üzerinde yazarak çöz ve her işlemi kontrol et.';
  const lowerTopic = topTopic.toLowerCase();
  for (const [key, tip] of Object.entries(TOPIC_ACTION_TIPS)) {
    if (lowerTopic.includes(key)) {
      actionTip = tip;
      break;
    }
  }

  return {
    id: `rx-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    focusTopic: topTopic,
    weaknessType: reasonInfo.shortLabel,
    weaknessEmoji: reasonInfo.emoji,
    totalPendingMistakes: pending.length,
    recommendedQuestions,
    actionTip,
    estimatedMinutes: Math.max(5, recommendedQuestions.length * 2),
  };
}
