import {
  CONTENT_SORT_OPTIONS,
  CONTENT_TYPE_MAPPING,
  CONTENT_TYPE_OPTIONS,
  getContentTypeLabel,
  getContentTypeQueryTypes,
} from '@/features/content/constants';


describe('content category constants', () => {
  it('merges trial exam and exam categories under Deneme-Sınav', () => {
    expect(CONTENT_TYPE_OPTIONS).toContainEqual({
      label: 'Deneme-Sınav',
      value: 'deneme-sinav',
    });
    expect(CONTENT_TYPE_OPTIONS).not.toContainEqual({
      label: 'Deneme',
      value: 'deneme',
    });
    expect(CONTENT_TYPE_OPTIONS).not.toContainEqual({
      label: 'Sınav',
      value: 'sinav',
    });

    expect(CONTENT_TYPE_MAPPING.deneme).toBe('deneme-sinav');
    expect(CONTENT_TYPE_MAPPING.sinav).toBe('deneme-sinav');
    expect(CONTENT_TYPE_MAPPING.test).toBe('deneme-sinav');
    expect(getContentTypeLabel('deneme')).toBe('Deneme-Sınav');
    expect(getContentTypeLabel('sinav')).toBe('Deneme-Sınav');
  });

  it('queries old and new document types for Deneme-Sınav', () => {
    expect(getContentTypeQueryTypes('deneme-sinav')).toEqual([
      'deneme',
      'sinav',
      'test',
      'deneme-sinav',
    ]);
  });

  it('maps chip types to canonical database types correctly', () => {
    expect(CONTENT_TYPE_MAPPING['ders-notu']).toBe('ders-notlari');
    expect(CONTENT_TYPE_MAPPING['deneme-sinavi']).toBe('deneme-sinav');
    expect(CONTENT_TYPE_MAPPING.video).toBe('ders-videolari');
    expect(CONTENT_TYPE_MAPPING.videolar).toBe('ders-videolari');
  });

  it('defines sort options for content filtering', () => {
    const ids = CONTENT_SORT_OPTIONS.map((o) => o.id);
    expect(ids).toContain('newest');
    expect(ids).toContain('downloads');
    expect(ids).toContain('views');
    expect(ids).toContain('likes');
  });
});

