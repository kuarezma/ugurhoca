import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildWorksheetPdfFileName,
  downloadPdfForDriveUpload,
} from '@/lib/google-drive-oauth';

const baseInput = {
  grade: 8,
  learningOutcome: 'M.8.1.2.1. Üslü ifadelerle ilgili temel kuralları anlar.',
  pdfBytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  sourceFileUrl: 'https://meb.gov.tr/test.pdf',
  subject: 'Üslü İfadeler',
};

describe('google drive worksheet helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('downloads shared Google Drive file links through the direct download URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      arrayBuffer: async () =>
        new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      ok: true,
    } as Response);

    const bytes = await downloadPdfForDriveUpload(
      'https://drive.google.com/file/d/drive-file-1/view?usp=sharing',
    );

    expect(bytes).toEqual(new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    expect(fetchMock).toHaveBeenCalledWith(
      'https://drive.google.com/uc?export=download&id=drive-file-1',
      expect.objectContaining({ redirect: 'follow' }),
    );
  });
});
