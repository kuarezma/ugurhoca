-- Mezun profiles.grade/assignments.grade içinde 0 saklanır.
-- src/lib/grade.ts ile eşdeğer; tekrar uygulanabilir, veri değiştirmez.

CREATE OR REPLACE FUNCTION public.live_lesson_normalize_grade(value jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE jsonb_typeof(value)
    WHEN 'number' THEN
      CASE WHEN value #>> '{}' ~ '^[0-9]+$' THEN
        CASE WHEN (value #>> '{}')::numeric <= 9007199254740991
          THEN CASE WHEN (value #>> '{}')::numeric = 0 THEN 'Mezun' ELSE value #>> '{}' END
        END
      END
    WHEN 'string' THEN
      CASE
        WHEN value #>> '{}' = 'Mezun' THEN 'Mezun'
        WHEN value #>> '{}' ~ '^[0-9]+$'
          THEN coalesce(nullif(ltrim(value #>> '{}', '0'), ''), 'Mezun')
      END
  END;
$$;

REVOKE ALL ON FUNCTION public.live_lesson_normalize_grade(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_lesson_normalize_grade(jsonb) TO service_role;

