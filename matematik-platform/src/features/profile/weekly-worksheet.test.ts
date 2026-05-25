import { describe, expect, it } from 'vitest';
import { buildWorksheetDescription } from '@/features/content/worksheet';
import type { ContentDocument } from '@/types';
import {
  buildWorksheetContentHref,
  getTodayInTimeZone,
  normalizeNumericGrade,
  selectWeeklyWorksheetSuggestion,
  type WeeklyWorksheetPlanItem,
} from '@/features/profile/weekly-worksheet';

const outcome = 'M.8.3.1.5. Pisagor bağıntısını oluşturur, ilgili problemleri çözer.';

const planItems: WeeklyWorksheetPlanItem[] = [
  {
    grade: 8,
    learning_outcome: outcome,
    subject: 'Pisagor',
    week_end: '2026-05-22',
    week_start: '2026-05-18',
  },
];

const documents = [
  {
    description: buildWorksheetDescription({
      description: 'Pisagor çalışma testi',
      order: 1,
      outcome,
    }),
    file_url: 'https://drive.google.com/file/d/test',
    grade: [8],
    id: 'worksheet-1',
    title: 'Pisagor çalışma testi (Test-1)',
    type: 'yaprak-test',
  },
] as ContentDocument[];

describe('weekly worksheet suggestion', () => {
  it('selects the published worksheet matching the current annual plan week', () => {
    const suggestion = selectWeeklyWorksheetSuggestion({
      documents,
      grade: 8,
      planItems,
      today: '2026-05-18',
    });

    expect(suggestion).toMatchObject({
      documentId: 'worksheet-1',
      fileUrl: 'https://drive.google.com/file/d/test',
      grade: 8,
      href: buildWorksheetContentHref(8, outcome),
      learningOutcome: outcome,
      subject: 'Pisagor',
      title: 'Bu haftanın yaprak testini çöz',
    });
  });

  it('supports the standard worksheet title format in weekly suggestions', () => {
    const suggestion = selectWeeklyWorksheetSuggestion({
      documents: [
        {
          description: 'Pisagor',
          file_url: 'https://drive.google.com/file/d/standard-test',
          grade: [8],
          id: 'worksheet-standard',
          title: '8. Sınıf Matematik - Pisagor - Yaprak Test 01',
          type: 'yaprak-test',
        },
      ] as ContentDocument[],
      grade: 8,
      planItems,
      today: '2026-05-18',
    });

    expect(suggestion).toMatchObject({
      documentId: 'worksheet-standard',
      fileUrl: 'https://drive.google.com/file/d/standard-test',
      learningOutcome: outcome,
      subject: 'Pisagor',
    });
  });

  it('does not suggest a worksheet for another grade or missing outcome', () => {
    expect(
      selectWeeklyWorksheetSuggestion({
        documents,
        grade: 7,
        planItems,
        today: '2026-05-18',
      }),
    ).toBeNull();

    expect(
      selectWeeklyWorksheetSuggestion({
        documents: [],
        grade: 8,
        planItems,
        today: '2026-05-18',
      }),
    ).toBeNull();
  });

  it('normalizes numeric grades and formats dates for the configured timezone', () => {
    expect(normalizeNumericGrade('8')).toBe(8);
    expect(normalizeNumericGrade('Mezun')).toBeNull();
    expect(
      getTodayInTimeZone(
        'Europe/Istanbul',
        new Date('2026-05-17T21:30:00.000Z'),
      ),
    ).toBe('2026-05-18');
  });
});
