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
      className="border-t-2 sm:border-t-3 border-default mt-12 px-4 pt-12 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-12 bg-surface-1 transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b-2 border-default">
          {/* Marka & Misyon */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff5cc] border-2 border-[#ffc800] shadow-[0_3px_0_#e5b400] overflow-hidden p-0.5 select-none">
                <Image
                  src="/ugur.jpeg"
                  alt="Uğur Hoca"
                  width={40}
                  height={40}
                  className="h-full w-full rounded-[14px] object-cover"
                />
              </div>
              <span className="font-display text-xl font-black text-primary">
                Uğur Hoca Matematik
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-sm text-secondary">
              LGS ve YKS hazırlığında tüm öğrencilere %100 ücretsiz, reklamsız, nitelikli ders notları,
              yaprak testler ve interaktif çalışma ortamı sunar.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ffb8] dark:bg-emerald-950/40 border border-[#46a302]/40 px-3.5 py-1 text-xs font-black text-[#276700] dark:text-[#a7f3d0]">
              <Shield className="h-3.5 w-3.5" />
              <span>💚 %100 Ücretsiz & Reklamsız</span>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="space-y-2.5">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary">
              Eğitim Modülleri
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <SafeLink href="/icerikler" className="hover:text-brand-ink transition">
                  Ders Notları & PDF'ler
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/testler" className="hover:text-brand-ink transition">
                  İnteraktif Testler
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/programlar" className="hover:text-brand-ink transition">
                  LGS & YKS Rehberliği
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/araclar" className="hover:text-brand-ink transition">
                  Matematik & Sınav Araçları
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/oyunlar" className="hover:text-brand-ink transition">
                  Matematik Oyunları
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/canli-ders" className="hover:text-brand-ink transition">
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
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <SafeLink href="/gizlilik" className="hover:text-brand-ink transition">
                  Gizlilik Politikası
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/kvkk" className="hover:text-brand-ink transition">
                  KVKK Aydınlatma Metni
                </SafeLink>
              </li>
              <li>
                <SafeLink href="/gizlilik#cerezler" className="hover:text-brand-ink transition">
                  Çerez Tercihleri
                </SafeLink>
              </li>
              <li>
                <a
                  href="mailto:yasayanugur@gmail.com"
                  className="hover:text-brand-ink transition"
                >
                  Doğrudan İletişim (E-Posta)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Telif Şeridi */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
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
