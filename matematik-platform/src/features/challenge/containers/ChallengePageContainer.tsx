'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Flame, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Mascot } from '@/components/Mascot';
import { SafeLink } from '@/components/SafeLink';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeDailyChallenge } from '@/features/home/components/HomeDailyChallenge';
import { HomeDailyGoalWidget } from '@/features/home/components/HomeDailyGoalWidget';
import { LgsTacticsCorner } from '@/features/home/components/LgsTacticsCorner';
import { HomeSuccessRoadmap } from '@/features/home/components/HomeSuccessRoadmap';
import { getCurrentUserProfile, signOutClient } from '@/lib/auth-client';
import type { AppUser } from '@/types';

const FormulaFlashcardsModal = dynamic(
  () =>
    import('@/features/programs/components/FormulaFlashcardsModal').then((m) => ({
      default: m.FormulaFlashcardsModal,
    })),
  { ssr: false },
);

export function ChallengePageContainer() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [user, setUser] = useState<AppUser | null>(null);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);

  useEffect(() => {
    let isDisposed = false;
    getCurrentUserProfile({ redirectToLogin: false }).then((res) => {
      if (!isDisposed && res?.profile) {
        setUser(res.profile);
      }
    });
    return () => {
      isDisposed = true;
    };
  }, []);

  const handleLogout = async () => {
    await signOutClient();
    setUser(null);
    router.push('/');
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
      }`}
    >
      <HomeNavbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6 md:pt-24 md:pb-16">
        {/* Geri Dön Butonu */}
        <div className="mb-6">
          <SafeLink
            href="/"
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 border ${
              isLight
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </SafeLink>
        </div>

        {/* Hero Başlık Kartı */}
        <section
          className={`relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-10 sm:py-10 mb-8 transition-all duration-300 ${
            isLight
              ? 'border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 shadow-bento'
              : 'border-white/10 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 shadow-2xl backdrop-blur-xl'
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl"
          />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4 animate-pulse text-amber-500" />
                <span>Günün Görevleri & Hedef Takibi</span>
              </div>
              <h1
                className={`font-display text-2xl sm:text-4xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Meydan Okuma Alanı
              </h1>
              <p
                className={`max-w-2xl text-sm sm:text-base leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Günün sorusuyla zihnini aç, günlük soru hedefini tamamla, LGS taktikleriyle hız kazan ve başarı yol haritanı adım adım takip et.
              </p>
            </div>

            <div className="shrink-0 hidden sm:block">
              <Mascot
                pose="celebrate"
                size={140}
                className="animate-float-y"
                ariaLabel="Meydan okuma maskotu Pi"
              />
            </div>
          </div>
        </section>

        {/* Hızlı Çapa Linkleri */}
        <nav
          aria-label="Meydan Okuma Bölümleri"
          className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]"
        >
          {[
            { href: '#gunun-sorusu', label: '⚡ Günün Sorusu' },
            { href: '#soru-hedefi', label: '🎯 Soru Hedefim' },
            { href: '#lgs-taktikleri', label: '💡 LGS Taktikleri' },
            { href: '#yol-haritasi', label: '🗺️ Yol Haritası' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 border ${
                isLight
                  ? 'border-slate-200 bg-white text-slate-700 hover:border-amber-400 hover:text-amber-600 shadow-sm'
                  : 'border-white/10 bg-slate-900/80 text-slate-300 hover:border-amber-400/40 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* 4 Ana Bölüm */}
        <div className="space-y-8">
          {/* 1. Günün Matematik Meydan Okuması */}
          <section id="gunun-sorusu" className="scroll-mt-24">
            <HomeDailyChallenge isLight={isLight} />
          </section>

          {/* 2. Günlük Soru Hedefim */}
          <section id="soru-hedefi" className="scroll-mt-24">
            <HomeDailyGoalWidget isLight={isLight} />
          </section>

          {/* 3. LGS Matematik Taktik Köşesi */}
          <section id="lgs-taktikleri" className="scroll-mt-24">
            <LgsTacticsCorner isLight={isLight} />
          </section>

          {/* 4. Başarı Yol Haritası */}
          <section id="yol-haritasi" className="scroll-mt-24">
            <HomeSuccessRoadmap
              isLight={isLight}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
            />
          </section>
        </div>
      </main>

      <HomeFooter isLight={isLight} />

      {isFlashcardsOpen ? (
        <FormulaFlashcardsModal
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
        />
      ) : null}
    </div>
  );
}
