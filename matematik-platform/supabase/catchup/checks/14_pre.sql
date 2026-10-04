select (to_regclass('public.student_groups') is not null) and (to_regclass('public.student_group_members') is not null) as ok;
