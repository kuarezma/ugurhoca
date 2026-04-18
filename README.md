# Uğur Hoca — Matematik Platformu

[English](README.en.md) | Türkçe

Uğur Hoca, öğrenciler için kapsamlı bir matematik öğrenme platformudur. Test çözme, ödev teslimi, ilerleme takibi, oyunlaştırma ve sohbet özelliklerini bir araya getirir.

<!-- TODO: Ana sayfa ekran görüntüsü ekle -->

## Özellikler

- **Test Sistemi:** Zamanlı testler, soru analizi, konfeti animasyonları
- **Ödev Teslimi:** Dosya yükleme, drag & drop, puanlama sistemi
- **İlerleme Takibi:** Çalışma süreleri, grafikler, rozetler, streak sistemi
- **Oyunlaştırma:** Mini oyunlar, liderlik tablosu, rozet koleksiyonu
- **Sohbet Sistemi:** Admin-öğrenci iletişimi, bildirimler
- **PDF Export:** Test raporları, ilerleme grafikleri PDF olarak indirilebilir
- **PWA Desteği:** Mobil uygulama deneyimi, offline çalışma
- **Program Verisi:** LGS ve YKS okul/program bilgileri

## Teknoloji Yığını

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** TailwindCSS, Framer Motion
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Deployment:** Vercel
- **Testing:** Vitest, Testing Library
- **Code Quality:** ESLint, Prettier

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

```bash
# Depoyu klonla
git clone <repository-url>
cd ugurhoca

# Environment değişkenlerini ayarla
cd matematik-platform
./scripts/bootstrap-env.sh   # .env.local oluşturur

# .env.local dosyasını düzenle
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Deployment

### Vercel

1. Depoyu Vercel'e import edin
2. Environment değişkenlerini ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (opsiyonel)
   - `ADMIN_EMAILS`
3. Deploy

### Supabase Setup

1. Supabase projesi oluşturun
2. Migration dosyalarını çalıştırın: `supabase/migrations/`
3. Storage bucket'ları oluşturun
4. RLS politikalarını uygulayın

## Proje Yapısı

```
ugurhoca/
├── matematik-platform/          # Ana uygulama
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React bileşenleri
│   │   ├── features/            # Feature bazlı yapı
│   │   ├── lib/                 # Utility fonksiyonları
│   │   └── types/               # TypeScript tipleri
│   ├── supabase/
│   │   └── migrations/          # DB migration'ları
│   └── public/                  # Statik dosyalar
├── docs/                        # Dokümantasyon
└── package.json                 # Kök package.json
```

## Geliştirme

### Kullanılabilir Scriptler

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucusu
npm run lint         # ESLint kontrolü
npm run lint:fix     # ESLint düzeltme
npm run format       # Prettier formatlama
npm run test         # Test çalıştırma
npm run typecheck    # TypeScript kontrolü
```

### Kod Kalitesi

- ESLint ve Prettier otomatik formatlama
- TypeScript tip güvenliği
- Vitest ile unit testler
- GitHub Actions ile CI/CD

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje özel bir lisans altındadır. İzinsiz kullanılamaz.

## İletişim

- **Email:** admin@ugurhoca.com
- **Web:** [ugurhoca.com](https://ugurhoca.com)

## Ekran Görüntüleri

<!-- TODO: Ana sayfa ekran görüntüsü ekle -->
<!-- TODO: Dashboard ekran görüntüsü ekle -->
<!-- TODO: Test ekranı ekran görüntüsü ekle -->
<!-- TODO: Ödev sayfası ekran görüntüsü ekle -->
<!-- TODO: İlerleme dashboard ekran görüntüsü ekle -->

## Dokümantasyon

- [Kalite Planı](docs/web-kalite-ve-profesyonellik-plan.md)
- [GitHub CI Rehberi](matematik-platform/docs/GITHUB_CI.md)
- [İlerleme Özeti](progress.md)
