'use client';

import { sanitizeRichTextHtml } from '@/lib/html-sanitize';

type SafeHtmlProps = {
  className?: string;
  html: string;
};

export default function SafeHtml({ className, html }: SafeHtmlProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }}
    />
  );
}
