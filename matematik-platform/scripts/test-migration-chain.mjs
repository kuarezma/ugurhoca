import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const database = new PGlite({ extensions: { uuid_ossp } });
try {
  await database.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/fixtures/supabase_platform.sql'),
      'utf8',
    ),
  );
  const files = (await readdir(resolve(projectRoot, 'supabase/migrations')))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  let completed = 0;
  for (const file of files) {
    try {
      await database.exec(
        await readFile(
          resolve(projectRoot, 'supabase/migrations', file),
          'utf8',
        ),
      );
    } catch (error) {
      throw new Error(`FAIL ${file} SQLSTATE=${error.code}: ${error.message}`);
    }
    completed++;
  }
  assert.equal(completed, files.length);
  console.log(
    `PASS migration chain: ${completed}/${files.length} (empty PGlite database)`,
  );
  // K0.2'de alınan OpenAPI sütun dökümü: yalnız ad/tür sözleşmesi,
  // canlı constraint/default/ACL eşitliği iddiası değildir.
  const expected = JSON.parse(
    await readFile(
      resolve(
        projectRoot,
        'supabase/tests/fixtures/public_schema_columns.json',
      ),
      'utf8',
    ),
  );
  for (const [table, columns] of Object.entries(expected)) {
    const { rows } = await database.query(
      `
      SELECT a.attname || ':' || format_type(a.atttypid, NULL) AS column_spec
      FROM pg_attribute a WHERE a.attrelid = to_regclass($1)
        AND a.attnum > 0 AND NOT a.attisdropped`,
      [`public.${table}`],
    );
    assert.deepEqual(
      rows.map((row) => row.column_spec).sort(),
      [...columns].sort(),
      table,
    );
  }
  assert.equal(
    (
      await database.query(
        "SELECT relkind FROM pg_class WHERE oid = 'public.global_leaderboard'::regclass",
      )
    ).rows[0].relkind,
    'v',
  );
  console.log(
    `PASS OpenAPI column contract: ${Object.keys(expected).length} relations`,
  );

  // Geç onarımın eksik okuma politikalarını tek başına geri kurduğunu doğrula.
  await database.exec(`DROP POLICY documents_select ON public.documents;
    DROP POLICY announcements_select ON public.announcements`);
  await database.exec(
    await readFile(
      resolve(
        projectRoot,
        'supabase/migrations/20261110110000_unify_admin_email_and_live_lesson_docs.sql',
      ),
      'utf8',
    ),
  );

  await database.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/migration_chain_contract.sql'),
      'utf8',
    ),
  );
  console.log('PASS policy catalog and API role contract');

  await database.exec(
    await readFile(
      resolve(
        projectRoot,
        'supabase/tests/full_chain_student_isolation.sql',
      ),
      'utf8',
    ),
  );
  console.log('PASS full chain student isolation and privacy contract');

  // İki yeni onarım dolu şemada tekrar çalışır; tarihsel dosyalar tekrarlanmaz.
  await database.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/fixtures/base_schema_rows.sql'),
      'utf8',
    ),
  );
  const tables = (
    await database.query(`SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' ORDER BY tablename`)
  ).rows;
  async function snapshot() {
    const result = {};
    for (const { tablename } of tables) {
      // Tablo adları yalnız PostgreSQL kataloğundan gelir.
      const identifier = '"' + tablename.replaceAll('"', '""') + '"';
      result[tablename] = (
        await database.query(`SELECT to_jsonb(t) AS data
        FROM public.${identifier} t ORDER BY to_jsonb(t)::text`)
      ).rows;
    }
    result.buckets = (
      await database.query('SELECT * FROM storage.buckets ORDER BY id')
    ).rows;
    return result;
  }
  const before = await snapshot();
  const repairs = [
    '20260401000000_restore_base_schema.sql',
    '20261110110000_unify_admin_email_and_live_lesson_docs.sql',
  ];
  for (let pass = 0; pass < 2; pass++) {
    for (const file of repairs) {
      await database.exec(
        await readFile(
          resolve(projectRoot, 'supabase/migrations', file),
          'utf8',
        ),
      );
    }
    assert.deepEqual(
      await snapshot(),
      before,
      'Onarımlar mevcut satırları değiştirmemeli',
    );
  }
  await database.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/migration_chain_contract.sql'),
      'utf8',
    ),
  );
  console.log(
    'PASS repair idempotence and populated schema preservation (2 replays)',
  );
} finally {
  await database.close();
}

