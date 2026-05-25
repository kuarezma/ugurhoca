import { describe, expect, it } from 'vitest';
import { buildWorksheetPdfFileName } from '@/lib/google-drive-oauth';

const baseInput = {
  grade: 8,
  learningOutcome: 'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
  pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  sourceFileUrl: 'https://meb.gov.tr/test.pdf',
  subject: 'Üslü İfadeler',
};

describe('google drive worksheet helpers', () => {
  it('uses the standard worksheet title as the PDF file name', () => {
    expect(
      buildWorksheetPdfFileName({
        ...baseInput,
        candidateTitle: '8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01',
      }),
    ).toBe('8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01.pdf');
  });

  it('keeps an existing PDF extension and removes unsafe Drive characters', () => {
    expect(
      buildWorksheetPdfFileName({
        ...baseInput,
        candidateTitle:
          '8. Sınıf Matematik: Üslü/İfadeler? - Yaprak Test 01.pdf',
      }),
    ).toBe('8. Sınıf Matematik Üslü İfadeler - Yaprak Test 01.pdf');
  });
});
