import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { GlobalFooterGate } from '@/components/GlobalFooterGate';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingThemeToggle } from '@/components/ThemeToggle';
import { HomeNavbar } from '@/features/home/components/HomeNavbar';

let currentPath = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

async function expectIsrHydrationClean(
  elementFactory: () => React.ReactNode,
  verify: (container: HTMLElement) => void,
) {
  currentPath = '/index';
  const serverHtml = renderToString(elementFactory());
  currentPath = '/';
  expect(renderToString(elementFactory())).toBe(serverHtml);

  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;

  try {
    await act(async () => {
      root = hydrateRoot(container, elementFactory(), {
        onRecoverableError,
      });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    verify(container);
  } finally {
    await act(async () => root?.unmount());
  }
}

describe('useClientPathname ISR hidrasyon koruması', () => {
  afterEach(() => {
    currentPath = '/';
  });

  it('GlobalFooterGate sunucuda /index dönse bile ana sayfada hatasız hidrate olur', async () => {
    currentPath = '/index';
    expect(renderToString(<GlobalFooterGate />)).toBe('');
    await expectIsrHydrationClean(
      () => <GlobalFooterGate />,
      (container) => {
        expect(container.querySelector('footer')).toBeNull();
      },
    );
  });

  it('FloatingThemeToggle sunucuda /index dönse bile ana sayfada hatasız hidrate olur', async () => {
    const node = () => (
      <ThemeProvider>
        <FloatingThemeToggle />
      </ThemeProvider>
    );
    currentPath = '/index';
    expect(renderToString(node())).toBe('');
    await expectIsrHydrationClean(node, (container) => {
      expect(container.querySelector('button')).toBeNull();
    });
  });

  it('HomeNavbar sunucuda /index dönse bile aria-current uyumsuzluğu üretmez', async () => {
    await expectIsrHydrationClean(
      () => (
        <ThemeProvider>
          <HomeNavbar user={null} onLogout={vi.fn()} />
        </ThemeProvider>
      ),
      (container) => {
        expect(container.querySelector('a[href="/"]')).toHaveAttribute(
          'aria-current',
          'page',
        );
      },
    );
  });
});
