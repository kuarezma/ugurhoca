/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { parseAnnualPlanFile } from '../src/lib/annual-plan-import';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const args = new Set(process.argv.slice(2));
const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const write = args.has('--write');

async function run() {
  if (!fileArg) {
    console.error('Kullanım: npm run import:annual-plan -- <dosya-yolu> [--write]');
    process.exit(1);
  }

  const filePath = path.resolve(fileArg);
  const fileBuffer = await fs.readFile(filePath);
  const parsed = await parseAnnualPlanFile(
    fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ),
    path.basename(filePath),
  );

  console.log('Yıllık plan import özeti\n');
  console.log(`Dosya: ${filePath}`);
  console.log(`Geçerli satır: ${parsed.rows.length}`);
  console.log(`Dosya içi tekrar: ${parsed.skippedDuplicates}`);
  console.log(`Mod: ${write ? 'veritabanına yaz' : 'dry-run'}`);

  if (parsed.errors.length > 0) {
    console.log('\nHatalar:');
    for (const error of parsed.errors.slice(0, 10)) {
      console.log(`- Satır ${error.row}: ${error.message}`);
    }
    process.exit(1);
  }

  if (parsed.rows.length === 0) {
    console.error('\nİçe aktarılacak geçerli satır bulunamadı.');
    process.exit(1);
  }

  console.log('\nİlk satırlar:');
  for (const row of parsed.rows.slice(0, 5)) {
    console.log(
      `- ${row.grade}. sınıf | ${row.week_start} - ${row.week_end} | ${row.subject} | ${row.learning_outcome}`,
    );
  }

  if (!write) {
    console.log('\nDry-run tamamlandı. Veritabanına yazmak için --write ekleyin.');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\nNEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from('annual_plan_items')
    .upsert(parsed.rows, {
      ignoreDuplicates: true,
      onConflict: 'grade,week_start,learning_outcome',
    })
    .select('*');

  if (error) {
    console.error('\nYıllık plan kaydedilemedi:');
    console.error(error.message);
    process.exit(1);
  }

  const inserted = data?.length ?? 0;
  const skipped = parsed.skippedDuplicates + Math.max(0, parsed.rows.length - inserted);

  console.log(`\nKaydedildi: ${inserted} yeni satır, ${skipped} tekrar atlandı.`);
}

run().catch((error) => {
  console.error('\nYıllık plan import başarısız:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
