# Uğur Hoca Matematik Platformu

[English](README.en.md) | Türkçe

Uğur Hoca Matematik Platformu; öğrencilerin matematiği severek öğrendiği, canlı derslerle pekiştirdiği, eksiklerini kolayca tamamladığı ve hedeflerine adım adım ilerlediği modern bir eğitim alanıdır.

Sade ve ferah tasarımıyla öğrencinin dikkatini dağıtmadan yalnızca öğrenmeye ve gelişime odaklanmasını sağlar.

![Uğur Hoca ana sayfa görünümü](docs/screenshots/homepage-desktop.jpg)

---

## Platformda Neler Var?

- 🎓 **Canlı Dersler:** Öğretmenle doğrudan etkileşim kurulan canlı dersler, anlık soru masası, dijital karalama tahtası ve kaçırılan dersler için ders kayıt arşivi.
- ⏱️ **Sınav & Tempo Koçu:** LGS ve YKS hazırlığında soruları ideal sürede çözmeyi öğreten canlı tempo göstergesi, turlama taktiği ve sınav sonu süre analizi.
- 💡 **Kademeli İpucu Desteği:** Test çözerken cevabı doğrudan vermek yerine öğrenciyi adım adım düşünmeye yönlendiren pedagojik ipucu merdiveni.
- 🗂️ **Aralıklı Tekrar & Formül Kartları:** Formülleri unutulmaz kılan akıllı tekrar kartları sistemiyle kalıcı matematik hafızası.
- 📊 **Aylık Gelişim Karnesi & Başarı Belgesi:** Öğrencinin çalışma süresini, konu hakimiyetini gösteren aylık raporlar ve başarıyı taçlandıran resmi başarı sertifikası.
- 🎮 **18 Eğitici Matematik Oyunu:** Zihinden işlem, koordinat bulma, kesirler ve çarpanları eğlenerek pekiştiren özgün matematik oyunları.
- 📝 **Ödev Takibi & Çalışma Kağıtları:** Öğretmenin verdiği ödevleri tek ekrandan takip etme, sisteme yükleme ve tek tıkla yazdırılabilir A4 çalışma kağıtları.
- 💬 **Gelişmiş Sohbet Balonu & 1-e-1 Eğitmen İletişimi:** Gerçek zamanlı "yazıyor..." göstergesi, WhatsApp tarzı iletildi/okundu (✓✓) teyidi, formül ve soru alıntılama (reply/quote), 60 saniyelik sesli not gönderme ve dahili ses oynatıcısı, çoklu görsel ve PDF soru föyü yükleme, sohbet içi arama ve tek tıkla öğrenci hızlı soru şablonları.
- 📱 **Tüm Cihazlarda Kusursuz:** Bilgisayar, tablet ve akıllı telefonlarda rahat kullanım; tek tıkla ana ekrana uygulama gibi ekleme kolaylığı.

---

## Öğrenci Gizliliği ve Güvenliği

Platformda öğrenci gizliliği en üst düzeyde korunur:
- Öğrencinin çözdüğü testler, çalışma süreleri ve ödevleri tamamen kendisine özeldir.
- Oyunlarda ve etkinlik listelerinde gerçek isim yerine rumuz kullanılır.
- Hiçbir öğrenci bir başkasının sonuçlarını veya mesajlarını göremez.

---

## Değişiklik Günlüğü (Changelog)

### v1.3.3 - Akordeon Kategori Kartları Mimarisi (Ferah & Genişleyen Tasarım)
- **Akordeon / Genişleyen Kart Tasarımı:** Sekmeli ve sabit yapışkan (sticky) kategori çubuğu tamamen kaldırılarak yerine 3 büyük, modern akordeon kartı (**Dersler**, **Oyun**, **Araçlar**) yerleştirildi.
- **Akıcı Açılıp Kapanma & Mikro-Etkileşimler:** Her kart kendi satırında bağımsız olarak açılır/kapanır (`aria-expanded`, dönen chevron animasyonu). Kartlar kapalıyken sayfa minimum dikey alana iner, tıklandığında yumuşak framer-motion animasyonuyla altındaki modüller açılır.
- **Odak & Sayfa Ferahlığı:** Kullanıcı tek bir kategoriye odaklanırken diğer kategoriler sayfayı doldurmaz; başparmak ergonomisi ve görsel sadelik en üst düzeye çıkarıldı.

