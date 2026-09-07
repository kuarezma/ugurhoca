@AGENTS.md

## Tema token sözlüğü

- `surface`: Sayfa ve kart yüzeylerinde `bg-surface-0`–`bg-surface-3` kullanılır.
- `text`: Metin hiyerarşisi `text-primary`, `text-secondary`, `text-tertiary` ile kurulur.
- `border`: Kenarlıklar `border-border-subtle`, `border-border-default`, `border-border-strong` ile seçilir.
- `accent`: Vurgulu yüzey ve metin için `bg-accent-bg` ve `text-accent-fg` kullanılır.
- `tone`: Durum renkleri `text-tone-<durum>-fg`, `bg-tone-<durum>-bg`, `border-tone-<durum>-border` biçimindedir; durumlar `success`, `warn`, `danger`, `info`dur.
- `page-surface`: Sayfa sarmalayıcısında kullanılan, tema yüzeyi ve birincil metni birlikte sağlayan ortak sınıftır.
- `ui-chip`: Tema uyumlu rozet temelidir; `Chip` bileşeni bunu `data-tone` ile kullanır.

## Tema kuralı

Açık tema için yeni JSX `className` değerlerinde çıplak `text-white` veya `bg-slate-950`/`900`/`800`/`700` kullanma. Aynı sınıf grubunda uygun bir `dark:` çifti yoksa semantik token kullan; yalnız yazdırılabilir çalışma kâğıdı ile kasıtlı koyu ya da gradyan CTA bağlamları istisnadır.
