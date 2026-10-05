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
  created_at timestamptz
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
CREATE TABLE public.assignments (id uuid PRIMARY KEY);
CREATE TABLE public.quizzes (id uuid PRIMARY KEY);
CREATE TABLE public.quiz_questions (id uuid PRIMARY KEY);
CREATE TABLE public.chat_users (id uuid PRIMARY KEY);
CREATE TABLE storage.objects (bucket_id text, name text, owner_id text);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Eski geniş politikalar, aşağıdaki gerçek migration'ların kaldırma davranışını da sınar.
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY shared_documents_select ON public.shared_documents FOR SELECT USING (true);
CREATE POLICY notifications_own_select ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles,
  public.shared_documents, public.notifications TO authenticated;
GRANT SELECT ON public.profiles, public.shared_documents TO anon;
GRANT SELECT ON public.profiles, public.shared_documents,
  public.notifications, public.documents, public.notes, public.assignments TO service_role;
