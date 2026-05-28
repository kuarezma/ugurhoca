import {
  formatSignupError,
  normalizeFullNameForMatch,
  normalizeSearchMatchText,
  studentLoginEmail,
} from '@/lib/student-identity';

describe('student-identity', () => {
  it('normalizes Turkish names for matching', () => {
    expect(normalizeFullNameForMatch('  İREM   ÇALIŞKAN  ')).toBe(
      'irem çalışkan',
    );
  });

  it('builds a deterministic local login email', () => {
    expect(studentLoginEmail('Çağrı Şenol')).toBe(
      'cagri_senol@ugurhoca.local',
    );
  });

  it('maps duplicate signup errors to a friendly message', () => {
    expect(
      formatSignupError({
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      }),
    ).toBe('Bu ad soyad ile zaten hesap var. Giriş sayfasından deneyin.');
  });

  describe('normalizeSearchMatchText', () => {
    it('treats Turkish dotted/dotless I forms as the same letter', () => {
      const forms = ['İlker', 'Ilker', 'ilker', 'ılker'];
      const normalized = forms.map(normalizeSearchMatchText);
      expect(new Set(normalized).size).toBe(1);
      expect(normalized[0]).toBe('ilker');
    });

    it('folds Turkish diacritics so "çağrı" matches "cagri"', () => {
      expect(normalizeSearchMatchText('Çağrı')).toBe('cagri');
      expect(normalizeSearchMatchText('cagri')).toBe('cagri');
    });

    it('collapses surrounding and inner whitespace', () => {
      expect(normalizeSearchMatchText('  Işık   Demir  ')).toBe('isik demir');
    });

    it('returns an empty string for nullish-ish inputs', () => {
      expect(normalizeSearchMatchText('')).toBe('');
      expect(normalizeSearchMatchText('   ')).toBe('');
    });
  });
});
