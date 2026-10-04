# Uğur Hoca — repo kuralları

Uygulama kodu `matematik-platform/` altındadır. Kural önceliği:

1. `matematik-platform/CLAUDE.md` — tema token sözlüğü (`text-white` yasağı vb.)
2. `matematik-platform/AGENTS.md` — Next.js agent kuralları
3. `docs/web-kalite-ve-profesyonellik-plan.md` — bağlayıcı kısıt: font/renk/tema/düzen değişmez, yalnızca teknik optimizasyon (+ 2026-09-10 karar kaydı)
4. `matematik-platform/site.md` — ürün kısıtları: ücretli paket/abonelik yok, öğrenci izolasyonu
5. `task.md` — görev günlüğü (sayılar için diske bak: `find matematik-platform/src -name "*.test.*"`)

Güvenlik sınırları: yetki her zaman server'da (`requireAdmin` / `getVerifiedServerUser` + RLS); middleware çerezi UX kısayoludur. `supabase/migrations/` tek şema kaynağıdır (`docs/archive-supabase-setup.legacy.sql` çalıştırılmaz).

## Cursor Cloud specific instructions

- Uygulama `matematik-platform/` altındadır. Node 22 ve `npm ci` (çalışma dizini `matematik-platform`). Kök `package.json` betikleri aynı komutlara `--prefix matematik-platform` ile iner.
- Geliştirme sunucusu: `npm run dev -- --hostname 0.0.0.0 --port 3000`. Sayfayı `http://127.0.0.1:3000` ile açın; `localhost` ile `127.0.0.1` Next geliştirme kaynakları için ayrı origin sayılır (`allowedDevOrigins`).
- Kalite komutları, `matematik-platform` içinde: `npm run typecheck`, `npm run lint`, `npm run test:fast`, `npm run build`. CI'daki kapsam raporu `npm run test` (`vitest run --coverage`).
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` yokken herkese açık sayfalar ve hesap araçları açılır; giriş, test ve ödev verisi için gerçek değerler `matematik-platform/.env.local` içine yazılır. `.env.example` yer tutucuları dolu kabul edilir ve kopyalanırsa istemci sahte hosta gider. `npm run setup:env` dosya yoksa yalnızca örneği kopyalar.
