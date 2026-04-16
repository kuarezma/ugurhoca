import type { GradeValue } from '@/types';

const DEFAULT_GRADE_KEY = '5';
const MEZUN_GRADE_KEY = '12';

export const GRADE_TOPIC_OPTIONS: Record<string, readonly string[]> = {
  '5': [
    'Doğal Sayılar',
    'Doğal Sayılarla İşlemler',
    'Kesirler',
    'Ondalık Gösterim',
    'Yüzdeler',
    'Temel Geometrik Kavramlar',
    'Üçgenler ve Dörtgenler',
    'Uzunluk ve Zaman Ölçme',
    'Alan Ölçme',
    'Veri Toplama ve Değerlendirme',
  ],
  '6': [
    'Doğal Sayılarla İşlemler',
    'Çarpanlar ve Katlar',
    'Kümeler',
    'Tam Sayılar',
    'Kesirlerle İşlemler',
    'Ondalık Gösterim',
    'Oran',
    'Cebirsel İfadeler',
    'Alan Ölçme',
    'Çember',
    'Veri Analizi',
  ],
  '7': [
    'Tam Sayılarla İşlemler',
    'Rasyonel Sayılar',
    'Oran ve Orantı',
    'Yüzdeler',
    'Cebirsel İfadeler',
    'Eşitlik ve Denklem',
    'Çokgenler',
    'Çember ve Daire',
    'Doğrular ve Açılar',
    'Veri Analizi',
    'Olasılık',
  ],
  '8': [
    'Çarpanlar ve Katlar',
    'Üslü İfadeler',
    'Kareköklü İfadeler',
    'Veri Analizi',
    'Olasılık',
    'Cebirsel İfadeler',
    'Doğrusal Denklemler',
    'Eşitsizlikler',
    'Üçgenler',
    'Dönüşüm Geometrisi',
    'Geometrik Cisimler',
  ],
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
  if (grade === 'Mezun') {
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

  return [...(GRADE_TOPIC_OPTIONS[gradeKey] || GRADE_TOPIC_OPTIONS[DEFAULT_GRADE_KEY])];
};
