'use client';

import { useState, useId } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Plus,
  FunctionSquare,
  Wand2,
} from 'lucide-react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import MathText from '@/components/MathText';

export type AdminLatexHelperModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula?: (formula: string) => void;
};

type SymbolCategory = 'basic' | 'geometry' | 'sets' | 'advanced';

const SYMBOL_GROUPS: {
  category: SymbolCategory;
  label: string;
  items: { label: string; latex: string; preview: string }[];
}[] = [
  {
    category: 'basic',
    label: 'Temel İşlemler & Üs/Kök',
    items: [
      { label: 'Kesir', latex: '\\frac{a}{b}', preview: '$\\frac{a}{b}$' },
      { label: 'Karekök', latex: '\\sqrt{x}', preview: '$\\sqrt{x}$' },
      { label: 'n. Dereceden Kök', latex: '\\sqrt[n]{x}', preview: '$\\sqrt[n]{x}$' },
      { label: 'Kare (Üs)', latex: 'x^2', preview: '$x^2$' },
      { label: 'Genel Üs', latex: 'x^{n}', preview: '$x^{n}$' },
      { label: 'Alt İndis', latex: 'x_{1}', preview: '$x_{1}$' },
      { label: 'Çarpı', latex: '\\cdot', preview: '$\\cdot$' },
      { label: 'Bölü', latex: '\\div', preview: '$\\div$' },
      { label: 'Artı-Eksi', latex: '\\pm', preview: '$\\pm$' },
    ],
  },
  {
    category: 'geometry',
    label: 'Geometri & Açı',
    items: [
      { label: 'Açı', latex: 'm(\\widehat{ABC})', preview: '$m(\\widehat{ABC})$' },
      { label: 'Derece', latex: '60^\\circ', preview: '$60^\\circ$' },
      { label: 'Diklik', latex: '[AB] \\perp [BC]', preview: '$[AB] \\perp [BC]$' },
      { label: 'Paralellik', latex: 'd_1 \\parallel d_2', preview: '$d_1 \\parallel d_2$' },
      { label: 'Üçgen', latex: '\\triangle ABC', preview: '$\\triangle ABC$' },
      { label: 'Kenar Uzunluğu', latex: '|AB|', preview: '$|AB|$' },
      { label: 'Pi Sayısı', latex: '\\pi', preview: '$\\pi$' },
      { label: 'Alfa Açısı', latex: '\\alpha', preview: '$\\alpha$' },
      { label: 'Teta Açısı', latex: '\\theta', preview: '$\\theta$' },
    ],
  },
  {
    category: 'sets',
    label: 'Eşitsizlik & Kümeler',
    items: [
      { label: 'Küçük Eşit', latex: '\\le', preview: '$\\le$' },
      { label: 'Büyük Eşit', latex: '\\ge', preview: '$\\ge$' },
      { label: 'Eşit Değil', latex: '\\neq', preview: '$\\neq$' },
      { label: 'Yaklaşık', latex: '\\approx', preview: '$\\approx$' },
      { label: 'Elemanıdır', latex: '\\in', preview: '$\\in$' },
      { label: 'Alt Küme', latex: '\\subset', preview: '$\\subset$' },
      { label: 'Kesişim', latex: '\\cap', preview: '$\\cap$' },
      { label: 'Birleşim', latex: '\\cup', preview: '$\\cup$' },
      { label: 'Boş Küme', latex: '\\emptyset', preview: '$\\emptyset$' },
    ],
  },
  {
    category: 'advanced',
    label: 'Lise & İleri Düzey',
    items: [
      { label: 'Logaritma', latex: '\\log_{a}(b)', preview: '$\\log_{a}(b)$' },
      { label: 'Doğal Logaritma', latex: '\\ln(x)', preview: '$\\ln(x)$' },
      { label: 'Toplam Sembolü', latex: '\\sum_{i=1}^{n} a_i', preview: '$\\sum_{i=1}^{n} a_i$' },
      { label: 'Limit', latex: '\\lim_{x \\to a} f(x)', preview: '$\\lim_{x \\to a} f(x)$' },
      { label: 'İntegral', latex: '\\int_{a}^{b} f(x)\\,dx', preview: '$\\int_{a}^{b} f(x)\\,dx$' },
      { label: 'Sonsuz', latex: '\\infty', preview: '$\\infty$' },
    ],
  },
];

