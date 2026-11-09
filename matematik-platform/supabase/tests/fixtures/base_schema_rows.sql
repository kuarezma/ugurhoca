-- Yalnız disposable test verileri; onarımlarda hiçbir satır değişmemelidir.
INSERT INTO auth.users (id, email) VALUES
  ('70000000-0000-4000-8000-000000000001', 'fixture@example.invalid');
INSERT INTO public.profiles (id, name, email, grade, is_favorite, current_streak)
VALUES ('70000000-0000-4000-8000-000000000001', 'Sentetik', 'fixture@example.invalid', 7, true, 9);
INSERT INTO public.documents (title, file_url, downloads, views, grade, grades)
VALUES ('Sentetik belge', 'https://example.invalid/test.pdf', 12, 34, ARRAY[7], ARRAY[8]);
INSERT INTO public.announcements (title, content) VALUES ('Sentetik duyuru', 'Korunacak içerik');
INSERT INTO public.assignments (title, student_id, grade)
VALUES ('Sentetik ödev', '70000000-0000-4000-8000-000000000001', 7);
INSERT INTO public.shared_documents (student_id, student_name, student_email, document_id)
VALUES ('70000000-0000-4000-8000-000000000001', 'Sentetik', 'fixture@example.invalid', 'external-text-id');
INSERT INTO public.notifications (user_id, title, metadata)
VALUES ('70000000-0000-4000-8000-000000000001', 'Sentetik bildirim', '{"preserve":true}');
INSERT INTO public.note_categories (user_id, name)
VALUES ('70000000-0000-4000-8000-000000000001', 'Sentetik kategori');
INSERT INTO public.notes (user_id, content, tags)
VALUES ('70000000-0000-4000-8000-000000000001', 'Sentetik not', ARRAY['koru']);
INSERT INTO public.lgs_school_targets (year, school_name, province, district, school_type, base_score)
VALUES (2026, 'Sentetik okul', 'Sentetik il', 'Sentetik ilçe', 'Test', 400);
INSERT INTO public.yks_program_targets (year, program_code, university_name, program_name, level, city, score_type)
VALUES (2026, 'TEST-001', 'Sentetik üniversite', 'Sentetik program', 'Lisans', 'Sentetik il', 'SAY');
INSERT INTO public.comments (document_id, user_id, content)
VALUES ('external-text-id', '70000000-0000-4000-8000-000000000001', 'Sentetik yorum');
INSERT INTO public.chat_users (full_name, display_name, tc_number, is_online)
VALUES ('Sentetik kullanıcı', 'Sentetik', 'fixture-not-a-tc', true);
