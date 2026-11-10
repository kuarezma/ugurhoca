import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { SafeLink as Link } from '@/components/SafeLink';
import { LogOut, Search, Bell, ShieldCheck, Globe, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeSelectorDropdown } from '@/components/ThemeSelectorDropdown';
import { useAdminNotifications } from '@/features/admin/hooks/useAdminNotifications';

type AdminNavigationProps = {
  setIsSpotlightOpen: Dispatch<SetStateAction<boolean>>;
  setShowNotifications: ReturnType<
    typeof useAdminNotifications
  >['setShowNotifications'];
  unreadNotifications: ReturnType<
    typeof useAdminNotifications
  >['unreadNotifications'];
  handleLogout: () => Promise<void>;
};

export function AdminNavigation({
  setIsSpotlightOpen,
  setShowNotifications,
  unreadNotifications,
  handleLogout,
}: AdminNavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-1/90 backdrop-blur-xl border-b border-border-default py-2.5 px-4 sm:py-3 sm:px-6 shadow-sm dark:shadow-xl dark:shadow-none pt-[max(0.625rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      <div className="container mx-auto flex min-w-0 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3 group">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-border-strong bg-accent-bg p-0.5 shadow-sm">
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={44}
              height={44}
              priority
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
              Uğur Hoca
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-tone-info-fg dark:text-tone-info-fg tracking-wide">
              <ShieldCheck className="w-3 h-3" />
              Yönetici Portalı
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-default bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3 transition-colors text-xs font-semibold h-9"
          >
            <Globe className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
            Siteyi Gör
          </Link>

          <Link
            href="/profil"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-default bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3 transition-colors text-xs font-semibold h-9"
            title="Kullanıcı / Öğrenci Profiline Git"
          >
            <User className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
            Profilim
          </Link>

          <button
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-default bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3 transition-colors text-xs font-semibold h-9"
            title="Hızlı Ara (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-tone-info-fg dark:text-tone-info-fg" />
            <span className="hidden sm:inline">Hızlı Ara</span>
            <kbd className="hidden md:inline rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-mono text-secondary border border-border-default">
              ⌘K
            </kbd>
          </button>

          <ThemeSelectorDropdown buttonClassName="h-9 px-3 rounded-xl border border-border-default bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3" />

          <ThemeToggle
            compact
            className="h-9 w-9 rounded-xl border-border-default bg-surface-2 hover:bg-surface-3 text-secondary hover:text-primary"
          />

          <button
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Bildirimler"
            className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-border-default bg-surface-2 text-secondary hover:text-primary hover:bg-surface-3 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-tone-danger-bg rounded-full text-[10px] text-primary dark:text-primary flex items-center justify-center font-bold shadow-md shadow-none animate-pulse">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          <div className="h-5 w-px bg-surface-2 dark:bg-surface-3 mx-0.5 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="btn-secondary text-xs px-3 py-1.5 rounded-xl h-9 flex items-center gap-1.5"
            title="Oturumu Kapat"
          >
            <LogOut className="w-3.5 h-3.5 text-tone-danger-fg" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
