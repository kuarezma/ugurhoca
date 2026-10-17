# Güncel yıllık plan — 2026–2027

Kullanıcı 10 Ekim 2026'da `MATEMATİK (5-8. SINIF) TASLAK ÇERÇEVE YILLIK PLAN+++ 2.xlsx` dosyasını, 17 Ekim 2026'da ise Öğretmen Evrak üzerinden Uğur YAŞAYAN adına üretilen resmi yıllık plan Word (.docx) dosyalarını en güncel kaynak olarak belirledi.

Bu kaynakların değiştirilmemiş kopyaları:
- Çerçeve plan: [2026-2027.xlsx](2026-2027.xlsx)
- Resmi Öğretmen Evrak Word planları (17.10.2026): [ogretmen_evrak/](ogretmen_evrak/)
  - 5. Sınıf: `5-sinif-matematik-maarif-m-yillik-plan-ogretmenevrak-1792259133.docx`
  - 6. Sınıf: `6-sinif-matematik-maarif-m-yillik-plan-ogretmenevrak-1792259200.docx`
  - 7. Sınıf: `7-sinif-matematik-maarif-m-yillik-plan-ogretmenevrak-1792259221.docx`
  - 8. Sınıf: `8-sinif-matematik-ugur-yasayan-yillik-plan-ogretmenevrak-1792259249.docx`

Tüm dosya adları, zaman damgaları ve SHA-256 parmak izi kayıtları [source.json](source.json) dosyasındadır.

5–8. sınıf konu ve kazanım takviminde bu kaynak esas alınır. 7. sınıfın ilk haftası **Tam Sayılar / Rasyonel Sayılar ve Farklı Temsilleri**, öğrenme çıktısı **MAT.7.1.1**'dir.

Web içe aktarma dosyası depo kökündeki [yillik-plan-2026-2027.csv](../../../yillik-plan-2026-2027.csv) dosyasıdır. 178 konu/hafta satırı içerir: 5. sınıf 41, 6. sınıf 45, 7. sınıf 50, 8. sınıf 42. Tatil, sosyal etkinlik ve okul temelli planlama satırları mevcut dönüştürücü tarafından içe aktarma CSV'sine alınmaz; özgün dosyalarda korunur. Ortak kazanımlı konular içe aktarıcıda aynı sınıf/hafta/kazanım anahtarıyla tek kayıt içinde birleştirilir; bütün konu adları korunur. 178 sayısı veritabanına eklenen kayıt sayısı değildir.

`matematik-platform/` dizininde `npm run prepare:annual-plan` komutu kaynak Excel'den CSV'yi yeniden üretir. Sonrasında `npm run test:fast -- scripts/meb-annual-plan-to-csv.test.ts src/lib/annual-plan-import.test.ts` kaynak parmak izini, CSV eşleşmesini ve içe aktarma davranışını doğrular.

Ayrıca `src/lib/annual-plan-import.ts` ve `scripts/preview-annual-plan.mjs` doğrudan resmi Öğretmen Evrak çok tablolu Maarif DOCX dosyalarını ayrıştırabilecek şekilde güncellenmiş ve testlerle güvenceye alınmıştır.
