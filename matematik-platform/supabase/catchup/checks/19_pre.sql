select exists(select 1 from pg_proc where proname='live_lesson_normalize_grade' and pronamespace='public'::regnamespace) as ok;
