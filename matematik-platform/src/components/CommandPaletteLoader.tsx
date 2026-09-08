'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CommandPalette = dynamic(() => import('@/components/CommandPalette'), {
  ssr: false,
});

const ACTIONABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

function isCommandPaletteShortcut(event: KeyboardEvent): boolean {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    return true;
  }

  const target = event.target as HTMLElement | null;
  const isTyping = Boolean(
    target &&
    typeof target.closest === 'function' &&
    target.closest(ACTIONABLE_SELECTOR),
  );

  return event.key === '/' && !isTyping;
}

/** Komut paleti kodunu yalnızca kullanıcı kısayolu kullandığında indirir. */
export function CommandPaletteLoader() {
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    if (isRequested) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isCommandPaletteShortcut(event)) {
        return;
      }

      event.preventDefault();
      setIsRequested(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRequested]);

  return isRequested ? <CommandPalette initiallyOpen /> : null;
}
