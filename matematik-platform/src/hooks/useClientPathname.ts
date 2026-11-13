'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

const subscribeToHydration = () => () => {};
const readClientHydrated = () => true;
const readServerHydrated = () => false;

/** SSR ile istemci ilk render'ını eşitlemek için hidrasyon tamamlanmasını izler. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    readClientHydrated,
    readServerHydrated,
  );
}

/**
 * Vercel ISR ön-render yolu tarayıcı URL'sinden farklı olabileceği için
 * hidrasyon öncesi `null`, hidrasyon sonrası güncel `usePathname()` döner.
 */
export function useClientPathname(): string | null {
  const routerPathname = usePathname();
  const hydrated = useHydrated();
  return hydrated ? routerPathname : null;
}
