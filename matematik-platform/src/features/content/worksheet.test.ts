import { describe, expect, it } from 'vitest';
import {
  buildWorksheetDescription,
  buildWorksheetStandardTitle,
  getNextWorksheetOrder,
  getWorksheetOutcomeLabel,
  getWorksheetOrder,
  getWorksheetTestTitle,
  getWorksheetVisibleDescription,
  normalizeWorksheetOutcome,
  sortWorksheetDocuments,
} from '@/features/content/worksheet';
import type { ContentDocument } from '@/types';

describe('worksheet helpers', () => {
  it('normalizes repeated whitespace in outcome names', () => {
    expect(normalizeWorksheetOutcome('  Doğal   Sayılar  ')).toBe(
      'Doğal Sayılar',
    );
  });

  it('reads order from metadata and test title', () => {
    const description = buildWorksheetDescription({
      description: 'Açıklama',
      order: 4,
      outcome: 'Doğal Sayılar',
    });

    expect(getWorksheetOrder({ description, title: 'Test - 1' })).toBe(4);
    expect(getWorksheetOrder({ description: '', title: 'Test - 7' })).toBe(7);
    expect(
      getWorksheetOrder({ description: '', title: 'Eşlik ve Benzerlik (Test-8)' }),
    ).toBe(8);
    expect(
      getWorksheetOrder({
        description: '',
        title: '8. Sınıf Matematik - Eşlik ve Benzerlik - Yaprak Test 09',
      }),
    ).toBe(9);
  });

  it('calculates the next test order', () => {
    expect(
      getNextWorksheetOrder([
        { description: '', title: 'Test - 1' },
        { description: '', title: 'Test - 3' },
      ]),
    ).toBe(4);
    expect(getWorksheetTestTitle(4, 'Eşlik ve Benzerlik')).toBe(
      'Eşlik ve Benzerlik (Test-4)',
    );
    expect(
      getWorksheetTestTitle(
        4,
        'Eşlik ve Benzerlik',
        'M.8.3.1. Eşlik ve benzerlik ilişkilerini yorumlar.',
        8,
      ),
    ).toBe('8. Sınıf Matematik - Eşlik ve Benzerlik - Yaprak Test 04');
  });

  it('builds standard worksheet titles', () => {
    expect(
      buildWorksheetStandardTitle({
        grade: 8,
        order: 1,
        subject: 'Üslü İfadeler',
      }),
    ).toBe('8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01');
    expect(
      buildWorksheetStandardTitle({
        grade: 5,
        order: 2,
        subject: 'Kesirler',
      }),
    ).toBe('5. Sınıf Matematik - Kesirler - Yaprak Test 02');
    expect(
      buildWorksheetStandardTitle({
        grade: 6,
        outcome: '',
        subject: '   ',
      }),
    ).toBe('6. Sınıf Matematik - Genel Kazanım - Yaprak Test');
    expect(
      buildWorksheetStandardTitle({
        grade: 8,
        outcome:
          'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
        subject: '',
      }),
    ).toBe(
      '8. Sınıf Matematik - Üslü ifadelerle ilgili temel kuralları anlar. - Yaprak Test',
    );
  });

  it('extracts outcome label and visible description from metadata', () => {
    const description = buildWorksheetDescription({
      description: 'Kısa açıklama',
      order: 2,
      outcome: 'Doğal Sayılar',
    });

    expect(
      getWorksheetOutcomeLabel({
        description,
        grade: [5],
        title: 'Test - 2',
      }),
    ).toBe('Doğal Sayılar');
    expect(getWorksheetVisibleDescription({ description })).toBe('Kısa açıklama');
  });

  it('sorts worksheet documents by sequence', () => {
    const documents = [
      {
        description: buildWorksheetDescription({
          description: '',
          order: 2,
          outcome: 'Doğal Sayılar',
        }),
        grade: [5],
        id: 'b',
        title: 'Test - 2',
        type: 'yaprak-test',
      },
      {
        description: buildWorksheetDescription({
          description: '',
          order: 1,
          outcome: 'Doğal Sayılar',
        }),
        grade: [5],
        id: 'a',
        title: 'Test - 1',
        type: 'yaprak-test',
      },
    ] as ContentDocument[];

    expect(sortWorksheetDocuments(documents).map((document) => document.id)).toEqual(
      ['a', 'b'],
    );
  });

  it('maps known legacy topics to official worksheet outcomes', () => {
    expect(
      getWorksheetOutcomeLabel({
        description:
          'Oranda çokluklardan biri bir olması durumunda diğerini bulma kazanımıyla ilgili test',
        grade: [7],
        title: 'Oran-Orantı -- 1',
      }),
    ).toBe(
      'M.7.1.4.1. Oranda çokluklardan birinin 1 olması durumunda diğerinin alacağı değeri belirler.',
    );

    expect(
      getWorksheetOutcomeLabel({
        description: 'Koordinat Sistemi ve Doğrusal İlişkiler',
        grade: [8],
        title: '100 Soruda 8.Sınıf Koordinat Sistemi ve Doğrusal İlişkiler Testi',
      }),
    ).toBe(
      'M.8.2.2.3. Aralarında doğrusal ilişki bulunan iki değişkenden birinin diğerine bağlı olarak nasıl değiştiğini tablo ve denklem ile ifade eder.',
    );
  });
});
