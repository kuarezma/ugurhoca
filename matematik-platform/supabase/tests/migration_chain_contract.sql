-- Gerçek API rolleri altında çalışır; bütün sentetik işlemler geri alınır.
BEGIN;
DO $$
DECLARE table_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname IN ('public', 'storage')
    AND (coalesce(qual, '') || coalesce(with_check, '')) ~* '(auth\.jwt|users\.email|@)') THEN
    RAISE EXCEPTION 'FAIL: Doğrudan e-posta kullanan aktif politika';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'public'
      AND (tablename, policyname) IN (('documents', 'documents_select'),
                                    ('announcements', 'announcements_select'))) <> 2 THEN
    RAISE EXCEPTION 'FAIL: İçerik okuma politikaları eksik';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND policyname IN
    ('profiles_admin_all', 'documents_update', 'assignments_admin_write',
     'shared_documents_admin_write', 'notifications_admin_all',
     'quizzes_admin_write', 'quiz_questions_admin_write')) <> 7 THEN
    RAISE EXCEPTION 'FAIL: Zorunlu yönetici politikası eksik';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname IN
    ('profiles_admin_all', 'documents_update', 'assignments_admin_write',
     'shared_documents_admin_write', 'notifications_admin_all',
     'quizzes_admin_write', 'quiz_questions_admin_write')
    AND (qual NOT LIKE '%SELECT is_admin_email()%'
      OR with_check NOT LIKE '%SELECT is_admin_email()%')) THEN
    RAISE EXCEPTION 'FAIL: Yönetici politikaları initplan helper kullanmalı';
  END IF;
  IF (SELECT jsonb_object_agg(id, public) FROM storage.buckets) <>
    '{"documents":true,"submissions":false,"avatars":true,"quiz-images":true}'::jsonb THEN
    RAISE EXCEPTION 'FAIL: Bucket sözleşmesi';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
    AND tablename = 'chat_users' AND policyname = 'chat_users_deny_clients'
    AND permissive = 'RESTRICTIVE' AND qual = 'false' AND with_check = 'false') THEN
    RAISE EXCEPTION 'FAIL: chat_users restrictive engeli eksik';
  END IF;
  IF obj_description('public.chat_users'::regclass) NOT LIKE '%DEPRECATED%' THEN
    RAISE EXCEPTION 'FAIL: chat_users açıklaması eksik';
  END IF;
  FOREACH table_name IN ARRAY ARRAY['live_lesson_participants', 'live_lesson_chat_messages', 'live_lesson_events'] LOOP
    IF obj_description(to_regclass('public.' || table_name)) NOT LIKE '%INSERT/UPDATE/DELETE%service_role%' THEN
      RAISE EXCEPTION 'FAIL: Canlı ders yazma açıklaması eksik: %', table_name;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = table_name AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')) THEN
      RAISE EXCEPTION 'FAIL: Canlı ders istemci yazma politikası: %', table_name;
    END IF;
  END LOOP;
END;
$$;

INSERT INTO public.documents (id, title) VALUES
  ('71000000-0000-4000-8000-000000000001', 'Rol testi');
INSERT INTO public.chat_users (full_name, display_name) VALUES ('Rol testi', 'Test');
INSERT INTO public.live_lessons (id, room_id, title, target_grade, starts_at)
VALUES ('71000000-0000-4000-8000-000000000002', 'k2-contract', 'Rol testi', 'all', now());

SET LOCAL ROLE service_role;
INSERT INTO public.live_lesson_participants (lesson_id, user_name, role)
VALUES ('71000000-0000-4000-8000-000000000002', 'Test', 'student');
INSERT INTO public.live_lesson_chat_messages (lesson_id, user_name, role, message)
VALUES ('71000000-0000-4000-8000-000000000002', 'Test', 'student', 'Test');
INSERT INTO public.live_lesson_events (lesson_id, event_type)
VALUES ('71000000-0000-4000-8000-000000000002', 'test');
DO $$
DECLARE table_name text; changed integer;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['live_lesson_participants', 'live_lesson_chat_messages', 'live_lesson_events'] LOOP
    EXECUTE format('UPDATE public.%I SET created_at = now() WHERE lesson_id = %L::uuid',
      table_name, '71000000-0000-4000-8000-000000000002');
    GET DIAGNOSTICS changed = ROW_COUNT;
    IF changed <> 1 THEN RAISE EXCEPTION 'FAIL: service_role UPDATE %', table_name; END IF;
  END LOOP;
  IF (SELECT count(*) FROM public.chat_users) < 1 THEN
    RAISE EXCEPTION 'FAIL: service_role chat_users okuyamıyor';
  END IF;
END;
$$;
RESET ROLE;

