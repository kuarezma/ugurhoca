# Site kalite düzeltmeleri — 16 Kasım 2026

Kaynak: [19 maddelik denetim](site-kalite-denetimi-2026-11-16.md).

## Uygulanan düzenlemeler

| Bulgu | Değişiklik                                                                                                                                                                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Yaprak testte geri/ileri ile sınıf ve kazanım durumu URL'ye döner. Tür ve sınıf aynı anda kaldırıldığında eski sınıf filtresi de temizlenir.                                                                                                                                                  |
| 2     | Geç gelen önizleme yanıtı kapatılan/eski belgeyi yeniden açamaz. Aynı belge iki kez sayılmaz. Hata sonrası “Yeniden dene” önizleme isteğini gerçekten tekrarlar.                                                                                                                              |
| 3     | HTML speculation ön yüklemesi kaldırıldı; SPA ön yüklemesini SafeLink yönetir. Açık URL'ye tekrar gezinme ve bekleyen bağlantının yeniden tetiklenmesi engellenir; dosya indirme bağlantıları doğal tarayıcı davranışını korur.                                                               |
| 4     | İçerik, hesaplayıcı ve giriş/kayıt formları için ayrı yükleme iskeletleri kullanılır. Kalıcı araç menüsünün üstüne ikinci bir menü iskeleti çizilmez.                                                                                                                                         |
| 5     | Seçili yaprak test sınıfı sunucudan başlangıç verisiyle gelir. Başarılı seed istemcide tekrar çekilmez. Sayfalı okuma ortak süre sınırı ve iptal sinyali kullanır. Mezun filtresi, sayısal sınıf sütununa metin göndermek yerine 12. sınıf/YKS materyallerini kullanır.                       |
| 6     | Mobilde yüzen mesaj düğmesi kaldırıldı; beş gezinme bağlantısı korunarak alt menüye Destek eklendi. Okunmamış mesaj sayısı ve aç/kapat durumu korunur. Sohbet ve çerez bildirimi menü üstüne yerleşir; içerik sonunda alt menü için boşluk ayrılır. Canlı ders odasında bu boşluk uygulanmaz. |
| 7     | LGS'de dar ekranda ders adı üstte, etiketli doğru/yanlış/net alanları altta görünür. Girdiler 44 piksel yüksekliğindedir.                                                                                                                                                                     |
| 8     | İçerik araması doğrudan görünür. Sınıf, tür, sıralama ve gelişmiş seçenekler telefonda aynı açılır panelde toplanır.                                                                                                                                                                          |
| 9     | Yaprak test tarayıcısında aynı sınıflar hem çip hem kart olarak tekrarlanmaz; sınıf kartları ve kırıntı yolu kullanılır.                                                                                                                                                                      |
| 10    | İçerik listesi/detayı, araçlar ve deneme salonu ortak üst menü kullanır. Arama ve tema aynı yerde bulunur. Hesap bilgisi bilinmeyen araç ekranları yanıltıcı “Giriş” yerine “Hesabım” bağlantısı sunar. İkinci yüzen tema düğmesi bu sayfalarda gösterilmez.                                  |
| 11    | Telefonda son içeriklerin ilk üçü öne çıkar; tüm içeriklere bağlantı korunur. Çalışma araçları ile duyurular/kullanım rehberi açılır bölümlere alınır. Ana renkler, yazı tipleri ve mevcut araçlar korunur.                                                                                   |
| 12    | Mobilde ve yavaş/veri tasarruflu bağlantıda arka plan canvas'ı sürekli çizilmez. Mobil arka plan animasyonları durur; kartlardaki yinelenen blur katmanları azaltılır. Sekme görünürlüğü ve azaltılmış hareket desteği korunur.                                                               |
| 13    | Deneme soruları ve matematik gösterimi sunucuda da oluşturulur; soru metni sonradan yanıp sönen üç noktanın yerine gelmez.                                                                                                                                                                    |
| 14    | Boş cevaba anlaşılır hata, kalıcı etiket, doğru/yanlış durum metni ve erişilebilir geri bildirim eklenir. Çözüm görüldükten sonra çoktan seçmeli cevap değiştirilemez.                                                                                                                        |
| 15    | Negatif ders neti LGS/YKS araçlarında, hesaplayıcı penceresinde, toplam özetinde ve yazdırılan karnede korunur. Tahmini puanın alt sınırı net hesabından ayrıdır.                                                                                                                             |
| 16    | LGS sezonu, başlığı ve SSS tek içerik modülünden üretilir. İkinci ve farklı SSS JSON-LD kaldırılır.                                                                                                                                                                                           |
| 17    | Öğrenci metnindeki “LaTeX çözümleri” → “Adım adım çözümler”, “Kılavuz Görünümü” → “Kart Görünümü”; teknik komut paleti adı sadeleştirilir.                                                                                                                                                    |
| 18    | Güncel tasarım kaydı Outfit/Baloo 2 ve uygulanmış yüzey tokenlarıyla eşleştirilir. Eski Sıcak Kağıt önerisi tarihsel kayıt olarak işaretlenir.                                                                                                                                                |
| 19    | Filtre paneline açılma durumu/bağlı alan kimliği; sınıf, tür ve görünüm seçimlerine erişilebilir seçili durum eklenir. Menü Escape ile kapanır ve odak açma düğmesine döner.                                                                                                                  |

