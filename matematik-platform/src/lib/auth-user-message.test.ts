import { describe, expect, it } from 'vitest';
import { toUserMessage } from './auth-user-message';

describe('toUserMessage', () => {
  it.each([
    [{ code: 'invalid_credentials' }, 'Ad soyad veya şifre hatalı.'],
    [new Error('Invalid login credentials'), 'Ad soyad veya şifre hatalı.'],
    [{ code: 'email_not_confirmed' }, 'E-posta onayı bekleniyor.'],
    [new Error('Email not confirmed'), 'E-posta onayı bekleniyor.'],
    [
      { code: 'user_already_exists' },
      'Bu ad soyad ile zaten hesap var. Giriş sayfasından giriş yapabilir veya aynı isimdeysen adının sonuna sınıfını ekleyebilirsin (örn: Ahmet Yılmaz 8-A).',
    ],
    [
      new Error('User already registered'),
      'Bu ad soyad ile zaten hesap var. Giriş sayfasından giriş yapabilir veya aynı isimdeysen adının sonuna sınıfını ekleyebilirsin (örn: Ahmet Yılmaz 8-A).',
    ],
    [
      { code: 'weak_password' },
      'Şifreniz yeterince güçlü değil. Daha uzun ve güçlü bir şifre seçin.',
    ],
    [
      new Error('Password should be at least 6 characters'),
      'Şifreniz yeterince güçlü değil. Daha uzun ve güçlü bir şifre seçin.',
    ],
    [
      { code: 'over_request_rate_limit' },
      'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.',
    ],
    [
      { status: 429, message: 'Internal detail' },
      'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.',
    ],
    [
      new Error('Email rate limit exceeded'),
      'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.',
    ],
    [
      new TypeError('Failed to fetch'),
      'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    ],
    [
      new Error('Network request failed'),
      'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
    ],
    [
      { message: 'database host internal.secret' },
      'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
    ],
    [null, 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'],
  ])('translates %s without exposing internal details', (error, expected) => {
    expect(toUserMessage(error)).toBe(expected);
  });
});
