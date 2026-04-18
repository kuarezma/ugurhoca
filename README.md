# Uğur Hoca — matematik platformu

Next.js uygulaması `matematik-platform/` dizinindedir.

## Hızlı başlangıç

```bash
cd matematik-platform
./scripts/bootstrap-env.sh   # .env.local yoksa .env.example'dan oluşturur
npm install
npm run dev
```

`.env.local` içinde en azından `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` doldurun (Supabase proje ayarları).

## CI (GitHub Actions)

Derleme ve testler otomatik çalışır. Secret eklemek ve sorun giderme: [matematik-platform/docs/GITHUB_CI.md](matematik-platform/docs/GITHUB_CI.md).

Kök dizinden:

```bash
npm run build    # matematik-platform'da build
npm run lint
```

## Kalite planı

[docs/web-kalite-ve-profesyonellik-plan.md](docs/web-kalite-ve-profesyonellik-plan.md)
