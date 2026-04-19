-- profiles.welcome_tour_seen_at: öğrenci profile hoşgeldin turunu ilk gördüğü
-- an kalıcı olarak işaretlenir. localStorage yerine DB kullanılır ki farklı
-- cihaz/tarayıcıda tekrar açılmasın.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_tour_seen_at timestamptz;
