'use client';

import { Check, Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { THEME_PALETTES } from '@/components/theme-constants';

interface ThemeSelectorProps {
  className?: string;
  showModeToggle?: boolean;
}

export function ThemeSelector({ className = '', showModeToggle = true }: ThemeSelectorProps) {
  const { theme, setTheme, palette, setPalette } = useTheme();

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Tema & Görünüm
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Çalışma Ortamını Özelleştir
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Gözünü yormayan, ders çalışırken odaklanmanı kolaylaştıran favori renk paletini seç.
          </p>
        </div>

        {showModeToggle && (
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              aria-label="Açık Mod"
            >
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Açık</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              aria-label="Koyu Mod"
            >
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Koyu</span>
            </button>
          </div>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Renk Teması Seçimi"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {THEME_PALETTES.map((item) => {
          const isSelected = palette === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setPalette(item.id)}
              className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm dark:border-indigo-500 dark:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-5 w-5 rounded-full shadow-xs ring-2 ring-white dark:ring-slate-900 shrink-0"
                      style={{ backgroundColor: item.previewColor }}
                      aria-hidden="true"
                    />
                    <span
                      className="h-3.5 w-3.5 -ml-1 rounded-full shadow-xs ring-2 ring-white dark:ring-slate-900 shrink-0 opacity-85"
                      style={{ backgroundColor: item.previewSecondary }}
                      aria-hidden="true"
                    />
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white dark:text-white shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                      Seçili
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {item.id === 'midnight' ? 'AMOLED' : 'Palet'}
                </span>
                <span
                  className="h-2 w-12 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${item.previewColor}, ${item.previewSecondary})`,
                  }}
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
