-- catchup: DÜZELTİLMİŞ KOPYA — kaynak supabase/migrations/20260906100000_user_mistakes.sql
-- catchup: Production durumu: user_mistakes tablosu YOK (PostgREST 404 logları).
-- catchup: Fark 1: politikalar "IF NOT EXISTS (pg_policies)" yerine DROP IF EXISTS + CREATE;
-- catchup:         auth.uid() initplan kalıbıyla ((SELECT auth.uid())) — 20260930140000'in
-- catchup:         zincirde bu tabloya da uygulayacağı biçim. Roller/komutlar aynı.
-- catchup: Fark 2: anon tablo yetkisi alınır (Supabase varsayılan ACL'i anon'a tam yetki
-- catchup:         verir; politika zaten anon'a satır göstermez).
-- catchup: Tablo, kısıtlar ve index'ler kaynakla birebir. Idempotent; veri yazmaz.
SET lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS public.user_mistakes (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_data jsonb NOT NULL,
  quiz_title text,
  saved_at timestamptz NOT NULL DEFAULT now(),
  mastered boolean NOT NULL DEFAULT false,
  reason text,
  review_stage integer NOT NULL DEFAULT 0,
  next_review_date date,
  last_reviewed_at timestamptz,
  review_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_mistakes_user_question_unique UNIQUE (user_id, question_id)
);

ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_mistakes_select_own" ON public.user_mistakes;
CREATE POLICY "user_mistakes_select_own" ON public.user_mistakes
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_mistakes_insert_own" ON public.user_mistakes;
CREATE POLICY "user_mistakes_insert_own" ON public.user_mistakes
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_mistakes_update_own" ON public.user_mistakes;
CREATE POLICY "user_mistakes_update_own" ON public.user_mistakes
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_mistakes_delete_own" ON public.user_mistakes;
CREATE POLICY "user_mistakes_delete_own" ON public.user_mistakes
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON public.user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_next_review ON public.user_mistakes(user_id, next_review_date) WHERE mastered = false;

REVOKE ALL ON public.user_mistakes FROM anon;

RESET lock_timeout;
