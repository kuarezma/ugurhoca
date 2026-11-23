'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Menu, MessageCircle, Search, X } from 'lucide-react';
import { SafeLink } from './SafeLink';
import { ThemeToggle } from './ThemeToggle';
import { useClientPathname } from '@/hooks/useClientPathname';

const sections = [
  { href: '/icerikler', label: 'İçerikler' },
  { href: '/testler', label: 'Testler' },
  { href: '/oyunlar', label: 'Oyunlar' },
  { href: '/programlar', label: 'Rehberlik' },
  { href: '/araclar', label: 'Araçlar' },
  { href: '/odak-pomodoro', label: 'Odak' },
];

export function SitePageNavigation({
  accountHref = '/profil',
  accountLabel = 'Hesabım',
  hideAccountLink = false,
  rightSlot,
  subtitle,
}: {
  accountHref?: string;
  accountLabel?: string;
  hideAccountLink?: boolean;
  rightSlot?: ReactNode;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useClientPathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const openSearch = () => {
    setOpen(false);
    window.dispatchEvent(new Event('ugurhoca:open-command-palette'));
  };

  return (
    <nav
      aria-label="Site menüsü"
      className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-5"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-surface-1 px-3 shadow-sm sm:h-16 lg:rounded-full">
        <SafeLink
          href="/"
          onClick={() => setOpen(false)}
          className="flex min-w-0 items-center gap-2 font-display font-bold text-primary"
        >
          <Image
            src="/ugur.jpeg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate">Uğur Hoca</span>
            {subtitle ? (
              <span className="block truncate font-sans text-[10px] font-semibold leading-tight text-secondary">
                {subtitle}
              </span>
            ) : null}
          </span>
        </SafeLink>
        <div className="hidden items-center gap-1 lg:flex">
          {sections.map(({ href, label }) => (
            <SafeLink
              key={href}
              href={href}
              aria-current={pathname?.startsWith(href) ? 'page' : undefined}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-secondary hover:bg-surface-2 hover:text-primary aria-[current=page]:bg-accent-bg aria-[current=page]:text-accent-fg"
            >
              {label}
            </SafeLink>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {rightSlot}
          <button
            type="button"
            aria-label="Hızlı arama aç"
            onClick={openSearch}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-default text-primary hover:bg-surface-2"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <ThemeToggle compact />
          {!hideAccountLink ? (
            <SafeLink
              href={accountHref}
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-2 lg:inline-flex"
            >
              {accountLabel}
            </SafeLink>
          ) : null}
          <button
            type="button"
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
            ref={menuButtonRef}
            aria-controls="secondary-site-menu"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-primary hover:bg-surface-2 lg:hidden"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <div
          id="secondary-site-menu"
          className="mx-auto mt-2 max-h-[calc(100dvh-11rem-env(safe-area-inset-top))] max-w-7xl overflow-y-auto rounded-2xl border border-border-subtle bg-surface-1 p-3 shadow-lg lg:hidden"
        >
          {sections.map(({ href, label }) => (
            <SafeLink
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname?.startsWith(href) ? 'page' : undefined}
              className="block rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-2"
            >
              {label}
            </SafeLink>
          ))}
          <SafeLink
            href="/canli-ders"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-2"
          >
            Canlı Ders
          </SafeLink>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event('open-chat-bubble'));
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-surface-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Uğur Hoca'ya yaz
          </button>
          {!hideAccountLink ? (
            <SafeLink
              href={accountHref}
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-accent-bg px-3 py-3 text-sm font-semibold text-accent-fg"
            >
              {accountLabel}
            </SafeLink>
          ) : null}
        </div>
      )}
    </nav>
  );
}
