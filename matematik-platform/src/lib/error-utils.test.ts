import { getErrorMessage } from '@/lib/error-utils';

describe('error-utils', () => {
  it('returns the message from Error instances', () => {
    expect(getErrorMessage(new Error('beklenen hata'))).toBe('beklenen hata');
  });

  it('returns the message field from plain objects', () => {
    expect(
      getErrorMessage({ message: 'sunucudan gelen hata' }),
    ).toBe('sunucudan gelen hata');
  });

  it('falls back for unknown values', () => {
    expect(getErrorMessage(null, 'varsayilan')).toBe('varsayilan');
  });
});
