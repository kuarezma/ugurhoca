import type { AppUser } from '@/types';
import { SitePageNavigation } from '@/components/SitePageNavigation';

type ContentNavigationProps = {
  profileHref: '/admin' | '/profil' | '/';
  user: AppUser | null;
};

export function ContentNavigation({
  profileHref,
  user,
}: ContentNavigationProps) {
  return (
    <SitePageNavigation
      accountHref={user ? profileHref : '/giris'}
      accountLabel={user?.isAdmin ? 'Admin Panel' : user ? 'Profil' : 'Giriş'}
    />
  );
}
