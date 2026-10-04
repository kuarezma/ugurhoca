select exists (select 1 from pg_proc where pronamespace='public'::regnamespace and proname='game_score_limit') as ok;
