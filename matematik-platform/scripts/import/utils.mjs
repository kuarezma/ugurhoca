import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

export function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const normalized = token.slice(2);
    const [key, inlineValue] = normalized.split('=');

    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    i += 1;
  }

  return parsed;
}

export function rootPath(...segments) {
  return path.resolve(process.cwd(), ...segments);
}

export async function loadJsonArray(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`JSON must be an array: ${filePath}`);
  }

  return parsed;
}

export function chunk(items, size = 200) {
  const result = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
}

export function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function toFloat(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;

  const parsed = Number.parseFloat(String(value));
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function toBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'evet'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'hayir'].includes(normalized)) return false;

  return fallback;
}

export function requiredString(value, fieldName, rowIndex) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw new Error(`Missing required field '${fieldName}' at row ${rowIndex + 1}`);
  }
  return normalized;
}

export function optionalString(value) {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized : null;
}

export function loadEnv() {
  dotenv.config({ path: rootPath('.env.local') });
  dotenv.config();
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in env.');
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in env. Add it to .env.local for import scripts.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function printSummary(title, rows, detail) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  console.log(`Rows: ${rows.length}`);

  if (detail?.years?.length) {
    console.log(`Years: ${detail.years.join(', ')}`);
  }

  if (detail?.extra?.length) {
    for (const line of detail.extra) {
      console.log(line);
    }
  }
}
