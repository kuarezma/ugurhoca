# Uğur Hoca Matematik Platformu

[English](README.en.md) | Türkçe

Uğur Hoca Matematik Platformu; öğrencilerin matematik çalışmasını, test çözmesini, ödevlerini takip etmesini, öğretmenle iletişim kurmasını ve canlı derslere katılmasını sağlayan modern bir eğitim uygulamasıdır.

Platformun temel odak noktası; sade ve modern bir öğrenci deneyimi, güçlü pedagojik araçlar ve üst düzey veri gizliliğidir.

![Uğur Hoca ana sayfa masaüstü görünümü](docs/screenshots/homepage-desktop.jpg)

## Öne Çıkan Özellikler

- **2026 Modern Bento Arayüzü:** Apple/Linear esintili tasarım dili, duyarlı bento kartları ve tek elle kullanım sağlayan yüzen mobil alt menü (dock).
- **Canlı Ders & Etkileşim:** LiveKit tabanlı canlı ders odaları, ekran paylaşımı, interaktif karalama tahtası, hazır geometrik çizim şablonları, anlık oylamalar ve zaman damgalı ders kayıt arşivi.
- **Akıllı Öğrenme & Hafıza:** 5 kutulu Leitner aralıklı tekrar formül kartları, 3 kademeli Sokratik ipucu merdiveni ve hareketli görsel formül ispatları.
- **Ölçme, Değerlendirme & Sınav Koçu:** LGS ve YKS için soru başı canlı tempo koçu, turlama taktiği ("Bayrakla & Geç"), kişiselleştirilmiş eksik reçetesi ve tek tıkla yazdırılabilir A4 resmi başarı belgesi / aylık gelişim karnesi.
- **Oyunlaştırma & Motivasyon:** 18 özgün eğitici matematik oyunu, sentetik ses efektleri, gizlilik odaklı rumuzlu liderlik panosu ve başarı rozetleri.
- **Öğretmen Yönetim Merkezi:** Test, ödev, doküman kütüphanesi, duyurular ve öğrenci gelişim analiz paneli.
- **Çoklu Platform:** PWA (Progressive Web App) desteği, sınav içi klavye kısayolları ve tek tıkla kişisel veri yedekleme.

## Teknoloji Yığını

- **Uygulama:** Next.js 16 (App Router), React 19, TypeScript
- **Stil & Animasyon:** Tailwind CSS, Framer Motion, Lucide React
- **Veri & Güvenlik:** Supabase Auth, PostgreSQL, Storage, Realtime, RLS Politikaları
- **Canlı Ders:** LiveKit WebRTC
- **E-posta & Bildirim:** Resend
- **Kalite & Test:** Vitest, Testing Library, ESLint, Prettier

## Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- npm

### Kurulum

```bash
git clone https://github.com/kuarezma/ugurhoca.git
cd ugurhoca

npm install --prefix matematik-platform
npm run setup:env
```

`matematik-platform/.env.local` dosyasını yapılandırın (ayrıntılar için `.env.example` dosyasını inceleyin):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Canlı ders
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LESSON_TEACHER_SECRET=your_teacher_secret
LESSON_PERSIST_SIGNING_SECRET=your_signing_secret
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Temel Komutlar

```bash
npm run dev            # Geliştirme sunucusu
npm run build          # Production build
npm run typecheck      # TypeScript kontrolü
npm run lint           # ESLint kontrolü
npm run test           # Vitest testleri
```

## Güvenlik ve Gizlilik

- **Öğrenci Gizliliği:** Supabase Row Level Security (RLS) ile izoledir. Hiçbir öğrenci başka bir öğrencinin profiline, mesajlarına, ödevlerine veya test sonuçlarına erişemez.
- **Anonimlik:** Liderlik panolarında ve topluluk alanlarında gerçek kimlikler yerine rumuzlar kullanılır.
- **Yönetici İzolasyonu:** Yönetim paneli rol bazlı erişim denetimi (RBAC) ile korunmaktadır.

## Sürüm Notları

- **2026-09-05:** Leitner aralıklı tekrar formül kartları, LGS/YKS sınav tempo koçu, Sokratik ipucu merdiveni, aylık gelişim karnesi ve resmi başarı sertifikası, karalama tahtası geometrik araçları, canlı ders kayıt arşivi.
- **2026-09-04:** Modern bento tasarımı, 18 eğitici matematik oyunu, gelişmiş mobil ergonomi, interaktif grafik laboratuvarı ve görsel formül ispatları.

## Lisans ve İletişim

Bu proje özel kullanım için geliştirilmiştir. İzinsiz çoğaltılamaz veya dağıtılamaz.

- **Web:** [ugurhoca.com](https://ugurhoca.com)
