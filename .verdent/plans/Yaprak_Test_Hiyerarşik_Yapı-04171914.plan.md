## Yaprak Test Sistemi - Uygulama Planı

### Hedef
"Yaprak Test" kategorisi için sınıf düzeyi kartları → kazanım listesi → testler hiyerarşisi oluşturmak.

---

### Adım 1: Veritabanı Tabloları

**Yeni Tablo: `yaprak_test_kazanumlari`**
```sql
id: uuid (primary key)
sinif: integer (5-12) veya 'Mezun'
baslik: text (kazanım adı)
sira: integer (sıralama)
olusturma_tarihi: timestamp
```

**Yeni Tablo: `yaprak_testler`**
```sql
id: uuid (primary key)
kazanım_id: uuid (foreign key -> yaprak_test_kazanumlari)
baslik: text (otomatik: "Test - 1", "Test - 2"...)
sira: integer (kazanım içindeki sıra)
dosya_url: text
cozum_url: text (opsiyonel)
olusturma_tarihi: timestamp
```

---

### Adım 2: İçerik Taşıma

Mevcut `documents` tablosunda `type = 'yaprak-test'` olan kayıtların:
- `type` değerini `'ders-notlari'` olarak güncelle
- Veya yeni tablolara migrate et

---

### Adım 3: Backend API

- `GET /api/yaprak-test/kazanumlar?sinif=5` - Sınıfa ait kazanımlar
- `GET /api/yaprak-test/testler?kazanum_id=xxx` - Kazanıma ait testler
- `POST /api/yaprak-test/kazanum` - Yeni kazanım oluştur
- `POST /api/yaprak-test/test` - Yeni test yükle (otomatik isimlendirme)
- `DELETE /api/yaprak-test/test/:id` - Test sil
- `GET /api/yaprak-test/test-sayisi?kazanum_id=xxx` - Mevcut test sayısı (isimlendirme için)

---

### Adım 4: Frontend Sayfaları

**4a. Sınıf Kartları Sayfası** (`/yaprak-test`)
- 5-12 + Mezun sınıf kartları (mevcut category kartları gibi)
- Her kart: `/yaprak-test?sinif=5` linki

**4b. Kazanım Listesi Sayfası** (`/yaprak-test?sinif=5`)
- Seçili sınıfa ait kazanımlar liste olarak
- Admin için: kazanım ekleme formu

**4c. Test Listesi Sayfası** (`/yaprak-test?sinif=5&kazanum=xxx`)
- Kazanıma ait testler
- Her test: "Test - 1", "Test - 2" formatında
- Admin için: test yükleme formu

---

### Adım 5: Admin Panel Entegrasyonu

- `AdminQuizzesTab.tsx` benzeri yeni `AdminYaprakTestTab.tsx`
- Kazanım CRUD
- Test yükleme (otomatik isimlendirme mantığı)

---

### Değiştirilecek / Ekleneck Dosyalar

| Dosya | İşlem |
|-------|-------|
| `src/app/api/yaprak-test/route.ts` | Yeni API route |
| `src/app/yaprak-test/page.tsx` | Sınıf kartları sayfası |
| `src/features/yaprak-test/containers/YaprakTestPage.tsx` | Ana container |
| `src/features/yaprak-test/components/GradeCard.tsx` | Sınıf kartı componenti |
| `src/features/yaprak-test/components/KazanumList.tsx` | Kazanım listesi |
| `src/features/yaprak-test/components/TestList.tsx` | Test listesi |
| `src/features/yaprak-test/queries.ts` | Backend sorguları |
| `src/features/admin/components/tabs/AdminYaprakTestTab.tsx` | Admin panel |

---

### DoD (Definition of Done)
- [ ] Yeni veritabanı tabloları oluşturuldu
- [ ] Sınıf kartları görüntüleniyor (5-12 + Mezun)
- [ ] Kazanım listesi çalışıyor
- [ ] Test yükleme ve otomatik isimlendirme çalışıyor
- [ ] Mevcut yaprak testler ders notlarına taşındı
