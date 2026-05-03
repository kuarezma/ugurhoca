import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/20260430120000_secure_game_score_submission.sql',
);

const normalizeSql = (value: string) => value.replace(/\s+/g, ' ').trim();

describe('secure game score submission migration', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  const normalizedSql = normalizeSql(sql);

  it('archives existing scores before resetting the active leaderboard', () => {
    expect(normalizedSql).toContain(
      'CREATE TABLE IF NOT EXISTS public.archived_game_scores',
    );
    expect(normalizedSql).toContain(
      'INSERT INTO public.archived_game_scores ( id, user_id, user_name, game_id, score, created_at ) SELECT id, user_id, user_name, game_id, score, created_at FROM public.game_scores ON CONFLICT (id) DO NOTHING',
    );
    expect(normalizedSql).toContain('TRUNCATE TABLE public.game_scores');
  });

  it('blocks direct score inserts and requires the score RPC', () => {
    expect(normalizedSql).toContain(
      'DROP POLICY IF EXISTS "Kullanıcılar kendi skorlarını ekleyebilir" ON public.game_scores',
    );
    expect(normalizedSql).toContain(
      'DROP POLICY IF EXISTS "game_scores_insert_own_with_alias" ON public.game_scores',
    );
    expect(normalizedSql).toContain(
      'REVOKE ALL ON public.game_scores FROM anon, authenticated',
    );
    expect(normalizedSql).toContain(
      'CREATE OR REPLACE FUNCTION public.submit_game_score( p_game_id INT, p_score INT )',
    );
    expect(normalizedSql).toContain(
      'GRANT EXECUTE ON FUNCTION public.submit_game_score(INT, INT) TO authenticated',
    );
  });

  it('requires aliases and enforces score limits inside the RPC', () => {
    expect(normalizedSql).toContain(
      'FROM public.game_aliases alias WHERE alias.user_id = auth.uid()',
    );
    expect(normalizedSql).toContain(
      "RAISE EXCEPTION 'Skor kaydetmek için önce oyun rumuzu seçmeniz gerekiyor.'",
    );
    expect(normalizedSql).toContain('IF p_score > max_score THEN');
    expect(normalizedSql).toContain('IF todays_score + p_score > 5000 THEN');
    expect(normalizedSql).toContain(
      "IF last_score_at IS NOT NULL AND last_score_at > now() - interval '15 seconds' THEN",
    );
  });

  it('exposes only alias-backed leaderboard rows', () => {
    expect(normalizedSql).toContain(
      'JOIN public.game_aliases a ON a.user_id = g.user_id',
    );
    expect(normalizedSql).toContain(
      'RETURNS TABLE(rank INTEGER, alias TEXT, total_score BIGINT)',
    );
    expect(normalizedSql).toContain('DROP VIEW IF EXISTS public.global_leaderboard');
    expect(normalizedSql).toContain(
      "FROM public.get_game_leaderboard('all')",
    );
    expect(normalizedSql).not.toContain(
      'CREATE VIEW public.global_leaderboard AS SELECT user_id, user_name',
    );
  });
});
