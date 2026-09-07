-- ==========================================================
-- KVKK: hesap silindiğinde öğrenciye ait tüm veri gerçekten silinsin.
--
-- /api/user/delete-account yalnızca 6 tabloyu (quiz_results, study_sessions,
-- user_mistakes, game_scores, student_activity_events, profiles) elle
-- siliyordu. quiz_results/user_mistakes/student_activity_events/game_scores
-- zaten ON DELETE CASCADE ile tanımlıydı; ama study_sessions ve aşağıdaki
-- diğer tablolarda user_id/student_id kolonu FK olmadan tanımlanmıştı —
-- auth.users silindiğinde bu satırlar veritabanında öksüz kalıyordu. Foreign
-- key + ON DELETE CASCADE eklenerek silme işlemi uygulama kodundan bağımsız,
-- veritabanı seviyesinde garanti altına alınır.
--
-- Önce mevcut öksüz satırlar (artık var olmayan bir auth.users.id'ye işaret
-- edenler) temizlenir — aksi halde ADD CONSTRAINT ihlal nedeniyle başarısız
-- olur. Bu platformda öğrenci sayısı küçük; öksüz satır bulunması beklenmez,
-- ama garanti için temizlik adımı korunur.
-- ==========================================================

-- 1. study_sessions.user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions') THEN
    DELETE FROM public.study_sessions s
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'study_sessions'
        AND constraint_name = 'study_sessions_user_id_fkey'
    ) THEN
      ALTER TABLE public.study_sessions
        ADD CONSTRAINT study_sessions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 2. assignment_submissions.student_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assignment_submissions') THEN
    DELETE FROM public.assignment_submissions s
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.student_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'assignment_submissions'
        AND constraint_name = 'assignment_submissions_student_id_fkey'
    ) THEN
      ALTER TABLE public.assignment_submissions
        ADD CONSTRAINT assignment_submissions_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 3. user_badges.user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_badges') THEN
    DELETE FROM public.user_badges b
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = b.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'user_badges'
        AND constraint_name = 'user_badges_user_id_fkey'
    ) THEN
      ALTER TABLE public.user_badges
        ADD CONSTRAINT user_badges_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 4. user_progress.user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_progress') THEN
    DELETE FROM public.user_progress p
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'user_progress'
        AND constraint_name = 'user_progress_user_id_fkey'
    ) THEN
      ALTER TABLE public.user_progress
        ADD CONSTRAINT user_progress_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 5. study_goals.user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_goals') THEN
    DELETE FROM public.study_goals g
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = g.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'study_goals'
        AND constraint_name = 'study_goals_user_id_fkey'
    ) THEN
      ALTER TABLE public.study_goals
        ADD CONSTRAINT study_goals_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 6. student_group_members.user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_group_members') THEN
    DELETE FROM public.student_group_members m
    WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = m.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'student_group_members'
        AND constraint_name = 'student_group_members_user_id_fkey'
    ) THEN
      ALTER TABLE public.student_group_members
        ADD CONSTRAINT student_group_members_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 7. archived_game_scores.user_id — bu bir arşiv/geçmiş tablosu (game_scores'un
-- tek seferlik anlık görüntüsü, anon/authenticated'a hiç açılmamış). Skoru
-- korumak ama kimliği koparmak için CASCADE değil SET NULL kullanılır.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'archived_game_scores') THEN
    UPDATE public.archived_game_scores a
    SET user_id = NULL
    WHERE a.user_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = a.user_id);

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND table_name = 'archived_game_scores'
        AND constraint_name = 'archived_game_scores_user_id_fkey'
    ) THEN
      ALTER TABLE public.archived_game_scores
        ADD CONSTRAINT archived_game_scores_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;
