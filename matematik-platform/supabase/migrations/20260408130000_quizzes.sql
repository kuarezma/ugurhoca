-- Test Sistemi Tabloları
-- Supabase Dashboard → SQL Editor’da çalıştırın

-- ============================================
-- quizzes Tablosu
-- ============================================
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  grade integer not null check (grade >= 1 and grade <= 12),
  time_limit integer not null, -- dakika cinsinden
  difficulty text not null check (difficulty in ('Kolay', 'Orta', 'Zor')),
  description text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;

drop policy if exists "quizzes_select" on public.quizzes;
drop policy if exists "quizzes_insert" on public.quizzes;
drop policy if exists "quizzes_update" on public.quizzes;
drop policy if exists "quizzes_delete" on public.quizzes;

create policy "quizzes_select" on public.quizzes for select using (true);
create policy "quizzes_insert" on public.quizzes for insert with check (true);
create policy "quizzes_update" on public.quizzes for update using (true) with check (true);
create policy "quizzes_delete" on public.quizzes for delete using (true);

grant select, insert, update, delete on public.quizzes to anon, authenticated;

-- ============================================
-- quiz_questions Tablosu
-- ============================================
create table if not exists public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options text[] not null check (array_length(options, 1) >= 2),
  correct_index integer not null check (correct_index >= 0),
  question_order integer not null,
  explanation text,
  created_at timestamptz not null default now()
);

alter table public.quiz_questions enable row level security;

drop policy if exists "quiz_questions_select" on public.quiz_questions;
drop policy if exists "quiz_questions_insert" on public.quiz_questions;
drop policy if exists "quiz_questions_update" on public.quiz_questions;
drop policy if exists "quiz_questions_delete" on public.quiz_questions;

create policy "quiz_questions_select" on public.quiz_questions for select using (true);
create policy "quiz_questions_insert" on public.quiz_questions for insert with check (true);
create policy "quiz_questions_update" on public.quiz_questions for update using (true) with check (true);
create policy "quiz_questions_delete" on public.quiz_questions for delete using (true);

grant select, insert, update, delete on public.quiz_questions to anon, authenticated;

-- ============================================
-- quiz_results Tablosu
-- ============================================
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null,
  answers jsonb not null, -- {question_id: selected_index}
  time_spent integer not null, -- saniye cinsinden
  completed_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

drop policy if exists "quiz_results_select" on public.quiz_results;
drop policy if exists "quiz_results_insert" on public.quiz_results;
drop policy if exists "quiz_results_update" on public.quiz_results;
drop policy if exists "quiz_results_delete" on public.quiz_results;

create policy "quiz_results_select" on public.quiz_results for select using (auth.uid() = user_id);
create policy "quiz_results_insert" on public.quiz_results for insert with check (auth.uid() = user_id);
create policy "quiz_results_update" on public.quiz_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quiz_results_delete" on public.quiz_results for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.quiz_results to anon, authenticated;

-- ============================================
-- Index'ler
-- ============================================
create index if not exists idx_quizzes_grade on public.quizzes(grade);
create index if not exists idx_quizzes_active on public.quizzes(is_active);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_results_user_id on public.quiz_results(user_id);
create index if not exists idx_quiz_results_quiz_id on public.quiz_results(quiz_id);
