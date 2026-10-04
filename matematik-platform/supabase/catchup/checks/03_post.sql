select exists (select 1 from pg_proc where pronamespace='public'::regnamespace and proname='game_score_limit' and prosrc like '%WHEN 18 THEN 950%') as ok;
