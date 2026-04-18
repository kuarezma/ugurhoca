# GitHub Actions CI ve ortam değişkenleri

## CI ne çalıştırır?

`.github/workflows/ci.yml`: `npm ci` → `typecheck` → `lint` → `test` → `build`.

## Secret’lar (önerilir)

Depo üzerinde: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret adı | Açıklama |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL’si (Project Settings → API → Project URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` anahtarı (aynı sayfa) |

Workflow bu isimleri job `env` ile `matematik-platform` derlemesine aktarır. Tanımlı değilse boş gelir; ana sayfa sunucu verisi için kod **boş feed** ile yine de derlenir.

**Önemli:** `SUPABASE_SERVICE_ROLE_KEY` ve `RESEND_API_KEY` CI derlemesi için zorunlu değildir; yalnızca API route’ları ve betikler için üretim/Vercel’de gerekir.

## Yerel geliştirme

```bash
cd matematik-platform
./scripts/bootstrap-env.sh   # yoksa .env.example → .env.local kopyalar
# .env.local içindeki placeholder’ları Supabase değerleriyle doldurun
```

## Sorun giderme

- **Build sadece GitHub’da düşüyorsa:** Actions sekmesinde kırmızı iş → ilgili job → hata satırını okuyun.
- **“environment variable is required”:** Eksik `NEXT_PUBLIC_*` — `.env.local` veya GitHub Secrets kontrol edin.
