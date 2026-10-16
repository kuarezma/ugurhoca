'use client';

import { X, Keyboard } from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';

type QuizShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
};

const SHORTCUTS = [
  {
    keys: ['A', 'B', 'C', 'D', 'E'],
    altKeys: ['1', '2', '3', '4', '5'],
    description: 'Şıkları tek tuşla anında işaretler.',
  },
  {
    keys: ['Backspace', 'Delete'],
    description: 'İşaretlenen şıkkı siler ve soruyu boş bırakır.',
  },
  {
    keys: ['→', 'Enter'],
    description: 'Sonraki soruya geçer veya testi tamamlar.',
  },
  {
    keys: ['←'],
    description: 'Önceki soruya geri döner.',
  },
  {
    keys: ['O'],
    description: 'Optik form simülasyonunu / yan paneli açar.',
  },
  {
    keys: ['I', 'H'],
    description: 'Kademeli ipucu ve Sokratik analiz merdivenini açar.',
  },
  {
    keys: ['K', 'S'],
    description: 'Karalama & İşlem tahtasını açar / kapatır.',
  },
  {
    keys: ['D'],
    description: 'Disleksi dostu rahat okuma modunu açar / kapatır.',
  },
  {
    keys: ['F', 'B'],
    description: 'Soruya bayrak koyar / bayrağı kaldırır.',
  },
  {
    keys: ['Shift + K'],
    description: 'Matematik kavramlar ve terimler sözlüğünü açar.',
  },
  {
    keys: ['?'],
    description: 'Bu klavye kısayolları penceresini açar.',
  },
];

export function QuizShortcutsModal({
  isOpen,
  onClose,
}: QuizShortcutsModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Test Klavye Kısayolları"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 dark:bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <div
        className="w-full max-w-md rounded-3xl border shadow-2xl p-6 transition-all bg-surface-1 dark:bg-slate-900 border-default dark:border-white/15 text-primary dark:text-white"
      >
        {/* Başlık */}
        <div className="flex items-center justify-between pb-4 border-b border-default dark:border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Test Klavye Kısayolları</h3>
              <p className="text-xs text-secondary dark:text-slate-400">
                Fareye dokunmadan hızlıca test çöz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="rounded-xl p-1.5 text-secondary hover:text-primary dark:text-slate-400 dark:hover:text-white hover:bg-surface-2 dark:hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Kısayol Tablosu */}
        <div className="space-y-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-2xl border border-default dark:border-white/5 bg-surface-2/60 dark:bg-white/5"
            >
              <div className="flex items-center gap-1.5">
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    className="flex h-6 min-w-[24px] items-center justify-center rounded-lg border border-default dark:border-white/20 bg-surface-2 dark:bg-slate-800 px-1.5 font-mono text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
                {item.altKeys && (
                  <>
                    <span className="text-[10px] text-slate-500">veya</span>
                    {item.altKeys.slice(0, 3).map((k) => (
                      <kbd
                        key={k}
                        className="flex h-6 min-w-[20px] items-center justify-center rounded-lg border border-default dark:border-white/10 bg-surface-2 dark:bg-slate-800/80 px-1 font-mono text-[11px] text-secondary dark:text-slate-300"
                      >
                        {k}
                      </kbd>
                    ))}
                    <span className="text-[10px] text-slate-500">...</span>
                  </>
                )}
              </div>

              <span className="text-xs font-medium text-right ml-2 text-secondary dark:text-slate-300">
                {item.description}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
export default QuizShortcutsModal;