### v1.3.2 - Son Eklenenler Temizliği & Başarı Yol Haritası Konumlandırması
- **Son Eklenenler Bölümü Kaldırıldı:** Anasayfadaki gereksiz dikey yükü ve görsel kalabalığı azaltmak amacıyla "Son Eklenenler" belgeler modülü anasayfa akışından tamamen çıkarıldı.
- **Başarı Yol Haritası Konumlandırması:** Öğrencinin öğrenim hedeflerine ve seviye basamaklarına kolayca erişebilmesi için "Başarı Yol Haritası" bölümü Kategori Hub'ının altındaki Duyurular bölümünün hemen altına taşındı.
- **Güncel Akış Sıralaması:** Hero Karşılama ➔ Kategori Hub'ı (Dersler, Oyun, Araçlar) ➔ Duyurular ➔ Başarı Yol Haritası ➔ LGS/YKS Sayacı ➔ Günün Sözü ➔ Uğur Hoca'ya Yaz.

### v1.3.1 - Mobil Deneyim & Başparmak Ergonomisi Optimizasyonu
- **Sticky Mobil Kategori Barı:** Kullanıcı sayfada nerede olursa olsun, tepeye kaydırmadan başparmağıyla tek tıkla Dersler, Oyun ve Araçlar arasında geçiş yapabilmesi için yapışkan (sticky) kategori kontrolü entegre edildi.
- **Segmented Hap (Pill) Switcher:** Mobilde dikey yer kaplayan hantal kutular yerine tek satırda 3 şık, modern iOS/Android segmented hap buton mimarisine geçildi.
- **4 Sütunlu Ders Uygulama Izgarası (App Grid):** 8 ders materyali mobilde 4 satırlık bloklar yerine sadece 2 satır kaplayan kompakt 4x2 uygulama simgelerine dönüştürüldü; dikey kaydırma mesafesi %60 kısaltıldı.
- **Mobil Araç Filtreleme Çipleri:** Araçlar sekmesinde 12 araç arasında kaybolmayı önlemek için `Tümü`, `🎯 Sınav & Net`, `📖 Formül & İspat`, `⏱️ Plan & Odak` ve `✏️ Tahta & Pratik` hızlı filtre çipleri sunuldu.

### v1.3.0 - Anasayfa Kategori Mimarisi & Sadeleştirilmiş Akış Düzeni
- **Kompakt Kategori Hub'ı:** Sonsuz aşağı kaydırma ve aşırı uzun sayfa yükü ortadan kaldırıldı; içerikler **Dersler**, **Oyun** ve **Araçlar** olmak üzere 3 ana interaktif sekmede toplandı.
- **Dersler Sekmesi:** Yaprak Test, Kitaplar, Kazanımlar, Ders Videoları, Deneme-Sınav, Canlı Ders, Çıkış Bileti, Programlar (oyun hariç 8 ders alanı), son eklenen belgeler, ödevler ve başarı yol haritası bir araya getirildi.
- **Oyun Sekmesi:** Günlük Matematik Meydan Okuması, 60s Hızlı Formül Antrenmanı ve eğlenceli matematik oyunları vitrini olarak yapılandırıldı.
- **Araçlar Sekmesi:** Puan/Net Hesaplayıcı, Pomodoro, Karalama Tahtası, Formül Kartları, Grafik Çizici, LGS Taktik Köşesi ve Günlük Hedef Takipçisi tek çatı altında toplandı.
- **İdeal Sayfa Akışı & Geri Alınabilirlik:** Kategori bölümünün ardından sırasıyla Duyurular ➔ LGS/YKS Sayacı ➔ Günün Sözü ➔ Uğur Hoca'ya Yaz sıralaması uygulandı. Canlı geçiş butonu ve `?layout=classic` parametresiyle kullanıcıların diledikleri an klasik görünüme tek tıkla dönebilmesi sağlandı.

