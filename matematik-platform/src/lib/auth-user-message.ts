/** Supabase Auth hatalarını güvenli, anlaşılır Türkçe mesajlara çevirir. */
export function toUserMessage(error: unknown): string {
  const details =
    error && typeof error === 'object'
      ? (error as { code?: unknown; message?: unknown; status?: unknown })
      : {};
  const code = typeof details.code === 'string' ? details.code : '';
  const message = (
    typeof details.message === 'string'
      ? details.message
      : typeof error === 'string'
        ? error
        : ''
  ).toLowerCase();
  if (
    code === 'invalid_credentials' ||
    /invalid (login )?credentials/.test(message)
  ) {
    return 'Ad soyad veya şifre hatalı.';
  }
  if (
    code === 'email_not_confirmed' ||
    message.includes('email not confirmed')
  ) {
    return 'E-posta onayı bekleniyor.';
  }
  if (code === '23505' || message.includes('duplicate key')) {
    return 'Bu ad soyad ile zaten hesap var. Aynı isimde farklı bir öğrenciysen adının sonuna sınıfını ekleyerek (örn: Ahmet Yılmaz 8-A) kayıt olabilirsin. Şifreni unuttuysan öğretmenine başvurabilirsin.';
  }
  if (
    ['user_already_exists', 'email_exists'].includes(code) ||
    /already (been )?registered|user already/.test(message)
  ) {
    return 'Bu ad soyad ile zaten hesap var. Giriş sayfasından giriş yapabilir veya aynı isimdeysen adının sonuna sınıfını ekleyebilirsin (örn: Ahmet Yılmaz 8-A).';
  }
  if (
    code === 'weak_password' ||
    /weak password|password should be|password.*at least/.test(message)
  ) {
    return 'Şifreniz yeterince güçlü değil. Daha uzun ve güçlü bir şifre seçin.';
  }
  if (
    [
      'over_request_rate_limit',
      'over_email_send_rate_limit',
      'over_sms_send_rate_limit',
    ].includes(code) ||
    details.status === 429 ||
    /rate limit|too many requests|too many attempts/.test(message)
  ) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.';
  }
  if (
    code === 'request_timeout' ||
    /failed to fetch|fetch failed|network|load failed|timeout/.test(message)
  ) {
    return 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.';
  }
  return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.';
}
