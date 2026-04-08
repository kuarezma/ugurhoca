-- Özellik 7: Sohbet Geçmişi ve Kalıcı Mesajlar

-- 1. Sohbet Odaları Tablosu
create table if not exists public.chat_rooms (
  id uuid default gen_random_uuid() primary key,
  name text,
  is_private boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_rooms enable row level security;

-- 2. Oda Üyeleri Tablosu (TC bazlı eşleşme için)
create table if not exists public.chat_room_members (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_tc text not null, -- ChatSessionUser'daki school_number (TC)
  joined_at timestamptz not null default now(),
  unique(room_id, user_tc)
);

alter table public.chat_room_members enable row level security;

-- 3. Mesajlar Tablosu
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade,
  sender_tc text not null,
  display_name text not null,
  text text not null,
  ts bigint not null, -- Mevcut ChatMessage tipine uyum için unix timestamp
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

-- INDEX'LER
create index if not exists idx_chat_messages_room_id on public.chat_messages(room_id);
create index if not exists idx_chat_room_members_user_tc on public.chat_room_members(user_tc);

-- ============================================
-- RLS POLİTİKALARI
-- ============================================

-- Admin Yardımı (Sadece admin e-postaları)
-- Not: Auth trigger'ları yerine e-posta kontrolü yapıyoruz mevcut sisteme uyum için.

-- CHAT_ROOMS POLİTİKALARI
create policy "admin_rooms_all" on public.chat_rooms for all using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com', 'admin@matematiklab.com')
);

create policy "member_rooms_select" on public.chat_rooms for select using (
  exists (select 1 from public.chat_room_members where room_id = public.chat_rooms.id and user_tc in (
    -- Öğrencinin kendi TC'sini chat_users tablosundan doğrulamalıyız veya basitçe user_tc'ye güvenmeliyiz.
    -- Bu platformda chat_users tablosu TC bazlı, biz de TC'ye göre kısıtlıyoruz.
    select tc_number from public.chat_users where tc_number = public.chat_room_members.user_tc
  ))
);

-- CHAT_ROOM_MEMBERS POLİTİKALARI
create policy "admin_members_all" on public.chat_room_members for all using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com', 'admin@matematiklab.com')
);

create policy "member_members_select" on public.chat_room_members for select using (
  true -- Üyeler odadaki diğer üyeleri (ör. admin) görebilmeli
);

-- CHAT_MESSAGES POLİTİKALARI
create policy "admin_messages_all" on public.chat_messages for all using (
  (select email from auth.users where id = auth.uid()) in ('admin@ugurhoca.com', 'admin@matematiklab.com')
);

create policy "member_messages_select" on public.chat_messages for select using (
  exists (select 1 from public.chat_room_members where room_id = public.chat_messages.room_id)
);

create policy "member_messages_insert" on public.chat_messages for insert with check (
  exists (select 1 from public.chat_room_members where room_id = public.chat_messages.room_id)
);

-- PERMISSIONS
grant select, insert, update, delete on public.chat_rooms to anon, authenticated;
grant select, insert, update, delete on public.chat_room_members to anon, authenticated;
grant select, insert, update, delete on public.chat_messages to anon, authenticated;

-- Trigger: Mesaj gelince odanın updated_at alanını güncelle
create or replace function public.update_room_timestamp()
returns trigger as $$
begin
  update public.chat_rooms set updated_at = now() where id = new.room_id;
  return new;
end;
$$ language plpgsql;

create trigger tr_update_chat_room_timestamp
  after insert on public.chat_messages
  for each row
  execute function public.update_room_timestamp();
