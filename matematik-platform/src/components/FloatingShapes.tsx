'use client';

const COLORS = [
  '#7C3AED',
  '#EC4899',
  '#06B6D4',
  '#FB923C',
  '#22C55E',
  '#FACC15',
  '#6366F1',
  '#14B8A6',
];

const SYMBOLS = ['π', '∑', '√', '∞', '÷', '×', '±', 'Δ', 'θ', 'φ'];

interface FloatingShapesProps {
  count?: number;
  showSymbols?: boolean;
}

export default function FloatingShapes({ count = 8, showSymbols = true }: FloatingShapesProps) {
  const total = Math.max(count, 4);
  const halfSymbols = showSymbols ? Math.ceil(total / 2) : 0;
  const halfOrbs = total - halfSymbols;

  return (
    <div
      className="absolute inset-x-0 top-0 h-[38rem] overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {Array.from({ length: halfOrbs }).map((_, i) => (
        <div
          key={`orb-${i}`}
          className="animate-float-y absolute rounded-full opacity-[0.055] blur-2xl"
          style={{
            width: 120,
            height: 120,
            background: COLORS[i % COLORS.length],
            left: `${8 + ((i * 23) % 78)}%`,
            top: `${(i * 17) % 55}%`,
            animationDelay: `${i * 0.22}s`,
            ['--float-duration' as string]: `${7 + i * 1.3}s`,
          }}
        />
      ))}
      {showSymbols
        ? Array.from({ length: halfSymbols }).map((_, i) => {
            const color = COLORS[(i + 2) % COLORS.length];
            const symbol = SYMBOLS[i % SYMBOLS.length];
            return (
              <span
                key={`sym-${i}`}
                className="animate-drift-xy absolute select-none font-display font-black"
                style={{
                  left: `${6 + ((i * 19 + 11) % 82)}%`,
                  top: `${((i * 23 + 7) % 60)}%`,
                  fontSize: 48 + ((i * 9) % 36),
                  color,
                  opacity: 0.11,
                  textShadow: `0 0 24px ${color}`,
                  animationDelay: `${0.4 + i * 0.3}s`,
                  ['--drift-duration' as string]: `${6 + (i % 5)}s`,
                  ['--drift-opacity-start' as string]: '0.09',
                  ['--drift-opacity-end' as string]: '0.16',
                }}
              >
                {symbol}
              </span>
            );
          })
        : null}
    </div>
  );
}
