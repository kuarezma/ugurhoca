export type BadgeCatalogEntry = {
  type: string;
  name: string;
  icon: string;
  description: string;
};

/**
 * Rozet kataloğu — DB tetikleyicilerinin atayabildiği rozetlerle uyumludur.
 * Yeni bir rozet eklediğinde listeye ekleyip supabase/migrations içindeki
 * trigger'ı da güncelle.
 */
export const BADGE_CATALOG: BadgeCatalogEntry[] = [
  {
    type: 'first_blood',
    name: 'İlk Adım',
    icon: 'Target',
    description: 'İlk testini bitirdin. Yolculuğun başlasın!',
  },
  {
    type: 'streak_3',
    name: '3 Gün Seri',
    icon: 'Flame',
    description: 'Üst üste 3 gün çalıştın.',
  },
  {
    type: 'streak_7',
    name: '7 Gün Seri',
    icon: 'Flame',
    description: 'Bir haftadır aralıksız çalışıyorsun.',
  },
  {
    type: 'streak_14',
    name: '2 Hafta Seri',
    icon: 'Flame',
    description: '14 gün boyunca vazgeçmedin.',
  },
  {
    type: 'mastery_50',
    name: 'Yarı Usta',
    icon: 'Sparkles',
    description: 'Bir konuda %50 ustalığa ulaştın.',
  },
  {
    type: 'mastery_100',
    name: 'Konu Ustası',
    icon: 'Crown',
    description: 'Bir konuyu tam ustalıkla tamamladın.',
  },
  {
    type: 'perfect_score',
    name: 'Tam Puan',
    icon: 'Trophy',
    description: 'Bir testi hatasız bitirdin.',
  },
  {
    type: 'quiz_10',
    name: 'Test Avcısı',
    icon: 'Medal',
    description: '10 test tamamladın.',
  },
  {
    type: 'early_bird',
    name: 'Erken Kuş',
    icon: 'Sunrise',
    description: 'Sabah 7 öncesi çalışmaya başladın.',
  },
];
