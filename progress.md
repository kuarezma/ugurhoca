# Uğur Hoca — proje ilerleme özeti

Bu dosya, depo ve Vercel/Supabase ile ilgili yapılan ana işleri özetler (Nisan 2026).

## 1. Depo yapısı: tek kaynak

- **Durum:** Aynı Next.js uygulaması hem depo kökünde hem `matematik-platform/` altında çiftlenmişti.
- **Karar:** Tek kaynak **`matematik-platform/`**; kökteki yinelenen `src/`, `package.json` vb. kaldırıldı.
- **Geri dönüş:** Git etiketi `backup/pre-consolidation-2026-04-06` (konsolidasyon öncesi commit).
- **Not:** Bozuk ref `refs/heads/main 2` silindi (git hatalarına yol açıyordu).

## 2. Sohbet balonu (ChatBubble)

- **Konum:** Tüm kod `matematik-platform/src/` altında; sabitler `src/lib/chat-constants.ts`.
- **Next.js 16:** Sunucu `layout.tsx` içinde `dynamic(..., { ssr: false })` kullanımı yasak olduğu için **`ChatBubbleLoader`** (`'use client'`) eklendi; asıl `ChatBubble` orada lazy yükleniyor.
- **Bileşenler:** `ChatBubble.tsx`, `ChatLogin.tsx`, `ChatBubbleLoader.tsx`.

## 3. Sohbet girişi ve Supabase (`chat_users`)

- **Tablo:** `public.chat_users` (TC, ad, görünen ad, zaman damgaları). SQL: `matematik-platform/supabase/migrations/20260406120000_chat_users.sql`.
- **RLS:** `select` / `insert` / `update` politikaları; politikalar idempotent (`DROP POLICY IF EXISTS`).
- **GRANT:** `anon` ve `authenticated` için tablo izinleri aynı migration’da.
- **Uygulama akışı:** Tarayıcıdan doğrudan anon ile upsert sorun çıkarabildiği için **`POST /api/chat-register`** eklendi; sunucu **`SUPABASE_SERVICE_ROLE_KEY`** ile upsert yapıyor.
- **Ortam:** `matematik-platform/.env.example` içinde değişkenler listelenir; **`SUPABASE_SERVICE_ROLE_KEY`** Vercel’de (Production) tanımlı olmalı — sohbet girişi için zorunlu.

## 4. Vercel deploy

- **Sorun:** Depo kökünde `next` yoktu → “No Next.js version detected”.
- **Çözüm:** Kök **`package.json`** içine `next`, `react`, `react-dom` eklendi; kök **`package-lock.json`** commitlendi.
- **Kök `vercel.json`:** `installCommand` / `buildCommand` `matematik-platform` altına yönlendirilir; `outputDirectory`: `matematik-platform/.next`.
- **CLI / Git:** Proje adı `ugurhoca`; domain ör. `www.ugurhoca.com` (Vercel ayarlarından).

## 5. Önemli dosya yolları

| Konu | Yol |
|------|-----|
| Uygulama kökü | `matematik-platform/` |
| Sohbet API | `matematik-platform/src/app/api/chat-register/route.ts` |
| Sohbet UI | `matematik-platform/src/components/ChatBubble.tsx`, `ChatLogin.tsx`, `ChatBubbleLoader.tsx` |
| Sabitler | `matematik-platform/src/lib/chat-constants.ts` |
| DB migration | `matematik-platform/supabase/migrations/20260406120000_chat_users.sql` |
| Geniş kurulum SQL | `matematik-platform/supabase-setup.sql` (sonunda `chat_users` bloğu) |
| Kök Vercel / npm | `vercel.json`, `package.json` (depo kökü) |

## 6. Canlı site kontrol listesi

1. Vercel env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, **`SUPABASE_SERVICE_ROLE_KEY`**, isteğe bağlı `NEXT_PUBLIC_CHAT_ADMIN_TC`.
2. Supabase SQL Editor’da `chat_users` migration’ı (ve gerekirse sadece `GRANT` satırı) çalıştırılmış olsun.
3. Deploy sonrası sohbet balonundan giriş testi.

---

## 7. Ödev Teslim Sistemi (Özellik 3)

- **Veritabanı:** `assignments` tablosu güncellendi (`due_date`, `grade`); `assignment_submissions` tablosu eklendi. SQL: `matematik-platform/supabase/migrations/20260408170000_assignment_submissions.sql`.
- **Storage:** `submissions` bucket'ı oluşturuldu. Öğrenciler için `insert/select` (kendi klasörleri), Admin için tam `select` yetkisi tanımlandı.
- **Öğrenci UI:** `src/app/odevler/page.tsx`. Ödev listeleme, detay görme, PDF/Görsel yükleme ve geri bildirim takibi.
- **Admin UI:** `src/app/admin/page.tsx`. Sınıf bazlı ödev atama, teslimatları inceleme, puanlama (0-100) ve yorum yapma ekranı.
- **Entegrasyon:** Ana sayfadaki ödev bildirimleri yeni ödev sayfasına bağlandı.

---

## 8. İlerleme Takibi Dashboard (Özellik 4)

- **Veritabanı:** `study_sessions`, `user_progress` ve `study_goals` tabloları oluşturuldu. `20260408180000_progress_tracking.sql` migration dosyası eklendi. Tüm tablolar RLS ile öğrenciye özel sınırlandırıldı.
- **Arayüz (UI):** `src/app/ilerleme/page.tsx` sayfası eklendi. `recharts` kütüphanesi NPM ile projeye kuruldu.
- **Bileşenler:** Haftalık saat hedefleri paneli, gün/çalışma süresi grafiği, "Mastery" konulu yetkinlik gösterge barları ve Öğrenci Çalışma Girişi formu yapıldı.
- **Entegrasyon:** `src/app/profil/page.tsx` sayfasına "Dashboard'a Git" yönlendirme kartı yerleştirildi.

---

## 7. Geliştirme Planı (Nisan 2026)

**Durum:** 8 yeni özellik belirlendi, implementasyon planı oluşturuldu.

**Özellikler:**
1. **Test Sistemi Veritabanı Entegrasyonu** - [TAMAMLANDI] quizzes, quiz_questions, quiz_results tabloları + RLS + Süre Takibi
...
7. **Sohbet Geçmişi Supabase'de Saklama** - [TAMAMLANDI] chat_messages, chat_rooms, chat_room_members tabloları + Realtime + Admin Panel UI
...
8. **Ödev Teslim Sistemi** - [TAMAMLANDI] assignment_submissions tablosu + dosya yükleme + Storage entegrasyonu

**Implementasyon Sırası:**
1. Test Sistemi ([x] Tamamlandı)
2. Sohbet Geçmişi ([x] Tamamlandı)
3. Ödev Teslim Sistemi ([x] Tamamlandı)
4. İlerleme Takibi ([x] Tamamlandı)
5. Oyun Çeşitliliği ([ ] Bekliyor)
6. E-posta Bildirimleri ([ ] Bekliyor)
7. PDF Export ([ ] Bekliyor)
8. PWA Desteği ([ ] Bekliyor)

**Detaylı Plan:** `/Users/ugurmac/.windsurf/plans/matematik-platform-gelistirme-348677.md`

*Son güncelleme: Özellik 1, 3, 4 ve 7 tamamlandı (8 Nisan 2026).*
