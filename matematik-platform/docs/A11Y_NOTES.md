# Erişilebilirlik (a11y) — uygulananlar ve kontrol listesi

## Uygulananlar (repo)

- **Atla bağlantısı**: Kök `layout` içinde “Ana içeriğe geç” → `#ana-icerik` (`globals.css` `.skip-link`).
- **Odak görünürlüğü**: Buton, bağlantı ve form kontrolleri için `:focus-visible` stilleri (`globals.css`).
- **`prefers-reduced-motion`**: Animasyon ve geçişler azaltılır (`globals.css`).
- **Ana landmark**: İçerik sarmalayıcı `id="ana-icerik"` ve `tabIndex={-1}` ile atlama hedefi.

## Periyodik kontrol (manuel)

- [ ] Her sayfada tek mantıklı `<h1>` (özellikle dashboard ve modaller).
- [ ] Modaller: ESC ile kapanma, odak tuzağı, kapatınca tetikleyiciye dönüş.
- [ ] Formlar: `label` / `htmlFor` ve hata mesajları `aria-live` veya `role="alert"` ile duyurulabilir.
- [ ] Kontrast: Turuncu/mor vurgular üzerinde metin okunabilirliği (dark/light).
