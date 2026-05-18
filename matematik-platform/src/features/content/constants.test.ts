import {
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
});
