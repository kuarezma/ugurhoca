# Ugur Hoca Platform Profesyonellestirme MVP Plani

## Summary
- Amac: platformu profesyonel, guvenli, ucretsiz, olculebilir ve admin acisindan kullanisli hale getirmek.
- Oncelik sirasi: ogrenci gizliligi, admin takip merkezi, rumuzlu oyun liderligi, fotograflı sohbet, guven paketi, canli olcum/analitik.
- Ana gizlilik kurali: hicbir ogrenci baska ogrencinin adini, e-postasini, profilini, odevini, yorumunu, mesajini, skor gecmisini, calisma hareketini, haftalik planini veya yazilarini goremez.
- Platform tamamen ucretsizdir. Para, ucretli uyelik, abonelik, odeme, paket, premium plan veya satin alma gibi konulardan hicbir yerde soz edilmeyecek.
- Veli odakli urun hedefi yoktur. Veli paneli, veliye ozel metinler, veli raporlari veya veli akislar bu planda yer almayacak.

## Key Changes
- Admin paneline "Takip Merkezi" ve "Canli Dashboard" eklenecek:
  - Riskteki ogrenciler, 7+ gun pasif kalanlar, eksik/gecikmis odevler, dusuk test skoru, haftalik hedef durumu, okunmamis mesajlar.
  - Sinif, risk seviyesi, favori, takip etiketi, takip tarihi ve aktivite durumuna gore filtreleme.
  - Ogrenci kartindan hizli aksiyon: profil ac, mesaj gonder, haftalik plan olustur, takip etiketi ekle.
- Ogrenci profil cekmecesi gelistirilecek:
  - Admin notlari, takip durumu, etiketler, takip tarihi.
  - Haftalik plan olusturma ve plan maddeleri.
  - Son aktivite, haftalik calisma, son test, odev durumu ve risk ozeti.
- Ogrenci paneline "Bu Haftaki Plan" eklenecek:
  - Ogrenci yalnizca kendi planini gorecek.
  - Plan maddeleri odev/test/icerik baglantili veya ozel gorev olabilir.
  - Ogrenci sadece kendi plan maddesini tamamlandi olarak isaretleyebilir.
- Sohbet balonuna fotograf ekleme destegi eklenecek:
  - Mevcut sohbet balonu duzeni korunacak.
  - Mesaj yazma alaninin yanina kucuk fotograf/atac ikonu eklenecek.
  - Ogrenci cozemedigi sorunun fotografini Ugur Hoca'ya gonderebilecek.
  - Admin ayni sohbetten cozdurdugu sorunun fotografini ogrenciye gonderebilecek.
  - Sadece gorsel dosyalar kabul edilecek: JPG, PNG, WebP.
  - Dosya boyutu siniri uygulanacak.
  - Gonderim oncesi kucuk onizleme ve kaldirma butonu olacak.
  - Metinsiz sadece fotograf gonderilebilir; fotograf + aciklama da gonderilebilir.
- Oyun liderlik tablosu rumuzlu hale getirilecek:
  - Gercek ad hicbir kosulda gorunmeyecek.
  - Ogrenci ilk skor oncesi zorunlu rumuz sececek.
  - Eski skorlar silinmeyecek; rumuz secilene kadar liderlikte gorunmeyecek.
  - Liderlik tablosu sadece giris yapan kullanicilara acik olacak.
- Ana sayfa "Guven Paketi" ile guclendirilecek:
  - Ogrenci gizliligi, ucretsiz kullanim ve veri guvenligi net anlatilacak.
  - "Nasil calisir" bolumu eklenecek: kayit ol, calis, test coz, odevlerini takip et, Ugur Hoca'dan geri bildirim al.
  - Kayit/giris ekranlarinda veri gizliligi notlari olacak.
  - Footer'da gizlilik, KVKK, cerez ve iletisim baglantilari daha gorunur olacak.
  - "Uyelik", "ucretli plan", "premium", "abonelik", "satin al", "odeme" gibi ifadeler kullanilmayacak.
- Olcum/analitik katmani eklenecek:
  - Bugun aktif ogrenci, pasif ogrenciler, test/odev/calisma trendleri.
  - En cok kullanilan icerikler, az kullanilan icerikler.
  - Ogrenci bazli mini analitik.
  - Core Web Vitals takip listesi.

## Interfaces And Data
- Yeni tablolar:
  - `game_aliases`: `user_id`, `alias`, `alias_normalized`, timestamps.
  - `student_admin_statuses`: `student_id`, `status`, `labels`, `follow_up_at`, `last_contacted_at`, timestamps.
  - `student_admin_notes`: `student_id`, `author_id`, `body`, timestamps.
  - `student_weekly_plans`: `student_id`, `author_id`, `week_start`, `title`, `target_minutes`, `status`, timestamps.
  - `student_weekly_plan_items`: `plan_id`, `kind`, `title`, `linked_id`, `href`, `due_at`, `sort_order`, `completed_at`, `completed_by`.
  - `student_activity_events`: `user_id`, `event_type`, `entity_type`, `entity_id`, `created_at`, `metadata`.
- Sohbet fotograf destegi:
  - Mevcut `notifications.metadata.image_url` ve `attachments` yapisi kullanilacak.
  - Ogrenci tarafinda mevcut `uploadSupportFiles` akisi sohbet balonuna baglanacak.
  - Admin tarafinda ayni panel icin gorsel upload helper'i eklenecek veya ortaklastirilacak.
  - Admin mesaj route'u `image_url` alanini destekliyor; UI ve upload akisi tamamlanacak.
