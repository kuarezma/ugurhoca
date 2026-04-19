'use client';

import { memo, useMemo } from 'react';
import katex from 'katex';

type MathTextProps = {
  children?: string | null;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

type Segment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean };

// `$...$` inline ve `$$...$$` blok olarak LaTeX bölümlerini ayrıştır.
// Escaped `\$` kullanıcıya dolar işareti olarak kalır.
function tokenize(input: string): Segment[] {
  const segments: Segment[] = [];
  let buffer = '';
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Escaped dollar: \$
    if (ch === '\\' && input[i + 1] === '$') {
      buffer += '$';
      i += 2;
      continue;
    }

    if (ch === '$') {
      const display = input[i + 1] === '$';
      const delim = display ? '$$' : '$';
      const start = i + delim.length;
      const end = input.indexOf(delim, start);

      if (end === -1) {
        // Kapanış yok, düz metin kabul et
        buffer += input.slice(i);
        break;
      }

      const math = input.slice(start, end);
      if (math.trim().length === 0) {
        buffer += delim + math + delim;
        i = end + delim.length;
        continue;
      }

      if (buffer) {
        segments.push({ type: 'text', value: buffer });
        buffer = '';
      }
      segments.push({ type: 'math', value: math, display });
      i = end + delim.length;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  if (buffer) {
    segments.push({ type: 'text', value: buffer });
  }

  return segments;
}

function renderMath(expr: string, display: boolean): string {
  try {
    return katex.renderToString(expr, {
      displayMode: display,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
      trust: false,
    });
  } catch {
    return (display ? '$$' : '$') + expr + (display ? '$$' : '$');
  }
}

function MathTextInner({ children, className, as: Tag = 'span' }: MathTextProps) {
  const text = typeof children === 'string' ? children : '';
  const segments = useMemo(() => (text ? tokenize(text) : []), [text]);

  const hasMath = segments.some((s) => s.type === 'math');

  if (!hasMath) {
    const Component = Tag as React.ElementType;
    return <Component className={className}>{text}</Component>;
  }

  const Component = Tag as React.ElementType;
  return (
    <Component className={className}>
      {segments.map((segment, idx) =>
        segment.type === 'math' ? (
          <span
            // katex çıktısı güvenlidir (trust:false, strict:ignore); kullanıcı metnini asla ham render etmiyoruz.
            dangerouslySetInnerHTML={{
              __html: renderMath(segment.value, segment.display),
            }}
            key={idx}
          />
        ) : (
          <span key={idx}>{segment.value}</span>
        ),
      )}
    </Component>
  );
}

const MathText = memo(MathTextInner);

export default MathText;
