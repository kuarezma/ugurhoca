# Uğur Hoca — repo kuralları

Uygulama kodu `matematik-platform/` altındadır. Kural önceliği:

1. `matematik-platform/CLAUDE.md` — tema token sözlüğü (`text-white` yasağı vb.)
2. `matematik-platform/AGENTS.md` — Next.js agent kuralları
3. `docs/web-kalite-ve-profesyonellik-plan.md` — bağlayıcı kısıt: font/renk/tema/düzen değişmez, yalnızca teknik optimizasyon (+ 2026-09-10 karar kaydı)
4. `matematik-platform/site.md` — ürün kısıtları: ücretli paket/abonelik yok, öğrenci izolasyonu
5. `task.md` — görev günlüğü (sayılar için diske bak: `find matematik-platform/src -name "*.test.*"`)

Güvenlik sınırları: yetki her zaman server'da (`requireAdmin` / `getVerifiedServerUser` + RLS); middleware çerezi UX kısayoludur. `supabase/migrations/` tek şema kaynağıdır (`docs/archive-supabase-setup.legacy.sql` çalıştırılmaz).
