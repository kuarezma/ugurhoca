# Uğur Hoca web sitesi — mükemmellik ve profesyonellik planı

Bu dosya, depo kökünde saklanan kalite yol haritasının kaynağıdır. Uygulama kodu: `matematik-platform/`.

## Sizin kriterleriniz (bağlayıcı)

1. **Hız**: Sayfaların hızlı açılması, etkileşimlerin gecikmeden tepki vermesi (Core Web Vitals ve algılanan performans).
2. **Görsel tutarlılık**: **Font, renk, tema ve düzeni kasıtlı olarak değiştirmeden** yalnızca teknik optimizasyon (aynı font aileleri/ağırlıklar, `DeferredFloatingShapes` ile aynı dekor, vb.).
3. **Profesyonellik**: Ziyaretçinin ve öğrencinin güven duyacağı, hatasız ve öngörülebilir deneyim; arama motorları ve erişilebilirlikte “tamamlanmış ürün” hissi.

## Profesyonelliğin ölçülebilir karşılığı

| Alan | Hedef (üretim, gerçek kullanıcı veya Lighthouse) |
|------|--------------------------------------------------|
| Performans | LCP iyi eşik; INP düşük; gereksiz JS az |
| Güvenilirlik | Beklenmeyen hata yerine anlaşılır mesaj; boş veride kırık UI yok |
| Erişilebilirlik | WCAG 2.2 AA’ye yaklaşan kontrast ve klavye ile tam kullanım (odak, modaller) |
| SEO | Doğru `metadata`, robots/sitemap uyumu, paylaşım önizlemesi tutarlılığı |
| Güven | Gizlilik / veri kullanımı şeffaflığı (yasal metinler içerik onayıyla) |
| Operasyon | Hatalar ve vitals üretimde görünür; CI kalite kapıları açık |

## Teknik temel (repo)

- Next.js **16**, React **19**, Tailwind, Supabase: `matematik-platform/package.json`.
- Kök layout ve meta: `matematik-platform/src/app/layout.tsx`; fontlar **`next/font`** (Poppins + Space Grotesk) + `globals.css` içinde `--font-poppins` / `--font-space-grotesk`.
- PWA: `matematik-platform/public/manifest.json`, `public/sw.js`.
- SEO: `matematik-platform/src/app/robots.ts`, `sitemap.ts`.

---

## Sütun A — Performans ve algılanan hız

1. Ölçüm: Production build + Lighthouse; LCP, INP, TBT.
2. `next/font/google`: Poppins ve Space Grotesk — önceki Google Fonts URL’sindeki **aynı ağırlıklar**; `@import` kaldırıldı.
3. `DeferredFloatingShapes` ana sayfada.
4. `optimizePackageImports`: `framer-motion`, `@supabase/supabase-js`.
5. (Opsiyonel) Anon feed RSC / `initialData`.
6. (Opsiyonel) `pdf-export` dinamik import.
7. `next/image` + `sizes` (liste/kartlar).

## Sütun B — Güvenilirlik

1. `app/error.tsx`, `app/global-error.tsx`.
2. Kritik rotalar için `loading.tsx`.
3. Form/API hatalarında anlaşılır Türkçe mesaj.

## Sütun C — Erişilebilirlik

Odak, modaller, başlık hiyerarşisi, kontrast, dokunma hedefleri, isteğe bağlı `prefers-reduced-motion`.

## Sütun D — SEO

Sayfa bazlı `metadata`, sitemap/robots sürekliliği, isteğe bağlı JSON-LD.

## Sütun E — Güven / yasal

İçerik onayıyla gizlilik / KVKK / çerez sayfaları.

## Sütun F — Güvenlik

HSTS, CSP (üretimde test), API güvenliği, Supabase RLS.

## Sütun G — Gözlemlenebilirlik

Web Vitals, hata toplama.

## Sütun H — Mühendislik

CI’da lint, typecheck, test; kritik akış testleri.

## Uygulama fazları

- **Faz 1**: Sütun A + ölçüm.
- **Faz 2**: Sütun B.
- **Faz 3**: Sütun C ve D.
- **Faz 4**: Sütun E, F, G, H.

**Görsel kimlik**: Performans ve a11y adımları tasarım dondurması ile yapılır; görsel revizyon ayrı sprint’tir.

---

## Faz 1 — uygulandı (özet)

1. **`next/font`** — `layout.tsx`: Poppins + Space Grotesk, `latin` + `latin-ext`, CSS değişkenleri `html` üzerinde.
2. **`globals.css`** — Google `@import` kaldırıldı; `body` / `.worksheet-outcome-title` font değişkenleri.
3. **Ana sayfa** — `DeferredFloatingShapes`.
4. **`next.config.js`** — `optimizePackageImports`: `framer-motion`, `@supabase/supabase-js`.
5. **Faz 2 giriş** — `app/error.tsx`, `app/global-error.tsx`, `app/loading.tsx`.

**Faz 2 (devam)** — uygulandı:

- **Sunucu tarafı anon feed**: `loadInitialHomeFeed` + `HomePage` / `useHomePageData` ile duyurular ve son dokümanlar ilk HTML’de; oturum ve ödevler yine istemci tarafında.
- **Yandex çözümlemesi**: Ortak `resolveYandexPublicDownloadUrl` (`lib/yandex-public-download.ts`), API route ile aynı mantık.
- **PDF chunk’ları**: `downloadProgressPDF` ve `downloadStudentListPDF` dinamik `import()` (Progress + Admin).

**Faz 3 (Sütun C–D) — uygulandı (özet)**

- **`next/image`**: Ana sayfa duyuru kartları ve duyuru modalı; `sizes` + `unoptimized` (dinamik uzak URL’ler için güvenli yol).
- **SEO**: Kök `metadataBase`; sayfa/segment `metadata` (İçerikler, Testler, Programlar, Oyunlar, vb.); giriş/kayıt ve panel sayfalarında `noindex` uygun rotalar.
- **JSON-LD**: Kök layout’ta `EducationalOrganization` şeması.
- **Erişilebilirlik**: “Ana içeriğe geç” (`skip-link`); duyuru modalında `role="dialog"`, `aria-labelledby`, kapat `aria-label`.

Sonraki adımlar: Lighthouse / gerçek cihaz ölçümü, diğer sayfalarda `img`→`next/image`, güvenlik başlıkları (HSTS/CSP üretimde test), yasal sayfalar (içerik onayıyla).