// Yanlış türde mevcut sütun: bütün taban onarımı transaction ile geri alınır.
const incompatible = new PGlite({ extensions: { uuid_ossp } });
try {
  await incompatible.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/fixtures/supabase_platform.sql'),
      'utf8',
    ),
  );
  await incompatible.exec(
    "CREATE TABLE public.documents (id text PRIMARY KEY); INSERT INTO public.documents VALUES ('preserve-me')",
  );
  await assert.rejects(
    incompatible.exec(
      await readFile(
        resolve(
          projectRoot,
          'supabase/migrations/20260401000000_restore_base_schema.sql',
        ),
        'utf8',
      ),
    ),
    /Tür uyuşmazlığı/,
  );
  await incompatible.exec('ROLLBACK');
  assert.equal(
    (
      await incompatible.query(
        "SELECT to_regclass('public.profiles') AS relation",
      )
    ).rows[0].relation,
    null,
  );
  assert.deepEqual(
    (await incompatible.query('SELECT * FROM public.documents')).rows,
    [{ id: 'preserve-me' }],
  );
  console.log(
    'PASS type mismatch fails atomically and preserves existing data',
  );
} finally {
  await incompatible.close();
}

// Canlıdaki eski PK/default/nullability korunurken eksik sütunlar tamamlanır.
const partial = new PGlite({ extensions: { uuid_ossp } });
try {
  await partial.exec(
    await readFile(
      resolve(projectRoot, 'supabase/tests/fixtures/supabase_platform.sql'),
      'utf8',
    ),
  );
  await partial.exec(`CREATE TABLE public.chat_users (
    tc_number text PRIMARY KEY,
    full_name text NOT NULL DEFAULT 'Mevcut varsayılan',
    display_name text NOT NULL
  );
  INSERT INTO public.chat_users VALUES ('fixture-legacy', 'Korunacak', 'Korunacak');`);
  const oldRows = (await partial.query('SELECT * FROM public.chat_users')).rows;
  const oldColumns = (
    await partial.query(`SELECT column_name, is_nullable, column_default
    FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_users'
    ORDER BY column_name`)
  ).rows;
  await partial.exec(
    await readFile(
      resolve(
        projectRoot,
        'supabase/migrations/20260401000000_restore_base_schema.sql',
      ),
      'utf8',
    ),
  );
  assert.deepEqual(
    (
      await partial.query(
        'SELECT tc_number, full_name, display_name FROM public.chat_users',
      )
    ).rows,
    oldRows,
  );
  assert.deepEqual(
    (
      await partial.query(`SELECT column_name, is_nullable, column_default
    FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chat_users'
      AND column_name IN ('tc_number', 'full_name', 'display_name') ORDER BY column_name`)
    ).rows,
    oldColumns,
  );
  assert.deepEqual(
    (
      await partial.query(`SELECT a.attname FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = 'public.chat_users'::regclass AND i.indisprimary`)
    ).rows,
    [{ attname: 'tc_number' }],
  );
  assert.equal(
    (
      await partial.query(`SELECT count(*)::integer AS total FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chat_users'`)
    ).rows[0].total,
    8,
  );
  // Yanlış bucket görünürlüğü sessizce değiştirilmez.
  await partial.exec(
    "UPDATE storage.buckets SET public = false WHERE id = 'documents'",
  );
  await assert.rejects(
    partial.exec(
      await readFile(
        resolve(
          projectRoot,
          'supabase/migrations/20260401000000_restore_base_schema.sql',
        ),
        'utf8',
      ),
    ),
    /Bucket public bayrağı/,
  );
  await partial.exec('ROLLBACK');
  assert.equal(
    (
      await partial.query(
        "SELECT public FROM storage.buckets WHERE id = 'documents'",
      )
    ).rows[0].public,
    false,
  );
  console.log(
    'PASS partial schema recovery preserves rows, PK, defaults and bucket visibility',
  );
} finally {
  await partial.close();
}
