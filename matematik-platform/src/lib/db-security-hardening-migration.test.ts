import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260930120000_harden_security_definer_functions.sql',
);

const normalizeSql = (value: string) => value.replace(/\s+/g, ' ').trim();

describe('security definer hardening migration', () => {
  const normalizedSql = normalizeSql(fs.readFileSync(migrationPath, 'utf8'));

  it('removes every API role from the quiz trigger function', () => {
    expect(normalizedSql).toContain(
      'REVOKE ALL ON FUNCTION public.handle_quiz_result_insert() FROM PUBLIC, anon, authenticated, service_role',
    );
  });

  it.each([
    'get_admin_profile_id()',
    'get_game_leaderboard(text)',
    'set_game_alias(text)',
    'submit_game_score(integer, integer)',
    'touch_daily_streak()',
    'is_admin_email()',
  ])('limits %s to signed-in users', (signature) => {
    expect(normalizedSql).toContain(
      `REVOKE ALL ON FUNCTION public.${signature} FROM PUBLIC, anon;`,
    );
    expect(normalizedSql).toContain(
      `GRANT EXECUTE ON FUNCTION public.${signature} TO authenticated, service_role;`,
    );
  });

  it('keeps pre-login lookups callable by anon', () => {
    expect(normalizedSql).toContain(
      'GRANT EXECUTE ON FUNCTION public.find_login_email(text, text) TO anon, authenticated, service_role',
    );
    expect(normalizedSql).toContain(
      'GRANT EXECUTE ON FUNCTION public.profile_exists_for_register(text, text) TO anon, authenticated, service_role',
    );
  });

  it('escapes LIKE wildcards and caps find_login_email results', () => {
    expect(normalizedSql).toContain(
      "WHERE p.name ILIKE replace(replace(replace(p_display_name, '\\', '\\\\'), '%', '\\%'), '_', '\\_') LIMIT 2;",
    );
    expect(normalizedSql).toContain(
      'WHERE p.name_normalized = p_name_normalized LIMIT 2;',
    );
  });

  it('replaces the open notifications insert policy', () => {
    expect(normalizedSql).toContain(
      'DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications',
    );
    expect(normalizedSql).toContain(
      "user_id = auth.uid() OR ( type = 'message' AND user_id = public.get_admin_profile_id()",
    );
    expect(normalizedSql).toContain(
      "THEN (message::jsonb ->> 'sender_id') = auth.uid()::text",
    );
    expect(normalizedSql).not.toContain(
      'CREATE POLICY "notifications_insert_authenticated"',
    );
  });

  it('documents archived_game_scores as service-role only', () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "archived_game_scores_no_client_access" ON public.archived_game_scores AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
    );
  });
});
