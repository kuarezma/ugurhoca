import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  BookOpen,
  FileText,
  Gamepad2,
} from 'lucide-react';
import type { ChipTone } from '@/components/ui/Chip';
import type { ContentDocument } from '@/types';

export const CONTENT_PAGE_SIZE = 5;

export const CONTENT_TYPE_OPTIONS = [
  { value: 'ders-notlari', label: 'Yaprak Test' },
  { value: 'kitaplar', label: 'Kitaplar' },
  { value: 'yaprak-test', label: 'Kazanımlar' },
  { value: 'ders-videolari', label: 'Ders Videoları' },
  { value: 'deneme-sinav', label: 'Deneme-Sınav' },
  { value: 'oyunlar', label: 'Oyunlar' },
  { value: 'programlar', label: 'Programlar' },
] as const;

export const CONTENT_TYPE_MAPPING: Record<string, string> = {
  'ders-notlari': 'ders-notlari',
  'ders-notu': 'ders-notlari',
  kitaplar: 'kitaplar',
  'yaprak-test': 'yaprak-test',
  'ders-videolari': 'ders-videolari',
  video: 'ders-videolari',
  videolar: 'ders-videolari',
  deneme: 'deneme-sinav',
  sinav: 'deneme-sinav',
  test: 'deneme-sinav',
  'deneme-sinav': 'deneme-sinav',
  'deneme-sinavi': 'deneme-sinav',
  worksheet: 'yaprak-test',
  oyunlar: 'oyunlar',
  game: 'oyunlar',
  programlar: 'programlar',
  document: 'yaprak-test',
  writing: 'ders-notlari',
  'ders-notuari-kitaplar': 'ders-notlari',
};

export const CONTENT_SORT_OPTIONS = [
  { id: 'newest', label: 'En Yeni' },
  { id: 'downloads', label: 'En Çok İndirilen' },
  { id: 'views', label: 'En Çok İncelenen' },
  { id: 'likes', label: 'En Çok Beğenilen' },
] as const;


export const getContentTypeIcon = (type: string): LucideIcon => {
  switch (CONTENT_TYPE_MAPPING[type] || type) {
    case 'ders-notlari':
    case 'kitaplar':
    case 'yaprak-test':
      return BookOpen;
    case 'oyunlar':
      return Gamepad2;
    case 'programlar':
      return AppWindow;
    default:
      return FileText;
  }
};

export const getContentTypeColor = (type: string) => {
  switch (CONTENT_TYPE_MAPPING[type] || type) {
    case 'ders-notlari':
      return 'from-blue-500 to-cyan-500';
    case 'kitaplar':
      return 'from-indigo-500 to-violet-500';
    case 'yaprak-test':
      return 'from-purple-500 to-pink-500';
    case 'ders-videolari':
      return 'from-red-500 to-orange-500';
    case 'deneme-sinav':
      return 'from-teal-500 to-cyan-500';
    case 'oyunlar':
      return 'from-yellow-500 to-amber-500';
    case 'programlar':
      return 'from-pink-500 to-rose-500';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

export const getContentTypeLabel = (type: string) => {
  switch (CONTENT_TYPE_MAPPING[type] || type) {
    case 'ders-notlari':
      return 'Yaprak Test';
    case 'kitaplar':
      return 'Kitaplar';
    case 'yaprak-test':
      return 'Kazanımlar';
    case 'ders-videolari':
      return 'Ders Videoları';
    case 'deneme-sinav':
      return 'Deneme-Sınav';
    case 'oyunlar':
      return 'Oyun';
    case 'programlar':
      return 'Programlar';
    default:
      return type;
  }
};

export const getContentTypeQueryTypes = (type: string) => {
  const normalizedType = CONTENT_TYPE_MAPPING[type] || type;

  if (normalizedType === 'ders-notlari') {
    return ['ders-notlari', 'writing', 'yaprak-test'];
  }

  if (normalizedType === 'deneme-sinav') {
    return ['deneme', 'sinav', 'test', 'deneme-sinav'];
  }

  return [normalizedType];
};

export const getContentKindLabel = (content: ContentDocument) => {
  const mapped = CONTENT_TYPE_MAPPING[content.type] || content.type;

  if (mapped === 'ders-videolari' || content.video_url) {
    return 'Video';
  }
  if (
    typeof content.file_url === 'string' &&
    content.file_url.toLowerCase().includes('.pdf')
  ) {
    return 'PDF';
  }
  return 'Dosya';
};

const CONTENT_PRIMARY_GRADE_BADGE_TONES: Record<string, ChipTone> = {
  5: 'emerald',
  6: 'blue',
  7: 'yellow',
  8: 'violet',
  9: 'rose',
  10: 'cyan',
  11: 'lime',
  12: 'orange',
  Mezun: 'zinc',
  all: 'slate',
};

export const getContentPrimaryGradeBadgeTone = (
  content: Pick<ContentDocument, 'grade'>,
): ChipTone => {
  const primaryGrade =
    Array.isArray(content.grade) && content.grade.length > 0
      ? String(content.grade[0])
      : 'all';

  return (
    CONTENT_PRIMARY_GRADE_BADGE_TONES[primaryGrade] ||
    CONTENT_PRIMARY_GRADE_BADGE_TONES.all
  );
};
