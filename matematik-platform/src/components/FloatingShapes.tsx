'use client';

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6'];

interface FloatingShapesProps {
  count?: number;
}

export default function FloatingShapes({ count = 6 }: FloatingShapesProps) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-float-y absolute rounded-full opacity-5"
          style={{
            width: 80,
            height: 80,
            background: COLORS[i % COLORS.length],
            left: `${(i * 18) % 90}%`,
            top: `${(i * 15) % 85}%`,
            animationDelay: `${i * 0.18}s`,
            ['--float-duration' as string]: `${4 + i}s`,
          }}
        />
      ))}
    </div>
  );
}
