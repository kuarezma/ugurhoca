-- K2.1 / K2.2: Canlı sütun sözleşmesi ve tek yönetici yetki kaynağı.
-- Yalnız yeni onarımdır; tarihsel migration zinciri canlıda yeniden oynatılmaz.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

CREATE TABLE IF NOT EXISTS public.chat_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tc_number text,
  full_name text NOT NULL,
  display_name text NOT NULL,
  last_seen timestamptz,
  is_online boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Mevcut tabloya yalnız eksik sütunlar eklenir; mevcut veri, default,
-- nullability ve kısıtlar korunur. Tür farkı sessizce dönüştürülmez.
DO $$
DECLARE
  column_spec text;
  column_name text;
  expected_type text;
  actual_type oid;
BEGIN
  FOREACH column_spec IN ARRAY ARRAY[
    'id uuid', 'tc_number text', 'full_name text', 'display_name text',
    'last_seen timestamptz', 'is_online boolean',
    'created_at timestamptz', 'updated_at timestamptz'
  ] LOOP
    column_name := split_part(column_spec, ' ', 1);
    expected_type := split_part(column_spec, ' ', 2);
    SELECT a.atttypid INTO actual_type FROM pg_attribute a
    WHERE a.attrelid = 'public.chat_users'::regclass
      AND a.attname = column_name AND a.attnum > 0 AND NOT a.attisdropped;
    IF FOUND AND actual_type <> to_regtype(expected_type)::oid THEN
      RAISE EXCEPTION 'Tür uyuşmazlığı: public.chat_users.%; beklenen %, mevcut %',
        column_name, expected_type, format_type(actual_type, NULL);
    END IF;
    EXECUTE format('ALTER TABLE public.chat_users ADD COLUMN IF NOT EXISTS %s', column_spec);
  END LOOP;
END;
$$;

ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_users FROM PUBLIC, anon, authenticated;
-- Tablo yetkisi kaldırılması eski sütun GRANT'larını kaldırmaz.
DO $$
DECLARE column_name text;
BEGIN
  FOR column_name IN
    SELECT attname FROM pg_attribute
    WHERE attrelid = 'public.chat_users'::regclass AND attnum > 0 AND NOT attisdropped
  LOOP
    EXECUTE format(
      'REVOKE SELECT (%1$I), INSERT (%1$I), UPDATE (%1$I), REFERENCES (%1$I)
       ON public.chat_users FROM PUBLIC, anon, authenticated', column_name);
  END LOOP;
END;
$$;
DROP POLICY IF EXISTS chat_users_deny_clients ON public.chat_users;
CREATE POLICY chat_users_deny_clients ON public.chat_users
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_users TO service_role;
COMMENT ON TABLE public.chat_users IS
  'DEPRECATED: Eski sohbet kullanıcıları; kayıtlar korunur. anon/authenticated erişimi kapalıdır; yalnız service_role erişebilir.';

-- Var olan daha dar okuma ifadeleri korunur; eksik taban politikası kurulur.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
                 AND tablename = 'documents' AND policyname = 'documents_select') THEN
    CREATE POLICY documents_select ON public.documents
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public'
                 AND tablename = 'announcements' AND policyname = 'announcements_select') THEN
    CREATE POLICY announcements_select ON public.announcements
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END;
$$;

-- Saf yönetici politikaları: komut ve permissive/restrictive niteliği korunur.
-- Public hedefli eski admin politikaları authenticated ile sınırlandırılır;
-- anon is_admin_email() çalıştırma yetkisine sahip değildir.
DO $$
DECLARE
  spec record;
  policy_command text;
  clauses text;
BEGIN
  FOR spec IN
    SELECT * FROM (VALUES
      ('profiles', 'profiles_admin_all'),
      ('documents', 'documents_update'),
      ('assignments', 'assignments_admin_write'),
      ('shared_documents', 'shared_documents_admin_write'),
      ('notifications', 'notifications_admin_all'),
      ('quizzes', 'quizzes_admin_write'),
      ('quiz_questions', 'quiz_questions_admin_write'),
      ('announcements', 'announcements_insert'),
      ('announcements', 'announcements_update'),
      ('announcements', 'announcements_delete'),
      ('documents', 'documents_insert'),
      ('documents', 'documents_delete'),
      ('assignment_submissions', 'submissions_admin_all'),
      ('user_badges', 'user_badges_admin_all'),
      ('chat_users', 'chat_users_admin_all'),
      ('chat_messages', 'admin_messages_all'),
      ('chat_room_members', 'admin_members_all'),
      ('chat_rooms', 'admin_rooms_all'),
      ('study_goals', 'study_goals_admin_all'),
      ('study_sessions', 'study_sessions_admin_all'),
      ('user_progress', 'user_progress_admin_all')
    ) AS policies(table_name, policy_name)
  LOOP
    SELECT cmd INTO policy_command FROM pg_policies
    WHERE schemaname = 'public' AND tablename = spec.table_name
      AND policyname = spec.policy_name;
    IF NOT FOUND THEN CONTINUE; END IF;
    clauses := CASE WHEN policy_command IN ('ALL', 'SELECT', 'UPDATE', 'DELETE')
      THEN ' USING ((SELECT public.is_admin_email()))' ELSE '' END;
    IF policy_command IN ('ALL', 'INSERT', 'UPDATE') THEN
      clauses := clauses || ' WITH CHECK ((SELECT public.is_admin_email()))';
    END IF;
    EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated%s',
      spec.policy_name, spec.table_name, clauses);
  END LOOP;
END;
$$;

-- Bucket sınırı korunur. Sahiplik hatası sessizce yutulmaz: transaction
-- geri alınır; tüm aktif politikaların birliği aksi halde garanti edilemez.
ALTER POLICY submissions_admin_select ON storage.objects TO authenticated
  USING (bucket_id = 'submissions' AND (SELECT public.is_admin_email()));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND (coalesce(qual, '') || coalesce(with_check, '')) ~* '(auth\.jwt|users\.email|@)'
  ) THEN
    RAISE EXCEPTION 'Doğrudan JWT/e-posta kullanan beklenmedik RLS politikası var; işlem geri alındı.';
  END IF;
END;
$$;

COMMENT ON TABLE public.live_lesson_participants IS
  'INSERT/UPDATE/DELETE istemciye kapalıdır. Yazma işlemleri yalnızca sunucu API rotaları üzerinden service_role ile yapılır.';
COMMENT ON TABLE public.live_lesson_chat_messages IS
  'INSERT/UPDATE/DELETE istemciye kapalıdır. Yazma işlemleri yalnızca sunucu API rotaları üzerinden service_role ile yapılır. Öğrenci yanıtlarında diğer öğrencilerin adları API tarafından maskelenir.';
COMMENT ON TABLE public.live_lesson_events IS
  'INSERT/UPDATE/DELETE istemciye kapalıdır. Yazma işlemleri yalnızca sunucu API rotaları üzerinden service_role ile yapılır.';
COMMIT;
