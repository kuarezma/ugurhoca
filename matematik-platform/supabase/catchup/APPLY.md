# Production DB catch-up — uygulama kılavuzu

Hazırlanış: 2026-10-04, `kalite/prod-db-catchup` (origin/main 8c8edae üstü).
Proje: `iynttlkquftibblygbzq`. Bu klasördeki hiçbir dosya production'a uygulanmadı;
hazırlık sırasında production'da yalnız `SELECT` çalıştırıldı.

## Kurallar

- **`supabase db push` kullanmayın.** Geçmiş tablosu repo ile eşleşmediği için push,
  veri silen dosyaları da çalıştırır: `20260430120000` (`TRUNCATE game_scores`, bugün
  90 satır), `20260906120000` (`DROP TABLE chat_users`, 4 satır). Ayrıca
  `20260429120000` `is_admin_email`'i, `20260406120000` ise `chat_users_select USING(true)`
  politikasını geri getirir.
- Adımlar `apply-order.txt` sırasıyla uygulanır. Her adım tek transaction'dır:
  dosya ve kayıt INSERT'i birlikte commit edilir, hata olursa ikisi de geri alınır.
  Dosyalarda BEGIN/COMMIT yoktur.
- Hiçbir adım satır silmez ya da dönüştürmez. Tek yazma, `90_…` dosyasındaki
  `schema_migrations` geçmiş satırlarıdır.
- Her dosya idempotenttir; yarıda kalan bir adım aynen tekrar çalıştırılabilir.
  Bu, kopya şema üzerinde iki kez çalıştırılarak doğrulandı.
- `SET lock_timeout = '5s'`: kilit alınamazsa adım düşer ve geri alınır; tekrar denenir.

## Bir adımı uygulama

```bash
# PROD_DB_URL: Dashboard > Project Settings > Database > connection string (postgres rolü)
N=01 FILE=01_20261004170000_lock_down_public_reads.sql V=20261004170000 NAME=lock_down_public_reads
psql "$PROD_DB_URL" -X -A -t -f checks/${N}_pre.sql            # ok = t olmalı
psql "$PROD_DB_URL" -X -v ON_ERROR_STOP=1 --single-transaction \
  -f "$FILE" \
  -c "INSERT INTO supabase_migrations.schema_migrations (version, name, created_by)
      VALUES ('$V', '$NAME', 'catchup-2026-10-04') ON CONFLICT (version) DO NOTHING;"
psql "$PROD_DB_URL" -X -A -t -f checks/${N}_post.sql           # ok = t (ve varsa storage_ok = t)
```

SQL Editor ile uygulanacaksa, dosya içeriği ve INSERT aynı çalıştırmada
`BEGIN; … COMMIT;` arasına alınır.

Kayıt biçimi: `version` repo dosya numarasıdır (dashboard'un uygulama-anı damgası
değil), `name` dosya adının numaradan sonraki kısmıdır, `created_by` değeri
`catchup-2026-10-04`'tür. Catch-up'a özgü dört dosya (`20261004130500`,
`20261004170000`, `20261004170100`, `20261004170200`) repoda `supabase/migrations/`
altında da durur; `migration list` bu yüzden yerel ile uzak tarafı eşleştirir.

## Adımlar

"Bugün" sütunu, ön kontrolün 2026-10-04'te production'a karşı salt okunur sonucudur.
`false` olanlar önceki adımlara bağlıdır.

