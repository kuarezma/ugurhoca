-- Eski kurulumlarda chat_users tablosu updated_at olmadan oluşmuş olabilir;
-- CREATE TABLE IF NOT EXISTS yeni sütun eklemez. PostgREST bu yüzden upsert'ta hata verir.

alter table public.chat_users
  add column if not exists updated_at timestamptz not null default now();
