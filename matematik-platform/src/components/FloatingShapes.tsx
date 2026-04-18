'use client';

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#10b981',
  '#8b5cf6',
  '#f43f5e',
  '#14b8a6',
];

interface FloatingShapesProps {
  count?: number;
}

export default function FloatingShapes({ count = 6 }: FloatingShapesProps) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[34rem] overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-float-y absolute rounded-full opacity-[0.045] blur-2xl"
          style={{
            width: 112,
            height: 112,
            background: COLORS[i % COLORS.length],
            left: `${10 + ((i * 22) % 74)}%`,
            top: `${(i * 14) % 52}%`,
            animationDelay: `${i * 0.22}s`,
            ['--float-duration' as string]: `${7 + i * 1.4}s`,
          }}
        />
      ))}
    </div>
  );
}
