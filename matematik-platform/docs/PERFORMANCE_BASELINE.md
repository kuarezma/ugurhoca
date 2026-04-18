# Performans taban çizgisi (Core Web Vitals)

Bu dosya plandaki **ölçüm** adımı için kullanılır. Üretim veya `next start` sonrası Lighthouse / gerçek cihaz ile doldurun.

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

## Sonuç tablosu (elle doldurun)

| Sayfa    | Tarih | LCP | INP | CLS | Lighthouse perf |
| -------- | ----- | --- | --- | --- | --------------- |
| /        |       |     |     |     |                 |
| /testler |       |     |     |     |                 |

**Hedef (kılavuz)**: LCP &lt; 2,5 s (iyi), INP &lt; 200 ms (iyi), CLS &lt; 0,1 (iyi) — [Web Vitals](https://web.dev/vitals/).
