'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { THEME_PALETTES } from '@/components/theme-constants';

interface ThemeSelectorDropdownProps {
  className?: string;
  buttonClassName?: string;
  align?: 'left' | 'right';
}

export function ThemeSelectorDropdown({
  className = '',
  buttonClassName = '',
  align = 'right',
}: ThemeSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, palette, setPalette } = useTheme();

  // Dışarı tıklama ve Escape tuşu ile kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentPalette = THEME_PALETTES.find((p) => p.id === palette) || THEME_PALETTES[0];

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Tetikleyici Buton */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Tema ve Renk Paleti Seçimi"
        title="Tema ve Renk Paleti Seçimi"
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white ${buttonClassName}`}
      >
        <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
          style={{ backgroundColor: currentPalette.previewColor }}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">{currentPalette.name}</span>
      </button>

      {/* Açılır Menü (Solid Opak Panel) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Tema Seçenekleri"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50`}
        >
          {/* Üst Kısım: Açık / Koyu Mod Geçişi */}
          <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Görünüm Modu
            </span>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                aria-label="Açık Mod"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Açık</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                aria-label="Koyu Mod"
              >
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Koyu</span>
              </button>
            </div>
          </div>

          {/* Alt Kısım: 5 Renk Paleti Listesi */}
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Renk Paleti
            </span>
            <div className="space-y-1" role="radiogroup" aria-label="Renk Paleti Listesi">
              {THEME_PALETTES.map((item) => {
                const isSelected = palette === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setPalette(item.id);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border border-brand-primary/50 bg-tone-success-bg text-tone-success-fg dark:border-brand-primary/50 dark:bg-tone-success-bg dark:text-brand-primary-soft'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center">
                        <span
                          className="h-4 w-4 rounded-full ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
                          style={{ backgroundColor: item.previewColor }}
                          aria-hidden="true"
                        />
                        <span
                          className="-ml-1 h-3 w-3 rounded-full opacity-80 ring-1 ring-slate-300 dark:ring-slate-700 shrink-0"
                          style={{ backgroundColor: item.previewSecondary }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <span className="block font-semibold">{item.name}</span>
                        <span className="block text-[10px] text-slate-600 dark:text-slate-400">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
