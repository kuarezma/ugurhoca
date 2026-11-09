import childProcess from 'node:child_process';
import fs from 'node:fs';

export const FORBIDDEN_PRIVACY_PATTERNS = [
  /okul\s+müdürü/i,
  /mustafa\s+özkan/i,
  /ali\s+rıza\s+hacıoğlu/i,
  /özel\s+ders/i,
];

export const FORBIDDEN_ASCII_PATTERNS = [
  /okul\s+muduru/i,
  /mustafa\s+ozkan/i,
  /ali\s+riza\s+hacioglu/i,
  /ozel\s+ders/i,
];

export function normalizeForPrivacyMatch(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFKC')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export function assertTextPrivacy(text, contextLabel = '') {
  if (!text || typeof text !== 'string') return;

  // 1. Orijinal metin üzerinde doğrudan kontrol
  for (const pattern of FORBIDDEN_PRIVACY_PATTERNS) {
    if (pattern.test(text)) {
      const label = contextLabel ? ` (${contextLabel})` : '';
      throw new Error(`Gizlilik ihlali tespit edildi [${pattern}]${label}: ${text.slice(0, 100)}`);
    }
  }

  // 2. Türkçe küçük harf + ASCII katlaması yapılmış metin üzerinde kontrol
  const normalized = normalizeForPrivacyMatch(text);
  for (const pattern of FORBIDDEN_ASCII_PATTERNS) {
    if (pattern.test(normalized)) {
      const label = contextLabel ? ` (${contextLabel})` : '';
      throw new Error(`Gizlilik ihlali tespit edildi [${pattern}]${label}: ${text.slice(0, 100)}`);
    }
  }
}

export function assertPdfPrivacy(pdfPath) {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF dosyası bulunamadı: ${pdfPath}`);
  }

  let text = '';
  try {
    text = childProcess.execFileSync('pdftotext', [pdfPath, '-'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    if (err.message && err.message.startsWith('Gizlilik ihlali')) {
      throw err;
    }
    throw new Error(`pdftotext çalıştırılamadı (${pdfPath}): ${err.message || String(err)}`);
  }

  if (!text || !text.trim()) {
    throw new Error(`PDF içeriği boş veya pdftotext tarafından okunamadı: ${pdfPath}`);
  }

  assertTextPrivacy(text, pdfPath);
}

export function resolveWriteMode(argv = process.argv) {
  const args = Array.isArray(argv) ? argv : [];
  const hasConfirm = args.includes('--confirm');
  const hasDryRun = args.includes('--dry-run');

  if (hasConfirm && !hasDryRun) {
    return { dryRun: false, confirmed: true };
  }
  return { dryRun: true, confirmed: false };
}
