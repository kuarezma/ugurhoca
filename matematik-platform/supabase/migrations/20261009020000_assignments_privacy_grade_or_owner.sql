-- Ödevler: öğrenci yalnızca kendi sınıfının (grade) ve kendine atanmış ödevleri
-- görür; admin tümünü görür. Önceki politika USING (true) PUBLIC idi; anon dahil
-- herkes tüm ödevleri okuyabiliyordu (site.md: kişisel ödev yalnızca ilgili öğrenciye).
-- Kural, uygulamadaki sorgularla aynı: grade = öğrencinin sınıfı OR student_id = kendisi.
DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
DROP POLICY IF EXISTS "assignments_select_own_grade_or_admin" ON public.assignments;

CREATE POLICY "assignments_select_own_grade_or_admin" ON public.assignments
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR grade = (SELECT p.grade FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
    OR (SELECT public.is_admin_email())
  );

REVOKE ALL ON public.assignments FROM anon;
