'use client';

const PARTICLES = [
  { color: '#f97316', left: '8%', top: '14%', duration: '4.2s', delay: '0s' },
  { color: '#ec4899', left: '22%', top: '76%', duration: '5.1s', delay: '0.4s' },
  { color: '#06b6d4', left: '37%', top: '28%', duration: '4.6s', delay: '0.9s' },
  { color: '#8b5cf6', left: '54%', top: '64%', duration: '5.4s', delay: '0.2s' },
  { color: '#10b981', left: '68%', top: '18%', duration: '4.8s', delay: '1.1s' },
  { color: '#f97316', left: '83%', top: '48%', duration: '5.0s', delay: '0.6s' },
  { color: '#ec4899', left: '14%', top: '52%', duration: '4.5s', delay: '1.3s' },
  { color: '#06b6d4', left: '46%', top: '84%', duration: '5.3s', delay: '0.7s' },
  { color: '#8b5cf6', left: '75%', top: '82%', duration: '4.4s', delay: '1.5s' },
  { color: '#10b981', left: '91%', top: '24%', duration: '4.9s', delay: '0.3s' },
  { color: '#f97316', left: '29%', top: '42%', duration: '5.2s', delay: '1.0s' },
  { color: '#ec4899', left: '62%', top: '36%', duration: '4.7s', delay: '0.5s' },
] as const;

export function FloatingParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {PARTICLES.map((p, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 rounded-full opacity-35 animate-float-y"
          style={{
            backgroundColor: p.color,
            left: p.left,
            top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

