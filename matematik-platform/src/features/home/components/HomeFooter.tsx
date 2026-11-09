'use client';

import Image from 'next/image';
import { SafeLink } from '@/components/SafeLink';
import { Sparkles, Shield, Heart } from 'lucide-react';

type HomeFooterProps = {
  /** @deprecated Ignored: theme classes come from CSS. Kept for callers outside the home feature. */
  isLight?: boolean;
};

export function HomeFooter(_props: HomeFooterProps) {
  return (
    <footer
      className="border-t border-subtle mt-12 px-4 pt-12 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-12 bg-surface-2 font-sans"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-subtle">
          {/* Marka & Misyon */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-1 border border-subtle overflow-hidden p-0.5 select-none">
                <Image
                  src="/ugur.jpeg"
                  alt="Uğur Hoca"
                  width={40}
                  height={40}
                  className="h-full w-full rounded-[14px] object-cover"
                />
              </div>
              <span className="font-display text-xl font-bold text-primary">
                Uğur Hoca Matematik
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-sm text-secondary">
              LGS ve YKS hazırlığında tüm öğrencilere %100 ücretsiz, reklamsız, nitelikli ders notları,
              yaprak testler ve interaktif çalışma ortamı sunar.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-bg border border-subtle px-3.5 py-1 text-xs font-black text-accent-fg">
              <Shield className="h-3.5 w-3.5" />
              <span>💚 %100 Ücretsiz & Reklamsız</span>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="space-y-2.5">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary">
              Eğitim Modülleri
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary">
              <li>
                <SafeLink href="/icerikler" className="hover:text-primary transition">
                  Ders Notları & PDF'ler
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/testler" className="hover:text-primary transition">
                  İnteraktif Testler
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/programlar" className="hover:text-primary transition">
                  LGS & YKS Rehberliği
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/araclar" className="hover:text-primary transition">
                  Matematik & Sınav Araçları
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/oyunlar" className="hover:text-primary transition">
                  Matematik Oyunları
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/canli-ders" className="hover:text-primary transition">
                  Canlı Ders Salonu
                </SafeLink>
              </li>
            </ul>
          </div>

          {/* Yasal & İletişim */}
          <div className="space-y-2.5">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary">
              Kurumsal & Destek
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary">
              <li>
                <SafeLink href="/gizlilik" className="hover:text-primary transition">
                  Gizlilik Politikası
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/kvkk" className="hover:text-primary transition">
                  KVKK Aydınlatma Metni
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/cerez" className="hover:text-primary transition">
                  Çerez Politikası
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/iletisim" className="hover:text-primary transition">
                  İletişim
                </SafeLink>
              </li>
              <li>
                <a
                  href="mailto:yasayanugur@gmail.com"
                  className="hover:text-primary transition"
                >
                  Doğrudan İletişim (E-Posta)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Telif Şeridi */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-secondary">
          <p>© 2026 Uğur Hoca Matematik Platformu. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1">
            <span>Öğrenciler için sevgiyle geliştirildi</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
