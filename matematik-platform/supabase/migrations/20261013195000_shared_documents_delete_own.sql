-- Öğrencinin ana sayfadaki "Paylaşılan Belge / Ödev" kartını listeden
-- kaldırması (`dismissHomeAssignment` -> `shared_documents` DELETE) için
-- yalnız kendi `student_id` satırını silebilme politikası.
DO $$
BEGIN
  IF to_regclass('public.shared_documents') IS NOT NULL THEN
    DROP POLICY IF EXISTS "shared_documents_delete_own" ON public.shared_documents;
    CREATE POLICY "shared_documents_delete_own" ON public.shared_documents
      FOR DELETE TO authenticated
      USING (
        student_id = (SELECT auth.uid())
        OR (SELECT public.is_admin_email())
      );
  END IF;
END $$;
