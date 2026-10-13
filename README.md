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
- 📊 **Aylık Gelişim Karnesi & Başarı Belgesi:** Öğrencinin çalışma süresini ve konu hakimiyetini gösteren aylık raporlar ile başarıyı taçlandıran yazdırılabilir başarı sertifikası.
- 🎮 **19 Eğitici Matematik Oyunu:** Zihinden işlem, koordinat bulma, kesirler ve çarpanları eğlenerek pekiştiren özgün matematik oyunları.
- 📝 **Ödev Takibi & Çalışma Kağıtları:** Öğretmenin verdiği ödevleri tek ekrandan takip etme, sisteme yükleme ve tek tıkla yazdırılabilir A4 çalışma kağıtları.
- 💬 **Gelişmiş Sohbet Balonu & 1-e-1 Eğitmen İletişimi:** Gerçek zamanlı "yazıyor..." göstergesi, iletildi/okundu (✓✓) teyidi, formül ve soru alıntılama (reply/quote), 60 saniyelik sesli not gönderme ve dahili ses oynatıcısı, çoklu görsel ve PDF soru föyü yükleme, sohbet içi arama ve tek tıkla öğrenci hızlı soru şablonları.
- 📱 **Tüm Cihazlarda Kusursuz:** Bilgisayar, tablet ve akıllı telefonlarda rahat kullanım; tek tıkla ana ekrana uygulama gibi ekleme kolaylığı.

---

## Kurulum ve Geliştirme

Uygulama kaynak kodu `matematik-platform/` dizini altındadır.

```bash
# Bağımlılıkları yükle
npm --prefix matematik-platform install

# Geliştirme sunucusunu başlat (http://localhost:3000)
npm --prefix matematik-platform run dev

# Tip kontrolü, lint, birim testleri ve üretim derlemesi
npm --prefix matematik-platform run typecheck
npm --prefix matematik-platform run lint
npm --prefix matematik-platform run test:fast
npm --prefix matematik-platform run build
```

---

## Öğrenci Gizliliği ve Güvenliği

Platformda öğrenci gizliliği en üst düzeyde korunur:
- Öğrencinin çözdüğü testler, çalışma süreleri ve ödevleri tamamen kendisine özeldir.
- Oyunlarda ve etkinlik listelerinde gerçek isim yerine rumuz kullanılır.
- Hiçbir öğrenci bir başkasının sonuçlarını veya mesajlarını göremez.

---

## İletişim

- **Web Sitesi:** [ugurhoca.com](https://ugurhoca.com)