## Doğrulama

- Birim testleri: tam çalıştırmada 1969 geçti, 1 test yeni ortak menü için eksik test mock’u nedeniyle başarısız oldu, 1 test atlandı. Mock düzeltildikten sonra etkilenen 9 dosyada 69/69 geçti. Böylece 1970 ayrı testin geçişi doğrulandı; tam paketin tek çalıştırmada sıfır hata verdiği iddia edilmez.
- Üretim derlemesi, TypeScript ve lint kontrolleri başarılı. Son iki görsel düzeltmenin ESLint kontrolü de geçti.
- Playwright: Next.js 16.4.6 ile son turda 10/10 geçti (8 akış testi + masaüstü/mobil kontrast testi). Masaüstü ve Pixel 7 emülasyonunda içerik arama/filtre, destek aç/kapat, dosya reddi, deneme mesajı, haber/hukuk sayfaları ve negatif net akışlarında 8/8 geçti. Mesaj API’si yerel fixture ile karşılandı; gerçek destek mesajı gönderilmedi.
- Kontrast: 27 rota × iki tema = 54 kayıt; kimlik doğrulaması gerektiren 20 kayıt atlandı, 34 görünüm ölçüldü. Ortak menünün arama sınırı düzeltildikten sonra test geçti; erişilemeyen oturumlu ekranlar için geçiş iddia edilmez.
- 320, 390 ve 1440 piksel genişliklerde yatay taşma bulunmadı. LGS girdisi 44 piksel; 3 yanlış = −1 net gösterimi doğrulandı. Yaprak testte geri tuşu sınıf kartlarına döndü.
- Tek tıkta içerik geçişinde 0 tam belge gezinmesi, 3 Next/RSC fetch gözlendi. Bunlar üç tam sayfa açılması değildir.
- 390 pikselde ana sayfa belge yüksekliği ilk denetimdeki yaklaşık 11063 pikselden 7303 piksele indi. Bu yerleşim ölçümüdür; gerçek cihaz hızı veya üretim Core Web Vitals kanıtı değildir.
- Yerel `next start` ortamında Vercel Speed Insights betiği 404 verir; bu ortamda üretim telemetrisi doğrulanmadı.

Kanıtlar: [ölçümler](../output/playwright/kalite-duzeltme-2026-11-16/yerlesim-olcumleri.json), [320 px içerik](../output/playwright/kalite-duzeltme-2026-11-16/02-icerikler-320.png), [320 px LGS](../output/playwright/kalite-duzeltme-2026-11-16/04-lgs-320.png), [390 px ana sayfa](../output/playwright/kalite-duzeltme-2026-11-16/05-ana-sayfa-390.png), [koyu tema](../output/playwright/kalite-duzeltme-2026-11-16/07-koyu-tema-1440.png).

## Ek güvenlik kontrolü

Derleme uyarısı üzerine Next.js 16.4.4 için [resmî güvenlik kaydı](https://github.com/advisories/GHSA-mfr8-8qww-v76h) doğrulandı. Aynı serinin 16.4.6 yaması ve eşleşen eslint-config-next uygulandı. Üretim bağımlılık audit’inde ayrıca Sentry/ExcelJS/KaTeX zincirlerinde orta/düşük seviyeli kayıtlar bulundu; bu teslimde büyük sürüm geçişleri yapılmadı. Güvenlik audit’inin tamamen temiz olduğu iddia edilmez.

## Sınırlar

- Matematik puanları tahmin modelidir; resmî MEB/ÖSYM puanına eşdeğerlik iddia edilmez.
- Fiziksel telefon klavyesi ve donanım üzerindeki FPS/pil tüketimi ayrı manuel kontroldür. Tarayıcı emülasyonu bunların yerine geçmez.
- Yetki, RLS ve öğrenci izolasyonu sınırları değiştirilmedi; şema/migration değişikliği yapılmadı. Bağımlılık değişikliği yukarıdaki Next.js güvenlik yamasıyla sınırlıdır.