| # | Dosya | Ne yapar | Risk | Bugün |
|---|---|---|---|---|
| 01 | `20261004170000_lock_down_public_reads` | **Acil.** `shared_documents` (551 satır, öğrenci adı ve e-postası) anonim okumaya kapanır; yalnız sahip öğrenci ve admin okur. `chat_users` (4 satır, TC no) anon/authenticated'a kapanır, tablo silinmez. `documents` bucket'ında anonim yükleme, güncelleme ve silme politikaları kalkar; oturumlu kullanıcı yalnız kök dizine `support_*` ekler, admin tam yetkili. | Düşük. Koddaki tüm okuyucular sahip ya da admin. `storage_ok` false olabilir (§Storage). | ok |
| 02 | `20260429130000_fix_daily_streak_rpc` | `touch_daily_streak` çakışan sütun hatası düzelir (log: "last_active_date is ambiguous"). | Düşük. Streak'ler Nisan'dan beri artmadı; yeniden başlar. | ok |
| 03 | `20260904000000_add_kids_games_score_limits` | Oyun 13–18 skorları kabul edilir. | Düşük | ok |
| 04 | `20261004170100_game_19_score_limit` | Oyun 19 limiti **5000**. | Ürün kararı (§Kararlar). Atlanırsa oyun 19 skorları reddedilmeye devam eder. | ok |
| 05 | `20260515110000_live_lesson_selected_students` | `live_lessons.target_student_ids` + GIN index. "Seçili öğrenci" dersleri çalışır. | Düşük; 10 satırlık tablo, kısa kilit. | ok |
| 06 | `20260905100000_live_lesson_recording_and_materials` | `recording_url`, `materials_url` | Düşük | ok |
| 07 | `20260428120000_profile_favorites` | `profiles.is_favorite` (NOT NULL DEFAULT false; PG17'de yalnız metadata) + kısmi index. Admin favori ve canlı ders öğrenci listesi düzelir. | Düşük | ok |
| 08 | `20260420131000_quiz_bundle_images` (düzeltilmiş) | Quiz görsel sütunları; bucket satırına dokunulmaz. | Düşük | ok |
| 09 | `20260906100000_user_mistakes` (düzeltilmiş) | Hata defteri tablosu. | Düşük | ok |
| 10 | `20261004170200_restore_tracking_tables` | 0429'un eksik kalan beş tablosu ve `complete_weekly_plan_item`. Haftalık plan, admin takip ve aktivite olayları çalışır. | Düşük. `is_admin_email` ve oyun nesnelerine dokunmaz. | ok |
| 11 | `20260906123000_student_groups` (düzeltilmiş) | Grup tabloları + `auth.users` FK. | Düşük. Adım 14'e kadar oturumlu herkes (boş) grupları görür. | ok |
| 12 | `20260906110000_performance_composite_indexes` | Index'ler. Repo dosyası düzeltildi: `quiz_results.created_at` → `completed_at`. | Düşük; küçük tablolar. | false (09, 10 gerekli) |
| 13 | `20261004150000_document_counter_rpc` (PR #10) | `increment_document_counter`, yalnız service_role. `likes` zaten var, o satır işlem yapmaz. | Düşük. **PR #10 deploy'undan önce** uygulanmalı. | ok |
| 14 | `20261004150100_revoke_stray_anon_grants` (PR #10) | `student_groups` okuması üyeyle sınırlanır; `quiz_results` ve `chat_users` anon yetkileri kalkar. | Düşük. 11'den sonra. | false (11 gerekli) |
| 15 | `20261004140000_assignment_submissions_unique_late` | `late` sütunu, trigger'ı, unique kısıt. Bugün 0 teslim, 0 tekrar. Repo dosyasında BEGIN/COMMIT kaldırıldı. | Düşük. `storage_ok` false olabilir. | ok |
| 16 | `20261004130000_single_admin_email` | 2 fonksiyon + 7 politika: matematiklab çıkar. | Düşük. auth.users'da matematiklab hesabı yok. | ok (16 politika) |
| 17 | `20261004130500_single_admin_email_remaining` | Kalan 8 public + 1 storage politika: production tanımı birebir, yalnız matematiklab çıkar. | Düşük | ok |
| @ | **Deploy** | PR #10'u içeren uygulama sürümü canlıya. | Atlanırsa 18'den sonra admin canlı ders paneli 42501 ile düşer. | — |
| 18 | `20261004120000_live_lesson_rls_scope` | Canlı ders okuma kapsamı, `teacher_proof` kolon gizliliği, realtime yayınından çıkarma. | Orta: davranış değişikliği. Önkoşul 05, 06 ve deploy. | false (05, 06 gerekli) |
| 90 | `90_register_history_only` | 36 repo sürümü yalnız geçmişe "uygulandı" olarak yazılır (applied, superseded, skipped; gerekçeler dosyada). | Yalnız geçmiş tablosu | — |

Sıra gerekçeleri: 01 bağımsız ve acil olduğu için en başta. 13, PR #10'daki
`/api/content-documents` rotası RPC'yi gerektirdiği için deploy'dan önce. 18, deploy
ile 05/06'dan sonra (politika `target_student_ids`'e başvurur; kolon izinleri
katalogdaki sütunlardan üretilir). 12, tablolarını kuran 09 ve 10'dan sonra.
14, 11'den sonra (yoksa grup bloğu işlem yapmaz).

## Storage

Production'da `postgres` rolü süper kullanıcı değil ve `storage.objects` sahibi olan
`supabase_storage_admin`'e üye değil (katalogdan doğrulandı). PostgreSQL'de politika
oluşturmak ve silmek tablo sahipliği gerektirir. Bu nedenle 01, 08, 15 ve 17'deki
`storage.objects` ifadeleri ayrı bir `DO` bloğunda duruyor. Yetki hatası
(`insufficient_privilege`) yalnız o bloğu geri alır ve `WARNING` basar; dosyanın
geri kalanı uygulanır. Bu davranış kopya şemada, sahibi olmayan bir rolle sınandı.

Son kontrolde `storage_ok = false` çıkarsa ilgili politikayı Dashboard >
Storage > Policies üzerinden kurun. Tanımlar dosyalardaki `DO` bloklarındadır.
Ardından son kontrolü yeniden çalıştırın. Kontrol şu adımlarda yapılır:
01 (`documents` bucket'ı), 08 (`quiz_images_public_select`; bucket public olduğu
için görseller yine de okunur), 15 (`submissions_student_delete_orphan`) ve
17 (`submissions_admin_select`).

## Geçmiş

- Catch-up sonrası her repo sürümü (54: bu dal + PR #10) `schema_migrations`'ta
  yer alır. Bunu kopya şemadaki düzenek doğruluyor.
- Dashboard'un 10 eski kaydına (`20260419191332` … `20260930183533`)
  dokunulmaz. `supabase migration list` bunları "yalnız uzakta" olarak gösterir;
  bir sonraki `db push` bu durumda durur. Kaldırmak
  (`supabase migration repair --status reverted <sürüm>`) yalnız geçmiş satırı siler;
  karar şefte.
- 90 numaralı dosya uygulandıktan sonra repoya eklenecek yeni migration'lar
  normal `supabase db push` ile uygulanabilir. Bunun için dashboard kayıtları
  konusunun da kapanmış olması gerekir.

## Doğrulama (hazırlıkta çalıştırıldı)

```bash
./verify-copies.sh              # 15 birebir kopya AYNI, 3 düzeltilmiş kopyanın farkı basılır
PGLITE=/path/to/@electric-sql/pglite/dist/index.js node replica/run.mjs
```

`replica/snapshot.sql`, production kataloğundan (salt okunur) üretilmiş, veri
içermeyen bir kopya şemadır: 31 tablo, 88 politika, 11 fonksiyon, ACL'ler, yayın ve
bucket'lar. `run.mjs` şunları yapar: (1) 18 adımı ön kontrol → dosya + kayıt → son
kontrol sırasıyla uygular; (2) hepsini ikinci kez çalıştırır (idempotentlik);
(3) geçmiş kapsamını sınar; (4) anon, öğrenci, admin ve eski admin rolleriyle 25
davranış testi yapar; (5) storage sahiplik hatasını benzetir.
Son çalıştırma: `SONUÇ: TÜM KONTROLLER GEÇTİ`.

Kopya şemanın sınırları: Supabase'in `auth`/`storage` şemaları taklittir. PostgREST,
Storage API ve realtime yoktur. Gerçek veri yoktur (ön kontrollerdeki sayımlar
production'dan alındı).

## Bu catch-up'ta YAPILMAYANLAR (açık kararlar)

- `20260429120000` RLS sıkılaştırmaları: `assignments_select_scoped` (bugün
  `assignments_select USING(true)`, public), `comments_select_own_or_admin`,
  `notes_*_own`, `quiz_results_admin_all`. Davranış değişikliği olduğu için ürün
  kararı gerekir.
- `20260408150000`'ın `handle_updated_at()` + `set_quizzes_updated_at` trigger'ı:
  `quizzes.updated_at` otomatik güncellenmiyor.
- `chat_users` silinmedi (4 satır, TC no). Erişimi kapalı; saklama süresi KVKK kararı.
- Öğrencinin `shared_documents`'tan "kaldır" (DELETE) akışı için politika yok; bugün
  de çalışmıyor.
- `announcements_*` ve `documents_insert/delete` politikaları `auth.users`'ı alt
  sorguyla okuyor; authenticated'ın orada SELECT yetkisi yok. İstemci yazmaları
  "permission denied" verir. 130500 bu biçimi bilerek korur.
