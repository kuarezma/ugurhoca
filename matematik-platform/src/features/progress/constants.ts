import { isGraduateGrade } from '@/lib/grade';
import type { GradeValue } from '@/types';
import topicMeta from './topics-2026.json';

export const GRADE_TOPIC_META: Record<
  string,
  readonly { topic: string; theme: string; aliases: readonly string[] }[]
> = topicMeta;

const DEFAULT_GRADE_KEY = '5';
const MEZUN_GRADE_KEY = '12';

export const GRADE_TOPIC_OPTIONS: Record<string, readonly string[]> = {
  '5': GRADE_TOPIC_META['5'].map((item) => item.topic),
  '6': GRADE_TOPIC_META['6'].map((item) => item.topic),
  '7': GRADE_TOPIC_META['7'].map((item) => item.topic),
  '8': GRADE_TOPIC_META['8'].map((item) => item.topic),
  '9': [
    'Mantık',
    'Kümeler',
    'Gerçek Sayılar',
    'Üslü ve Köklü İfadeler',
    'Polinomlar',
    'Denklem ve Eşitsizlikler',
    'Üçgenler',
    'Veri Analizi',
  ],
  '10': [
    'Fonksiyonlar',
    'Polinomlar',
    'İkinci Dereceden Denklemler',
    'Dörtgenler ve Çokgenler',
    'Çember ve Daire',
    'Katı Cisimler',
    'Permütasyon ve Kombinasyon',
    'Olasılık',
  ],
  '11': [
    'Trigonometri',
    'Analitik Geometri',
    'Fonksiyon Uygulamaları',
    'Logaritma',
    'Diziler',
    'Parabol',
    'Dönüşümler',
    'Katı Cisimler',
  ],
  '12': [
    'Limit',
    'Türev',
    'İntegral',
    'Trigonometri',
    'Analitik Geometri',
    'Çember ve Daire',
    'Olasılık',
    'Binom ve Diziler',
  ],
};

const normalizeGradeToTopicKey = (grade?: GradeValue | string | null) => {
  if (isGraduateGrade(grade)) {
    return MEZUN_GRADE_KEY;
  }

  if (typeof grade === 'number' && Number.isFinite(grade)) {
    return String(Math.min(12, Math.max(5, Math.trunc(grade))));
  }

  if (typeof grade === 'string') {
    const normalized = grade.trim();

    if (normalized.toLowerCase() === 'mezun') {
      return MEZUN_GRADE_KEY;
    }

    const numericGrade = Number.parseInt(normalized, 10);
    if (Number.isFinite(numericGrade)) {
      return String(Math.min(12, Math.max(5, numericGrade)));
    }
  }

  return DEFAULT_GRADE_KEY;
};

export const getTopicsForGrade = (grade?: GradeValue | string | null) => {
  const gradeKey = normalizeGradeToTopicKey(grade);

  return [
    ...(GRADE_TOPIC_OPTIONS[gradeKey] ||
      GRADE_TOPIC_OPTIONS[DEFAULT_GRADE_KEY]),
  ];
};

export const normalizeTopicText = (value: string) =>
  value.normalize('NFC').toLocaleLowerCase('tr').trim().replace(/\s+/g, ' ');

export function getTopicNames(
  grade: GradeValue | string | null | undefined,
  topic: string,
) {
  const normalized = normalizeTopicText(topic);
  const item = GRADE_TOPIC_META[normalizeGradeToTopicKey(grade)]?.find(
    (entry) =>
      [entry.topic, ...entry.aliases].some(
        (name) => normalizeTopicText(name) === normalized,
      ),
  );
  return item ? [item.topic, ...item.aliases] : [topic];
}

export function resolveTopicName(
  grade: GradeValue | string | null | undefined,
  topic: string,
) {
  return getTopicNames(grade, topic)[0];
}

/** Türkçe harflerde de tam sözcük sınırı kullanır; ek alan adlarını eşleştirmez. */
export function matchesTopicText(text: string, names: readonly string[]) {
  const normalized = normalizeTopicText(text);
  return names.some((name) => {
    const escaped = normalizeTopicText(name).replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    return (
      Boolean(escaped) &&
      new RegExp(
        `(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
        'u',
      ).test(normalized)
    );
  });
}

/** Eski satırlar DB'de korunur; gösterimde aynı konu için en yüksek ustalık seçilir. */
export function normalizeProgressTopics<
  T extends { topic: string; mastery_level: number | null },
>(rows: readonly T[], grade: GradeValue | string | null | undefined): T[] {
  const byTopic = new Map<string, T>();
  for (const row of rows) {
    const topic = resolveTopicName(grade, row.topic);
    const previous = byTopic.get(topic);
    if (!previous || (row.mastery_level ?? 0) > (previous.mastery_level ?? 0)) {
      byTopic.set(topic, { ...row, topic });
    }
  }
  return [...byTopic.values()];
}
