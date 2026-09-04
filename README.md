# Uğur Hoca Matematik Platformu

[English](README.en.md) | Türkçe

Uğur Hoca Matematik Platformu; öğrencilerin matematik çalışmasını, test çözmesini, ödevlerini takip etmesini, öğretmenle iletişim kurmasını ve canlı derslere katılmasını sağlayan modern bir eğitim uygulamasıdır.

Platformun odağı sade bir öğrenci deneyimi, güçlü öğretmen yönetimi ve güvenli veri erişimidir. Öğrenciler yalnızca kendi içeriklerini, sonuçlarını ve mesajlarını görür; öğretmen paneli ise takip, ölçme ve geri bildirim süreçlerini tek yerden yönetir.

![Uğur Hoca ana sayfa masaüstü görünümü](docs/screenshots/homepage-desktop.jpg)

## Öne Çıkanlar

- **2026 Modern Bento Tasarımı:** Apple/Linear tarzı yumuşak çok katmanlı gölgeler, ferah boşluklar, modern sınav sayaç widgetları ve bento kutuları.
- **Mobil Ergonomi:** Tek elle rahat gezinti sağlayan yüzen mobil alt menü (Bottom Navigation Dock) ve dokunmatik uyumu.
- **Canlı ders:** LiveKit tabanlı oda yapısı, öğretmen ekran paylaşımı, öğrenci tam ekran izleme, mikrofon izin yönetimi, katılım onayı ve canlı sohbet.
- **Test sistemi:** Zamanlı testler, doğru/yanlış takibi, sonuç ekranı, çözüm geri bildirimi ve PDF çıktıları.
- **Ödev yönetimi:** Öğrenciye veya sınıfa ödev atama, dosya teslimi, teslim inceleme ve puanlama.
- **İlerleme takibi:** Çalışma süresi, hedefler, günlük seri, grafikler ve öğrenci gelişim özeti.
- **Oyunlaştırma (18 Özgün Oyun):** Çocukların ve gençlerin severek oynadığı Pizza Ustası, Matematik Ninja, Köstebek Avı, Hızlı Şoför, Koordinat Korsanı, Sayı Kulesi, Çarpım Tablosu, Balon Patlatma, Uzay Roketi ve rumuzlu liderlik tablosu.
- **Öğretmen paneli:** Kullanıcı yönetimi, içerik yönetimi, duyurular, mesajlar, takip merkezi ve canlı ders planlama.
- **İçerik kütüphanesi:** Dokümanlar, yaprak testler, konu içerikleri, LGS/YKS kaynakları ve hızlı PDF/döküman önizleyici.
- **İnteraktif Sınav Hesaplayıcı:** LGS ve YKS (TYT/AYT) için anlık net ve standart puan hesaplama motoru.
- **Akıllı Hata Defterim:** Testlerde yanlış yapılan soruları %100 gizlilikle yerel olarak biriktiren ve tekrar testi oluşturan kişisel çalışma havuzu.
- **Matematik Odak & Pomodoro:** 25 ve 50 dakikalık odaklanma ve mola zamanlayıcısı (Web Audio melodik geri bildirimli).
- **MEB Konu Takip Çizelgesi:** 5. sınıftan 12. sınıfa kadar tüm matematik kazanımlarının adım adım işaretlenebildiği müfredat takip aracı.
- **Mobil uyum:** Responsive arayüz, yüzen alt gezinti çubuğu ve telefon/tablet kullanımına uygun akışlar.

## Teknoloji Yığını

- **Uygulama:** Next.js 16, React 19, TypeScript
- **Arayüz:** Tailwind CSS, Framer Motion, Lucide React
- **Veri ve kimlik:** Supabase Auth, Postgres, Storage, Realtime, RLS politikaları
- **Canlı ders:** LiveKit
- **E-posta:** Resend
- **Test ve kalite:** Vitest, Testing Library, ESLint, Prettier, TypeScript
- **Dağıtım:** Vercel

## Proje Yapısı

```text
ugurhoca/
├── matematik-platform/          # Ana Next.js uygulaması
│   ├── src/
│   │   ├── app/                 # App Router sayfaları ve API route'ları
│   │   ├── components/          # Ortak UI bileşenleri
│   │   ├── features/            # Özellik bazlı modüller
│   │   ├── hooks/               # Ortak React hook'ları
│   │   ├── lib/                 # Yardımcı fonksiyonlar ve servisler
│   │   └── types/               # Ortak TypeScript tipleri
│   ├── public/                  # Statik dosyalar
│   ├── scripts/                 # Veri aktarımı ve kurulum scriptleri
│   └── supabase/migrations/     # Veritabanı migration dosyaları
├── docs/                        # Proje dokümantasyonu
├── package.json                 # Kök script yönlendiricileri
└── README.md
```

