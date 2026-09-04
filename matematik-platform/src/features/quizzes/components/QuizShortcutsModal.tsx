'use client';

import { X, Keyboard } from 'lucide-react';

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
    keys: ['→', 'Enter'],
    description: 'Sonraki soruya geçer veya testi tamamlar.',
  },
  {
    keys: ['←'],
    description: 'Önceki soruya geri döner.',
  },
  {
    keys: ['K', 'S'],
    description: 'Karalama & İşlem tahtasını açar / kapatır.',
  },
  {
    keys: ['I', 'H'],
    description: 'Kademeli ipucu merdivenini açar.',
  },
  {
    keys: ['F', 'B'],
    description: 'Soruya bayrak koyar / bayrağı kaldırır.',
  },
  {
    keys: ['?'],
    description: 'Bu klavye kısayolları penceresini açar.',
  },
];

export function QuizShortcutsModal({
  isOpen,
  onClose,
  isLight = false,
}: QuizShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Test Klavye Kısayolları"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-white/15 text-white'
        }`}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base">Test Klavye Kısayolları</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Fareye dokunmadan hızlıca test çöz.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Pencereyi kapat"
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Kısayol Tablosu */}
        <div className="space-y-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    className="flex h-6 min-w-[24px] items-center justify-center rounded-lg border border-white/20 bg-slate-800 px-1.5 font-mono text-xs font-bold text-amber-300 shadow-sm"
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
                        className="flex h-6 min-w-[20px] items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 px-1 font-mono text-[11px] text-slate-300"
                      >
                        {k}
                      </kbd>
                    ))}
                    <span className="text-[10px] text-slate-500">...</span>
                  </>
                )}
              </div>

              <span className={`text-xs font-medium text-right ml-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {item.description}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
export default QuizShortcutsModal;
