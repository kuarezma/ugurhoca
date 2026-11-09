-- Yalnız RLS ve istatistik testlerinin kullandığı en küçük şema.
-- Uygulama şeması veya production migration'ı değildir.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
CREATE SCHEMA storage;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;

CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
$$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated;

CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  name_normalized text,
  email text,
  grade integer,
  created_at timestamptz,
  is_private_student boolean DEFAULT false,
  current_streak integer DEFAULT 0,
  last_active_date date DEFAULT CURRENT_DATE,
  avatar_id text,
  welcome_tour_seen_at timestamptz,
  is_favorite boolean DEFAULT false
);
CREATE TABLE public.shared_documents (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  student_name text,
  student_email text
);
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  title text,
  type text
);
CREATE TABLE public.documents (id uuid PRIMARY KEY, downloads integer, views integer);
CREATE TABLE public.notes (id uuid PRIMARY KEY, user_id uuid);
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY,
  grade integer,
  student_id uuid REFERENCES public.profiles(id)
);
CREATE TABLE public.comments (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  content text
);
CREATE TABLE public.quizzes (id uuid PRIMARY KEY);
CREATE TABLE public.quiz_questions (id uuid PRIMARY KEY);
CREATE TABLE public.chat_users (id uuid PRIMARY KEY);
CREATE TABLE storage.objects (bucket_id text, name text, owner_id text);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Eski geniş politikalar, aşağıdaki gerçek migration'ların kaldırma davranışını da sınar.
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY shared_documents_select ON public.shared_documents FOR SELECT USING (true);
CREATE POLICY assignments_select ON public.assignments FOR SELECT USING (true);
CREATE POLICY comments_select ON public.comments FOR SELECT USING (true);
CREATE POLICY notifications_own_select ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles,
  public.shared_documents, public.notifications, public.assignments, public.comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.shared_documents, public.assignments, public.comments TO anon;
GRANT SELECT ON public.profiles, public.shared_documents,
  public.notifications, public.documents, public.notes, public.assignments, public.comments TO service_role;


CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE TABLE public.live_lesson_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lesson_id uuid NOT NULL,
  user_id uuid, user_name text NOT NULL, role text NOT NULL, message text NOT NULL
);
CREATE TABLE public.live_lesson_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lesson_id uuid NOT NULL,
  user_id uuid, user_name text, event_type text NOT NULL, payload jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.live_lesson_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_lesson_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY live_lesson_chat_select_scoped ON public.live_lesson_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY live_lesson_events_select_scoped ON public.live_lesson_events FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.live_lesson_chat_messages, public.live_lesson_events TO authenticated;
