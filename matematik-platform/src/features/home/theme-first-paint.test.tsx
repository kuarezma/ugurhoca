import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/components/ThemeProvider';
import { HomeAnnouncementsSection } from '@/features/home/components/HomeAnnouncementsSection';
import { HomeDailyQuote } from '@/features/home/components/HomeDailyQuote';
import { HomeExamCountdownSection } from '@/features/home/components/HomeExamCountdownSection';
import { HomeFooter } from '@/features/home/components/HomeFooter';
import { HomeHeroSection } from '@/features/home/components/HomeHeroSection';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';
import { HomeNavbarMessagesButton } from '@/features/home/components/HomeNavbarMessagesButton';
import { HomeNavbarNotificationBell } from '@/features/home/components/HomeNavbarNotificationBell';
import { HomeSupportSection } from '@/features/home/components/HomeSupportSection';
import type { Announcement, AppUser } from '@/types';

// Theme classes must come from CSS (`light:` / `dark:` variants on data-theme),
// not from the JS theme state: the server and the first client render do not
// know the theme, so markup that depends on it paints the wrong theme first.

vi.mock('framer-motion', () => {
  const elements = {
    div: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: ComponentPropsWithoutRef<'button'>) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: ComponentPropsWithoutRef<'span'>) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: ComponentPropsWithoutRef<'section'>) => (
      <section {...props}>{children}</section>
    ),
  };

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    LazyMotion: ({ children }: { children: ReactNode }) => <>{children}</>,
    domAnimation: {},
    motion: elements,
    m: elements,
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/Mascot', () => ({
  Mascot: () => <div data-testid="mascot">Pi</div>,
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ showToast: vi.fn(), toast: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}));

vi.mock('@/features/home/hooks/useNavbarNotifications', () => ({
  useNavbarNotifications: () => ({
    notifications: [
      {
        id: 'n-1',
        user_id: 'user-1',
        title: 'Yeni ödev',
        message: 'Cumaya kadar tamamla.',
        type: 'assignment',
        is_read: false,
        created_at: '2026-10-01T10:00:00.000Z',
      },
    ],
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    loading: false,
  }),
}));

vi.mock('@/features/home/hooks/useNavbarMessages', () => ({
  useNavbarMessages: () => ({
    appendMessage: vi.fn(),
    markAllAsRead: vi.fn(),
    messages: [],
    refetch: vi.fn(),
    unreadCount: 2,
  }),
}));

const user: AppUser = {
  id: 'user-1',
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  grade: 8,
} as AppUser;

const announcements: Announcement[] = [
  {
    id: 'a-1',
    title: 'Yeni deneme yayında',
    content: 'LGS deneme 3 açıldı.',
    created_at: '2026-10-01T10:00:00.000Z',
  } as Announcement,
];

type Theme = 'light' | 'dark';

function renderInTheme(theme: Theme, ui: ReactElement, interact?: () => void) {
  document.documentElement.dataset.theme = theme;
  const view = render(<ThemeProvider>{ui}</ThemeProvider>);
  interact?.();
  const html = view.container.innerHTML
    .replace(/:r[0-9a-z]+:/gi, ':r:')
    .replace(/_r_[0-9a-z]+_/gi, ':r:');
  view.unmount();
  return html;
}

function expectThemeIndependentMarkup(ui: () => ReactElement, interact?: () => void) {
  const light = renderInTheme('light', ui(), interact);
  const dark = renderInTheme('dark', ui(), interact);
  expect(light).toBe(dark);
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe('ana sayfa tema sınıfları ilk boyamada CSS’ten gelir', () => {
  it('HomeNavbar (misafir, mobil menü açık) iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(
      () => <HomeNavbar user={null} onLogout={vi.fn()} />,
      () => fireEvent.click(screen.getByRole('button', { name: 'Menüyü aç' })),
    );
  });

  it('HomeNavbar logosu açık temada koyu, koyu temada beyaz yazıyı CSS varyantıyla seçer', () => {
    document.documentElement.dataset.theme = 'light';
    render(
      <ThemeProvider>
        <HomeNavbar user={null} onLogout={vi.fn()} />
      </ThemeProvider>,
    );

    const brand = screen.getByText('Uğur Hoca', { selector: 'span' });
    expect(brand).toHaveClass('text-primary');
    expect(brand).not.toHaveClass('text-white');
  });

  it('HomeNavbar (oturum açık) iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => <HomeNavbar user={user} onLogout={vi.fn()} />);
  });

  it('HomeHeroSection iki temada aynı işaretlemeyi üretir ve başlığı varyantla renklendirir', () => {
    expectThemeIndependentMarkup(() => <HomeHeroSection user={null} />);

    document.documentElement.dataset.theme = 'light';
    render(
      <ThemeProvider>
        <HomeHeroSection user={null} />
      </ThemeProvider>,
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-primary');
    expect(heading).not.toHaveClass('text-white');
  });

  it('HomeNavbarNotificationBell (açık panel) iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(
      () => <HomeNavbarNotificationBell userId="user-1" />,
      () => fireEvent.click(screen.getAllByRole('button')[0]),
    );
  });

  it('HomeNavbarMessagesButton iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => (
      <HomeNavbarMessagesButton userId="user-1" userName="Ayşe" userEmail="ayse@example.com" />
    ));
  });

  it('HomeAnnouncementsSection iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => (
      <HomeAnnouncementsSection announcements={announcements} onSelectAnnouncement={vi.fn()} />
    ));
  });

  it('HomeExamCountdownSection iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => <HomeExamCountdownSection userGrade={8} />);
  });

  it('HomeDailyQuote iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => <HomeDailyQuote />);
  });

  it('HomeSupportSection (misafir ve oturum açık) iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => <HomeSupportSection user={null} />);
    expectThemeIndependentMarkup(() => <HomeSupportSection user={user} />);
  });

  it('HomeFooter iki temada aynı işaretlemeyi üretir', () => {
    expectThemeIndependentMarkup(() => <HomeFooter />);
  });
});
