select exists (select 1 from pg_policies where schemaname='public' and tablename='live_lessons' and policyname='live_lessons_select_scoped') and not exists (select 1 from pg_policies where schemaname='public' and tablename='live_lessons' and policyname='live_lessons_authenticated_select')
   and exists (select 1 from pg_policies where schemaname='public' and tablename='live_lesson_reminders' and policyname='live_lesson_reminders_admin_select')
   and not has_column_privilege('authenticated','public.live_lessons','teacher_proof','SELECT')
   and has_column_privilege('authenticated','public.live_lessons','recording_url','SELECT')
   and not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename like 'live_lesson%') as ok;
