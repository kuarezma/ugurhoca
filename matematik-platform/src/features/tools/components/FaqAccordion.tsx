'use client';

import { ChevronDown, Info } from 'lucide-react';

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqAccordionProps = {
  title?: string;
  items: FaqItem[];
  iconColorClass?: string;
};

export function FaqAccordion({
  title = 'Sıkça Sorulan Sorular',
  items,
  iconColorClass = 'text-cyan-400',
}: FaqAccordionProps) {
  return (
    <div className="mt-12 space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Info className={`h-4 w-4 ${iconColorClass}`} />
        {title}
      </h2>

      <div className="space-y-3">
        {items.map((faq, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-slate-200 hover:text-white">
              <span>{faq.q}</span>
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
export default FaqAccordion;
