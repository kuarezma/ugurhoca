import fs from 'node:fs';
import path from 'node:path';

const readMigration = (file: string) =>
  fs
    .readFileSync(path.join(process.cwd(), 'supabase/migrations', file), 'utf8')
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('document counter RPC migration', () => {
  const sql = readMigration('20261004150000_document_counter_rpc.sql');

  it('sets a lock timeout before touching objects', () => {
    expect(sql).toContain("SET lock_timeout = '5s';");
  });

  it('defines an idempotent SECURITY DEFINER function with an empty search_path', () => {
    expect(sql).toContain(
      'CREATE OR REPLACE FUNCTION public.increment_document_counter( doc_id uuid, counter text )',
    );
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain("SET search_path = ''");
  });

  it('only updates whitelisted counters on a single row', () => {
    for (const column of ['views', 'downloads', 'likes']) {
      expect(sql).toContain(
        `UPDATE public.documents SET ${column} = COALESCE(${column}, 0) + 1 WHERE id = doc_id RETURNING ${column} INTO new_value;`,
      );
    }
    expect(sql).toContain("RAISE EXCEPTION 'invalid counter' USING ERRCODE = '22023';");
    expect(sql).not.toMatch(/EXECUTE format/i);
  });

  it('adds the likes column only when it is missing, before the function', () => {
    const alter =
      'ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;';
    expect(sql).toContain(alter);
    expect(sql.indexOf(alter)).toBeLessThan(
      sql.indexOf('CREATE OR REPLACE FUNCTION public.increment_document_counter'),
    );
  });

  it('does not depend on auth.uid(): the only caller is service_role', () => {
    // Oturum kontrolü rotada (getUser); service_role çağrısında auth.uid() NULL olur.
    expect(sql).not.toMatch(/auth\.uid\(\)/);
  });

  it('grants EXECUTE to service_role only', () => {
    expect(sql).toContain(
      'REVOKE ALL ON FUNCTION public.increment_document_counter(uuid, text) FROM PUBLIC, anon, authenticated;',
    );
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.increment_document_counter(uuid, text) TO service_role;',
    );
    expect(sql).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.increment_document_counter\(uuid, text\) TO [^;]*\b(anon|authenticated)\b/);
  });
});

describe('stray anon grants migration', () => {
  const sql = readMigration('20261004150100_revoke_stray_anon_grants.sql');

  it('sets a lock timeout', () => {
    expect(sql).toContain("SET lock_timeout = '5s';");
  });

  it('limits student_groups reads to admins and member students', () => {
    expect(sql).toContain("IF to_regclass('public.student_groups') IS NOT NULL THEN");
    expect(sql).toContain('DROP POLICY IF EXISTS "student_groups_select" ON public.student_groups;');
    expect(sql).toContain(
      'CREATE POLICY "student_groups_select" ON public.student_groups FOR SELECT TO authenticated USING ( public.is_admin_email() OR EXISTS ( SELECT 1 FROM public.student_group_members m WHERE m.group_id = student_groups.id AND m.user_id = (SELECT auth.uid()) ) );',
    );
    expect(sql).toContain('REVOKE ALL ON public.student_groups FROM anon;');
    expect(sql).not.toMatch(/student_groups[^;]*USING \(true\)/);
  });

  it.each(['chat_rooms', 'chat_room_members', 'chat_messages'])(
    'closes the sunset %s table to API roles only when it still exists',
    (table) => {
      expect(sql).toContain(`IF to_regclass('public.${table}') IS NOT NULL THEN`);
      expect(sql).toContain(`REVOKE ALL ON public.${table} FROM anon, authenticated;`);
    },
  );

  it('drops the open chat member policies', () => {
    for (const [policy, table] of [
      ['member_rooms_select', 'chat_rooms'],
      ['member_members_select', 'chat_room_members'],
      ['member_messages_select', 'chat_messages'],
      ['member_messages_insert', 'chat_messages'],
    ]) {
      expect(sql).toContain(`DROP POLICY IF EXISTS "${policy}" ON public.${table};`);
    }
  });

  it('skips the already dropped chat_users table safely', () => {
    expect(sql).toContain("IF to_regclass('public.chat_users') IS NOT NULL THEN");
  });

  it('revokes the anon grant on quiz_results without touching authenticated', () => {
    expect(sql).toContain("IF to_regclass('public.quiz_results') IS NOT NULL THEN");
    expect(sql).toContain('REVOKE ALL ON public.quiz_results FROM anon;');
    expect(sql).not.toMatch(/REVOKE[^;]*quiz_results[^;]*authenticated/);
  });
});
