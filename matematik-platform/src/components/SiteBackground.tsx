'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface MathGlyph {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  alpha: number;
  phase: number;
}

const GLYPHS = ['π', '∑', '∞', '√x', '∫', 'Δ', 'φ', 'f(x)', 'e', 'θ'];

export function SiteBackground() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Canvas Animasyonu: Matematiksel Takımyıldız Ağı ve Süzülen Glifler
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Erişilebilirlik: Kullanıcı hareketi azaltmak istiyorsa döngüyü başlatma
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let animId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let glyphs: MathGlyph[] = [];

    const setupDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Ekran genişliğine göre partikül yoğunluğu (mobilde az, masaüstünde zengin)
      const particleCount = width < 768 ? 26 : width < 1280 ? 44 : 58;
      const glyphCount = width < 768 ? 6 : 10;

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2,
        baseAlpha: Math.random() * 0.25 + 0.2,
      }));

      glyphs = Array.from({ length: glyphCount }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        symbol: GLYPHS[i % GLYPHS.length],
        size: Math.floor(Math.random() * 8) + 16,
        alpha: Math.random() * 0.12 + 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    setupDimensions();

    const handleResize = () => {
      setupDimensions();
      if (prefersReducedMotion) {
        drawFrame(0);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Fare / Dokunma Pozisyon Takibi
    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, {
      passive: true,
    });

    let lastTime = performance.now();

    const drawFrame = (currentTime: number) => {
      ctx.clearRect(0, 0, width, height);

      const maxDist = width < 768 ? 95 : 125;
      const mouse = mouseRef.current;

      // 1. Partiküller ve Manyetik Çekim
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Kenarlardan yumuşak sekme
          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;

          // Fare manyetik etkisi (hafif ve organik)
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 140 && dist > 1) {
              const force = (1 - dist / 140) * 0.015;
              p.vx += dx * force;
              p.vy += dy * force;
              // Hız kısıtlaması
              const speed = Math.hypot(p.vx, p.vy);
              if (speed > 1.2) {
                p.vx = (p.vx / speed) * 1.2;
                p.vy = (p.vy / speed) * 1.2;
              }
            }
          }
        }

        // Partikül çizimi
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(99, 102, 241, ${p.baseAlpha * 0.55})`
          : `rgba(167, 139, 250, ${p.baseAlpha})`;
        ctx.fill();

        // 2. Komşu partiküller arası geometrik kafes çizgileri (Delaunay/Truss estetiği)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isLight ? 0.12 : 0.22);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLight
              ? `rgba(99, 102, 241, ${alpha})`
              : `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // 3. Süzülen Matematik Glifleri (π, ∑, ∞, √, ∫ vb.)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const timeDelta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];

        if (!prefersReducedMotion) {
          g.x += g.vx;
          g.y += g.vy;
          g.phase += timeDelta * 0.8;

          if (g.x < -30) g.x = width + 30;
          else if (g.x > width + 30) g.x = -30;
          if (g.y < -30) g.y = height + 30;
          else if (g.y > height + 30) g.y = -30;
        }

        const floatY = g.y + Math.sin(g.phase) * 5;
        ctx.font = `600 ${g.size}px var(--font-display), "Baloo 2", sans-serif`;

        if (isLight) {
          ctx.fillStyle = `rgba(71, 85, 105, ${g.alpha * 0.85})`;
        } else {
          ctx.shadowColor = 'rgba(167, 139, 250, 0.4)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(226, 232, 240, ${g.alpha * 1.2})`;
        }

        ctx.fillText(g.symbol, g.x, floatY);
        ctx.shadowBlur = 0; // Sıfırla
      }
    };

    // Animasyon döngüsü (CPU koruma ile)
    const loop = (time: number) => {
      drawFrame(time);
      animId = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      animId = requestAnimationFrame(loop);
    }

    // Tarayıcı sekmesi gizlendiğinde pil/CPU koruması için duraklat
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else if (!prefersReducedMotion) {
        lastTime = performance.now();
        animId = requestAnimationFrame(loop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted, isLight]);

  return (
    <div
      className="site-background-container fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
      data-testid="site-background"
    >
      {/* KATMAN 1: Donanım Hızlandırmalı Akıcı Aurora Küreleri (GPU CSS) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Küre 1: Sol Üst / İndigo-Mor Parıltı */}
        <div
          className={`aurora-orb aurora-orb-1 -top-24 -left-24 h-[34rem] w-[34rem] sm:h-[48rem] sm:w-[48rem] ${
            isLight
              ? 'bg-gradient-to-br from-indigo-500/10 via-purple-400/5 to-transparent'
              : 'bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-transparent'
          }`}
        />

        {/* Küre 2: Sağ Üst / Camgöbeği-Mavi Işıma */}
        <div
          className={`aurora-orb aurora-orb-2 -top-20 -right-20 h-[32rem] w-[32rem] sm:h-[44rem] sm:w-[44rem] ${
            isLight
              ? 'bg-gradient-to-bl from-sky-400/8 via-cyan-300/4 to-transparent'
              : 'bg-gradient-to-bl from-cyan-500/18 via-blue-600/12 to-transparent'
          }`}
        />

        {/* Küre 3: Orta-Alt / Sıcak Fuşya-Lavanta Işıma */}
        <div
          className={`aurora-orb aurora-orb-3 top-1/2 left-1/3 -translate-x-1/2 h-[30rem] w-[30rem] sm:h-[42rem] sm:w-[42rem] ${
            isLight
              ? 'bg-gradient-to-tr from-pink-400/6 via-rose-300/3 to-transparent'
              : 'bg-gradient-to-tr from-fuchsia-600/14 via-pink-600/8 to-transparent'
          }`}
        />
      </div>

      {/* KATMAN 2: Mimari Koordinat & Mavi Kopya Izgarası (Blueprint Mesh) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isLight
            ? `radial-gradient(ellipse 85% 70% at 50% 30%, rgba(99, 102, 241, 0.04) 0%, transparent 80%),
               linear-gradient(to right, rgba(99, 102, 241, 0.035) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(99, 102, 241, 0.035) 1px, transparent 1px)`
            : `radial-gradient(ellipse 85% 70% at 50% 30%, rgba(139, 92, 246, 0.06) 0%, transparent 80%),
               linear-gradient(to right, rgba(255, 255, 255, 0.022) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(255, 255, 255, 0.022) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          maskImage:
            'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 85% at 50% 35%, black 30%, transparent 95%)',
        }}
      >
        {/* Izgara Üzerinde Kayan Işık Dalgası / Tarama Nabzı */}
        <div className="grid-shimmer-beam" />
      </div>

      {/* KATMAN 3: İnteraktif Matematiksel Takımyıldız & Süzülen Glif Canvas'ı */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90 transition-opacity duration-700"
      />

      {/* KATMAN 4: Kenar Karartma ve Derinlik Vignette'i */}
      <div
        className={`absolute inset-0 ${
          isLight
            ? 'bg-radial-gradient-vignette opacity-20'
            : 'bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40'
        }`}
      />
    </div>
  );
}

export default SiteBackground;
