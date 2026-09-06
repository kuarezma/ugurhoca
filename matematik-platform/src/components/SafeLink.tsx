'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type SafeLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

// Modül seviyesinde önceden prefetch edilmiş URL'ler (mükerrer istekleri sıfırlar)
const prefetchedUrls = new Set<string>();

/**
 * SafeLink renders a clean HTML <a> tag with intent-based (hover/touch) prefetching
 * and native View Transitions SPA navigation.
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
    router = useRouter();
  } catch {
    router = null;
  }

  const prefetchRoute = (targetHref: string) => {
    if (
      !targetHref ||
      !targetHref.startsWith('/') ||
      targetHref.startsWith('//') ||
      prefetchedUrls.has(targetHref)
    ) {
      return;
    }
    prefetchedUrls.add(targetHref);
    try {
      router?.prefetch(targetHref);
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

        // Native View Transition (eğer tarayıcı destekliyorsa ve reduced-motion yoksa)
        const doc = typeof document !== 'undefined' ? (document as unknown as {
          startViewTransition?: (cb: () => void) => void;
        }) : null;

        if (
          doc?.startViewTransition &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          doc.startViewTransition(() => {
            router?.push(href);
          });
        } else {
          router.push(href);
        }
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
      {...props}
    >
      {children}
    </a>
  );
}
