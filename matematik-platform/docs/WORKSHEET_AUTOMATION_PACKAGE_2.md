# Yaprak Test Otomasyonu Paket 2 Notları

Paket 2, mevcut otomasyonu bozmadan kaynak güvenliğini ve başlık tutarlılığını iyileştirir.

## Başlık Standardı

Yeni aday ve yayınlanan yaprak testlerde standart yapı kullanılır:

```text
8. Sınıf Matematik - Üslü İfadeler - Yaprak Test 01
```

- Aday listesinde sıra numarası olmayan başlık gösterilir.
- Yayın sırasında aynı sınıf ve kazanım için `01`, `02`, `03` sırası verilir.
- Google Drive dosya adı aynı başlığa `.pdf` eklenerek oluşturulur.
- Eski `Konu (Test-1)` başlıkları okunmaya devam eder.

## Kaynak Güvenliği

Kaynaklar virgülle veya satır satır yazılabilir. Sadece public `http/https` adresleri kabul edilir.

Şu adresler kaynak veya izinli host olarak geçerli değildir:

- `localhost`
- `*.local`
- `127.x.x.x`
- `10.x.x.x`
- `172.16.x.x` - `172.31.x.x`
- `192.168.x.x`

## Eşleşme Kalitesi

- Sınıf biçimleri daha esnek algılanır: `8. sınıf`, `8-sinif`, `8_sinif`, `8sinif`.
- Yanlış sınıf geçen PDF adayları elenir veya düşük puanlanır.
- Link metni `İndir` gibi genel olsa bile PDF dosya adı skorlamaya katılır.
- Konu boşsa başlık, kazanım metninden temizlenerek üretilir.

## Doğrulama

Paket 2 için hedef testler ve tam test paketi çalıştırıldı:

- Hedef testler: `29 passed`
- Tam test paketi: `201 passed`
- `npm run typecheck`
- `npm run lint`

## Paket 3 İçin Küçük Adaylar

Paket 3 ayrı ve küçük tutulmalıdır. Önerilen adaylar:

- Kaynak sağlık raporu: kaç kaynak erişilebilir, kaçında PDF var, kaç kaynak atlandı.
- Admin aday listesinde düşük/orta/yüksek eşleşme etiketi.
- Aynı PDF'nin farklı kaynaklardan gelmesi durumunda kaynak bilgisini daha görünür gösterme.
- Onay öncesi PDF başlığını elle düzeltme alanı.

İlk Paket 3 işi başlatıldı: admin kaynak durumu artık ağ taraması yapmadan toplam/geçerli/geçersiz kaynak ve izinli alan adı sayılarını gösterir.

Görünen sağlık özeti:

```text
Kaynak özeti: 2 geçerli, 1 geçersiz, 2 izinli alan adı.
```

Yıllık plan sekmesi de aynı bilgiyi uyarı metninde kullanır; kaynak yoksa kaynak bağlantısı eklemeyi, geçersiz kaynak varsa bağlantıları kontrol etmeyi söyler.
