-- ==========================================================
-- Yalnız geçmiş kaydı: catch-up'ta ÇALIŞTIRILMAYAN repo migration'ları.
-- Şema değiştirmez; yalnız supabase_migrations.schema_migrations'a satır ekler
-- ki "supabase migration list/push" bunları bekleyen sanıp yeniden
-- çalıştırmasın (bazıları yeniden çalışırsa veri siler ya da güvenliği geri alır).
--
-- Durumlar (2026-10-04 salt okunur denetim):
--   applied     etkisi production'da var
--   superseded  sonraki bir tanım (dashboard ya da sonraki migration) geçerli;
--               yeniden çalıştırmak bugünkü tanımı geri alır
--   skipped     bilinçli olarak uygulanmadı (kararı yanında)
-- Önceki 10 dashboard kaydına dokunulmaz (bkz. APPLY.md §Geçmiş).
-- Tekrar çalıştırılabilir (ON CONFLICT DO NOTHING).
-- ==========================================================

SET lock_timeout = '5s';

INSERT INTO supabase_migrations.schema_migrations (version, name, created_by) VALUES
  -- superseded: tablo farklı şemayla var; yeniden çalışırsa chat_users_select USING(true) geri gelir
  ('20260406120000', 'chat_users', 'catchup-2026-10-04'),
  -- applied
  ('20260407100000', 'chat_users_updated_at_if_missing', 'catchup-2026-10-04'),
  ('20260407120000', 'profiles_name_normalized', 'catchup-2026-10-04'),
  -- skipped: emekli sohbet; 4 satırı UPDATE eder, idempotent değil
  ('20260407140000', 'update_chat_users_schema', 'catchup-2026-10-04'),
  -- applied
  ('20260408130000', 'quizzes', 'catchup-2026-10-04'),
  -- superseded (kısmi): politikalar 20260419220000 ile değişti; handle_updated_at() + set_quizzes_updated_at YOK (açık karar)
  ('20260408150000', 'perfect_quizzes', 'catchup-2026-10-04'),
  -- skipped: emekli sohbet tabloları (chat_rooms/members/messages); idempotent değil
  ('20260408160000', 'chat_persistence', 'catchup-2026-10-04'),
  -- applied
  ('20260408170000', 'assignment_submissions', 'catchup-2026-10-04'),
  ('20260408180000', 'progress_tracking', 'catchup-2026-10-04'),
  ('20260408190000', 'gamification_triggers', 'catchup-2026-10-04'),
  -- superseded
  ('20260409000000', 'game_scores', 'catchup-2026-10-04'),
  ('20260410000000', 'fix_announcements_rls', 'catchup-2026-10-04'),
  ('20260410010000', 'notifications_rls', 'catchup-2026-10-04'),
  -- applied
  ('20260410020000', 'profile_avatars', 'catchup-2026-10-04'),
  -- superseded: chat_* tabloları yok, yeniden çalışırsa hata verir; admin tanımları 20261004130500'de
  ('20260411110000', 'single_admin_email', 'catchup-2026-10-04'),
  -- applied (dashboard kayıtları 20260419191xxx–200527 bunlara karşılık gelir)
  ('20260415010000', 'profile_avatar_uploads', 'catchup-2026-10-04'),
  ('20260417120000', 'yaprak_test_hierarchy', 'catchup-2026-10-04'),
  ('20260419120000', 'daily_streak_rpc', 'catchup-2026-10-04'),
  ('20260419220000', 'rls_hardening_and_public_content', 'catchup-2026-10-04'),
  ('20260419230000', 'lock_down_profiles', 'catchup-2026-10-04'),
  ('20260419235000', 'realtime_notifications', 'catchup-2026-10-04'),
  ('20260419240000', 'welcome_tour_seen_at', 'catchup-2026-10-04'),
  ('20260420240000', 'notifications_metadata_column', 'catchup-2026-10-04'),
  -- superseded (kısmi): oyun kısmı var; eksik nesneler 20261004170200, shared_documents 20261004170000;
  -- assignments/comments/notes/quiz_results sıkılaştırması açık karar. Yeniden çalışırsa is_admin_email'i geri alır.
  ('20260429120000', 'privacy_tracking_aliases', 'catchup-2026-10-04'),
  -- superseded (kısmi): limitler adım 03/04'te. YENİDEN ÇALIŞIRSA game_scores TRUNCATE (90 satır).
  ('20260430120000', 'secure_game_score_submission', 'catchup-2026-10-04'),
  -- applied
  ('20260514120000', 'live_lessons', 'catchup-2026-10-04'),
  ('20260516120000', 'annual_plan_items', 'catchup-2026-10-04'),
  ('20260516123000', 'worksheet_candidates', 'catchup-2026-10-04'),
  ('20260517100000', 'google_drive_connections', 'catchup-2026-10-04'),
  ('20260525231500', 'worksheet_candidate_match_reason', 'catchup-2026-10-04'),
  -- skipped: DROP TABLE chat_users CASCADE (4 satır, TC no). Tablo korunur, erişim adım 01/14'te kapanır.
  ('20260906120000', 'deprecate_chat_users', 'catchup-2026-10-04'),
  -- superseded: grup kısmı adım 11'de; bildirim politikası 20260930120000 ile değişti
  ('20260906140000', 'harden_student_groups_and_notifications_rls', 'catchup-2026-10-04'),
  -- applied
  ('20260907090000', 'cascade_delete_user_owned_tables', 'catchup-2026-10-04'),
  ('20260907100000', 'align_is_admin_email_helper', 'catchup-2026-10-04'),
  ('20260930120000', 'harden_security_definer_functions', 'catchup-2026-10-04'),
  ('20260930140000', 'rls_initplan_and_fk_indexes', 'catchup-2026-10-04')
ON CONFLICT (version) DO NOTHING;

RESET lock_timeout;
