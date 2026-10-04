import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metric = 'first-load-uncompressed-js-bytes';

// Kilitli Next 16.3.8, build tablosu yerine bu tanılama dosyasını üretir.
// Sayfa ve ortak layout chunk'ları dahil; her rota içinde dosyalar tekilleştirilir.
export function measureBundle(buildRoot = resolve(appRoot, '.next')) {
  if (!existsSync(resolve(buildRoot, 'BUILD_ID'))) {
    throw new Error('Önce başarılı bir npm run build çalıştırılmalı.');
  }
  const rows = JSON.parse(
    readFileSync(
      resolve(buildRoot, 'diagnostics/route-bundle-stats.json'),
      'utf8',
    ),
  );
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error('Next.js rota bundle ölçümleri bulunamadı.');
  }
  const staticRoot = resolve(buildRoot, 'static');
  return rows.map((row) => {
    if (
      typeof row.route !== 'string' ||
      !row.route.startsWith('/') ||
      !Array.isArray(row.firstLoadChunkPaths) ||
      !row.firstLoadChunkPaths.length
    ) {
      throw new Error('Next.js bundle ölçüm biçimi geçersiz.');
    }
    let bytes = 0;
    const chunks = new Set(row.firstLoadChunkPaths);
    for (const chunk of chunks) {
      const file = resolve(buildRoot, '..', chunk);
      if (!file.startsWith(`${staticRoot}${sep}`) || !file.endsWith('.js')) {
        throw new Error(`Beklenmeyen chunk yolu: ${chunk}`);
      }
      // Next eksik dosyaları sessizce atlayabilir; kapı bunları hata sayar.
      bytes += statSync(file).size;
    }
    if (bytes !== row.firstLoadUncompressedJsBytes) {
      throw new Error(
        `${row.route}: Next.js ölçümü ile chunk boyutları uyuşmuyor.`,
      );
    }
    return { path: row.route, bytes, chunks: chunks.size };
  });
}

export function checkBundleBudget({
  measureOnly = false,
  buildRoot = resolve(appRoot, '.next'),
  budgetPath = resolve(appRoot, 'scripts/bundle-budget.json'),
} = {}) {
  const measurements = measureBundle(buildRoot);
  const largest = Math.max(...measurements.map((route) => route.bytes));
  if (measureOnly) {
    for (const route of measurements) {
      console.log(
        `${route.path}: ${route.bytes} bytes (${route.chunks} chunk)`,
      );
    }
    console.log('Ölçüm + %10 için önerilen bütçe yapılandırması:');
    console.log(
      JSON.stringify(
        {
          metric,
          baselineBytes: largest,
          maxBytes: Math.ceil((largest * 110) / 100),
        },
        null,
        2,
      ),
    );
    return;
  }
  const budget = JSON.parse(readFileSync(budgetPath, 'utf8'));
  if (
    budget.metric !== metric ||
    !Number.isSafeInteger(budget.baselineBytes) ||
    budget.baselineBytes <= 0 ||
    budget.maxBytes !== Math.ceil((budget.baselineBytes * 110) / 100)
  ) {
    throw new Error(
      'Bütçe için gerçek baseline gerekli: npm run analyze:compare -- --measure çıktısını scripts/bundle-budget.json içine kaydedin.',
    );
  }
  let exceeded = false;
  for (const route of measurements) {
    const failed = route.bytes > budget.maxBytes;
    exceeded ||= failed;
    console.log(
      `${failed ? 'FAIL' : 'PASS'} ${route.path}: ${route.bytes} bytes; bütçe ${budget.maxBytes} bytes`,
    );
  }
  if (exceeded) throw new Error('İlk yükleme JS bütçesi aşıldı.');
  console.log(`BUNDLE_BUDGET_OK: ${measurements.length} rota`);
}
