ALTER TABLE public.worksheet_candidates
  ADD COLUMN IF NOT EXISTS match_reason TEXT;
