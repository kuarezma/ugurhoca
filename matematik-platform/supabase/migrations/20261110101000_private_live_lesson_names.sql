-- Ham adlar yalnız sahibi ve öğretmen tarafından okunabilir.
-- Ortak sohbet görünümü service_role API'sinde kullanıcıya göre maskelenir.
DROP POLICY IF EXISTS live_lesson_chat_authenticated_select ON public.live_lesson_chat_messages;
DROP POLICY IF EXISTS live_lesson_chat_select_scoped ON public.live_lesson_chat_messages;
CREATE POLICY live_lesson_chat_select_scoped ON public.live_lesson_chat_messages
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_email()));

DROP POLICY IF EXISTS live_lesson_events_authenticated_select ON public.live_lesson_events;
DROP POLICY IF EXISTS live_lesson_events_select_scoped ON public.live_lesson_events;
CREATE POLICY live_lesson_events_select_scoped ON public.live_lesson_events
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin_email()));
