BEGIN;

INSERT INTO auth.users (id, email) VALUES
  ('70000000-0000-4000-8000-000000000000', 'admin@ugurhoca.com');
INSERT INTO public.profiles (id, email, grade, created_at) VALUES
  ('70000000-0000-4000-8000-000000000000', 'admin@ugurhoca.com', NULL, now());

INSERT INTO auth.users (id, email)
SELECT ('70000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'student-' || n || '@example.com'
FROM generate_series(1, 1201) AS n;
INSERT INTO public.profiles (id, email, grade, created_at)
SELECT ('70000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'student-' || n || '@example.com',
  CASE WHEN n = 1201 THEN 0 ELSE 7 END,
  CASE WHEN n = 1201 THEN now() ELSE now() - interval '40 days' END
FROM generate_series(1, 1201) AS n;

INSERT INTO public.documents (id, downloads, views) VALUES
  ('71000000-0000-4000-8000-000000000001', 4, 9),
  ('71000000-0000-4000-8000-000000000002', 6, 11);
INSERT INTO public.notes (id, user_id) VALUES
  ('72000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001');
INSERT INTO public.assignments (id) VALUES
  ('73000000-0000-4000-8000-000000000001');

CREATE FUNCTION pg_temp.expect_stat(label text, actual bigint, expected bigint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'FAIL %: beklenen %, gelen %', label, expected, actual;
  END IF;
  RAISE NOTICE 'ok %', label;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_stat(text, bigint, bigint) TO service_role;

SET LOCAL ROLE service_role;
SELECT pg_temp.expect_stat('RPC öğrenci rolüne açık değil',
  has_function_privilege('authenticated', 'public.admin_site_statistics(timestamptz,text[])', 'EXECUTE')::int, 0);
SELECT pg_temp.expect_stat('RPC anonim role açık değil',
  has_function_privilege('anon', 'public.admin_site_statistics(timestamptz,text[])', 'EXECUTE')::int, 0);
SELECT pg_temp.expect_stat('1201 öğrenci satır sınırından bağımsız sayılır',
  (public.admin_site_statistics(NULL, ARRAY['admin@ugurhoca.com']) ->> 'totalUsers')::bigint, 1201);
SELECT pg_temp.expect_stat('iki dokümanın indirme toplamı',
  (public.admin_site_statistics(NULL, ARRAY['admin@ugurhoca.com']) ->> 'totalDownloads')::bigint, 10);
SELECT pg_temp.expect_stat('son 30 günde tek kayıt',
  (public.admin_site_statistics(now() - interval '30 days', ARRAY['admin@ugurhoca.com']) ->> 'recentSignups')::bigint, 1);
SELECT pg_temp.expect_stat('Mezun sayısı',
  (public.admin_site_statistics(NULL, ARRAY['admin@ugurhoca.com']) -> 'usersByGrade' -> 1 ->> 'count')::bigint, 1);

RESET ROLE;
ROLLBACK;