- RLS/gizlilik kurallari:
  - `profiles`: ogrenci sadece kendi profilini okuyabilir; admin tumunu okuyabilir.
  - `shared_documents`: sadece ilgili ogrenci ve admin.
  - `assignments`: sinif geneli odev ilgili sinifa; kisisel odev sadece ilgili ogrenciye.
  - `assignment_submissions`: ogrenci sadece kendi teslimini; admin tum teslimleri.
  - `notifications`, `study_sessions`, `user_progress`, `study_goals`, `quiz_results`, `notes`: ogrenci sadece kendi satirlarini.
  - `game_scores`: ogrenci sadece kendi skorlarini; genel tablo sadece rumuzlu RPC/view uzerinden.
  - `comments`: herkese acik ogrenci yorumu kaldirilir veya ogrenci-admin ozel soru modeline cevrilir.
- Yeni RPC/view:
  - `get_game_leaderboard(period)` sadece `rank`, `alias`, `total_score` dondurur.
  - `complete_weekly_plan_item(item_id, completed)` sadece ilgili ogrenci icin calisir.
- Rumuz validasyonu:
  - 3-16 karakter.
  - Benzersiz.
  - E-posta, telefon, link, `@` iceremez.
  - Ogrencinin gercek adiyla ayni veya cok benzer olamaz.

## Content Rules
- Platform ucretsizdir; ucretli uyelik, abonelik, paket, premium, odeme veya satin alma dili kullanilmayacak.
- "Ucretsiz kayit ol" gibi ifadeler yalnizca ucretsizligi netlestirmek icin kullanilabilir; ticari paket algisi olusturacak hicbir ifade eklenmeyecek.
- Veli odakli mesaj, veli raporu, veli paneli veya veliye ozel yonlendirme yapilmayacak.
- Metinlerin odagi ogrenci ve Ugur Hoca arasindaki ogrenme/takip deneyimi olacak.
- Guven mesaji su cizgide olacak: ogrencinin verisi gizlidir, baska ogrencilerle paylasilmaz, platform ogrencilerin faydalanmasi icin ucretsizdir.

## Test Plan
- Gizlilik testleri:
  - Ogrenci A, Ogrenci B'nin profilini, odevini, teslimini, mesajini, bildirimini, planini, yorumunu, skor gecmisini, test sonucunu ve calisma verisini okuyamamali.
  - Admin gerekli tum ogrenci verilerini okuyabilmeli.
- Sohbet fotograf testleri:
  - Ogrenci fotograf secip onizleyebilir, kaldirabilir ve gonderebilir.
  - Admin fotograf secip onizleyebilir, kaldirabilir ve gonderebilir.
  - Mesaj balonunda gonderilen fotograf duzgun gorunur.
  - Gecersiz dosya tipi ve buyuk dosya reddedilir.
  - Fotograf baska ogrencinin sohbetinde gorunmez.
  - Mevcut sohbet balonunun duzeni mobil ve desktop'ta bozulmaz.
- Rumuz testleri:
  - Rumuz yokken skor kaydi reddedilmeli.
  - Gercek ada benzeyen rumuz reddedilmeli.
  - Eski `user_name` degerleri liderlikte gorunmemeli.
  - Rumuz secildikten sonra eski skorlar rumuz altinda toplanmali.
- Icerik dili testleri:
  - Uygulamada `odeme`, `abonelik`, `premium`, `satin al`, `ucretli plan`, `paket` gibi ifadeler bulunmamali.
  - Veliye ozel akis veya metin bulunmamali.
- Takip merkezi testleri:
  - Pasif ogrenci, gecikmis odev, dusuk test skoru ve haftalik hedef riski dogru hesaplanmali.
  - Filtreler ve hizli aksiyonlar dogru calismali.
- Haftalik plan testleri:
  - Admin plan olusturabilir.
  - Ogrenci sadece kendi planini gorur.
  - Ogrenci sadece kendi plan maddesini tamamlayabilir.
- Analitik testleri:
  - 7/30 gun trendleri dogru hesaplanir.
  - Bos veri durumunda dashboard kirilmaz.
  - Ogrenci activity event kayitlari baska ogrenci tarafindan okunamaz.
- Kalite kontrolleri:
  - `npm run typecheck`
  - `npm run lint`
  - hedefli Vitest testleri
  - production build
  - browser dogrulamasi: admin dashboard, ogrenci paneli, sohbet balonu, oyun liderligi, ana sayfa desktop/mobil.

## Assumptions
- Mevcut marka dili ve genel tasarim korunacak; tam redesign yapilmayacak.
- Mevcut sohbet balonu tasarimi korunacak; yalnizca kucuk fotograf ekleme ikonu, onizleme ve gonderim durumu eklenecek.
- Ogrenciler arasi veri gorunurlugunde sifir tolerans uygulanacak.
- Liderlik tablosunda gercek ad asla gosterilmeyecek.
- Rumuzu ogrenci sececek; admin gerektiginde yonetebilecek.
- Eski skorlar silinmeyecek, ama rumuz secilene kadar liderlikte gorunmeyecek.
- Para, odeme, ucretli uyelik, abonelik ve veli odakli ozellikler kesin olarak kapsam disidir.
