'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import {
  THEME_STORAGE_KEY,
  PALETTE_STORAGE_KEY,
  type ThemePalette,
  DEFAULT_PALETTE,
} from '@/components/theme-constants';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  palette: ThemePalette;
  setPalette: (palette: ThemePalette) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
};

const applyPalette = (palette: ThemePalette) => {
  document.documentElement.dataset.palette = palette;
};

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const readServerTheme = (): Theme => 'dark';

const readPalette = (): ThemePalette =>
  (document.documentElement.dataset.palette as ThemePalette) || DEFAULT_PALETTE;

const readServerPalette = (): ThemePalette => DEFAULT_PALETTE;

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-palette'],
  });
  return () => observer.disconnect();
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, readServerTheme);
  const palette = useSyncExternalStore(subscribeToTheme, readPalette, readServerPalette);

  const setTheme = useCallback((nextTheme: Theme) => {
    const update = () => {
      applyTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(update);
    } else {
      update();
    }
  }, []);

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    const update = () => {
      applyPalette(nextPalette);
      window.localStorage.setItem(PALETTE_STORAGE_KEY, nextPalette);
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(update);
    } else {
      update();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme, palette, setPalette }),
    [setTheme, theme, toggleTheme, palette, setPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
