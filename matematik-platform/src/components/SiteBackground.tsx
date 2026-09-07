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
  const glowRef = useRef<HTMLDivElement | null>(null);
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
        alpha: Math.random() * 0.14 + 0.1,
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

    // Fare / Dokunma Pozisyon Takibi.
    // İmleç ışığı doğrudan DOM'a yazılır: setState her mousemove'da kök seviyedeki
    // bu bileşeni yeniden render ederdi (saniyede 100+ commit, her sayfada).
    let glowFrame = 0;

    const syncGlow = () => {
      glowFrame = 0;
      const glow = glowRef.current;
      if (!glow) return;
      const { x, y, active } = mouseRef.current;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      glow.style.opacity = active ? '1' : '0';
    };

    const scheduleGlow = () => {
      if (glowFrame) return;
      glowFrame = requestAnimationFrame(syncGlow);
    };

    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
      scheduleGlow();
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      scheduleGlow();
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
          ? `rgba(79, 70, 229, ${p.baseAlpha * 0.75})`
          : `rgba(167, 139, 250, ${p.baseAlpha})`;
        ctx.fill();

        // 2. Komşu partiküller arası geometrik kafes çizgileri (Delaunay/Truss estetiği)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isLight ? 0.18 : 0.22);
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
        // Canvas 2D `font` CSS değişkeni çözemez; var(--font-display) yazıldığında
        // atama sessizce yok sayılır ve glifler varsayılan 10px ile çizilir.
        ctx.font = `600 ${g.size}px "Baloo 2", system-ui, sans-serif`;

        if (isLight) {
          ctx.shadowColor = 'rgba(99, 102, 241, 0.25)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = `rgba(67, 56, 202, ${g.alpha * 1.5})`;
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
      if (glowFrame) cancelAnimationFrame(glowFrame);
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
      {/* KATMAN 0: Açık Modda Çok Tonlu Akıcı Gradyan Zemin (Gradient Mesh) */}
      {isLight ? (
        <div className="absolute inset-0 light-gradient-mesh" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#090d16]" />
      )}

      {/* KATMAN 1: Donanım Hızlandırmalı Akıcı Aurora Küreleri (GPU CSS) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Küre 1: Sol Üst / İndigo-Mor Parıltı */}
        <div
          className={`aurora-orb aurora-orb-1 -top-24 -left-24 h-[36rem] w-[36rem] sm:h-[52rem] sm:w-[52rem] ${
            isLight
              ? 'bg-gradient-to-br from-indigo-500/25 via-purple-500/18 to-pink-400/12'
              : 'bg-gradient-to-br from-indigo-600/22 via-violet-600/16 to-transparent'
          }`}
        />

        {/* Küre 2: Sağ Üst / Camgöbeği-Gök Mavisi Işıma */}
        <div
          className={`aurora-orb aurora-orb-2 -top-20 -right-20 h-[34rem] w-[34rem] sm:h-[48rem] sm:w-[48rem] ${
            isLight
              ? 'bg-gradient-to-bl from-cyan-400/22 via-sky-400/16 to-indigo-300/10'
              : 'bg-gradient-to-bl from-cyan-500/20 via-blue-600/14 to-transparent'
          }`}
        />

        {/* Küre 3: Orta-Alt / Sıcak Gül-Lavanta Işıma */}
        <div
          className={`aurora-orb aurora-orb-3 top-1/2 left-1/3 -translate-x-1/2 h-[32rem] w-[32rem] sm:h-[46rem] sm:w-[46rem] ${
            isLight
              ? 'bg-gradient-to-tr from-rose-400/20 via-fuchsia-400/14 to-amber-300/10'
              : 'bg-gradient-to-tr from-fuchsia-600/16 via-pink-600/10 to-transparent'
          }`}
        />

        {/* Küre 4: Sağ Alt / İris-Mavi Işıma */}
        <div
          className={`aurora-orb aurora-orb-4 -bottom-24 -right-16 h-[30rem] w-[30rem] sm:h-[42rem] sm:w-[42rem] ${
            isLight
              ? 'bg-gradient-to-tl from-purple-400/20 via-indigo-400/14 to-cyan-300/10'
              : 'bg-gradient-to-tl from-violet-600/18 via-indigo-700/12 to-transparent'
          }`}
        />

        {/* İmleç Manyetik Işık Halkası — konum/görünürlük rAF ile doğrudan DOM'a yazılır */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-0 top-0 h-[26rem] w-[26rem] rounded-full opacity-0 blur-3xl transition-opacity duration-300"
          style={{
            willChange: 'transform, opacity',
            background: isLight
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(236, 72, 153, 0.12) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.12) 45%, transparent 70%)',
          }}
        />
      </div>

      {/* KATMAN 2: Mimari Koordinat & Mavi Kopya Izgarası (Blueprint Mesh) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isLight
            ? `radial-gradient(ellipse 85% 70% at 50% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 80%),
               linear-gradient(to right, rgba(99, 102, 241, 0.045) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(99, 102, 241, 0.045) 1px, transparent 1px)`
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
            ? 'bg-gradient-to-t from-indigo-100/30 via-transparent to-white/40'
            : 'bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40'
        }`}
      />
    </div>
  );
}

export default SiteBackground;
