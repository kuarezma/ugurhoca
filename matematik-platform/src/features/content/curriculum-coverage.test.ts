import { describe, expect, it } from 'vitest';
import {
  calculateCurriculumCoverage,
  getCurriculumContentHref,
  matchesCurriculumDocument,
  type CurriculumDocument,
} from './curriculum-coverage';

const worksheet: CurriculumDocument = {
  id: 'test',
  grade: [8],
  type: 'yaprak-test',
  title: 'Test - 1',
  description:
    '__WS_META__{"outcome":"M.8.1.3. Kareköklü İfadeler","order":1}\nAlıştırmalar',
};

describe('curriculum document matching', () => {
  it('matches encoded outcomes, Turkish case and whitespace, with grade/type isolation', () => {
    expect(
      matchesCurriculumDocument(
        worksheet,
        8,
        'Kareköklü İfadeler',
        'yaprak-test',
      ),
    ).toBe(true);
    expect(
      matchesCurriculumDocument(
        { ...worksheet, description: 'KAREKÖKLÜ   İFADELER' },
        8,
        'Kareköklü İfadeler',
        'yaprak-test',
      ),
    ).toBe(true);
    expect(
      matchesCurriculumDocument(
        worksheet,
        7,
        'Kareköklü İfadeler',
        'yaprak-test',
      ),
    ).toBe(false);
    expect(
      matchesCurriculumDocument(
        worksheet,
        8,
        'Kareköklü İfadeler',
        'ders-notlari',
      ),
    ).toBe(false);
  });

  it('matches note titles/descriptions and legacy types without treating tests as notes', () => {
    expect(
      matchesCurriculumDocument(
        {
          ...worksheet,
          type: 'writing',
          title: 'Kareköklü İfadeler — Özet',
          description: null,
        },
        8,
        'Kareköklü İfadeler',
        'ders-notlari',
      ),
    ).toBe(true);
    expect(
      matchesCurriculumDocument(
        {
          ...worksheet,
          type: 'ders-notlari',
          title: 'Konu özeti',
          description: 'Kareköklü İfadeler',
        },
        8,
        'Kareköklü İfadeler',
        'ders-notlari',
      ),
    ).toBe(true);
    expect(
      matchesCurriculumDocument(
        { ...worksheet, type: 'worksheet' },
        8,
        'Kareköklü İfadeler',
        'yaprak-test',
      ),
    ).toBe(true);
    expect(
      matchesCurriculumDocument(
        { ...worksheet, title: 'Doğal Sayılarla İşlemler', description: null },
        8,
        'Doğal Sayılar',
        'yaprak-test',
      ),
    ).toBe(false);
    expect(matchesCurriculumDocument(worksheet, 8, '', 'yaprak-test')).toBe(
      false,
    );
  });

  it('counts multi-grade documents once per topic and reports readable gaps', () => {
    const rows = calculateCurriculumCoverage([
      worksheet,
      {
        ...worksheet,
        id: 'notes',
        type: 'ders-notlari',
        grade: [7, 8],
        title: 'Veri Analizi',
        description: null,
      },
    ]);
    expect(
      rows.find((row) => row.grade === 8 && row.topic === 'Kareköklü İfadeler'),
    ).toMatchObject({
      worksheets: 1,
      notes: 0,
      missing: ['8. Sınıf · Kareköklü İfadeler: ders notu yok'],
    });
    expect(
      rows.find((row) => row.grade === 7 && row.topic === 'Veri Analizi')
        ?.notes,
    ).toBe(1);
    expect(
      rows.find((row) => row.grade === 8 && row.topic === 'Veri Analizi')
        ?.notes,
    ).toBe(1);
    expect(calculateCurriculumCoverage([])[0].missing).toEqual([
      '5. Sınıf · Doğal Sayılar: yaprak test yok',
      '5. Sınıf · Doğal Sayılar: ders notu yok',
    ]);
  });

  it('encodes the same topic and type for content links', () => {
    const url = new URL(
      getCurriculumContentHref(8, 'Kareköklü İfadeler', 'yaprak-test'),
      'https://example.test',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      grade: '8',
      type: 'yaprak-test',
      q: 'Kareköklü İfadeler',
    });
  });
});
