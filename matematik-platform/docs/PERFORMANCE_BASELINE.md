# Performans taban çizgisi (Core Web Vitals)

Bu dosya plandaki **ölçüm** adımı için kullanılır. Aşağıdaki değerler `2026-04-18` tarihinde yerel `next build && next start` çıktısı üzerinde Lighthouse ile alındı.

Ölçüm bağlamı:
- Ortam: `http://127.0.0.1:3000`
- Profil: temiz, oturumsuz tarayıcı oturumu
- Not: `INP` alanı Lighthouse koşusunda etkileşim simülasyonu üretmediği için `n/a` olarak kaldı
- Not: `/profil` ölçümü oturumsuz korumalı rota davranışını temsil eder

## Kritik sayfalar (öncelik sırası)

| Öncelik | Rota         | Not                    |
| ------- | ------------ | ---------------------- |
| 1       | `/`          | Ana sayfa, ilk izlenim |
| 2       | `/testler`   | Yoğun etkileşim        |
| 3       | `/icerikler` | Liste + görseller      |
| 4       | `/giris`     | Dönüşüm                |
| 5       | `/profil`    | Oturum açık kullanıcı  |

## Nasıl ölçülür?

1. **Üretim derlemesi**: `npm run build && npm run start` (kökten `npm run start` kök `package.json` ile).
2. **Chrome DevTools → Lighthouse**: Mod Desktop ve Mobile; Performance + Accessibility kategorileri.
3. **Web Vitals**: Chrome UX Report (CrUX) veya Vercel Speed Insights (üretimde etkinse).

## Sonuç tablosu

| Sayfa | Form | Tarih | LCP | INP | CLS | Lighthouse perf |
| ----- | ---- | ----- | --- | --- | --- | --------------- |
| `/` | Mobile | 2026-04-18 | 4.06 s | n/a | 0.00 | 87 |
| `/` | Desktop | 2026-04-18 | 4.05 s | n/a | 0.00 | 87 |
| `/testler` | Mobile | 2026-04-18 | 3.82 s | n/a | 0.00 | 89 |
| `/testler` | Desktop | 2026-04-18 | 3.98 s | n/a | 0.00 | 88 |
| `/icerikler` | Mobile | 2026-04-18 | 4.28 s | n/a | 0.00 | 86 |
| `/icerikler` | Desktop | 2026-04-18 | 4.29 s | n/a | 0.00 | 86 |
| `/giris` | Mobile | 2026-04-18 | 4.00 s | n/a | 0.00 | 88 |
| `/giris` | Desktop | 2026-04-18 | 3.98 s | n/a | 0.00 | 88 |
| `/profil` | Mobile | 2026-04-18 | 4.28 s | n/a | 0.00 | 86 |
| `/profil` | Desktop | 2026-04-18 | 4.28 s | n/a | 0.00 | 86 |

**Hedef (kılavuz)**: LCP &lt; 2,5 s (iyi), INP &lt; 200 ms (iyi), CLS &lt; 0,1 (iyi) — [Web Vitals](https://web.dev/vitals/).
