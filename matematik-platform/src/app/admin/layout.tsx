import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVerifiedServerUser } from '@/lib/auth-verify.server';
import { createPageMetadata } from '@/lib/site-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Yönetim paneli',
  description: 'Yönetici alanı — arama motorlarında dizine eklenmez.',
  path: '/admin',
  noIndex: true,
});

// Sunucu-taraflı guard (derinlemesine savunma): admin bundle'ı, doğrulanmış JWT'si
// admin olmayan hiç kimseye render edilmez. API route'ları zaten bağımsız doğruluyor.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getVerifiedServerUser();

  if (!user) {
    redirect('/giris');
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  return children;
}
