import {
  formatSignupError,
  normalizeFullNameForMatch,
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
});
