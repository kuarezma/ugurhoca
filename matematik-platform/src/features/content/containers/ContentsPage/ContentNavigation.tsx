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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur-md border-b-2 border-border-default py-3 sm:py-4 px-4 sm:px-6 xl:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      <div className="max-w-[1760px] mx-auto flex justify-between items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
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
          <span className="font-display text-base sm:text-xl font-bold text-primary truncate">
            Uğur Hoca Matematik
          </span>
        </Link>

        <Link
          href={profileHref}
          className="text-secondary hover:text-primary flex items-center gap-1.5 text-xs sm:text-base shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>
            {user?.isAdmin ? 'Admin Panel' : user ? 'Profil' : 'Ana Sayfa'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
