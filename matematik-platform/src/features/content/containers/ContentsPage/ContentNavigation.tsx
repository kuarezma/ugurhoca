import type { AppUser } from '@/types';
import Image from 'next/image';
import { SafeLink as Link } from '@/components/SafeLink';
import { ArrowLeft } from 'lucide-react';

type ContentNavigationProps = {
  profileHref: '/admin' | '/profil' | '/';
  user: AppUser | null;
};

export function ContentNavigation({
  profileHref,
  user,
}: ContentNavigationProps) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-3 sm:px-5 pt-[max(0.6rem,env(safe-area-inset-top))] pointer-events-none font-sans">
      <div className="pointer-events-auto mx-auto max-w-7xl rounded-2xl lg:rounded-full border border-sky-200/70 dark:border-sky-400/20 bg-surface-1/80 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_32px_-8px_rgba(14,165,233,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_38px_-10px_rgba(2,6,23,0.65)] px-3.5 sm:px-5 py-2.5 sm:py-3 flex justify-between items-center gap-3 transition-all duration-300">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
          <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-2xl border border-sky-300/60 dark:border-sky-400/30 bg-surface-2 p-0.5 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/ugur.jpeg"
              alt="Uğur Hoca"
              width={40}
              height={40}
              priority
              className="h-full w-full rounded-[14px] object-cover"
            />
          </div>
          <span className="font-display text-base sm:text-lg font-bold text-primary truncate">
            Uğur Hoca Matematik
          </span>
        </Link>

        <Link
          href={profileHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-subtle bg-surface-2/80 hover:bg-surface-3 px-3 py-1.5 text-xs sm:text-sm font-bold text-secondary hover:text-primary transition-all shrink-0 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>
            {user?.isAdmin ? 'Admin Panel' : user ? 'Profil' : 'Ana Sayfa'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
