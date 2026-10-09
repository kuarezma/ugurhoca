import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme, applyInitialThemeMigration } from './ThemeProvider';
import { THEME_STORAGE_KEY, THEME_LIGHT_MIGRATION_KEY, PALETTE_STORAGE_KEY } from './theme-constants';

function ThemeProbe({ seen }: { seen?: string[] }) {
  const { theme } = useTheme();
  seen?.push(theme);
  return <span data-testid="theme">{theme}</span>;
}

function ThemeSetter() {
  const { setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme('light')}>
      light
    </button>
  );
}

function PaletteProbe() {
  const { palette } = useTheme();
  return <span data-testid="palette">{palette}</span>;
}

function PaletteSetter() {
  const { setPalette } = useTheme();
  return (
    <button type="button" onClick={() => setPalette('ocean')}>
      ocean
    </button>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    document.documentElement.classList.remove('light', 'dark');
    vi.restoreAllMocks();
  });

  it('istemcide ilk render temayı inline script’in yazdığı data-theme’den okur', () => {
    document.documentElement.dataset.theme = 'light';
    const seen: string[] = [];

    render(
      <ThemeProvider>
        <ThemeProbe seen={seen} />
      </ThemeProvider>,
    );

    expect(seen[0]).toBe('light');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('data-theme yoksa açık temayla başlar', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('sunucu çıktısı açık tema kalır ve hidrasyon uyarısı üretmez', async () => {
    const tree = (
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );
    const serverHtml = renderToString(tree);
    expect(serverHtml).toContain('>light<');

    document.documentElement.dataset.theme = 'light';
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverableErrors: unknown[] = [];

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    await waitFor(() => expect(container.textContent).toBe('light'));
    expect(recoverableErrors).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();

    act(() => root?.unmount());
    container.remove();
  });

  it('setTheme data-theme, sınıf ve localStorage’ı günceller', async () => {
    document.documentElement.dataset.theme = 'dark';

    render(
      <ThemeProvider>
        <ThemeProbe />
        <ThemeSetter />
      </ThemeProvider>,
    );

    act(() => screen.getByRole('button', { name: 'light' }).click());

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('light'));
  });

  it('setPalette data-palette ve localStorage’ı günceller', async () => {
    document.documentElement.dataset.palette = 'classic';

    render(
      <ThemeProvider>
        <PaletteProbe />
        <PaletteSetter />
      </ThemeProvider>,
    );

    act(() => screen.getByRole('button', { name: 'ocean' }).click());

    expect(document.documentElement.dataset.palette).toBe('ocean');
    expect(window.localStorage.getItem(PALETTE_STORAGE_KEY)).toBe('ocean');
    await waitFor(() => expect(screen.getByTestId('palette')).toHaveTextContent('ocean'));
  });

  it('önceden koyu temada olan kullanıcıları tek seferlik açık temaya taşır ve bayrağı kaydeder', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    document.documentElement.dataset.theme = 'dark';

    applyInitialThemeMigration();

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(window.localStorage.getItem(THEME_LIGHT_MIGRATION_KEY)).toBe('1');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('tek seferlik geçiş yapıldıktan sonra kullanıcının koyu temayı seçmesine izin verir', () => {
    // Migration bayrağı önceden set edilmiş
    window.localStorage.setItem(THEME_LIGHT_MIGRATION_KEY, '1');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    document.documentElement.dataset.theme = 'dark';

    // Yeniden çağrıldığında kullanıcının dark tercihini ezmemeli
    applyInitialThemeMigration();

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
