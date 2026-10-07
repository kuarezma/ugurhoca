import {
  GRADE_TOPIC_OPTIONS,
  GRADE_TOPIC_META,
  getTopicNames,
} from '@/features/progress/constants';
import { getCurriculumContentHref } from '@/features/content/curriculum-coverage';

export interface AdventureTopicNode {
  id: string;
  unitNumber: number;
  title: string;
  grade: number;
  theme?: string;
  notesHref: string;
  testsHref: string;
  gameHref?: string;
  flashcardSubject?: string;
}

// Yalnız mevcut, konuya özel araçlar. Genel oyun/kart bağlantısı üniteye eklenmez.
const TOPIC_GAMES: Record<string, Record<string, number>> = {
  '5': { 'Doğal Sayılarla İşlemler': 1 },
  '6': { 'Doğal Sayılarla İşlemler': 1, 'Kesirlerle İşlemler': 7, Oran: 9 },
  '7': { Yüzdeler: 9, 'Eşitlik ve Denklem': 8 },
  '8': { 'Doğrusal Denklemler': 8 },
};
const TOPIC_FLASHCARDS: Record<string, Record<string, string>> = {
  '8': {
    'Çarpanlar ve Katlar': 'Çarpanlar ve Katlar',
    'Üslü İfadeler': 'Üslü İfadeler',
    'Kareköklü İfadeler': 'Kareköklü İfadeler',
    'Doğrusal Denklemler': 'Doğrusal Denklemler',
    Üçgenler: 'Geometri / Üçgenler',
    Olasılık: 'Olasılık',
  },
  '10': {
    'İkinci Dereceden Denklemler': 'İkinci Dereceden Denklemler',
    'Permütasyon ve Kombinasyon': 'Kombinatorik',
  },
  '11': {
    Trigonometri: 'Trigonometri',
    Logaritma: 'Logaritma',
    Diziler: 'Diziler',
  },
  '12': {
    Trigonometri: 'Trigonometri',
    Türev: 'Türev',
    İntegral: 'İntegral',
    'Binom ve Diziler': 'Diziler',
  },
};

export const ADVENTURE_CURRICULUM: Record<string, AdventureTopicNode[]> =
  Object.fromEntries(
    Object.entries(GRADE_TOPIC_OPTIONS).map(([gradeKey, topics]) => [
      gradeKey,
      topics.map((title, index) => {
        const names = getTopicNames(gradeKey, title);
        const gameId = names
          .map((name) => TOPIC_GAMES[gradeKey]?.[name])
          .find(Boolean);
        return {
          id: `g${gradeKey}-${index + 1}`,
          unitNumber: index + 1,
          title,
          grade: Number(gradeKey),
          theme: GRADE_TOPIC_META[gradeKey]?.find(
            (item) => item.topic === title,
          )?.theme,
          notesHref: getCurriculumContentHref(
            Number(gradeKey),
            title,
            'ders-notlari',
          ),
          testsHref: getCurriculumContentHref(
            Number(gradeKey),
            title,
            'yaprak-test',
          ),
          gameHref: gameId ? `/oyunlar?id=${gameId}` : undefined,
          flashcardSubject: names
            .map((name) => TOPIC_FLASHCARDS[gradeKey]?.[name])
            .find(Boolean),
        };
      }),
    ]),
  );