export function AdminLatexHelperModal({
  isOpen,
  onClose,
  onInsertFormula,
}: AdminLatexHelperModalProps) {
  const titleId = useId();
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  const [activeCategory, setActiveCategory] = useState<SymbolCategory>('basic');
  const [customFormula, setCustomFormula] = useState<string>('\\frac{x^2 - 4}{x + 2} = x - 2');
  const [copied, setCopied] = useState<boolean>(false);

  // Quick auto formatter: converts plain patterns to LaTeX
  const handleAutoFormat = () => {
    let text = customFormula;
    // Replace square root: karekok(x) -> \sqrt{x}
    text = text.replace(/karekok\(([^)]+)\)/gi, '\\sqrt{$1}');
    // Replace simple fractions: (a)/(b) -> \frac{a}{b}
    text = text.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');
    // Replace pi
    text = text.replace(/\bpi\b/gi, '\\pi');
    // Replace <= and >=
    text = text.replace(/<=/g, '\\le ').replace(/>=/g, '\\ge ');
    text = text.replace(/!=/g, '\\neq ');

    setCustomFormula(text);
  };

  const handleCopy = async () => {
    const wrapped = customFormula.startsWith('$') ? customFormula : `$${customFormula}$`;
    try {
      await navigator.clipboard.writeText(wrapped);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleInsert = (latex: string) => {
    const wrapped = latex.startsWith('$') ? latex : `$${latex}$`;
    if (onInsertFormula) {
      onInsertFormula(wrapped);
      onClose();
    } else {
      handleCopy();
    }
  };

  if (!isOpen) return null;

  const currentGroup =
    SYMBOL_GROUPS.find((g) => g.category === activeCategory) || SYMBOL_GROUPS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="admin-latex-helper-modal"
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
              <FunctionSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold tracking-tight">
                  Akıllı LaTeX & Matematik Formül Asistanı
                </h2>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                  KaTeX Önizleme
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Soru ve çözümlere tek tıkla şık matematiksel semboller ekleyin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Canlı Formül Önizlemesi
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFormat}
                title="Düz metin yazımını LaTeX formatına dönüştür"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <Wand2 className="h-3 w-3 text-amber-400" />
                Otomatik Dönüştür
              </button>
            </div>
          </div>

          {/* Formül Render Alanı */}
          <div className="flex min-h-[64px] items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 text-center">
            {customFormula.trim() ? (
              <MathText className="text-xl sm:text-2xl font-serif text-white">
                {customFormula.startsWith('$') ? customFormula : `$${customFormula}$`}
              </MathText>
            ) : (
              <span className="text-xs text-slate-500">
                Aşağıdaki sembollere tıklayın veya formül yazın...
              </span>
            )}
          </div>

          {/* Input & Action Buttons */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customFormula}
              onChange={(e) => setCustomFormula(e.target.value)}
              placeholder="LaTeX kodu (Örn: \frac{a}{b})"
              className="flex-1 h-10 rounded-xl border border-white/15 bg-white/5 px-3.5 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
            {onInsertFormula && (
              <button
                type="button"
                onClick={() => handleInsert(customFormula)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Soruya Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 px-4 py-2 gap-1.5 overflow-x-auto scrollbar-none bg-slate-900/50">
          {SYMBOL_GROUPS.map((group) => (
            <button
              key={group.category}
              type="button"
              onClick={() => setActiveCategory(group.category)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeCategory === group.category
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Symbol Palette Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {currentGroup.items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setCustomFormula(item.latex);
                  if (onInsertFormula) {
                    onInsertFormula(`$${item.latex}$`);
                    onClose();
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-white/5 bg-white/5 hover:border-violet-500/40 hover:bg-violet-500/10 transition group text-center"
              >
                <div className="min-h-[32px] flex items-center justify-center mb-1">
                  <MathText className="text-base text-white group-hover:text-violet-300">
                    {item.preview}
                  </MathText>
                </div>
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200">
                  {item.label}
                </span>
                <span className="text-[9px] font-mono text-slate-500 truncate max-w-full">
                  {item.latex}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminLatexHelperModal;
