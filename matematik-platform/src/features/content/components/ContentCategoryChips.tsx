'use client';

type ContentCategoryChipsProps = {
  selectedGrade: string;
  selectedType: string;
  onSelectGrade: (grade: string) => void;
  onSelectType: (type: string) => void;
  isLight?: boolean;
};

const GRADE_OPTIONS: { id: string; label: string; dot?: string }[] = [
  { id: 'all', label: 'Tüm Sınıflar' },
  { id: '5', label: '5. Sınıf', dot: 'bg-cyan-500' },
  { id: '6', label: '6. Sınıf', dot: 'bg-amber-500' },
  { id: '7', label: '7. Sınıf', dot: 'bg-purple-500' },
  { id: '8', label: '8. Sınıf (LGS)', dot: 'bg-rose-500' },
  { id: '9', label: '9. Sınıf', dot: 'bg-blue-500' },
  { id: '10', label: '10. Sınıf', dot: 'bg-emerald-500' },
  { id: '11', label: '11. Sınıf', dot: 'bg-indigo-500' },
  { id: '12', label: '12. Sınıf (YKS)', dot: 'bg-orange-500' },
  { id: 'Mezun', label: 'Mezun', dot: 'bg-slate-400' },
];

const TYPE_OPTIONS: { id: string; label: string; emoji?: string }[] = [
  { id: 'all', label: 'Tüm Türler' },
  { id: 'yaprak-test', label: 'Yaprak Testler', emoji: '📄' },
  { id: 'ders-notu', label: 'Ders Notları', emoji: '📚' },
  { id: 'deneme-sinavi', label: 'Denemeler', emoji: '⏱️' },
  { id: 'video', label: 'Videolar', emoji: '🎬' },
];

export function ContentCategoryChips({
  selectedGrade,
  selectedType,
  onSelectGrade,
  onSelectType,
  isLight: _isLight = false,
}: ContentCategoryChipsProps) {
  return (
    <div className="space-y-4">
      {/* Sınıf Çipleri */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            Sınıf Seviyesi
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {GRADE_OPTIONS.map((g) => {
            const isSelected = selectedGrade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGrade(g.id)}
                className={`group shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-[1.02]'
                    : 'border border-default dark:border-slate-600 bg-white/90 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 shadow-xs'
                }`}
              >
                {g.dot && (
                  <span
                    className={`h-2 w-2 rounded-full ${g.dot} ${
                      isSelected ? 'ring-2 ring-white/50 dark:ring-slate-900/50' : 'opacity-80 group-hover:opacity-100'
                    }`}
                  />
                )}
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tür Çipleri */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            İçerik Türü
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {TYPE_OPTIONS.map((t) => {
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectType(t.id)}
                className={`group shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-[1.02]'
                    : 'border border-default dark:border-slate-600 bg-white/90 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 shadow-xs'
                }`}
              >
                {t.emoji && <span className="text-xs">{t.emoji}</span>}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
