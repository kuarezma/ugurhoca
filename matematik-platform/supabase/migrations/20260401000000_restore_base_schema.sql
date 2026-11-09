-- K2.1: Eksik taban şemayı veri değiştirmeden geri kurar.
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Supabase platform nesnelerini uygulama migration'ı oluşturmaz.
DO $$
BEGIN
  IF to_regclass('auth.users') IS NULL
     OR to_regclass('storage.buckets') IS NULL
     OR to_regclass('storage.objects') IS NULL
     OR to_regprocedure('auth.uid()') IS NULL
     OR to_regprocedure('auth.jwt()') IS NULL
     OR to_regprocedure('auth.role()') IS NULL
     OR to_regprocedure('storage.foldername(text)') IS NULL
  THEN
    RAISE EXCEPTION
      'Supabase platform nesneleri eksik; önce platform veya test fixture kurulmalı.';
  END IF;

  IF EXISTS (
    SELECT required_role
    FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS required_role
    WHERE NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = required_role
    )
  ) THEN
    RAISE EXCEPTION 'Gerekli Supabase API rolleri eksik.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    RAISE EXCEPTION 'supabase_realtime publication eksik.';
  END IF;
END;
$$;

-- Erken migration'ların ihtiyaç duyduğu helper.
-- Canlıdaki mevcut fonksiyonun gövdesi veya sahipliği değiştirilmez.
DO $outer$
BEGIN
  IF to_regprocedure('public.is_admin_email()') IS NULL THEN
    EXECUTE $ddl$
      CREATE FUNCTION public.is_admin_email()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY INVOKER
      SET search_path = ''
      AS $body$
        SELECT coalesce(
          (auth.jwt() ->> 'email') = 'admin@ugurhoca.com',
          false
        );
      $body$
    $ddl$;

    REVOKE ALL ON FUNCTION public.is_admin_email()
      FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.is_admin_email()
      TO authenticated, service_role;
  END IF;
END;
$outer$;

-- Sabit manifest:
-- * Yeni tabloda tüm sütunlar ve yeni-kurulum kısıtları oluşturulur.
-- * Mevcut tabloda yalnız eksik sütun eklenir.
-- * Mevcut sütunun default/nullability/constraint özellikleri değiştirilmez.
-- * Tür farklılığı otomatik düzeltilmez.
DO $$
DECLARE
  spec jsonb;
  column_def text;
  column_name text;
  expected_type text;
  definitions text;
  table_name text;
  table_was_missing boolean;
  actual_type oid;
