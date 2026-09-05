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
  isLight = false,
}: ContentCategoryChipsProps) {
  return (
    <div className="space-y-3">
      {/* Sınıf Çipleri */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
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
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-secondary text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
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
