-- Yorumlar yalnızca yazarına ve admin'e açık olsun (site.md: öğrenci başkasının
-- yorumunu okuyamaz). Prod'da comments_select USING (true) PUBLIC idi; anon rolü
-- de tüm yorumları okuyabiliyordu. anon'a hiç yorum yetkisi gerekmez.
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_select_own_or_admin" ON public.comments;

CREATE POLICY "comments_select_own_or_admin" ON public.comments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_email()));

REVOKE ALL ON public.comments FROM anon;
