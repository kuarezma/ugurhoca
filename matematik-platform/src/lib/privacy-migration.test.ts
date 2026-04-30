import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260429120000_privacy_tracking_aliases.sql',
);

const normalizeSql = (value: string) => value.replace(/\s+/g, ' ').trim();

describe('privacy tracking migration', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const normalizedSql = normalizeSql(sql);

  it('uses the single canonical admin account', () => {
    expect(sql).toContain("(auth.jwt() ->> 'email') = 'admin@ugurhoca.com'");
    expect(sql).not.toContain('admin@matematiklab.com');
  });

  it('keeps game scores private while exposing only alias leaderboard data', () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "game_scores_select_own" ON public.game_scores FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin_email())',
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "game_scores_insert_own_with_alias" ON public.game_scores FOR INSERT TO authenticated WITH CHECK ( auth.uid() = user_id AND EXISTS ( SELECT 1 FROM public.game_aliases alias WHERE alias.user_id = auth.uid() ) )',
    );
    expect(normalizedSql).toContain(
      'RETURNS TABLE(rank INTEGER, alias TEXT, total_score BIGINT)',
    );
    expect(normalizedSql).not.toContain(
      'RETURNS TABLE(rank INTEGER, user_id UUID',
    );
  });

  it('keeps weekly plans visible only to the target student or admin', () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "student_weekly_plans_select_own" ON public.student_weekly_plans FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.is_admin_email())',
    );
    expect(normalizedSql).toContain(
      'WHERE item.id = p_item_id AND item.plan_id = plan.id AND plan.student_id = auth.uid()',
    );
  });

  it('keeps student-owned tables isolated by user id', () => {
    expect(normalizedSql).toContain(
      'CREATE POLICY "shared_documents_select_own" ON public.shared_documents FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin_email())',
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "comments_select_own_or_admin" ON public.comments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_email())',
    );
    expect(normalizedSql).toContain(
      'CREATE POLICY "notes_select_own" ON public.notes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_email())',
    );
  });
});
