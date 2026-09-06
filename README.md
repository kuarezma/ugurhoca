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
