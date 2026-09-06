'use client';

import { useState, useEffect, useCallback } from 'react';

export type A11yFontSize = 'normal' | 'large' | 'xlarge';
export type A11yTouchTarget = 'normal' | 'wcag_24' | 'comfortable_44';

export interface AccessibilitySettings {
  fontSize: A11yFontSize;
  touchTarget: A11yTouchTarget;
  reducedMotion: boolean;
  spaciousOptions: boolean;
  highContrast: boolean;
}

export const DEFAULT_A11Y_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  touchTarget: 'comfortable_44', // WCAG 2.2 AAA ideal default
  reducedMotion: false,
  spaciousOptions: false,
  highContrast: false,
};

export const A11Y_STORAGE_KEY = 'ugurhoca_a11y_settings_v1';

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_A11Y_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(A11Y_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_A11Y_SETTINGS, ...parsed });
      }
    } catch {
      // fallback to default
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync with document element attributes for global CSS styling
  const applyDOMAttributes = useCallback((current: AccessibilitySettings) => {
    if (typeof document === 'undefined') return;
    const doc = document.documentElement;

    doc.setAttribute('data-a11y-font', current.fontSize);
    doc.setAttribute('data-a11y-touch', current.touchTarget);

    if (current.reducedMotion) {
      doc.setAttribute('data-a11y-motion', 'reduced');
    } else {
      doc.removeAttribute('data-a11y-motion');
    }

    if (current.spaciousOptions) {
      doc.setAttribute('data-a11y-spacious', 'true');
    } else {
      doc.removeAttribute('data-a11y-spacious');
    }

    if (current.highContrast) {
      doc.setAttribute('data-a11y-contrast', 'high');
    } else {
      doc.removeAttribute('data-a11y-contrast');
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      applyDOMAttributes(settings);
    }
  }, [settings, isLoaded, applyDOMAttributes]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
      setSettings((prev) => {
        const updated = { ...prev, [key]: value };
        try {
          localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(updated));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ugur_hoca_a11y_changed', { detail: updated }));
          }
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_A11Y_SETTINGS);
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(DEFAULT_A11Y_SETTINGS));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ugur_hoca_a11y_changed', { detail: DEFAULT_A11Y_SETTINGS }));
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  };
}
