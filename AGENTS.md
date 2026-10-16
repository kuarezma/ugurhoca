# Uğur Hoca — repo kuralları

Güncel 5–8. sınıf yıllık plan kaynağı: `matematik-platform/data/annual-plan/GUNCEL_KAYNAK.md`. Kullanıcının 10 Ekim 2026'da güncel olarak belirttiği Excel esas alınır.

Uygulama kodu `matematik-platform/` altındadır. Kural önceliği:

1. `matematik-platform/CLAUDE.md` — tema token sözlüğü (`text-white` yasağı vb.)
2. `matematik-platform/AGENTS.md` — Next.js agent kuralları
3. `docs/web-kalite-ve-profesyonellik-plan.md` — bağlayıcı kısıt: font/renk/tema/düzen değişmez, yalnızca teknik optimizasyon (+ 2026-09-10 karar kaydı)
4. `matematik-platform/site.md` — ürün kısıtları: ücretli paket/abonelik yok, öğrenci izolasyonu
5. `task.md` — görev günlüğü (sayılar için diske bak: `find matematik-platform/src -name "*.test.*"`)

Güvenlik sınırları: yetki her zaman server'da (`requireAdmin` / `getVerifiedServerUser` + RLS); middleware çerezi UX kısayoludur. `supabase/migrations/` tek şema kaynağıdır (`docs/archive-supabase-setup.legacy.sql` çalıştırılmaz).

## Web Paylaşımı ve Gizlilik İlkeleri (Zorunlu Kural)
- Web sitesine (`ugurhoca.com` / `matematik-platform`), Google Drive paylaşım klasörlerine veya veritabanına (`public.documents` vb.) yüklenen hiçbir yaprak testte, çalışma kağıdında, PDF'te veya içerik açıklamasında **Okul Müdürü ismi** (`Okul Müdürü`, `Mustafa ÖZKAN`, `Ali Rıza HACIOĞLU` vb.), **özel ders** ibaresi/materyali veya **öğrenci/veli kişisel verileri** kesinlikle yer almaz.
- Paylaşılan materyallerde yalnızca ders öğretmeni künyesi (`Uğur YAŞAYAN • Matematik Öğretmeni`) bulunur; yükleme öncesinde tüm PDF metinleri (`pdftotext`) ve veritabanı alanları bu gizlilik filtresinden geçirilir.

## Otonom Git ve Dağıtım Protokolü
Her tamamlanan işten sonra (geliştirme, hata düzeltme, refactor veya mekanik doğrulama sonrasında) tüm değişiklikler onay beklenmeksizin otomatik olarak sahneye alınır (`git add .`), konvansiyonel anlamlı bir commit mesajıyla commit edilir ve derhal uzak depoya push edilir (`git push origin <branch>`).
