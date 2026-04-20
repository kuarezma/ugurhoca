import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  BookOpen,
  FileText,
  Gamepad2,
} from 'lucide-react';
import type { ContentDocument } from '@/types';

export const CONTENT_PAGE_SIZE = 5;

export const CONTENT_TYPE_OPTIONS = [
  { value: 'ders-notlari', label: 'Yaprak Test' },
  { value: 'kitaplar', label: 'Kitaplar' },
  { value: 'yaprak-test', label: 'Kazanımlar' },
  { value: 'ders-videolari', label: 'Ders Videoları' },
  { value: 'deneme', label: 'Deneme' },
  { value: 'sinav', label: 'Sınav' },
  { value: 'oyunlar', label: 'Oyunlar' },
  { value: 'programlar', label: 'Programlar' },
] as const;

export const CONTENT_TYPE_MAPPING: Record<string, string> = {
  'ders-notlari': 'ders-notlari',
  kitaplar: 'kitaplar',
  'yaprak-test': 'yaprak-test',
  'ders-videolari': 'ders-videolari',
  video: 'ders-videolari',
  deneme: 'deneme',
  sinav: 'sinav',
  test: 'sinav',
  worksheet: 'yaprak-test',
  oyunlar: 'oyunlar',
  game: 'oyunlar',
  programlar: 'programlar',
  document: 'yaprak-test',
  writing: 'ders-notlari',
  'ders-notuari-kitaplar': 'ders-notlari',
};

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
    case 'deneme':
      return 'from-green-500 to-emerald-500';
    case 'sinav':
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
    case 'deneme':
      return 'Deneme';
    case 'sinav':
      return 'Sınav';
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

const CONTENT_PRIMARY_GRADE_BADGE_STYLES: Record<string, string> = {
  5: 'bg-emerald-500/35 text-emerald-50 border border-emerald-200/80 shadow-sm shadow-emerald-500/30',
  6: 'bg-sky-500/35 text-sky-50 border border-sky-200/80 shadow-sm shadow-sky-500/30',
  7: 'bg-violet-500/35 text-violet-50 border border-violet-200/80 shadow-sm shadow-violet-500/30',
  8: 'bg-indigo-500/40 text-indigo-50 border border-indigo-200/85 shadow-sm shadow-indigo-500/35',
  9: 'bg-fuchsia-500/35 text-fuchsia-50 border border-fuchsia-200/80 shadow-sm shadow-fuchsia-500/30',
  10: 'bg-amber-500/35 text-amber-50 border border-amber-200/80 shadow-sm shadow-amber-500/30',
  11: 'bg-rose-500/35 text-rose-50 border border-rose-200/80 shadow-sm shadow-rose-500/30',
  12: 'bg-cyan-500/35 text-cyan-50 border border-cyan-200/80 shadow-sm shadow-cyan-500/30',
  Mezun: 'bg-orange-500/35 text-orange-50 border border-orange-200/80 shadow-sm shadow-orange-500/30',
  all: 'bg-slate-500/35 text-slate-50 border border-slate-200/70 shadow-sm shadow-slate-500/20',
};

export const getContentPrimaryGradeBadgeClass = (
  content: Pick<ContentDocument, 'grade'>,
) => {
  const primaryGrade =
    Array.isArray(content.grade) && content.grade.length > 0
      ? String(content.grade[0])
      : 'all';

  return (
    CONTENT_PRIMARY_GRADE_BADGE_STYLES[primaryGrade] ||
    CONTENT_PRIMARY_GRADE_BADGE_STYLES.all
  );
};
