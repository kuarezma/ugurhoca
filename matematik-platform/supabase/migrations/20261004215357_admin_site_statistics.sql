-- Site istatistikleri satır sınırına takılmadan veritabanında hesaplanır.
-- Yalnız yetki denetimi yapan sunucu rotası service_role ile çağırır.
CREATE OR REPLACE FUNCTION public.admin_site_statistics(
  p_since timestamptz,
  p_admin_emails text[]
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH student_profiles AS (
    SELECT grade, created_at
    FROM public.profiles
    WHERE NOT (
      lower(btrim(coalesce(email, ''))) = ANY (coalesce(p_admin_emails, ARRAY[]::text[]))
    )
  ),
  student_totals AS (
    SELECT count(*) AS total_users,
      count(*) FILTER (WHERE p_since IS NULL OR created_at >= p_since) AS recent_signups
    FROM student_profiles
  ),
  grade_totals AS (
    SELECT CASE
        WHEN grade = 0 THEN 'Mezun'
        WHEN grade IS NULL THEN 'Belirtilmemiş'
        ELSE grade::text || '. Sınıf'
      END AS label,
      CASE WHEN grade = 0 THEN 998 WHEN grade IS NULL THEN 999 ELSE grade END AS sort_order,
      count(*) AS total
    FROM student_profiles
    GROUP BY grade
  ),
  document_totals AS (
    SELECT count(*) AS total_documents,
      coalesce(sum(downloads), 0) AS total_downloads,
      coalesce(sum(views), 0) AS total_views
    FROM public.documents
  )
  SELECT jsonb_build_object(
    'totalUsers', (SELECT total_users FROM student_totals),
    'recentSignups', (SELECT recent_signups FROM student_totals),
    'usersByGrade', coalesce(
      (SELECT jsonb_agg(jsonb_build_object('grade', label, 'count', total)
        ORDER BY sort_order) FROM grade_totals), '[]'::jsonb
    ),
    'totalDocuments', (SELECT total_documents FROM document_totals),
    'totalDownloads', (SELECT total_downloads FROM document_totals),
    'totalViews', (SELECT total_views FROM document_totals),
    'totalNotes', (SELECT count(*) FROM public.notes),
    'totalAssignments', (SELECT count(*) FROM public.assignments),
    'mostActiveDay', '-'
  );
$$;

REVOKE ALL ON FUNCTION public.admin_site_statistics(timestamptz, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_site_statistics(timestamptz, text[]) TO service_role;
