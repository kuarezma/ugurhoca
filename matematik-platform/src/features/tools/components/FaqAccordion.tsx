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
  iconColorClass = 'text-accent-fg',
}: FaqAccordionProps) {
  return (
    <div className="mt-12 space-y-4">
      <h2 className="text-lg font-bold text-primary flex items-center gap-2">
        <Info className={`h-4 w-4 ${iconColorClass}`} />
        {title}
      </h2>

      <div className="space-y-3">
        {items.map((faq, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-default bg-surface-1 p-4 transition [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-primary hover:text-accent-fg">
              <span>{faq.q}</span>
              <ChevronDown className="h-4 w-4 text-secondary transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-secondary leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
export default FaqAccordion;
