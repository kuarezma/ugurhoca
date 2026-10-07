'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import {
  THEME_STORAGE_KEY,
  PALETTE_STORAGE_KEY,
  DESIGN_MODE_STORAGE_KEY,
  type ThemePalette,
  type DesignMode,
  DEFAULT_PALETTE,
  DEFAULT_DESIGN_MODE,
} from '@/components/theme-constants';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  palette: ThemePalette;
  setPalette: (palette: ThemePalette) => void;
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => void;
  toggleDesignMode: () => void;
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

const applyDesignMode = (mode: DesignMode) => {
  document.documentElement.dataset.designMode = mode;
};

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const readServerTheme = (): Theme => 'dark';

const readPalette = (): ThemePalette =>
  (document.documentElement.dataset.palette as ThemePalette) || DEFAULT_PALETTE;

const readServerPalette = (): ThemePalette => DEFAULT_PALETTE;

const readDesignMode = (): DesignMode =>
  (document.documentElement.dataset.designMode as DesignMode) || DEFAULT_DESIGN_MODE;

const readServerDesignMode = (): DesignMode => DEFAULT_DESIGN_MODE;

const subscribeToTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-palette', 'data-design-mode'],
  });
  return () => observer.disconnect();
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, readServerTheme);
  const palette = useSyncExternalStore(subscribeToTheme, readPalette, readServerPalette);
  const designMode = useSyncExternalStore(subscribeToTheme, readDesignMode, readServerDesignMode);

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

  const setDesignMode = useCallback((nextMode: DesignMode) => {
    const update = () => {
      applyDesignMode(nextMode);
      window.localStorage.setItem(DESIGN_MODE_STORAGE_KEY, nextMode);
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

  const toggleDesignMode = useCallback(() => {
    setDesignMode(designMode === 'adventure' ? 'classic' : 'adventure');
  }, [setDesignMode, designMode]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      palette,
      setPalette,
      designMode,
      setDesignMode,
      toggleDesignMode,
    }),
    [setTheme, theme, toggleTheme, palette, setPalette, designMode, setDesignMode, toggleDesignMode]
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
