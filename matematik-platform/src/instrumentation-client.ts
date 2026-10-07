// Next 16 (Turbopack) `sentry.client.config.ts` dosyasını artık kendiliğinden
// yüklemez; istemci tarafı yalnızca bu dosya üzerinden başlar. İlk boyamayı
// geciktirmemek için Sentry, sayfa boşta kaldığında dinamik olarak yüklenir.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const start = () => {
    void import('../sentry.client.config');
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(start, { timeout: 4000 });
  } else {
    setTimeout(start, 2000);
  }
}
