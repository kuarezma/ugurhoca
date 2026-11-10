import MathText from '@/components/MathText';
import type { Flashcard } from './types';

type FlashcardPrintSectionProps = {
  categoryFilter: string;
  filteredCards: Flashcard[];
};

export function FlashcardPrintSection({
  categoryFilter,
  filteredCards,
}: FlashcardPrintSectionProps) {
  return (
    <div className="print-only mb-6 border-b-2 border-black pb-4 text-black">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Uğur Hoca Matematik — Formül & Bilgi Cep Kitapçığı
          </h1>
          <p className="mt-1 text-xs text-gray-700">
            Kategori:{' '}
            {categoryFilter === 'all'
              ? 'Tüm Konular (LGS & YKS)'
              : categoryFilter.toUpperCase()}{' '}
            | Öğrenci Çalışma Notu
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-600">
            Toplam {filteredCards.length} Formül Kartı
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {filteredCards.map((card, idx) => (
          <div
            key={card.id || idx}
            className="rounded-lg border border-gray-400 p-2.5 break-inside-avoid"
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase mb-1">
              <span>{card.subject}</span>
              <span>{card.category.toUpperCase()}</span>
            </div>
            <div className="font-bold text-sm text-black mb-1">
              {card.title}
            </div>
            <div className="font-mono text-xs bg-gray-100 p-1.5 rounded border border-gray-300 text-black mb-1">
              <MathText>{card.formula}</MathText>
            </div>
            <div className="text-[11px] text-gray-800">{card.frontText}</div>
            {card.tip && (
              <div className="mt-1 text-[10px] italic text-gray-600">
                💡 {card.tip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