### v1.2.1 - Sohbet Penceresi Kaydırma Yalıtımı, Scrollbar İyileştirmesi & Taşma Koruması
- **Scroll Chaining & Bleed Önleme:** Sohbet penceresi veya mesaj listesi kaydırılırken momentumun arkadaki site sayfasına sıçramasını engelleyen `useScrollContainment` kancası ve CSS overscroll containment mimarisi entegre edildi.
- **Scrollbar İyileştirmesi:** Global kaydırma çubukları 5px'lik zarif, yarı saydam ve yuvarlatılmış modern hap (pill) tasarımına geçirildi; Hızlı Not ve Sembol yatay çubuklarındaki dikkat dağıtıcı kalın çubuklar gizlendi.
- **Yatay Kayma & Taşma Önleme:** Mesaj akış alanına `overflow-x-hidden` ve baloncuklara `break-words [overflow-wrap:anywhere]` uygulanarak dikey kaydırma esnasında oluşabilecek yatay drift (kayma) ve formül taşmaları tamamen önlendi.

### v1.2.0 - Platform Denetimi, SEO, Favicon & Erişilebilirlik Optimizasyonu
- **Favicon & Çoklu Boyut Desteği:** 16x16, 32x32 ve 48x48 piksellik standart `favicon.ico` üretildi, Next.js root layout metadata'sına eksiksiz `icons` tanımları işlendi.
- **Sosyal Önizleme (OG & Twitter):** Kök layout için Open Graph ve Twitter Cards görsel önizleme etiketleri eksiksiz hale getirildi.
- **Sitemap & Robots İyileştirmesi:** `/cikis-bileti` canonical metadata ile `sitemap.xml`'e eklendi; `/sifre-sifirla` ve `/sifremi-unuttum` hassas rotaları arama motoru dizinlerinden (`robots.txt`, `noIndex`) izole edildi.
- **Erişilebilirlik (A11y) & Kod Hijyeni:** `SupportChatPanel` üzerindeki kullanılmayan import temizlendi, ekran okuyucu ve klavye uyumluluğu için `autoFocus` yerine reaktif odaklama mimarisine geçildi.
- **İstatistik İyileştirmesi:** Yönetici panelindeki kayıtlı kullanıcı sayaç filtreleri tüm zamanlar aralığı için optimize edildi.

### v1.1.0 - Sohbet Balonu & Eğitsel İletişim Paketi
- **Canlı Etkileşim:** Supabase Realtime broadcast kanalı üzerinden anlık "yazıyor..." (typing indicator) animasyonu ve mesaj teslim/okundu (✓ / ✓✓) imleri eklendi.
- **Zengin İletişim & Sesli Not:** MediaRecorder destekli sesli mesaj (voice note) kaydı, dalga formlu ses çalar ve mesaj alıntılama/yanıtlama (quote/reply) desteği sunuldu.
- **Çoklu Dosya & PDF:** Çoklu görsel ve PDF soru föyü yükleme/önizleme altyapısı kuruldu.
- **Sohbet İçi Arama & Şablonlar:** Mesajlar arasında canlı arama, öğrenci hızlı soru şablonları ve dinamik eğitmen durum göstergesi entegre edildi.
- **Tema & A11y:** Tam light/dark tema senkronizasyonu, dialog a11y standartları, focus-trap ve otomatik odaklama mekanizması sağlandı.

---

## İletişim

- **Web Sitesi:** [ugurhoca.com](https://ugurhoca.com)