BEGIN
  FOR spec IN
    SELECT value
    FROM jsonb_array_elements(
      $manifest$
      [
        {
          "table": "profiles",
          "columns": [
            "id uuid PRIMARY KEY REFERENCES auth.users(id)",
            "name text",
            "email text",
            "grade integer",
            "is_private_student boolean DEFAULT false",
            "created_at timestamptz DEFAULT now()",
            "name_normalized text",
            "current_streak integer DEFAULT 0",
            "last_active_date date DEFAULT CURRENT_DATE",
            "avatar_id text",
            "welcome_tour_seen_at timestamptz",
            "is_favorite boolean DEFAULT false"
          ],
          "constraints": ""
        },
        {
          "table": "documents",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "title text NOT NULL",
            "description text",
            "type text",
            "file_url text",
            "grades integer[]",
            "downloads integer DEFAULT 0",
            "created_at timestamptz DEFAULT now()",
            "file_name text",
            "video_url text",
            "grade integer[]",
            "is_admin_only boolean DEFAULT false",
            "views integer DEFAULT 0",
            "rating numeric DEFAULT 0",
            "is_new boolean DEFAULT false",
            "likes integer NOT NULL DEFAULT 0",
            "comments_count integer DEFAULT 0",
            "answer_key_text text",
            "solution_url text",
            "learning_outcome text",
            "worksheet_order integer"
          ],
          "constraints": ""
        },
        {
          "table": "announcements",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "title text NOT NULL",
            "content text",
            "created_at timestamptz DEFAULT now()",
            "image_url text",
            "image_urls text[]",
            "link_url text"
          ],
          "constraints": ""
        },
        {
          "table": "assignments",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "title text NOT NULL",
            "description text",
            "student_id uuid",
            "created_at timestamptz DEFAULT now()",
            "due_date timestamptz",
            "grade integer"
          ],
          "constraints": ""
        },
        {
          "table": "shared_documents",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "document_id text",
            "student_id uuid NOT NULL",
            "student_name text",
            "student_email text",
            "document_title text",
            "document_type text",
            "file_url text",
            "is_read boolean DEFAULT false",
            "created_at timestamptz DEFAULT now()"
          ],
          "constraints": ""
        },
        {
          "table": "notifications",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "user_id uuid NOT NULL",
            "title text",
            "message text",
            "type text",
            "is_read boolean DEFAULT false",
            "created_at timestamptz DEFAULT now()",
            "metadata jsonb"
          ],
          "constraints": ""
        },
        {
          "table": "note_categories",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE",
            "name text NOT NULL",
            "color text DEFAULT '#8b5cf6'",
            "created_at timestamptz DEFAULT now()"
          ],
          "constraints": ""
        },
        {
          "table": "notes",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE",
            "title text",
            "content text NOT NULL",
            "category text",
            "tags text[] DEFAULT '{}'::text[]",
            "is_pinned boolean DEFAULT false",
            "created_at timestamptz DEFAULT now()",
            "updated_at timestamptz DEFAULT now()"
          ],
          "constraints": ""
        },
        {
          "table": "lgs_school_targets",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "year integer NOT NULL",
            "school_name text NOT NULL",
            "province text NOT NULL",
            "district text NOT NULL",
            "school_type text NOT NULL",
            "placement_mode text DEFAULT 'central'",
            "instruction_language text DEFAULT 'Turkce'",
            "boarding boolean DEFAULT false",
            "prep_class boolean DEFAULT false",
            "base_score numeric NOT NULL",
            "national_percentile numeric",
            "quota_total integer",
            "source_url text",
            "source_year integer",
            "created_at timestamptz DEFAULT now()"
          ],
          "constraints": "UNIQUE (year, school_name, district)"
        },
        {
          "table": "yks_program_targets",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "year integer NOT NULL",
            "program_code text NOT NULL",
            "university_name text NOT NULL",
            "university_type text NOT NULL DEFAULT 'Devlet'",
            "faculty_or_school text",
            "program_name text NOT NULL",
            "level text NOT NULL",
            "city text NOT NULL",
            "score_type text NOT NULL",
            "teaching_type text DEFAULT 'Orgun'",
            "scholarship_rate integer DEFAULT 0",
            "instruction_language text DEFAULT 'Turkce'",
            "quota_total integer",
            "base_rank integer",
            "base_score numeric",
            "source_url_osym text",
            "source_url_yokatlas text",
            "created_at timestamptz DEFAULT now()"
          ],
          "constraints": "UNIQUE (year, program_code)"
        },
        {
          "table": "comments",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "document_id text",
            "user_id uuid",
            "user_name text",
            "content text",
            "created_at timestamptz DEFAULT now()"
          ],
          "constraints": ""
        },
        {
          "table": "chat_users",
          "columns": [
            "id uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "tc_number text",
            "full_name text NOT NULL",
            "display_name text NOT NULL",
            "last_seen timestamptz",
            "is_online boolean DEFAULT false",
            "created_at timestamptz NOT NULL DEFAULT now()",
            "updated_at timestamptz NOT NULL DEFAULT now()"
          ],
          "constraints": ""
        }
      ]
      $manifest$::jsonb
    )
  LOOP
    table_name := spec ->> 'table';
    table_was_missing :=
      to_regclass(format('public.%I', table_name)) IS NULL;

    SELECT string_agg(value, ', ' ORDER BY ordinality)
    INTO definitions
    FROM jsonb_array_elements_text(spec -> 'columns')
      WITH ORDINALITY AS columns(value, ordinality);

    IF coalesce(spec ->> 'constraints', '') <> '' THEN
      definitions := definitions || ', ' || (spec ->> 'constraints');
    END IF;

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS public.%I (%s)',
      table_name,
      definitions
    );

    FOR column_def IN
      SELECT jsonb_array_elements_text(spec -> 'columns')
    LOOP
      -- Manifestte türler tek sözcüktür:
      -- uuid, text, integer, boolean, date, timestamptz, numeric ve dizileri.
      column_name := split_part(column_def, ' ', 1);
      expected_type := split_part(column_def, ' ', 2);

      SELECT a.atttypid
      INTO actual_type
      FROM pg_attribute a
      WHERE a.attrelid = to_regclass(format('public.%I', table_name))
        AND a.attname = column_name
        AND a.attnum > 0
        AND NOT a.attisdropped;

      IF FOUND AND actual_type <> to_regtype(expected_type)::oid THEN
        RAISE EXCEPTION
          'Tür uyuşmazlığı: public.%.%; beklenen %, mevcut %',
          table_name,
          column_name,
          expected_type,
          format_type(actual_type, NULL);
      END IF;

      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %s',
        table_name,
        CASE WHEN table_was_missing THEN column_def
             ELSE column_name || ' ' || expected_type END
      );
    END LOOP;

    IF NOT (
      SELECT c.relrowsecurity
      FROM pg_class c
      WHERE c.oid = to_regclass(format('public.%I', table_name))
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
        table_name
      );
    END IF;

    -- Mevcut tablonun bilinmeyen sütun bazlı yetkilerini tablo GRANT'ıyla
    -- genişletmemek için başlangıç yetkileri yalnız yeni tabloda verilir.
    IF table_was_missing THEN
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I
         TO authenticated, service_role',
        table_name
      );
    END IF;
  END LOOP;