-- Tablo ve sütun ACL'leri ayrı doğrulanır.
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF has_table_privilege(role_name, 'public.chat_users', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
       OR has_any_column_privilege(role_name, 'public.chat_users', 'SELECT,INSERT,UPDATE,REFERENCES') THEN
      RAISE EXCEPTION 'FAIL: chat_users istemci ACL açık: %', role_name;
    END IF;
  END LOOP;
END;
$$;

-- Gelecekte yanlışlıkla permissive politika/GRANT eklense bile restrictive
-- engeli etkili kalmalıdır. Bu değişiklikler yalnız test transaction'ında.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_users TO anon, authenticated;
CREATE POLICY k2_test_permissive ON public.chat_users FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
SET LOCAL ROLE anon;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.chat_users) <> 0 THEN RAISE EXCEPTION 'FAIL: anon chat_users'; END IF;
  IF (SELECT count(*) FROM public.documents WHERE id = '71000000-0000-4000-8000-000000000001') <> 1 THEN
    RAISE EXCEPTION 'FAIL: anon içerik okuma';
  END IF;
  BEGIN
    INSERT INTO public.chat_users (full_name, display_name) VALUES ('Anon', 'Test');
    RAISE EXCEPTION 'FAIL: anon chat_users INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","email":"admin@ugurhoca.com"}', true);
DO $$
DECLARE changed integer; table_name text;
BEGIN
  IF NOT public.is_admin_email() THEN RAISE EXCEPTION 'FAIL: admin helper'; END IF;
  UPDATE public.documents SET title = 'Admin güncelledi' WHERE id = '71000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN RAISE EXCEPTION 'FAIL: admin UPDATE'; END IF;
  INSERT INTO public.documents (title) VALUES ('Admin ekledi');
  INSERT INTO public.announcements (title) VALUES ('Admin ekledi');
  IF (SELECT count(*) FROM public.chat_users) <> 0 THEN RAISE EXCEPTION 'FAIL: admin chat_users'; END IF;
  BEGIN
    INSERT INTO public.chat_users (full_name, display_name) VALUES ('Admin', 'Test');
    RAISE EXCEPTION 'FAIL: admin chat_users INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  -- Admin dahil bütün istemcilerde canlı ders DML kapalıdır.
  FOREACH table_name IN ARRAY ARRAY['live_lesson_participants', 'live_lesson_chat_messages', 'live_lesson_events'] LOOP
    EXECUTE format('UPDATE public.%I SET created_at = now()', table_name);
    GET DIAGNOSTICS changed = ROW_COUNT;
    IF changed <> 0 THEN RAISE EXCEPTION 'FAIL: client UPDATE %', table_name; END IF;
    EXECUTE format('DELETE FROM public.%I', table_name);
    GET DIAGNOSTICS changed = ROW_COUNT;
    IF changed <> 0 THEN RAISE EXCEPTION 'FAIL: client DELETE %', table_name; END IF;
  END LOOP;
  BEGIN
    INSERT INTO public.live_lesson_participants (lesson_id, user_name, role)
    VALUES ('71000000-0000-4000-8000-000000000002', 'Test', 'student');
    RAISE EXCEPTION 'FAIL: client participant INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.live_lesson_chat_messages (lesson_id, user_name, role, message)
    VALUES ('71000000-0000-4000-8000-000000000002', 'Test', 'student', 'Test');
    RAISE EXCEPTION 'FAIL: client chat INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.live_lesson_events (lesson_id, event_type)
    VALUES ('71000000-0000-4000-8000-000000000002', 'test');
    RAISE EXCEPTION 'FAIL: client event INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","email":"admin@matematiklab.com"}', true);
DO $$
DECLARE changed integer;
BEGIN
  IF public.is_admin_email() THEN RAISE EXCEPTION 'FAIL: eski admin helper'; END IF;
  UPDATE public.documents SET title = 'Eski admin' WHERE id = '71000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'FAIL: eski admin UPDATE'; END IF;
END;
$$;
SELECT set_config('request.jwt.claims', '{"role":"authenticated","email":"student@example.invalid"}', true);
DO $$
DECLARE changed integer;
BEGIN
  IF public.is_admin_email() THEN RAISE EXCEPTION 'FAIL: öğrenci helper'; END IF;
  UPDATE public.documents SET title = 'Öğrenci' WHERE id = '71000000-0000-4000-8000-000000000001';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'FAIL: öğrenci UPDATE'; END IF;
  BEGIN
    INSERT INTO public.documents (title) VALUES ('Yetkisiz');
    RAISE EXCEPTION 'FAIL: öğrenci INSERT';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;
SET LOCAL ROLE service_role;
DELETE FROM public.live_lesson_participants WHERE lesson_id = '71000000-0000-4000-8000-000000000002';
DELETE FROM public.live_lesson_chat_messages WHERE lesson_id = '71000000-0000-4000-8000-000000000002';
DELETE FROM public.live_lesson_events WHERE lesson_id = '71000000-0000-4000-8000-000000000002';
RESET ROLE;
ROLLBACK;
