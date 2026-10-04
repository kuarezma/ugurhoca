import fs from 'node:fs';
import path from 'node:path';

// Source checks for the 2026-10-04 production catch-up migrations. Behaviour
// is verified against a production-catalog replica outside the unit suite
// (supabase/catchup/APPLY.md); these tests pin the safety properties.
const dir = path.join(process.cwd(), 'supabase/migrations');
const read = (name: string) => fs.readFileSync(path.join(dir, name), 'utf8');
const code = (name: string) =>
  read(name).replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim();

const catchupFiles = [
  '20261004130500_single_admin_email_remaining.sql',
  '20261004170000_lock_down_public_reads.sql',
  '20261004170100_game_19_score_limit.sql',
  '20261004170200_restore_tracking_tables.sql',
];

describe.each(catchupFiles)('%s', (file) => {
  it('bounds lock waits, owns no transaction and never changes rows', () => {
    const sql = code(file);
    expect(sql.startsWith("SET lock_timeout = '5s';")).toBe(true);
    // Function bodies define behaviour; they do not run during the migration.
    const statements = sql.replace(/AS \$\$[\s\S]*?\$\$;/g, 'AS <body>;');
    expect(statements).not.toMatch(/\b(BEGIN|COMMIT)\s*;/i);
    expect(statements).not.toMatch(
      /\b(INSERT INTO|UPDATE public\.|DELETE FROM|TRUNCATE|DROP TABLE|DROP COLUMN)\b/i,
    );
    expect(sql).not.toContain('admin@matematiklab.com');
  });

  it('recreates every policy idempotently', () => {
    const sql = code(file);
    for (const [, name, table] of sql.matchAll(
      /CREATE POLICY "([^"]+)" ON ((?:public|storage)\.\w+)/g,
    )) {
      expect(sql).toContain(`DROP POLICY IF EXISTS "${name}" ON ${table};`);
    }
  });
});

describe('20261004130500_single_admin_email_remaining.sql', () => {
  const sql = code('20261004130500_single_admin_email_remaining.sql');

  it('covers exactly the production policies 20261004130000 left behind', () => {
    const names = [...sql.matchAll(/CREATE POLICY "([^"]+)" ON ((?:public|storage)\.\w+)/g)]
      .map(([, name, table]) => `${table}.${name}`)
      .sort();
    expect(names).toEqual(
      [
        'public.announcements.announcements_delete',
        'public.announcements.announcements_insert',
        'public.announcements.announcements_update',
        'public.assignment_submissions.submissions_admin_all',
        'public.chat_users.chat_users_admin_all',
        'public.documents.documents_delete',
        'public.documents.documents_insert',
        'storage.objects.submissions_admin_select',
        'public.user_badges.user_badges_admin_all',
      ].sort(),
    );
    expect(sql.match(/admin@ugurhoca\.com/g)?.length).toBe(10);
  });

  it('turns a storage ownership error into a warning instead of aborting', () => {
    expect(sql).toMatch(
      /ON storage\.objects[\s\S]*EXCEPTION WHEN insufficient_privilege THEN RAISE WARNING/,
    );
  });
});

describe('20261004170000_lock_down_public_reads.sql', () => {
  const sql = code('20261004170000_lock_down_public_reads.sql');

  it('limits shared_documents reads to the owner student and the admin', () => {
    expect(sql).toContain('DROP POLICY IF EXISTS "shared_documents_select" ON public.shared_documents;');
    expect(sql).toMatch(
      /CREATE POLICY "shared_documents_select_own" ON public\.shared_documents FOR SELECT TO authenticated USING \( student_id = \(SELECT auth\.uid\(\)\) OR \(SELECT public\.is_admin_email\(\)\) \);/,
    );
    expect(sql).toContain('REVOKE ALL ON public.shared_documents FROM anon;');
  });

  it('closes chat_users to API roles without dropping the table', () => {
    expect(sql).toContain('REVOKE ALL ON public.chat_users FROM anon, authenticated;');
    expect(sql).not.toMatch(/DROP TABLE/i);
  });

  it('removes anonymous document bucket writes and keeps support uploads', () => {
    for (const name of ['Allow anonymous uploads', 'documents flreew_0', 'documents flreew_1', 'documents flreew_2', 'documents flreew_3']) {
      expect(sql).toContain(`DROP POLICY IF EXISTS "${name}" ON storage.objects;`);
    }
    expect(sql).toMatch(/"documents_support_upload" ON storage\.objects FOR INSERT TO authenticated/);
    expect(sql).toContain("name LIKE 'support\\_%'");
    expect(sql).not.toMatch(/TO (anon|public)\b/);
  });
});

describe('20261004170200_restore_tracking_tables.sql', () => {
  const sql = code('20261004170200_restore_tracking_tables.sql');

  it('does not redefine objects later migrations replaced', () => {
    expect(sql).not.toMatch(/FUNCTION public\.(is_admin_email|set_game_alias|get_game_leaderboard)/i);
    expect(sql).not.toMatch(/game_scores|global_leaderboard|game_aliases/);
  });

  it.each([
    'student_admin_statuses',
    'student_admin_notes',
    'student_weekly_plans',
    'student_weekly_plan_items',
    'student_activity_events',
  ])('creates %s idempotently without anonymous access', (table) => {
    expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table} (`);
    expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    expect(sql).toContain(`REVOKE ALL ON public.${table} FROM anon;`);
  });
});

it('20260906110000 indexes quiz_results on its real timestamp column', () => {
  const sql = code('20260906110000_performance_composite_indexes.sql');
  expect(sql).toContain('ON public.quiz_results(user_id, completed_at DESC);');
  expect(sql).not.toMatch(/quiz_results\(user_id, created_at/);
  expect(read('20260408130000_quizzes.sql')).toMatch(/completed_at timestamptz/);
});

it('20261004170100 keeps every existing game limit and adds game 19', () => {
  const previous = code('20260904000000_add_kids_games_score_limits.sql');
  const next = code('20261004170100_game_19_score_limit.sql');
  for (const [clause] of previous.matchAll(/WHEN \d+ THEN \d+/g)) {
    expect(next).toContain(clause);
  }
  expect(next).toContain('WHEN 19 THEN 5000');
});
