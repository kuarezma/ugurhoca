import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const scripts = [
  'supabase/tests/fixtures/privacy_schema.sql',
  'supabase/migrations/20260419230000_lock_down_profiles.sql',
  'supabase/migrations/20261004130000_single_admin_email.sql',
  'supabase/migrations/20261004170000_lock_down_public_reads.sql',
  'supabase/migrations/20261004215357_admin_site_statistics.sql',
  'supabase/tests/student_privacy_rls.sql',
  'supabase/tests/admin_site_statistics.sql',
];

const database = new PGlite();
try {
  for (const relativePath of scripts) {
    const sql = await readFile(resolve(projectRoot, relativePath), 'utf8');
    await database.exec(sql);
    process.stdout.write(`OK ${relativePath}\n`);
  }
} finally {
  await database.close();
}
