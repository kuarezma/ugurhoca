-- Sahip yetkisiyle çalışan mevcut profil otomasyonlarını doğrula.
DO $$
DECLARE
  profile_owner oid;
  procedure_oid oid;
  signature text;
BEGIN
  SELECT relowner INTO profile_owner FROM pg_class WHERE oid = 'public.profiles'::regclass;
  FOREACH signature IN ARRAY ARRAY['public.touch_daily_streak()', 'public.handle_quiz_result_insert()'] LOOP
    procedure_oid := to_regprocedure(signature);
    IF procedure_oid IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid = procedure_oid
        AND prosecdef AND proowner = profile_owner) THEN
        RAISE EXCEPTION 'Profil otomasyonu SECURITY DEFINER ve tablo sahibi olmalı: %', signature;
      END IF;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_student_profile_update()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  profile_owner_name name;
BEGIN
  SELECT pg_catalog.pg_get_userbyid(relowner) INTO profile_owner_name
    FROM pg_catalog.pg_class WHERE oid = TG_RELID;
  IF current_user = profile_owner_name OR current_user = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.is_admin_email() THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL OR OLD.id IS DISTINCT FROM auth.uid() OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Yalnız kendi profilinizi güncelleyebilirsiniz.' USING ERRCODE = '42501';
  END IF;
  -- İleride eklenen sütunlar da varsayılan olarak korunur.
  IF (to_jsonb(NEW) - ARRAY['avatar_id', 'welcome_tour_seen_at']::text[])
      IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['avatar_id', 'welcome_tour_seen_at']::text[]) THEN
    RAISE EXCEPTION 'Yalnız avatar ve karşılama turu güncellenebilir.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_student_profile_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  profile_owner_name name;
  jwt_email text;
BEGIN
  SELECT pg_catalog.pg_get_userbyid(relowner) INTO profile_owner_name
    FROM pg_catalog.pg_class WHERE oid = TG_RELID;
  IF current_user = profile_owner_name OR current_user = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.is_admin_email() THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL OR NEW.id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Yalnız kendi profilinizi oluşturabilirsiniz.' USING ERRCODE = '42501';
  END IF;
  jwt_email := auth.jwt() ->> 'email';
  IF jwt_email IS NOT NULL AND NEW.email IS DISTINCT FROM jwt_email THEN
    RAISE EXCEPTION 'Profil e-postası oturumla eşleşmeli.' USING ERRCODE = '42501';
  END IF;
  NEW.is_private_student := false;
  NEW.is_favorite := false;
  NEW.current_streak := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zz_profiles_guard_student_update ON public.profiles;
CREATE TRIGGER zz_profiles_guard_student_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_student_profile_update();
DROP TRIGGER IF EXISTS zz_profiles_guard_student_insert ON public.profiles;
CREATE TRIGGER zz_profiles_guard_student_insert BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_student_profile_insert();

REVOKE ALL ON FUNCTION public.guard_student_profile_update(), public.guard_student_profile_insert() FROM PUBLIC, anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM PUBLIC, anon, authenticated;