END;
$$;

-- Arşivdeki genel içerik okuma davranışını geri kurar.
-- is_admin_only alanının ayrıca gizlilik sınırı yapılması aşağıda açıklanmıştır.
DROP POLICY IF EXISTS documents_select ON public.documents;
CREATE POLICY documents_select
  ON public.documents
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS announcements_select ON public.announcements;
CREATE POLICY announcements_select
  ON public.announcements
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.documents, public.announcements
  TO anon, authenticated;

-- Not ve kategori tabloları için kaynakta eksik kalan taban politikalar.
-- Bilinen eski geniş SELECT politikaları aynı adla değiştirilir.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['notes', 'note_categories']
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      table_name || '_select', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR SELECT TO authenticated
       USING (user_id = (SELECT auth.uid()))',
      table_name || '_select', table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      table_name || '_insert', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR INSERT TO authenticated
       WITH CHECK (user_id = (SELECT auth.uid()))',
      table_name || '_insert', table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      table_name || '_update', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR UPDATE TO authenticated
       USING (user_id = (SELECT auth.uid()))
       WITH CHECK (user_id = (SELECT auth.uid()))',
      table_name || '_update', table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      table_name || '_delete', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR DELETE TO authenticated
       USING (user_id = (SELECT auth.uid()))',
      table_name || '_delete', table_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      table_name || '_admin_all', table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I
       FOR ALL TO authenticated
       USING ((SELECT public.is_admin_email()))
       WITH CHECK ((SELECT public.is_admin_email()))',
      table_name || '_admin_all', table_name
    );
  END LOOP;
END;
$$;

DROP POLICY IF EXISTS lgs_school_targets_select
  ON public.lgs_school_targets;
CREATE POLICY lgs_school_targets_select
  ON public.lgs_school_targets
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS yks_program_targets_select
  ON public.yks_program_targets;
CREATE POLICY yks_program_targets_select
  ON public.yks_program_targets
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.lgs_school_targets, public.yks_program_targets
  TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_year
  ON public.lgs_school_targets(year);
CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_location
  ON public.lgs_school_targets(province, district);
CREATE INDEX IF NOT EXISTS idx_lgs_school_targets_type
  ON public.lgs_school_targets(school_type);

CREATE INDEX IF NOT EXISTS idx_yks_program_targets_year
  ON public.yks_program_targets(year);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_score_type
  ON public.yks_program_targets(score_type);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_city
  ON public.yks_program_targets(city);
CREATE INDEX IF NOT EXISTS idx_yks_program_targets_level
  ON public.yks_program_targets(level);

-- Mevcut bucket görünürlüğü değiştirilmez.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM storage.buckets b
    JOIN (
      VALUES
        ('documents', true),
        ('submissions', false),
        ('avatars', true),
        ('quiz-images', true)
    ) AS expected(id, is_public)
      ON expected.id = b.id
    WHERE b.public IS DISTINCT FROM expected.is_public
  ) THEN
    RAISE EXCEPTION
      'Bucket public bayrağı dökümden farklı; otomatik değiştirilmedi.';
  END IF;
END;
$$;

INSERT INTO storage.buckets(id, name, public)
VALUES
  ('documents', 'documents', true),
  ('submissions', 'submissions', false),
  ('avatars', 'avatars', true),
  ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
