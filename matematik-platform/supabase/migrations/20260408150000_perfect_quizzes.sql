-- Özellik 1 İyileştirmeleri - Güvenlik ve Otomasyon

-- 1. updated_at Fonksiyonu (Eğer yoksa)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. quizzes Tablosu için Trigger
drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
  before update on public.quizzes
  for each row
  execute function public.handle_updated_at();

-- 3. RLS Politikalarını Sıkılaştırma
-- quizzes tablosu
alter table public.quizzes enable row level security;

drop policy if exists "quizzes_insert" on public.quizzes;
drop policy if exists "quizzes_update" on public.quizzes;
drop policy if exists "quizzes_delete" on public.quizzes;

-- Sadece adminler ekleyebilir, güncelleyebilir ve silebilir
create policy "quizzes_insert" on public.quizzes for insert with check (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);
create policy "quizzes_update" on public.quizzes for update using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);
create policy "quizzes_delete" on public.quizzes for delete using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);

-- quiz_questions tablosu
alter table public.quiz_questions enable row level security;

drop policy if exists "quiz_questions_insert" on public.quiz_questions;
drop policy if exists "quiz_questions_update" on public.quiz_questions;
drop policy if exists "quiz_questions_delete" on public.quiz_questions;

create policy "quiz_questions_insert" on public.quiz_questions for insert with check (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);
create policy "quiz_questions_update" on public.quiz_questions for update using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);
create policy "quiz_questions_delete" on public.quiz_questions for delete using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com')
);

-- NOT: quiz_results tablosu için mevcut politikalar zaten güvenli (auth.uid() = user_id).
