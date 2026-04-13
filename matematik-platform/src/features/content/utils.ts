import type { ContentGradeFilter } from '@/features/content/types';
import type { ContentDocument } from '@/types';

export const normalizeContentGrade = (
  value: number | string | null | undefined,
): ContentGradeFilter => {
  if (value === 'Mezun') return 'Mezun';
  const nextValue = Number(value);
  return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 'all';
};

export const getYouTubeId = (url: string) => {
  const pattern =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(pattern);
  return match && match[2].length === 11 ? match[2] : null;
};

export const getDriveId = (url: string) => {
  if (!url) return null;

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export const formatContentDate = (value?: string | null) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getContentPrimaryGradeLabel = (content: ContentDocument) => {
  if (Array.isArray(content.grade) && content.grade.length > 0) {
    return `${content.grade[0]}. Sınıf`;
  }

  return 'Tüm Sınıflar';
};

export const getContentAuthorLabel = (content: ContentDocument) =>
  content.author || content.owner_name || 'Uğur Hoca';

export const getContentPageTitle = (selectedType: string) => {
  switch (selectedType) {
    case 'yaprak-test':
      return 'Yaprak Testler';
    case 'deneme':
      return 'Denemeler';
    case 'sinav':
      return 'Sınavlar';
    case 'oyunlar':
      return 'Oyunlar';
    case 'ders-notlari':
      return 'Ders Notları';
    case 'kitaplar':
      return 'Kitaplar';
    case 'ders-videolari':
      return 'Ders Videoları';
    case 'programlar':
      return 'Programlar';
    default:
      return 'İçerikler';
  }
};

export const getContentPageDescription = (
  selectedType: string,
  selectedGrade: ContentGradeFilter,
) => {
  if (selectedType === 'all') {
    return selectedGrade === 'all'
      ? 'Tüm sınıflar için içerikler'
      : `${selectedGrade}. sınıf için tüm içerikler`;
  }

  return selectedGrade === 'all'
    ? 'Seçili kategoride, tüm sınıflardaki içerikler'
    : 'Seçili kategorideki içerikler';
};
