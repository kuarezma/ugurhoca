'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gamepad2,
  GraduationCap,
  Home,
  ListChecks,
  LogIn,
  MonitorPlay,
  PenTool,
  Search,
  Sparkles,
  Swords,
  Timer,
  User,
  Video,
  Zap,
} from 'lucide-react';

export type CommandCategory = 'Araç' | 'Oyun' | 'Konu' | 'Sayfa';

export type CommandItem = {
  id: string;
  label: string;
  category: CommandCategory;
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

  const openTool = useCallback((tool: string, fallbackPath = '/?tool=' + tool) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ugurhoca:open-tool', { detail: { tool } }));
      if (tool === 'mistakes' && !window.location.pathname.startsWith('/testler')) {
        router.push('/testler?tool=mistakes');
        return;
      }
      if (tool !== 'mistakes' && window.location.pathname !== '/') {
        router.push(fallbackPath);
      }
    }
  }, [router]);

  const commands = useMemo<CommandItem[]>(
    () => [
      // Hızlı Araçlar
      {
        id: 'calculator',
        label: 'LGS & YKS Puan / Net Hesaplayıcı',
        category: 'Araç',
        hint: 'MEB/ÖSYM uyumlu anlık net ve puan hesapla',
        keywords: ['hesapla', 'hesaplayici', 'puan', 'net', 'lgs', 'yks', 'tyt', 'ayt'],
        icon: Calculator,
        action: () => openTool('calculator'),
      },
      {
        id: 'pomodoro',
        label: 'Matematik Odak & Pomodoro Sayacı',
        category: 'Araç',
        hint: '25/50 dk çalışma süreölçeri ve mola zili',
        keywords: ['pomodoro', 'odak', 'sayac', 'sure', 'zaman', 'timer', 'kronometre'],
        icon: Timer,
        action: () => openTool('pomodoro'),
      },
      {
        id: 'checklist',
        label: 'MEB Matematik Konu Takip Çizelgesi',
        category: 'Araç',
        hint: '5-12. sınıf müfredat kazanım takip listesi ve A4 yazdır',
        keywords: ['cizelge', 'konu', 'takip', 'kazanim', 'mufredat', 'liste', 'checklist', 'yazdir'],
        icon: ListChecks,
        action: () => openTool('checklist'),
      },
      {
        id: 'flashcards',
        label: 'Formül & Bilgi Kartları',
        category: 'Araç',
        hint: 'LGS ve YKS matematik pratik formül tekrarı',
        keywords: ['formul', 'kart', 'flashcard', 'kural', 'ozet', 'ezber'],
        icon: Sparkles,
        action: () => openTool('flashcards'),
      },
      {
        id: 'speed-drill',
        label: '60 Saniye Formül Eşleştirme Antrenmanı',
        category: 'Araç',
        hint: '60 saniyede hızlı matematik formül eşleştirme pratiği',
        keywords: ['formul', 'hiz', 'drill', 'eslestir', 'antrenman', 'sure', '60', 'kural', 'aktif'],
        icon: Zap,
        action: () => openTool('speed-drill'),
      },
      {
        id: 'mistakes',
        label: 'Akıllı Hata Defterim',
        category: 'Araç',
        hint: 'Testlerdeki yanlış sorular havuzu ve tekrar çözümü',
        keywords: ['hata', 'yanlis', 'defter', 'tekrar', 'soru', 'eksik'],
        icon: CheckCircle2,
        action: () => openTool('mistakes', '/testler?tool=mistakes'),
      },
      {
        id: 'scratchpad',
        label: 'Karalama & İşlem Tahtası',
        category: 'Araç',
        hint: 'Geometrik şekiller ve serbest tuval çizimi',
        keywords: ['karalama', 'cizim', 'tahta', 'tuval', 'scratchpad', 'geometri'],
        icon: PenTool,
        action: () => openTool('scratchpad'),
      },
      {
        id: 'graph',
        label: 'İnteraktif Fonksiyon & Grafik Görselleştirici',
        category: 'Araç',
        hint: 'Doğrusal fonksiyon, parabol ve birim çember simülasyonu',
        keywords: ['grafik', 'fonksiyon', 'parabol', 'trigonometri', 'cember', 'egim', 'visualizer'],
        icon: Activity,
        action: () => openTool('graph'),
      },
      {
        id: 'replay_archive',
        label: 'Canlı Ders Kayıtları & Arşiv',
        category: 'Araç',
        hint: 'Geçmiş canlı video dersler ve bölüm başlıkları',
        keywords: ['canli', 'ders', 'kayit', 'video', 'tekrar', 'arsiv'],
        icon: Video,
        action: () => openTool('replay_archive', '/canli-ders'),
      },
      {
        id: 'report_card',
        label: 'Aylık Matematik Gelişim Raporu & Karne',
        category: 'Araç',
        hint: 'Kazanım başarısı, soru istatistikleri ve A4 başarı belgesi',
        keywords: ['karne', 'rapor', 'gelisim', 'basari', 'belge', 'aylik'],
        icon: Award,
        action: () => openTool('report_card', '/ilerleme'),
      },
      {
        id: 'topic_weights',
        label: 'MEB & ÖSYM Çıkmış Soru Dağılım Matrisi',
        category: 'Araç',
        hint: 'Son 5 yıl LGS, TYT ve AYT konu ağırlıkları ve kritik kazanımlar',
        keywords: ['matris', 'cikmis', 'soru', 'dagilim', 'agirlik', 'lgs', 'tyt', 'ayt', 'istatistik'],
        icon: BarChart3,
        action: () => openTool('topic-weights'),
      },
      {
        id: 'weekly_planner',
        label: 'A4 Masabaşı Haftalık Çalışma Çizelgesi',
        category: 'Araç',
        hint: 'Kişiselleştirilebilir soru hedefi, Pomodoro takibi ve A4 yazdır',
        keywords: ['cizelge', 'haftalik', 'plan', 'planner', 'calisma', 'program', 'yazdir', 'a4'],
        icon: ClipboardList,
        action: () => openTool('weekly-planner'),
      },

      // Eğlenceli Matematik Oyunları
      {
        id: 'game_math_duel',
        label: 'Matematik Düellosu (1v1 Hızlı İşlem)',
        category: 'Oyun',
        hint: 'Arkadaşınla ya da zamana karşı işlem yarışı',
        keywords: ['oyun', 'duello', '1v1', 'hizli', 'islem', 'mathduel'],
        icon: Swords,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'game_math_ninja',
        label: 'Matematik Ninjası (Dilimlemece)',
        category: 'Oyun',
        hint: 'Doğru sonuçları dilimle ve kombo yap',
        keywords: ['oyun', 'ninja', 'dilimle', 'islem', 'mathninja'],
        icon: Swords,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'game_pizza_chef',
        label: 'Kesir Şefi Pizza',
        category: 'Oyun',
        hint: 'Pizza dilimleriyle kesirleri öğren',
        keywords: ['oyun', 'kesir', 'pizza', 'sef', 'pizzachef'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'game_speed_racer',
        label: 'Hız Yarışı (Çarpım Tablosu)',
        category: 'Oyun',
        hint: 'Çarpım tablosu nitro yarışı',
        keywords: ['oyun', 'hiz', 'yaris', 'carpim', 'tablosu', 'speedracer'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'game_mole_whack',
        label: 'Köstebek Vurmaca',
        category: 'Oyun',
        hint: 'Katlar ve bölünebilme kuralları',
        keywords: ['oyun', 'kostebek', 'kat', 'bolunebilme', 'molewhack'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'game_tower_block',
        label: 'Kule Bloğu',
        category: 'Oyun',
        hint: 'Zihinden toplama ile matematik kulesi inşa et',
        keywords: ['oyun', 'kule', 'blok', 'toplama', 'towerblock'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },

      // Önemli Matematik Konuları & Formül Kısayolları
      {
        id: 'topic_pythagoras',
        label: 'Pisagor Bağıntısı ve Özel Üçgenler',
        category: 'Konu',
        hint: 'a² + b² = c² ve 3-4-5, 5-12-13 formülleri',
        keywords: ['pisagor', 'ucgen', 'hipotenus', 'geometri', 'formuller'],
        icon: Sparkles,
        action: () => openTool('flashcards'),
      },
      {
        id: 'topic_factoring',
        label: 'Çarpanlara Ayırma ve Özdeşlikler',
        category: 'Konu',
        hint: '(a+b)² ve a²-b² iki kare farkı kuralları',
        keywords: ['carpanlara ayirma', 'ozdeslik', 'iki kare farki', 'tam kare'],
        icon: Sparkles,
        action: () => openTool('flashcards'),
      },
      {
        id: 'topic_radicals',
        label: 'Kareköklü İfadeler ve Kural Özeti',
        category: 'Konu',
        hint: 'Kök dışına çıkarma ve yaklaşık değer hesabı',
        keywords: ['karekok', 'koklu', 'yaklasik deger'],
        icon: Sparkles,
        action: () => openTool('flashcards'),
      },
      {
        id: 'topic_quadratics',
        label: 'İkinci Dereceden Denklemler & Diskriminant',
        category: 'Konu',
        hint: 'Δ = b² - 4ac, kök bulma ve parabol grafiği',
        keywords: ['delta', 'diskriminant', 'ikinci derece', 'parabol'],
        icon: Activity,
        action: () => openTool('graph'),
      },
      {
        id: 'topic_linear',
        label: 'Doğrusal Fonksiyonlar ve Eğim',
        category: 'Konu',
        hint: 'y = mx + b doğrusu ve eğim hesabı',
        keywords: ['dogrusal', 'egim', 'fonksiyon', 'grafik'],
        icon: Activity,
        action: () => openTool('graph'),
      },
      {
        id: 'topic_trig',
        label: 'Trigonometrik Oranlar & Birim Çember',
        category: 'Konu',
        hint: 'sin, cos, tan açı değerleri ve bölgeleri',
        keywords: ['trigonometri', 'sinus', 'kosinus', 'birim cember'],
        icon: Activity,
        action: () => openTool('graph'),
      },

      // Sayfalar
      {
        id: 'home',
        label: 'Ana Sayfa',
        category: 'Sayfa',
        hint: 'Ana sayfaya git',
        keywords: ['anasayfa', 'home', 'ana', 'giris'],
        icon: Home,
        action: () => router.push('/'),
      },
      {
        id: 'profile',
        label: 'Profilim',
        category: 'Sayfa',
        hint: 'Öğrenci panelim',
        keywords: ['profil', 'profile', 'hesap', 'panel', 'dashboard'],
        icon: User,
        action: () => router.push('/profil'),
      },
      {
        id: 'contents',
        label: 'İçerikler',
        category: 'Sayfa',
        hint: 'Ders notları, PDF’ler, videolar',
        keywords: ['icerik', 'notlar', 'pdf', 'video', 'ders', 'dokuman'],
        icon: BookOpen,
        action: () => router.push('/icerikler'),
      },
      {
        id: 'tests',
        label: 'Testler',
        category: 'Sayfa',
        hint: 'Soru çöz, pratik yap',
        keywords: ['test', 'soru', 'quiz', 'pratik', 'sinav'],
        icon: ClipboardList,
        action: () => router.push('/testler'),
      },
      {
        id: 'assignments',
        label: 'Ödevler',
        category: 'Sayfa',
        hint: 'Aktif ödevlerim',
        keywords: ['odev', 'assignment', 'teslim', 'gorev'],
        icon: FileText,
        action: () => router.push('/odevler'),
      },
      {
        id: 'progress',
        label: 'İlerleme',
        category: 'Sayfa',
        hint: 'Grafikler, streak, hedefler',
        keywords: ['ilerleme', 'progress', 'grafik', 'hedef', 'streak'],
        icon: BarChart3,
        action: () => router.push('/ilerleme'),
      },
      {
        id: 'programs',
        label: 'Programlar',
        category: 'Sayfa',
        hint: 'LGS ve YKS programları',
        keywords: ['program', 'lgs', 'yks', 'plan', 'cizelge'],
        icon: GraduationCap,
        action: () => router.push('/programlar'),
      },
      {
        id: 'games',
        label: 'Oyunlar',
        category: 'Sayfa',
        hint: 'Eğlenceli matematik oyunları',
        keywords: ['oyun', 'game', 'eglence', 'puzzle'],
        icon: Gamepad2,
        action: () => router.push('/oyunlar'),
      },
      {
        id: 'live-lessons',
        label: 'Canlı Ders',
        category: 'Sayfa',
        hint: 'Planlanan ve aktif dersler',
        keywords: ['canli', 'ders', 'zoom', 'online', 'uzaktan'],
        icon: MonitorPlay,
        action: () => router.push('/canli-ders'),
      },
      {
        id: 'login',
        label: 'Giriş / Kayıt',
        category: 'Sayfa',
        hint: 'Hesabına gir veya kayıt ol',
        keywords: ['giris', 'kayit', 'login', 'register', 'signin', 'signup'],
        icon: LogIn,
        action: () => router.push('/giris'),
      },
    ],
    [openTool, router],
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
      const inField = Boolean(
        target && typeof target.closest === 'function' && target.closest(ACTIONABLE_SELECTOR),
      );
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
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 px-4 py-3">
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
            className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-400 sm:inline">
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
            <li className="flex items-center gap-3 rounded-xl px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
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
                        ? 'bg-brand-primary/15 text-brand-primary dark:text-white font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {command.label}
                        </span>
                        {command.category && (
                          <span
                            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
                              command.category === 'Araç'
                                ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-400'
                                : command.category === 'Oyun'
                                ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/25 text-purple-700 dark:text-purple-400'
                                : command.category === 'Konu'
                                ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600/30 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {command.category}
                          </span>
                        )}
                      </div>
                      {command.hint ? (
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
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
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>
            <kbd className="rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1 font-mono text-slate-600 dark:text-slate-400">
              ↑↓
            </kbd>{' '}
            gezin
          </span>
          <span>
            <kbd className="rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1 font-mono text-slate-600 dark:text-slate-400">
              ↵
            </kbd>{' '}
            aç
          </span>
          <span>
            <kbd className="rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1 font-mono text-slate-600 dark:text-slate-400">
              ESC
            </kbd>{' '}
            kapat
          </span>
        </div>
      </div>
    </div>
  );
}
