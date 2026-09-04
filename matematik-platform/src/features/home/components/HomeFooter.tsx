'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, Heart } from 'lucide-react';

type HomeFooterProps = {
  isLight: boolean;
};

export function HomeFooter({ isLight }: HomeFooterProps) {
  return (
    <footer
      className={`border-t mt-12 px-4 py-12 transition-colors duration-300 ${
        isLight
          ? 'border-slate-200 bg-slate-50/80 backdrop-blur-md text-slate-700'
          : 'border-white/10 bg-slate-950/80 backdrop-blur-md text-slate-300'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-white/5">
          {/* Marka & Misyon */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-primary via-brand-pink to-brand-orange p-0.5 shadow-md">
                <Image
                  src="/ugur.jpeg"
                  alt="Uğur Hoca"
                  width={36}
                  height={36}
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
              <span
                className={`font-display text-lg font-bold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Uğur Hoca Matematik
              </span>
            </div>

            <p className="text-xs leading-relaxed max-w-sm text-slate-400">
              LGS ve YKS hazırlığında tüm öğrencilere %100 ücretsiz, reklamsız, nitelikli ders notları,
              yaprak testler ve interaktif çalışma ortamı sunar.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>%100 Ücretsiz & Gizlilik Korumalı</span>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="space-y-2.5">
            <h4
              className={`font-display text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Eğitim Modülleri
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link href="/icerikler" prefetch={false} className="hover:text-brand-primary-soft transition">
                  Ders Notları & PDF'ler
                </Link>
              </li>
              <li>
                <Link href="/testler" prefetch={false} className="hover:text-brand-primary-soft transition">
                  İnteraktif Testler
                </Link>
              </li>
              <li>
                <Link href="/programlar" prefetch={false} className="hover:text-brand-primary-soft transition">
                  LGS & YKS Rehberliği
                </Link>
              </li>
              <li>
                <Link href="/oyunlar" prefetch={false} className="hover:text-brand-primary-soft transition">
                  Matematik Oyunları
                </Link>
              </li>
              <li>
                <Link href="/canli-ders" prefetch={false} className="hover:text-brand-primary-soft transition">
                  Canlı Ders Salonu
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal & İletişim */}
          <div className="space-y-2.5">
            <h4
              className={`font-display text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Kurumsal & Destek
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link href="/gizlilik" prefetch={false} className="hover:text-brand-primary-soft transition">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk" prefetch={false} className="hover:text-brand-primary-soft transition">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik#cerezler" prefetch={false} className="hover:text-brand-primary-soft transition">
                  Çerez Tercihleri
                </Link>
              </li>
              <li>
                <a
                  href="mailto:yasayanugur@gmail.com"
                  className="hover:text-brand-primary-soft transition"
                >
                  Doğrudan İletişim (E-Posta)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Telif Şeridi */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
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
