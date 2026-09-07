'use client';

type ContentCategoryChipsProps = {
  selectedGrade: string;
  selectedType: string;
  onSelectGrade: (grade: string) => void;
  onSelectType: (type: string) => void;
  isLight?: boolean;
};

const GRADE_OPTIONS = [
  { id: 'all', label: 'Tüm Sınıflar' },
  { id: '5', label: '5. Sınıf' },
  { id: '6', label: '6. Sınıf' },
  { id: '7', label: '7. Sınıf' },
  { id: '8', label: '8. Sınıf (LGS)' },
  { id: '9', label: '9. Sınıf' },
  { id: '10', label: '10. Sınıf' },
  { id: '11', label: '11. Sınıf' },
  { id: '12', label: '12. Sınıf (YKS)' },
  { id: 'Mezun', label: 'Mezun' },
];


const TYPE_OPTIONS = [
  { id: 'all', label: 'Tüm Türler' },
  { id: 'yaprak-test', label: 'Yaprak Testler' },
  { id: 'ders-notu', label: 'Ders Notları' },
  { id: 'deneme-sinavi', label: 'Denemeler' },
  { id: 'video', label: 'Videolar' },
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
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30 scale-[1.02]'
                    : 'border border-default dark:border-white/[0.08] bg-surface-2/70 text-secondary hover:bg-surface-3 hover:text-primary hover:border-slate-600'
                }`}
              >
                {g.label}
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
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-600/25 border border-cyan-400/30 scale-[1.02]'
                    : 'border border-default dark:border-white/[0.08] bg-surface-2/70 text-secondary hover:bg-surface-3 hover:text-primary hover:border-slate-600'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
