'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type SafeLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

/**
 * SafeLink renders a clean HTML <a> tag to eliminate Next.js Link prefetch storms.
 *
 * Next.js <Link> components register viewport IntersectionObservers and hover
 * listeners that eagerly trigger RSC (?_rsc=...) payloads. When dozens of links
 * (e.g. 9 grades, 8 categories, CTA buttons) appear on the home page, this floods
 * the server with 60+ concurrent serverless invocations, causing 503 errors.
 *
 * SafeLink avoids all automatic prefetching while retaining fast client-side
 * SPA navigation upon explicit user click via router.push().
 */
export function SafeLink({
  href,
  children,
  onClick,
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
        router.push(href);
      }
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' && !rel ? 'noopener noreferrer' : rel}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
