import { GRADE_TOPIC_OPTIONS } from '@/features/progress/constants';
import { CONTENT_TYPE_MAPPING } from './constants';
import { getWorksheetOutcomeLabel } from './worksheet-display';
import type { ContentDocument } from '@/types';

export type CurriculumDocument = Pick<
  ContentDocument,
  'id' | 'grade' | 'type' | 'title' | 'description'
>;
export type CurriculumContentType = 'yaprak-test' | 'ders-notlari';

export const CURRICULUM_DOCUMENT_TYPES = Object.keys(
  CONTENT_TYPE_MAPPING,
).filter((type) =>
  ['yaprak-test', 'ders-notlari'].includes(CONTENT_TYPE_MAPPING[type]),
);

const normalizeTopicText = (value: string) =>
  value.normalize('NFC').toLocaleLowerCase('tr').trim().replace(/\s+/g, ' ');

export const isCurriculumTopic = (grade: number, topic: string) =>
  GRADE_TOPIC_OPTIONS[String(grade)]?.includes(topic) ?? false;

/** Konu adını tam sözcüklerle arar; benzer adları veya kazanım kodlarını tahmin etmez. */
export function matchesCurriculumDocument(
  document: CurriculumDocument,
  grade: number,
  topic: string,
  type: CurriculumContentType,
) {
  if (!document.grade?.includes(grade)) return false;
  if ((CONTENT_TYPE_MAPPING[document.type] || document.type) !== type)
    return false;

  const texts = [document.title, document.description || ''];
  if (type === 'yaprak-test') texts.push(getWorksheetOutcomeLabel(document));
  const escapedTopic = normalizeTopicText(topic).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  if (!escapedTopic) return false;
  const pattern = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])${escapedTopic}(?=$|[^\\p{L}\\p{N}])`,
    'u',
  );
  return texts.some((text) => pattern.test(normalizeTopicText(text)));
}

export function getCurriculumContentHref(
  grade: number,
  topic: string,
  type: CurriculumContentType,
) {
  return `/icerikler?${new URLSearchParams({ grade: String(grade), type, q: topic })}`;
}

export function calculateCurriculumCoverage(documents: CurriculumDocument[]) {
  return Object.entries(GRADE_TOPIC_OPTIONS).flatMap(([gradeKey, topics]) => {
    const grade = Number(gradeKey);
    return topics.map((topic) => {
      const worksheets = documents.filter((doc) =>
        matchesCurriculumDocument(doc, grade, topic, 'yaprak-test'),
      ).length;
      const notes = documents.filter((doc) =>
        matchesCurriculumDocument(doc, grade, topic, 'ders-notlari'),
      ).length;
      const missing: string[] = [];
      if (!worksheets)
        missing.push(`${grade}. Sınıf · ${topic}: yaprak test yok`);
      if (!notes) missing.push(`${grade}. Sınıf · ${topic}: ders notu yok`);
      return { grade, topic, worksheets, notes, missing };
    });
  });
}
