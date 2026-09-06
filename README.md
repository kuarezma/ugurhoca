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

### v1.4.9 - Mobil Alt Menü "Testler" & "Odak" Olarak Güncellendi, Özel Odak & Pomodoro Sayfası Eklendi (`/odak-pomodoro`)
- **Mobil Gezinme Çubuğu Güncellemesi:**
  - 2. sıradaki "İçerikler" etiketi doğrudan **"Testler"** (`/testler`) olarak güncellendi.
  - 3. sıradaki menü öğesi **"Odak"** (`/odak-pomodoro`, `Timer` ikonu) ile değiştirildi. Böylece mobil kullanıcılar tek dokunuşla Pomodoro ve derin odaklanma seanslarına erişebiliyor.
  - Yeni mobil sekme sırası: **Ana Sayfa** · **Testler** · **Odak** · **Oyunlar** · **Profil**.
- **Yeni Odak & Pomodoro Zamanlayıcı Sayfası (`/odak-pomodoro`):**
  - **4 Zamanlayıcı Modu:** 25 Dk Standart Odak, 50 Dk Derin Odak, 5 Dk Kısa Mola, 10 Dk Uzun Mola.
  - **Büyük Dijital Sayaç & İlerleme Çubuğu:** Kalan süre, animasyonlu ilerleme ve tarayıcı sekme başlığında dinamik geri sayım (`🍅 24:59`, `☕ 04:59`).
  - **Dahili Web Audio Ambiyans Sesleri:** Sıfır ağ maliyetli saf Web Audio API sentezleyicisi (Sessiz, Kahverengi Gürültü, Pembe Gürültü, 432 Hz Zihin Akordu).
  - **Hedef Belirleme & Taktik Kartları:** Seans odak konusu girişi, tamamlanan pomodoro sayacı ve matematik çalışma tüyoları.

### v1.4.8 - "Meydan Okuma" Tıklanınca Açılan Özel Sayfaya Dönüştürüldü (`/meydan-okuma`)
- **Doğrudan Sayfa Yönlendirmeli Kart:** Kullanıcı isteği doğrultusunda "Meydan Okuma" kartı, tıpkı Yaprak Test, Oyunlar ve Canlı Ders kartları gibi tıklandığında yeni sayfa açan (`/meydan-okuma`) bağımsız bir gezinme kartına dönüştürüldü.
- **Ana Sayfa Alt Blokları Kaldırıldı:** Kategori kartının altında sürekli açık veya akordeon şeklinde ekstra bir bölüm tutulmadı; kartın altı tamamen sadeleştirilerek yalnızca "Ders" ve "Araçlar" korundu.
- **Özel Meydan Okuma Sayfası (`/meydan-okuma`):** 4 temel bölüm (**Günün Matematik Meydan Okuması**, **Günlük Soru Hedefim**, **LGS Matematik Taktik Köşesi**, **Başarı Yol Haritası**) yeni `/meydan-okuma` sayfasında ferah bir hero başlık, hızlı çapa linkleri ve odaklanmış tam ekran deneyimiyle sunuldu.

### v1.4.7 - "Meydan Okuma" 4. Kart Olarak Eklendi & Dağınık 4 Bölüm Hub İçine Taşındı
- **Öne Çıkan 4'lü Vitrin:** Üstteki 3 kartın (Yaprak Test, Oyunlar, Canlı Ders) yanına 4. olarak sıcak ateş/kupa gradyanlı **"Meydan Okuma"** kartı eklendi.
  - **Masaüstünde:** Soldan sağa 4 eşit sütun: **Yaprak Test** · **Oyunlar** · **Canlı Ders** · **Meydan Okuma**.
  - **Mobilde:** Kusursuz 2×2 simetrik ızgara: Üstte **Yaprak Test** & **Oyunlar**, altta **Canlı Ders** & **Meydan Okuma**.
