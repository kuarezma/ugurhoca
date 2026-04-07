-- Öğrenci giriş: ad soyad büyük/küçük harf duyarsız eşleştirme (uygulama tr-TR ile doldurur).
-- Eski satırlar name_normalized NULL kalabilir; giriş sayfası ilike ile yedekler.

alter table public.profiles
  add column if not exists name_normalized text;

comment on column public.profiles.name_normalized is
  'normalizeFullNameForMatch (tr-TR) — tekrar kayıt ve giriş eşlemesi';

create unique index if not exists profiles_name_normalized_unique
  on public.profiles (name_normalized)
  where name_normalized is not null and name_normalized <> '';
