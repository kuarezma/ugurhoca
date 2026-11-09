-- Yalnız disposable PGlite testleri; production üzerinde çalıştırılmaz.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
CREATE SCHEMA storage;

GRANT USAGE ON SCHEMA public, auth, storage
  TO anon, authenticated, service_role;

CREATE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

CREATE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

CREATE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT auth.jwt() ->> 'role';
$$;

GRANT EXECUTE ON FUNCTION auth.jwt(), auth.uid(), auth.role()
  TO anon, authenticated, service_role;

CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  email text,
  raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  public boolean NOT NULL DEFAULT false
);

CREATE TABLE storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets(id),
  name text NOT NULL,
  owner_id text
);

CREATE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN strpos(name, '/') = 0 THEN ARRAY[]::text[]
    ELSE string_to_array(
      regexp_replace(name, '/[^/]*$', ''),
      '/'
    )
  END;
$$;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects
  TO authenticated, service_role;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets
  TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION storage.foldername(text)
  TO anon, authenticated, service_role;

-- Testte Supabase benzeri başlangıç ACL'leri.
-- Production'a uygulanmaz.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

CREATE PUBLICATION supabase_realtime;

-- Tarihsel game_scores migration’ının Supabase platform bağımlılığı.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
