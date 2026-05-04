---
name: Kapsamlı Kalite Tespit Planı
overview: Tüm repo için (özellikle `matematik-platform`) kapsamlı kalite denetimi yapıp bulguları etki+efor dengesine göre kritikten düşüğe hiyerarşik olarak sıralayacağız. Plan; çalışmayan butonlar, mantık hataları, geri bildirim eksikleri, kod/test açıkları, yazım ve UI kaymaları dahil uçtan uca tespit üretir.
todos:
  - id: inventory-quality-gates
    content: Lint/typecheck/test/build ve CI kurallarını tarayıp kalite kapısı bazlı ilk bulgu listesini çıkar
    status: pending
  - id: inspect-core-user-flows
    content: UI ve özellik modüllerinde buton, form, feedback ve çalışan/çalışmayan özellik tespitlerini topla
    status: pending
  - id: inspect-api-data-auth
    content: API route, schema validation, Supabase auth/policy katmanında mantık ve entegrasyon hatalarını belirle
    status: pending
  - id: inspect-ui-copy-layout
    content: Yazım, metin tutarlılığı ve responsive görsel kayma bulgularını derle
    status: pending
  - id: prioritize-findings
    content: Tüm bulguları P0-P3 hiyerarşisinde etki+efor dengesine göre sırala ve uygulanabilir backlog formatına dönüştür
    status: pending
isProject: false
---

# Kapsamlı Kalite Tespit ve Önceliklendirme Planı

## 1) Kapsam ve Denetim Yüzeyi
- Ana odak uygulama: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform)
- Yardımcı kontroller:
  - CI hattı: [`/Users/ugurmac/Desktop/ugurhoca/.github/workflows/ci.yml`](/Users/ugurmac/Desktop/ugurhoca/.github/workflows/ci.yml)
  - Repo script orkestrasyonu: [`/Users/ugurmac/Desktop/ugurhoca/package.json`](/Users/ugurmac/Desktop/ugurhoca/package.json)

## 2) Tespit Kategorileri (Senin listene göre genişletilmiş)
- Çalışmayan butonlar/aksiyonlar (onclick, submit, disabled state, route geçişi)
- Formlarda yanlış alana yazım veya hiç yazılamama (input binding/state/sync)
- Mantık hataları (yanlış koşul, sınır durumları, auth/role akışı)
- Geri bildirim eksiklikleri (loading/success/error/toast/inline validation)
- Kod hataları/eksikleri (type, lint, exception handling, null/undefined)
- Çalışmayan özellikler (API endpoint, veri akışı, entegrasyon kırıkları)
- Yazım/terim hataları (TR içerik, tutarsız metin)
- Görsel/yazı kaymaları (responsive kırılımlar, taşma, hizalama, contrast)
- Ek risk yüzeyi: güvenlik ve veri doğruluğu (validation, RLS/policy, env)

## 3) Uygulama Alanlarına Göre İnceleme Sırası
1. Kullanıcıya direkt dokunan ekranlar
   - UI rotaları: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/app`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/app)
   - Bileşenler: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/components`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/components)
   - Özellik modülleri: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/features`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/features)
2. API ve doğrulama katmanı
   - Endpointler: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/app/api`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/app/api)
   - Şema/validation: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/route-schemas.ts`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/route-schemas.ts), [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/validation`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/validation)
3. Veri ve auth katmanı
   - Supabase istemcileri: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/supabase`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/lib/supabase)
   - Migration/policy: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/supabase/migrations`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/supabase/migrations)
4. Kalite kapıları
   - Test altyapısı: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/vitest.config.ts`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/vitest.config.ts), [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/test/setup.ts`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/src/test/setup.ts)
   - Lint/Typecheck: [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/eslint.config.mjs`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/eslint.config.mjs), [`/Users/ugurmac/Desktop/ugurhoca/matematik-platform/tsconfig.json`](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/tsconfig.json)

## 4) Tespit Yöntemi (Nasıl yakalayacağız)
- Statik kontroller: `typecheck`, `lint`, `test`, `build` çıktıları ile bloklayıcı hataları toplama
- Kod taraması: kritik akışlarda event-handler, form state, async error handling, edge-case analizi
- Senaryo bazlı fonksiyonel inceleme: buton/form/özellik akışlarının beklenen-actual karşılaştırması
- UI/UX kontrol listesi: breakpoint bazlı hizalama, metin taşması, yanlış kopya ve geri bildirim boşlukları
- Entegrasyon kontrolü: API request/response şema uyumu, auth ve yetki denetimi

## 5) Önceliklendirme Hiyerarşisi (Etki + Efor Dengeli)
- P0 (Acil, hemen):
  - Çalışmayan temel akışlar (giriş, kayıt, kritik buton, ödeme/işlem benzeri ana fonksiyon)
  - Veri kaybı, güvenlik açığı, yetkisiz erişim, tamamen bozulan endpoint
- P1 (Yüksek):
  - Mantık hataları ve yanlış sonuç üreten iş kuralları
  - Kullanıcıyı bloklayan validation/geri bildirim eksiklikleri
- P2 (Orta):
  - Kısmi işlev bozuklukları, belirli edge-case hataları
  - UI hizalama/sapma, mobilde bozulma, önemli fakat bloke etmeyen copy hataları
- P3 (Düşük):
  - Kozmetik yazım hataları, küçük spacing/typography tutarsızlıkları
  - Non-critical refactor ve teknik borç notları

```mermaid
flowchart TD
    auditStart[AuditStart] --> p0[PriorityP0]
    auditStart --> p1[PriorityP1]
    auditStart --> p2[PriorityP2]
    auditStart --> p3[PriorityP3]
    p0 --> fixNow[FixImmediately]
    p1 --> nextSprint[PlanNextSprint]
    p2 --> backlog[BacklogNearTerm]
    p3 --> polish[PolishQueue]
```

## 6) Çıktı Formatı (Teslim şekli)
- Her bulgu için tek satır standart:
  - `ID | Öncelik | Alan | Dosya/Yol | Semptom | Muhtemel Kök Neden | Önerilen Çözüm | Doğrulama Adımı`
- Sonunda 3 özet bölümü:
  - Kritik risk özeti (P0/P1)
  - Hızlı kazanımlar (düşük efor, yüksek etki)
  - Test açığı haritası (hangi bug türü neden kaçmış)

## 7) Uygulama Sırası (Operasyon)
1. Otomatik kalite kapıları (lint/type/test/build)
2. Kritik kullanıcı akışları (buton/form/özellik)
3. API + validation + auth
4. UI metin ve responsive inceleme
5. Bulguları P0→P3 sıralı backlog’a dönüştürme

## 8) Başarı Kriteri
- Tespit listesi tüm istenen kategorileri kapsar
- Her bulgu için net dosya/alan ve doğrulama adımı vardır
- Öncelik sırası uygulanabilir ve sprint planına doğrudan taşınabilir durumdadır
