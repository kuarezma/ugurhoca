import { timingSafeEqual } from 'node:crypto';

// Vercel cron isteklerini CRON_SECRET ile doğrular. Sabit-zamanlı karşılaştırma
// kullanır ve secret tanımlı değilse fail-closed davranır (aksi halde saldırgan
// "Bearer undefined" göndererek yetki alabilirdi). runtime = 'nodejs' gerektirir.
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const provided = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