## Kurulum

### Gereksinimler

- Node.js 18 veya üzeri
- npm
- Supabase projesi
- Canlı ders kullanılacaksa LiveKit projesi

### Yerel Geliştirme

```bash
git clone https://github.com/kuarezma/ugurhoca.git
cd ugurhoca

npm install --prefix matematik-platform
npm run setup:env
```

`matematik-platform/.env.local` dosyasını kendi servis bilgilerinle doldur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ADMIN_EXTRA_EMAILS=ikinci-admin@ugurhoca.com
RESEND_API_KEY=your_resend_api_key_here

# Canlı ders için
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LESSON_TEACHER_SECRET=strong_teacher_secret
LESSON_PERSIST_SIGNING_SECRET=strong_persist_secret
```

`admin@ugurhoca.com` adresi varsayılan admin olarak koda gömülüdür; `ADMIN_EXTRA_EMAILS` yalnızca ek admin adresleri tanımlar. Değişkenlerin tam listesi ve açıklamaları için `matematik-platform/.env.example` dosyasına bakın.

Geliştirme sunucusunu başlat:

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Komutlar

Kök dizinden çalıştırılabilir:

```bash
npm run dev            # Geliştirme sunucusu
npm run build          # Production build
npm run start          # Production sunucusu
npm run typecheck      # TypeScript kontrolü
npm run lint           # ESLint kontrolü
npm run lint:fix       # ESLint düzeltmeleri
npm run format         # Prettier formatlama
npm run format:check   # Format kontrolü
npm run test           # Vitest testleri
```

## Supabase Notları

Veritabanı şeması `matematik-platform/supabase/migrations/` altında tutulur. Yeni ortam kurulurken migration dosyaları Supabase projesine uygulanmalıdır.

Projede öğrenci gizliliği kritik kabul edilir:

- Öğrenciler başka öğrencilerin profilini, mesajını, ödev teslimini, test sonucunu veya çalışma verisini okuyamaz.
- Öğretmen/admin rolleri gerekli yönetim ekranlarına erişebilir.
- Genel görünümlerde gerçek öğrenci bilgisi yerine gizliliği koruyan yapılar tercih edilir.

## Dağıtım

Önerilen dağıtım ortamı Vercel'dir.

1. Depoyu Vercel'e import edin.
2. Build root olarak `matematik-platform` klasörünü kullanın.
3. `.env.local` içindeki gerekli değişkenleri Vercel Environment Variables alanına ekleyin.
4. Supabase migration ve storage ayarlarının production ortamında hazır olduğundan emin olun.
5. Deploy alın.

Canlı ders, e-posta ve cron işleri için ilgili servis anahtarlarının production ortamında ayrıca tanımlanması gerekir.

## Kalite Kontrol

Değişikliklerden önce veya deploy öncesi önerilen kontrol sırası:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Küçük UI değişikliklerinde ilgili sayfa mobil ve masaüstü görünümde ayrıca kontrol edilmelidir.

## Dokümantasyon

- [Web kalite ve profesyonellik planı](docs/web-kalite-ve-profesyonellik-plan.md)
- [GitHub CI rehberi](matematik-platform/docs/GITHUB_CI.md)
- [Performans notları](matematik-platform/docs/PERFORMANCE_BASELINE.md)
- [Quiz bundle import rehberi](matematik-platform/docs/QUIZ_BUNDLE_IMPORT.md)
- [İlerleme özeti](progress.md)

## Değişiklik Günlüğü (Changelog)
 
- **2026-09-04 (Canlı Ders Bölümü Kapsamlı Modernizasyonu & Geliştirmesi):**
  - **Modern Tema & Navigasyon:** `/canli-ders` sayfası sitenin açık/koyu temasına, cam (glassmorphism) efektlerine ve standart üst menüye (`HomeNavbar`) tam uyumlu hale getirildi.
  - **İstatistik & Özet Şeridi:** Aktif canlı ders durumu, yaklaşan ders sayısı, toplam planlanan saat ve sınıf seviyesini gösteren bento özet kartları eklendi.
  - **Sekmeli Ders Listesi & Arama:** "Yaklaşan Dersler" ve "Geçmiş Dersler" sekmeleri, sınıf bazlı filtre hapları ve anlık ders arama çubuğu entegre edildi.
  - **Takvime Ekle & Kalan Süre Sayacı:** Her ders için anlık Türkçe geri sayım ("25 dk kaldı", "Ders devam ediyor"), tek tıkla Google Takvim bağlantısı ve `.ics` iCalendar indirme desteği eklendi.
  - **Öğretmen Kolaylıkları:** Tek tıkla o an ders başlatan "Hızlı Ders Başlat" aksiyonu, katlanabilir ders planlama formu ve sayfa üzerinden doğrudan ders düzenleme modalı (`LiveLessonEditModal`) sunuldu.
  - **Gelişmiş Bekleme Lobisi:** Derse girmeden önce mikrofon ses seviyesini canlı görselleştiren test aracı ve kamera/mikrofon hazır giriş ayarları (`RoomLobbyPreview`) eklendi.
  - **Oda İçi Sekmeli Dock Paneli:** Canlı ders odasındaki dikey yığılma giderilerek profesyonel sekmeli dock paneli (Sohbet, Katılımcılar & Moderasyon, Anlık Soru / Quiz, Görünüm Ayarları) kuruldu.
  - **Ders İçi Matematik Tahtası & Sayaç:** Canlı ders esnasında geçen/kalan süreyi gösteren akıllı sayaç, tek tık tam ekran modu ve entegre çizim/karalama tahtası eklendi.
- **2026-09-04 (Çocuklar İçin 6 Yeni Eğitici Matematik Oyunu):**
  - **Pizza Ustası (Kesir & Parça-Bütün):** Müşteri siparişine göre pizzayı istenen kesir ve yüzde kadar süsleyip fırına verme oyunu.
  - **Matematik Ninja (Çarpanlar, Asal & Sayı Refleksi):** Kılıçla uçuşan meyvelerden görev kuralına uyanları dilimleme, kombo ve refleks oyunu.
  - **Köstebek Avı (Hızlı Zihinden İşlem):** Çimenlikteki yuvalardan kafasını çıkaran köstebeklerden doğru cevabı tutana çekiçle vurma oyunu.
  - **Hızlı Şoför (Matematik Yarışı & Nitro):** 3 şeritli pistte spor arabayla doğru işlem kapısına girerek alevli nitro boost kazanma oyunu.
  - **Koordinat Korsanı (Kartezyen Koordinat Sistemi):** Korsan adasındaki gizli altın sandıklarını (X, Y) koordinatlarıyla bulup kazma oyunu.
  - **Sayı Kulesi (Örüntüler & Matematik İstifleme):** Sayı dizisini çözüp doğru blokla gökdelen inşa etme oyunu.
  - **Web Audio Sentetik Ses Efektleri:** Harici dosya yüklemeden sıfır gecikmeli doğru/yanlış/kombo/nitro/zafer sesleri entegre edildi.
  - **Supabase Skor Güvenliği:** Yeni oyunlar için puan limitleri tanımlandı ve liderlik tablosu entegrasyonu sağlandı.
- **2026-09-04 (Yeni Eğitim Araçları & Pedagojik Özellikler):**
  - **İnteraktif Sınav Hesaplayıcı:** LGS ve YKS için doğru/yanlış/net ve tahmini başarı sıralamasını anında hesaplayan modal eklendi.
  - **Akıllı Hata Defterim:** Testlerde yanlış yapılan soruları gizlilikle tarayıcıda biriktiren ve tek tıkla tekrar testi başlatan kişisel hata havuzu kuruldu.
  - **Matematik Odak & Pomodoro Sayacı:** 25/50 dk çalışma ve mola sürelerini yöneten dairesel animasyonlu ve Web Audio melodili çalışma aracı eklendi.
  - **MEB Konu Takip Çizelgesi:** 5-12. sınıf matematik müfredatını (konu, soru, tekrar) takip eden interaktif checklist eklendi.
  - **Gelişmiş PDF Önizleme:** Çalışma kağıtlarında iframe sandbox uyumluluğu artırıldı ve ayrı sekmede tam ekran açma butonu eklendi.
- **2026-09-04 (Tasarım & Hız Modernizasyonu):**
  - Apple/Linear esintili modern bento-grid yapısı ve token'ları (`bento-card`, çok katmanlı gölgeler, safir/indigo teması) entegre edildi.
  - LGS ve YKS sınav sayaçları widget tarzı modern bento kutularına dönüştürüldü.
  - Hero alanı, sınıf seçim hapları ve hızlı araçlar (bilgi kartları, karalama tahtası) ferah arayüze kavuşturuldu.
  - Mobil kullanıcılar için tek elle kullanıma uygun yüzen alt gezinti çubuğu (`MobileBottomNav`) eklendi.
  - Test çözme ve sonuç ekranları modern degrade vurguları ile yenilendi.
  - `defer-section` (`content-visibility: auto`) ve yerel CSS View Transitions ile sayfa açılış ve geçiş hızları optimize edildi.

## Lisans

Bu proje özel kullanım için geliştirilmiştir. İzinsiz kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.

## İletişim

- Web: [ugurhoca.com](https://ugurhoca.com)
- E-posta: admin@ugurhoca.com
