import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const rootDir = path.resolve(import.meta.dirname, '..');
const envPath = path.join(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, quiet: true });
}

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WORKSHEET_CANDIDATE_SOURCE_URLS',
  'GOOGLE_DRIVE_CLIENT_ID',
  'GOOGLE_DRIVE_CLIENT_SECRET',
  'GOOGLE_DRIVE_REDIRECT_URI',
  'CRON_SECRET',
];

const requiredMigrations = [
  '20260516120000_annual_plan_items.sql',
  '20260516123000_worksheet_candidates.sql',
  '20260517100000_google_drive_connections.sql',
];

const requiredTables = [
  'annual_plan_items',
  'worksheet_candidates',
  'google_drive_connections',
];

const results = [];

function addResult(ok, label, detail = '') {
  results.push({ ok, label, detail });
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isPublicHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !isPrivateOrLocalHost(url.hostname);
  } catch {
    return false;
  }
}

function hasGoogleDriveCallbackPath(value) {
  try {
    return new URL(value).pathname === '/api/admin-google-drive/callback';
  } catch {
    return false;
  }
}

function isValidHost(value) {
  return (
    /^[a-z0-9.-]+$/i.test(value) &&
    value.includes('.') &&
    !value.includes('..') &&
    isPublicHttpUrl(`https://${value.replace(/^\./, '')}`)
  );
}

function isPrivateOrLocalHost(host) {
  const lowerHost = host.toLowerCase();
  if (lowerHost === 'localhost' || lowerHost.endsWith('.local')) {
    return true;
  }

  const ipv4 = lowerHost.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!ipv4) {
    return false;
  }

  const first = Number(ipv4[1]);
  const second = Number(ipv4[2]);

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

addResult(
  fs.existsSync(envPath),
  '.env.local dosyası',
  fs.existsSync(envPath) ? 'bulundu' : 'eksik',
);

for (const key of requiredEnv) {
  addResult(Boolean(process.env[key]), key, process.env[key] ? 'tanımlı' : 'eksik');
}

const sourceUrls = (process.env.WORKSHEET_CANDIDATE_SOURCE_URLS || '')
  .split(/[,\n]+/)
  .map((value) => value.trim())
  .filter(Boolean);

if (sourceUrls.length > 0) {
  const invalidUrls = sourceUrls.filter((value) => !isPublicHttpUrl(value));

  addResult(
    invalidUrls.length === 0,
    'WORKSHEET_CANDIDATE_SOURCE_URLS public URL formatı',
    invalidUrls.length === 0
      ? `${sourceUrls.length} kaynak geçerli görünüyor`
      : `${invalidUrls.length} kaynak geçersiz veya yerel/özel ağ adresi`,
  );
}

const allowedHosts = (process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS || '')
  .split(/[,\n]+/)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (allowedHosts.length > 0) {
  const invalidHosts = allowedHosts.filter((value) => !isValidHost(value));

  addResult(
    invalidHosts.length === 0,
    'WORKSHEET_CANDIDATE_ALLOWED_HOSTS formatı',
    invalidHosts.length === 0
      ? `${allowedHosts.length} alan adı geçerli görünüyor`
      : `${invalidHosts.length} alan adı geçersiz`,
  );
}

if (process.env.GOOGLE_DRIVE_REDIRECT_URI) {
  addResult(
    isHttpUrl(process.env.GOOGLE_DRIVE_REDIRECT_URI),
    'GOOGLE_DRIVE_REDIRECT_URI URL formatı',
    isHttpUrl(process.env.GOOGLE_DRIVE_REDIRECT_URI)
      ? 'geçerli görünüyor'
      : 'http veya https URL olmalı',
  );
  addResult(
    hasGoogleDriveCallbackPath(process.env.GOOGLE_DRIVE_REDIRECT_URI),
    'GOOGLE_DRIVE_REDIRECT_URI callback yolu',
    hasGoogleDriveCallbackPath(process.env.GOOGLE_DRIVE_REDIRECT_URI)
      ? 'doğru callback yolu'
      : '/api/admin-google-drive/callback ile bitmeli',
  );
}

if (process.env.CRON_SECRET) {
  const weakCronSecret =
    process.env.CRON_SECRET.length < 24 ||
    ['change-this-cron-secret', 'changeme', 'secret'].includes(
      process.env.CRON_SECRET.toLowerCase(),
    );

  addResult(
    !weakCronSecret,
    'CRON_SECRET güvenliği',
    weakCronSecret ? 'daha uzun ve tahmin edilemez olmalı' : 'uygun görünüyor',
  );
}

for (const migration of requiredMigrations) {
  addResult(
    fs.existsSync(path.join(rootDir, 'supabase', 'migrations', migration)),
    `migration: ${migration}`,
    'dosya kontrolü',
  );
}

if (
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  for (const table of requiredTables) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    addResult(
      !error,
      `Supabase tablo: ${table}`,
      error ? 'bulunamadı veya erişilemiyor' : 'erişilebilir',
    );
  }
} else {
  for (const table of requiredTables) {
    addResult(false, `Supabase tablo: ${table}`, 'env eksik olduğu için kontrol edilemedi');
  }
}

console.log('Yaprak test otomasyonu kurulum kontrolü\n');

for (const result of results) {
  console.log(`${result.ok ? 'OK' : 'EKSİK'}  ${result.label} - ${result.detail}`);
}

const failed = results.filter((result) => !result.ok);

if (failed.length > 0) {
  console.error(`\n${failed.length} eksik/hatali ayar var.`);

  if (!process.env.WORKSHEET_CANDIDATE_SOURCE_URLS) {
    console.error(
      '- WORKSHEET_CANDIDATE_SOURCE_URLS için izinli PDF veya kaynak sayfa URL listesi ekleyin.',
    );
  }

  if (
    failed.some(
      (result) => result.label === 'WORKSHEET_CANDIDATE_ALLOWED_HOSTS formatı',
    )
  ) {
    console.error(
      '- WORKSHEET_CANDIDATE_ALLOWED_HOSTS değerlerini protokolsüz alan adı olarak yazın. Örn: meb.gov.tr',
    );
  }

  if (
    !process.env.GOOGLE_DRIVE_CLIENT_ID ||
    !process.env.GOOGLE_DRIVE_CLIENT_SECRET ||
    !process.env.GOOGLE_DRIVE_REDIRECT_URI ||
    failed.some((result) =>
      result.label.startsWith('GOOGLE_DRIVE_REDIRECT_URI'),
    )
  ) {
    console.error(
      '- Google Cloud OAuth istemcisi oluşturup Drive callback adresini Authorized redirect URI olarak ekleyin.',
    );
  }

  if (failed.some((result) => result.label.startsWith('Supabase tablo:'))) {
    console.error(
      '- Supabase SQL Editor veya migration akışıyla yıllık plan migration dosyalarını uygulayın.',
    );
  }

  console.error(
    '- Detaylı sıra için docs/WORKSHEET_AUTOMATION_SETUP.md dosyasına bakın.',
  );
  process.exit(1);
}

console.log('\nKurulum ayarları hazır görünüyor.');
