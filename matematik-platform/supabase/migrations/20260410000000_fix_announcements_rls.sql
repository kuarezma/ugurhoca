-- announcements tablosu RLS politikalarını sıkılaştır
-- Sadece adminler ekleyebilir ve silebilir

DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;
DROP POLICY IF EXISTS "announcements_update" ON public.announcements;

CREATE POLICY "announcements_insert" ON public.announcements
  FOR INSERT WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@ugurhoca.com')
  );

CREATE POLICY "announcements_delete" ON public.announcements
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@ugurhoca.com')
  );

CREATE POLICY "announcements_update" ON public.announcements
  FOR UPDATE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@ugurhoca.com')
  );

-- documents tablosu için de aynı düzeltme
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@ugurhoca.com')
  );

CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@ugurhoca.com')
  );
