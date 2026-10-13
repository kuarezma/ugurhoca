# Güncel yıllık plan — 2026–2027

Kullanıcı 10 Ekim 2026'da `MATEMATİK (5-8. SINIF) TASLAK ÇERÇEVE YILLIK PLAN+++ 2.xlsx` dosyasını en güncel kaynak olarak belirledi. Bu dosyanın değiştirilmemiş kopyası [2026-2027.xlsx](2026-2027.xlsx), kaynak adı ve SHA-256 kaydı [source.json](source.json) dosyasındadır. Dosyanın adındaki “taslak” ifadesi korunur; güncellik kabulü kullanıcının bildirimine dayanır.

5–8. sınıf konu ve kazanım takviminde bu kaynak esas alınır. 7. sınıfın ilk haftası **Tam Sayılar / Rasyonel Sayılar ve Farklı Temsilleri**, öğrenme çıktısı **MAT.7.1.1**'dir.

Web içe aktarma dosyası depo kökündeki [yillik-plan-2026-2027.csv](../../../yillik-plan-2026-2027.csv) dosyasıdır. 178 konu/hafta satırı içerir: 5. sınıf 41, 6. sınıf 45, 7. sınıf 50, 8. sınıf 42. Tatil, sosyal etkinlik ve okul temelli planlama satırları mevcut dönüştürücü tarafından içe aktarma CSV'sine alınmaz; özgün Excel'de korunur. Ortak kazanımlı konular içe aktarıcıda aynı sınıf/hafta/kazanım anahtarıyla tek kayıt içinde birleştirilir; bütün konu adları korunur. 178 sayısı veritabanına eklenen kayıt sayısı değildir.

`matematik-platform/` dizininde `npm run prepare:annual-plan` komutu kaynak Excel'den CSV'yi yeniden üretir. Sonrasında `npm run test:fast -- scripts/meb-annual-plan-to-csv.test.ts src/lib/annual-plan-import.test.ts` kaynak parmak izini, CSV eşleşmesini ve içe aktarma davranışını doğrular.

CSV yönetici panelinin Yıllık Plan sekmesinden mevcut içe aktarma akışıyla yüklenebilir. Bu entegrasyon yerel kaynak dosyalarını bağlar; canlı veritabanına aktarım ve site yayını ayrı işlemlerdir. Excel'in özgün çok sayfalı düzeni için önce CSV dönüştürme komutu kullanılır.
