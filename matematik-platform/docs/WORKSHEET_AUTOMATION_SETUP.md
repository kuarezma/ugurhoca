# Yaprak Test Otomasyonu Kurulum Kontrol Listesi

Bu özellik yıllık planı okuyup haftanın kazanımına göre PDF adaylarını bulur, onaylanan PDF'yi Google Drive'a kopyalar ve öğrencilerin paneline/bildirimlerine düşürür.

## Ortam Değişkenleri

Vercel ve yerel `.env.local` için:

| Değişken | Açıklama |
| --- | --- |
| `WORKSHEET_CANDIDATE_SOURCE_URLS` | Virgülle ayrılmış izinli kaynak sayfaları veya PDF URL'leri |
| `WORKSHEET_CANDIDATE_ALLOWED_HOSTS` | İsteğe bağlı. Boşsa kaynak URL alan adları otomatik izinli sayılır |
| `GOOGLE_DRIVE_CLIENT_ID` | Google OAuth istemci ID |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Google OAuth istemci secret |
| `GOOGLE_DRIVE_REDIRECT_URI` | Örn. `https://www.ugurhoca.com/api/admin-google-drive/callback` |
| `CRON_SECRET` | Vercel cron endpoint'i için Bearer token |

## Supabase

Migration'lar uygulanmalı:

- `annual_plan_items`
- `worksheet_candidates`
- `google_drive_connections`

Supabase CLI bağlı değilse SQL Editor için tek dosya üretin:

```bash
npm run setup:worksheets:sql
```

Oluşan dosyayı Supabase Dashboard > SQL Editor içinde çalıştırın:

```text
data/worksheet-automation-setup.sql
```

## Kurulum Kontrolü

Yerelde gizli değerleri göstermeden temel ayarları kontrol etmek için:

```bash
npm run setup:worksheets:check
```

Yıllık plan dosyasını yüklemeden önce ilk satırlarını görmek için:

```bash
npm run preview:annual-plan -- ./dosya.docx
```

Admin paneli kullanmadan yıllık planı komutla içe aktarmak için önce kontrol edin:

```bash
npm run import:annual-plan -- ./dosya.docx
```

Kontrol doğruysa veritabanına yazın:

```bash
npm run import:annual-plan -- ./dosya.docx --write
```

Kaynak sayfaların erişilip PDF linki verdiğini kontrol etmek için:

```bash
npm run setup:worksheets:source
```

## Kaynak URL Ayarı

`WORKSHEET_CANDIDATE_SOURCE_URLS` alanına PDF dosyası veya PDF linkleri içeren kaynak sayfalar yazılabilir:

```bash
WORKSHEET_CANDIDATE_SOURCE_URLS=https://ornek-site.com/8-sinif-testler,https://ornek-site.com/test.pdf
```

`WORKSHEET_CANDIDATE_ALLOWED_HOSTS` boş bırakılırsa kaynak URL'lerin alan adları otomatik izinli sayılır. Daha sıkı kontrol istenirse virgülle alan adı yazılabilir:

```bash
WORKSHEET_CANDIDATE_ALLOWED_HOSTS=ornek-site.com,baska-kaynak.com
```

## Google Drive OAuth

1. Google Cloud Console'da bir OAuth istemcisi oluştur.
2. Uygulama türü olarak **Web application** seç.
3. Authorized redirect URI alanına canlı site için şunu ekle:

```text
https://www.ugurhoca.com/api/admin-google-drive/callback
```

4. Yerelde deneme yapılacaksa bunu da ekle:

```text
http://localhost:3000/api/admin-google-drive/callback
```

5. Oluşan client ID ve client secret değerlerini `.env.local` ve Vercel Environment Variables içine ekle.

## Yıllık Plan Dosyası

Desteklenen formatlar:

- `.csv`
- `.docx`
- `.xlsx`

Eski `.doc` ve `.xls` dosyaları desteklenmez. Gerekirse Word üzerinden `.docx`, Excel veya Google Sheets üzerinden `.xlsx` ya da `.csv` olarak dışa aktarın.

Word dosyası tablo içermelidir. Doğrudan deneme için örnek dosya:

```bash
npm run preview:annual-plan -- data/8-sinif-yillik-plan-deneme.docx
```

Word tablosunda şu başlıklar desteklenir:

Zorunlu kolonlar:

- `sinif`
- `hafta_baslangic`
- `hafta_bitis`
- `konu`
- `kazanim`

Alternatif Word başlıkları:

- `Tarih` kolonu `18-24 Mayıs 2026` gibi hafta aralığı içerebilir.
- `Öğrenme Alanı` veya `Ünite` kolonu `konu` yerine kullanılabilir.
- `Kazanımlar` kolonu `kazanim` yerine kullanılabilir.
- Dosya adında `8-sinif` gibi sınıf bilgisi varsa `sinif` kolonu eksik olabilir.

Maarif yıllık plan formatı da desteklenir:

- `TARİH`
- `KONU (İÇERİK ÇERÇEVESİ)`
- `ÖĞRENME ÇIKTILARI`

Tarih örnekleri:

- `08-12 Eylül`
- `29-03 Eylül-Ekim`

Bu formatta yıl yazmıyorsa akademik yıl otomatik yorumlanır.

Opsiyonel kolon:

- `aciklama`

## Canlı Test Sırası

1. Admin panelde **Yıllık Plan > Örnek CSV İndir** ile şablonu indir veya `data/8-sinif-yillik-plan-deneme.docx` dosyasını kullan.
2. Şablonu/dosyayı doldurup yıllık planı içe aktar.
3. **Yaprak Test Adayları** ekranında kaynak ayarının hazır göründüğünü kontrol et.
4. Google Drive hesabını bağla.
5. **Bu Haftayı Tara** ile aday oluştur.
6. Bir adayı PDF/kaynak linkinden kontrol et.
7. **Drive'a Yayınla** ile yayınla.
8. İçeriklerde ilgili sınıf/kazanım klasöründe testin göründüğünü kontrol et.
9. Öğrenci hesabında bildirim ve **Bugünkü Plan** önerisini kontrol et.

## Notlar

- Kaynak ayarı eksikse haftalık tarama butonu pasif kalır.
- Yayınlanan PDF Drive'a kopyalanır; öğrenciye Drive bağlantısı gösterilir.
- Bildirim/paylaşım hatası olursa yaprak test yayında kalır, admin uyarı görür.