- **Meydan Okuma Açılır Hub:** Ana sayfada dağınık duran 4 bölüm (**Başarı Yol Haritası**, **Günün Matematik Meydan Okuması**, **Günlük Soru Hedefim**, **LGS Matematik Taktik Köşesi**) doğrudan Meydan Okuma hub'ının içerisine taşındı.
  - Hızlı sekme filtreleri (`📋 Tümü`, `⚡ Günün Sorusu`, `🎯 Soru Hedefim`, `💡 LGS Taktikleri`, `🗺️ Yol Haritası`) ile öğrenci ister tek tek ister tümünü aynı anda inceleyebilir.
- **Sadeleşen Ana Sayfa Akışı:** Dağınık widget'ların kaldırılmasıyla ana sayfa akışı tam olarak sadeleşti:
  Hero (4 Kart + Meydan Okuma Hub + 6'lı Ders + 12'li Araçlar) ➔ Duyurular ➔ LGS/YKS Sayacı ➔ Günün Sözü ➔ Uğur Hoca'ya Yaz ➔ Footer.

### v1.4.6 - Öne Çıkan Kart Sıralaması Güncellendi (Yaprak Test · Oyunlar · Canlı Ders)
- **Kullanıcı İsteğine Göre Yeniden Sıralama:**
  - **Masaüstünde:** Solda **Yaprak Test**, ortada **Oyunlar**, sağda **Canlı Ders** olarak 3 eşit sütun halinde konumlandırıldı.
  - **Mobilde:** En üstte tam genişlikte **Yaprak Test**, hemen altında yan yana **Oyunlar** (sol) ve **Canlı Ders** (sağ) düzeni uygulandı.

### v1.4.5 - Yaprak Test Üst Vitrine 3. Kart Olarak Eklendi & Ders Kategorisi 6'lı Kusursuz Simetriye Ulaştı
- **Öne Çıkan 3'lü Vitrin Kartları:** "Yaprak Test", Canlı Ders ve Oyunlar'ın yanına 3. parlak kart olarak eklendi. Mobilde üstte tam genişlikte Canlı Ders, altında yan yana Yaprak Test ve Oyunlar (1 Geniş + 2 Yan Yana) düzeniyle kaydırma gerektirmeden tam görünürlük sağlandı. Masaüstünde ise yan yana 3 sütunlu altın üçgen (Canlı Ders · Yaprak Test · Oyunlar) oluşturuldu.
- **"Ders" Kategorisinde Kusursuz 6'lı Simetri:** Yaprak Test'in üst vitrine taşınmasıyla Ders kartı içerisindeki materyal sayısı 6'ya indi; böylece 3 sütunlu ızgarada tam 2 satır (2×3 = 6) kusursuz simetrik dikdörtgen yapı elde edildi.

### v1.4.4 - Hızlı Erişim "Ders" Kartına Dönüştürüldü & Oyunlar ile Canlı Ders Öne Çıkarıldı
- **Canlı Ders ve Oyunlar Kartları:** Karşılama ve maskotun hemen altına yan yana, renkli, parlak (glow efektli) ve öğrencilerin dikkatini çeken büyük öne çıkan kartlar olarak yerleştirildi.
- **"Ders" Açılır Kategori Kartı:** "Hızlı erişim" başlığı "Ders" olarak yenilendi; Araçlar kartıyla birebir aynı açılır-kapanır (varsayılan açık) tasarım diline kavuşturuldu. İçerisinde yalnızca 7 temel ders materyali (Yaprak Test, Kitaplar, Kazanımlar, Ders Videoları, Deneme-Sınav, Çıkış Bileti ve Programlar) 3 sütunlu yatay kartlar halinde listelendi.

