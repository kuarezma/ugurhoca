'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type SafeLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

// Modül seviyesinde önceden prefetch edilmiş URL'ler ve zaman damgaları (TTL: 25sn)
const prefetchedUrls = new Map<string, number>();
const PREFETCH_TTL_MS = 25_000;
const MAX_PREFETCH_CACHE_SIZE = 150;

function shouldPrefetch(url: string): boolean {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return false;
  }
  const now = Date.now();
  const lastPrefetched = prefetchedUrls.get(url);
  if (lastPrefetched && now - lastPrefetched < PREFETCH_TTL_MS) {
    return false;
  }
  if (prefetchedUrls.size >= MAX_PREFETCH_CACHE_SIZE) {
    const cutoff = now - PREFETCH_TTL_MS;
    for (const [entryUrl, timestamp] of prefetchedUrls.entries()) {
      if (timestamp < cutoff) {
        prefetchedUrls.delete(entryUrl);
      }
    }
  }
  prefetchedUrls.set(url, now);
  return true;
}

/**
 * SafeLink renders a clean HTML <a> tag with intent-based (hover/touch) prefetching
 * and client-side SPA navigation.
 *
 * It prevents viewport IntersectionObserver prefetch storms (which would trigger
 * 60+ simultaneous requests on the home page) while ensuring 0ms navigation latency
 * by prefetching the exact link the user hovers or touches 100-200ms before click.
 */
export function SafeLink({
  href,
  children,
  onClick,
  onPointerEnter,
  onTouchStart,
  target,
  rel,
  ...props
}: SafeLinkProps) {
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (typeof useRouter === 'function') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      router = useRouter();
    }
  } catch {
    router = null;
  }
  const [isPending, startTransition] = React.useTransition();

  const prefetchRoute = (targetHref: string) => {
    if (!shouldPrefetch(targetHref)) {
      return;
    }
    try {
      router?.prefetch?.(targetHref);
    } catch {
      // prefetch hatası kritik değildir
    }
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLAnchorElement>) => {
    onPointerEnter?.(event);
    if (!target && href.startsWith('/') && !href.startsWith('//')) {
      prefetchRoute(href);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLAnchorElement>) => {
    onTouchStart?.(event);
    if (!target && href.startsWith('/') && !href.startsWith('//')) {
      prefetchRoute(href);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      !event.defaultPrevented &&
      event.button === 0 &&
      !target &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      href.startsWith('/') &&
      !href.startsWith('//')
    ) {
      if (router) {
        event.preventDefault();

        // React 19 startTransition: gezinme geçişini arka planda eşzamanlı
        // yürütür ve ana thread'i dondurmadan sayfa geçişini başlatır.
        startTransition(() => {
          router.push(href);
        });
      }
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' && !rel ? 'noopener noreferrer' : rel}
      onPointerEnter={handlePointerEnter}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      data-pending={isPending ? 'true' : undefined}
      aria-busy={isPending ? 'true' : undefined}
      {...props}
    >
      {children}
    </a>
  );
}
