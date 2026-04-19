'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  Gamepad2,
  GraduationCap,
  Home,
  LogIn,
  Search,
  Sparkles,
  User,
} from 'lucide-react';

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
};

const ACTIONABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: 'home',
        label: 'Ana Sayfa',
        hint: 'Ana sayfaya git',
        keywords: ['anasayfa', 'home', 'ana', 'giris'],
        icon: Home,
        action: () => router.push('/'),
      },
      {
        id: 'profile',
        label: 'Profilim',
        hint: 'Öğrenci panelim',
        keywords: ['profil', 'profile', 'hesap', 'panel', 'dashboard'],
        icon: User,
        action: () => router.push('/profil'),
      },
      {
        id: 'contents',
        label: 'İçerikler',
        hint: 'Ders notları, PDF’ler, videolar',
        keywords: ['icerik', 'notlar', 'pdf', 'video', 'ders', 'dokuman'],
        icon: BookOpen,
        action: () => router.push('/icerikler'),
      },
      {
        id: 'tests',
        label: 'Testler',
        hint: 'Soru çöz, pratik yap',
        keywords: ['test', 'soru', 'quiz', 'pratik', 'sinav'],
        icon: ClipboardList,
        action: () => router.push('/testler'),
      },
      {
        id: 'assignments',
        label: 'Ödevler',
        hint: 'Aktif ödevlerim',
        keywords: ['odev', 'assignment', 'teslim', 'gorev'],
        icon: FileText,
        action: () => router.push('/odevler'),
      },
      {
        id: 'progress',
        label: 'İlerleme',
        hint: 'Grafikler, streak, hedefler',
        keywords: ['ilerleme', 'progress', 'grafik', 'hedef', 'streak'],
        icon: BarChart3,
        action: () => router.push('/ilerleme'),
      },
      {
        id: 'programs',
        label: 'Programlar',
        hint: 'LGS ve YKS programları',
        keywords: ['program', 'lgs', 'yks', 'plan', 'cizelge'],
        icon: GraduationCap,
        action: () => router.push('/programlar'),
      },
      {
        id: 'games',
        label: 'Oyunlar',
        hint: 'Eğlenceli matematik oyunları',
        keywords: ['oyun', 'game', 'eglence', 'puzzle'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'login',
        label: 'Giriş / Kayıt',
        hint: 'Hesabına gir veya kayıt ol',
        keywords: ['giris', 'kayit', 'login', 'register', 'signin', 'signup'],
        icon: LogIn,
        action: () => router.push('/giris'),
      },
    ],
    [router],
  );

  const normalize = (value: string) =>
    value
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  const filtered = useMemo(() => {
    const normalized = normalize(query.trim());
    if (!normalized) {
      return commands;
    }
    return commands.filter((command) => {
      const haystack = [command.label, command.hint ?? '', ...command.keywords]
        .map(normalize)
        .join(' ');
      return haystack.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField = target?.closest(ACTIONABLE_SELECTOR);
      const isPaletteOpen = open;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (event.key === '/' && !inField && !isPaletteOpen) {
        event.preventDefault();
        setOpen(true);
        return;
      }

      if (isPaletteOpen && event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const runCommand = useCallback((command: CommandItem) => {
    setOpen(false);
    setQuery('');
    command.action();
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Komut paleti"
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-950/70 px-4 pb-20 pt-16 backdrop-blur-sm sm:pt-24"
    >
      <button
        type="button"
        aria-label="Paleti kapat"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((prev) =>
                  filtered.length === 0
                    ? 0
                    : (prev + 1) % filtered.length,
                );
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((prev) =>
                  filtered.length === 0
                    ? 0
                    : (prev - 1 + filtered.length) % filtered.length,
                );
              } else if (event.key === 'Enter') {
                event.preventDefault();
                const target = filtered[activeIndex];
                if (target) {
                  runCommand(target);
                }
              }
            }}
            placeholder="Bir sayfa ya da komut ara... (⌘K / Ctrl+K)"
            aria-label="Komut arama"
            aria-controls={listboxId}
            className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
            ESC
          </kbd>
        </div>
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Komutlar"
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <li className="flex items-center gap-3 rounded-xl px-3 py-4 text-sm text-slate-400">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Eşleşen bir şey bulamadım.
            </li>
          ) : (
            filtered.map((command, index) => {
              const Icon = command.icon;
              const isActive = index === activeIndex;
              return (
                <li key={command.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runCommand(command)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-brand-primary/20 text-white'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-brand-primary/40 text-white'
                          : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {command.label}
                      </span>
                      {command.hint ? (
                        <span className="block truncate text-xs text-slate-400">
                          {command.hint}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">
              ↑↓
            </kbd>{' '}
            gezin
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">
              ↵
            </kbd>{' '}
            aç
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">
              ESC
            </kbd>{' '}
            kapat
          </span>
        </div>
      </div>
    </div>
  );
}
