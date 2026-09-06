-- Migration: 20260906100000_user_mistakes.sql
-- Hata Defteri bulut senkronizasyonu ve cihazlar arası aralıklı tekrar eşitlemesi

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_mistakes' AND policyname = 'user_mistakes_select_own'
  ) THEN
    CREATE POLICY "user_mistakes_select_own"
      ON public.user_mistakes
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_mistakes' AND policyname = 'user_mistakes_insert_own'
  ) THEN
    CREATE POLICY "user_mistakes_insert_own"
      ON public.user_mistakes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_mistakes' AND policyname = 'user_mistakes_update_own'
  ) THEN
    CREATE POLICY "user_mistakes_update_own"
      ON public.user_mistakes
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_mistakes' AND policyname = 'user_mistakes_delete_own'
  ) THEN
    CREATE POLICY "user_mistakes_delete_own"
      ON public.user_mistakes
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON public.user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_next_review ON public.user_mistakes(user_id, next_review_date) WHERE mastered = false;
