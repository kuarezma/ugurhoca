'use client';

import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

export type MathSymbolGroup = {
  name: string;
  symbols: { label: string; value: string; title: string }[];
};

export const MATH_SYMBOL_GROUPS: MathSymbolGroup[] = [
  {
    name: 'Temel & Eşitsizlik',
    symbols: [
      { label: '±', value: '±', title: 'Artı veya Eksi' },
      { label: '×', value: '×', title: 'Çarpma' },
      { label: '÷', value: '÷', title: 'Bölme' },
      { label: '≠', value: '≠', title: 'Eşit Değil' },
      { label: '≤', value: '≤', title: 'Küçük Eşit' },
      { label: '≥', value: '≥', title: 'Büyük Eşit' },
      { label: '≈', value: '≈', title: 'Yaklaşık Eşit' },
    ],
  },
  {
    name: 'Üs & Köklü Sayılar',
    symbols: [
      { label: 'x²', value: '²', title: 'Kare (Üs 2)' },
      { label: 'x³', value: '³', title: 'Küp (Üs 3)' },
      { label: 'xⁿ', value: '^n', title: 'n. Kuvvet' },
      { label: '√', value: '√', title: 'Karekök' },
      { label: '∛', value: '∛', title: 'Küp Kök' },
      { label: '½', value: '½', title: 'Bir Bölü İki' },
      { label: '¼', value: '¼', title: 'Bir Bölü Dört' },
    ],
  },
  {
    name: 'Geometri & Açı',
    symbols: [
      { label: 'π', value: 'π', title: 'Pi Sayısı' },
      { label: '°', value: '°', title: 'Derece' },
      { label: '∠', value: '∠', title: 'Açı' },
      { label: '△', value: '△', title: 'Üçgen' },
      { label: '⊥', value: '⊥', title: 'Diklik' },
      { label: '∥', value: '∥', title: 'Paralellik' },
      { label: 'α', value: 'α', title: 'Alfa Açısı' },
      { label: 'β', value: 'β', title: 'Beta Açısı' },
      { label: 'θ', value: 'θ', title: 'Teta Açısı' },
    ],
  },
  {
    name: 'Kümeler & Mantık',
    symbols: [
      { label: '∈', value: '∈', title: 'Elemanıdır' },
      { label: '∉', value: '∉', title: 'Elemanı Değildir' },
      { label: '⊂', value: '⊂', title: 'Alt Kümesi' },
      { label: '∪', value: '∪', title: 'Birleşim' },
      { label: '∩', value: '∩', title: 'Kesişim' },
      { label: '∅', value: '∅', title: 'Boş Küme' },
      { label: '∞', value: '∞', title: 'Sonsuz' },
    ],
  },
];

type MathInputToolbarProps = {
  onInsertSymbol: (symbol: string) => void;
  className?: string;
};

export function MathInputToolbar({ onInsertSymbol, className = '' }: MathInputToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  // Hızlı bar: En sık kullanılan 7 temel sembol
  const quickSymbols = ['²', '√', 'π', '≤', '≥', '≠', '±', '°'];

  return (
    <div className={`rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-1.5 text-xs ${className}`}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[10px] font-bold text-indigo-400 px-1.5 flex items-center gap-1 shrink-0">
            <Calculator className="w-3 h-3" />
            <span className="hidden sm:inline">Sembol:</span>
          </span>

          {quickSymbols.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => onInsertSymbol(sym)}
              className="h-7 min-w-[28px] px-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-mono font-bold text-xs transition active:scale-95 shrink-0"
              title={`${sym} ekle`}
            >
              {sym}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-[10px] font-bold transition shrink-0"
        >
          <span>{isExpanded ? 'Kapat' : 'Tümü'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-white/10 space-y-2 animate-fade-in">
          {/* Grup Tabları */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {MATH_SYMBOL_GROUPS.map((group, idx) => (
              <button
                key={group.name}
                type="button"
                onClick={() => setActiveGroupIndex(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition ${
                  activeGroupIndex === idx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Aktif Grubun Sembolleri */}
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1 max-h-32 overflow-y-auto p-1">
            {MATH_SYMBOL_GROUPS[activeGroupIndex].symbols.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onInsertSymbol(item.value)}
                className="h-8 rounded-lg bg-slate-800 hover:bg-indigo-600/40 border border-white/5 text-white font-mono font-bold text-xs flex items-center justify-center transition active:scale-95"
                title={item.title}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MathInputToolbar;