### v1.4.3 - Günlük Meydan Okuma, Soru Hedefi ve LGS Taktik Köşesi Sayfa Altına Eklendi
- **Günlük Çalışma Kartları Sayfa Altına Yerleştirildi:** Öğrencinin günlük motivasyonunu ve çalışma disiplinini artıran "Günün Matematik Meydan Okuması", "Günlük Soru Hedefim" ve "LGS Matematik Taktik Köşesi" bileşenleri, sayfanın üst kısmını kalabalıklaştırmayacak şekilde sayfanın en altına konumlandırıldı.

### v1.4.2 - Hızlı Erişim Kategorilerinin Yatay 3'lü Izgaraya Dönüşümü & Araçların Açık Tutulması
- **Hızlı Erişim Kartları Yenilendi:** Üstteki 9 ders kategorisi, altındaki Araçlar kartlarıyla birebir aynı tasarım diline kavuşturuldu; 4'lü dikey bloklar yerine zarif, yatay, kompakt 3 sütunlu (3x3 = 9 kategori) ızgara yapısına geçirildi. Her kartta sol renkli ikon, başlık, alt açıklama ve yönlendirici ok simgesi yer aldı.
- **Araçlar Bölümü Hep Açık:** Kullanıcı beğenisi doğrultusunda 12 aracın listelendiği açılır "Araçlar [12 ARAÇ]" kartı, sayfa açılışında varsayılan olarak hep açık tutuldu (`isToolsOpen: true`).

### v1.4.1 - Anasayfa Sadeleştirme & Açıkta Kalan Araçların ve Ekstra Blokların Temizliği
- **Açıkta Kalan 12 Araç ve Fazlalıklar Kaldırıldı:** 12 araç Hızlı Erişim içerisindeki açılır "Araçlar" kartına toplandığından, ana sayfada açıkta yer kaplayan `HomeQuickToolsGrid` tamamen kaldırıldı. Ayrıca `HomeDailyChallenge`, `HomeDailyGoalWidget`, `LgsTacticsCorner`, `HomeRecentDocumentsSection` ve `HomeStatsStrip` temizlendi.
- **Sadece İstenen 6 Ana Bölüm Bırakıldı:**
  1. **Karşılama Ekranı (Hero):** Hızlı Erişim kategorileri + Gönderilen resimdeki açılır "Araçlar [12 ARAÇ]" kartı.
  2. **Duyurular:** Önemli güncellemeler ve bildirimler.
  3. **Başarı Yol Haritası:** Duyuruların hemen altında yer alan basamaklar.
  4. **LGS ve YKS Sayacı:** Geri sayım ve hızlı puan hesaplama geçişi.
  5. **Günün Sözü:** Motivasyon kartı.
  6. **Uğur Hoca'ya Yaz:** Eğitmenle doğrudan iletişim paneli.

### v1.4.0 - Orijinal Anasayfa Akışına Dönüş & Hızlı Erişimde Açılır "Araçlar (12 Araç)" Kartı
- **Orijinal Anasayfa Düzenine Dönüş:** Anasayfa önceki sekmeli veya akordeonlu hub yerine sevilen orijinal, dengeli ve zengin sayfa akışına (Hero ➔ Günlük Meydan Okuma ➔ Hedef Takipçisi ➔ Taktik Köşesi ➔ Yol Haritası ➔ Duyurular ➔ Geri Sayım Sayacı ➔ Belgeler) geri döndürüldü.
- **Hızlı Erişimde Açılır Araçlar Kartı:** Hızlı erişim kategorilerinin hemen altına kullanıcının belirlediği "Araçlar [12 ARAÇ]" açılır akordeon kartı yerleştirildi.
- **12 Aracın Sıralı Listesi:** Karta tıklandığında yumuşak bir animasyon ve dönen chevron oku ile 12 araç (LGS/YKS Net Hesaplama, Pomodoro, Karalama Tahtası, Formül Kartları, Kural Tablosu, Grafik Çizici, Görsel İspatlar, Taktik Köşesi, Sözlük, Soru Ağırlıkları, Çalışma Planı) dikey olarak sıralanır ve doğrudan modal aksiyonlarını çalıştırır.

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
