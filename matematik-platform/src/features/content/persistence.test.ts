import { describe, expect, it } from 'vitest';
import { buildContentDocumentPersistPayload } from '@/features/content/persistence';

describe('content persistence payload', () => {
  it('removes transient quick-add fields and normalizes empty strings', () => {
    expect(
      buildContentDocumentPersistPayload({
        description: '  Açıklama  ',
        file_name: 'worksheet.pdf',
        file_url: '   ',
        grade: [8, 'Mezun'],
        learning_outcome: 'Kazanım',
        title: '  Başlık  ',
        type: 'ders-notlari',
        worksheet_order: 2,
      }),
    ).toEqual({
      description: 'Açıklama',
      file_url: null,
      grade: [8],
      title: 'Başlık',
      type: 'ders-notlari',
    });
  });

  it('keeps an empty numeric grade array when only unsupported grade values are selected', () => {
    expect(
      buildContentDocumentPersistPayload({
        grade: ['Mezun'],
        title: 'Mezun İçerik',
        type: 'ders-notlari',
      }),
    ).toEqual({
      grade: [],
      title: 'Mezun İçerik',
      type: 'ders-notlari',
    });
  });
});
