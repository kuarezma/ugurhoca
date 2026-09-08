'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export function SmartBoardPresentationMode() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [mode, setMode] = useState<'idle' | 'pen' | 'highlighter' | 'eraser'>('idle');
  const [fontScale, setFontScale] = useState<0 | 1 | 2>(0); // 0: 1.0x, 1: 1.25x, 2: 1.5x
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPointerDownRef = useRef(false);

  // Resize canvas when viewport changes
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) {
        document.body.classList.add('in-lesson-mode');
      } else {
        document.body.classList.remove('in-lesson-mode');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.body.classList.remove('in-lesson-mode', 'board-mode-large', 'board-mode-xlarge');
    };
  }, [resizeCanvas]);

  const toggleLessonFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not permitted or cancelled
    }
  }, []);

  const cycleFontScale = useCallback(() => {
    setFontScale((prev) => {
      const next = ((prev + 1) % 3) as 0 | 1 | 2;
      document.body.classList.remove('board-mode-large', 'board-mode-xlarge');
      if (next === 1) {
        document.body.classList.add('board-mode-large');
      } else if (next === 2) {
        document.body.classList.add('board-mode-xlarge');
      }
      return next;
    });
  }, []);

  const handleSetMode = useCallback((newMode: 'pen' | 'highlighter' | 'eraser') => {
    setMode((prev) => {
      if (prev === newMode) {
        setIsDrawingActive(false);
        return 'idle';
      }
      setIsDrawingActive(true);
      return newMode;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === 'idle') return;
    isPointerDownRef.current = true;
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || mode === 'idle') return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
    } else if (mode === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 20;
    } else if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 24;
    }

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    ctxRef.current?.closePath();
  };

  const fontLabel = fontScale === 1 ? '1.25x' : fontScale === 2 ? '1.5x' : '1.0x';

  return (
    <>
      {/* Şeffaf Çizim Katmanı */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-screen h-screen z-[9998] transition-opacity ${
          isDrawingActive ? 'pointer-events-auto cursor-crosshair opacity-100' : 'pointer-events-none opacity-90'
        }`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-hidden="true"
      />

      {/* Akıllı Tahta Araç Çubuğu */}
      <nav
        aria-label="Akıllı Tahta ve Sunum Araç Çubuğu"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 text-xs font-medium select-none"
      >
        <button
          type="button"
          onClick={toggleLessonFullscreen}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            isFullscreen ? 'bg-indigo-600 text-slate-50 font-semibold' : 'hover:bg-slate-800 text-slate-200'
          }`}
          title="Ders / Tam Ekran Modu"
        >
          {isFullscreen ? 'Tam Ekrandan Çık' : 'Ders Modu'}
        </button>

        <button
          type="button"
          onClick={cycleFontScale}
          className="px-2.5 py-1 rounded-full hover:bg-slate-800 text-slate-200 transition-colors"
          title="Yazı Boyutunu Büyüt (Arka Sıra Modu)"
        >
          Yazı: {fontLabel}
        </button>

        <span className="w-px h-4 bg-slate-700 mx-0.5" aria-hidden="true" />

        <button
          type="button"
          onClick={() => handleSetMode('pen')}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            mode === 'pen' ? 'bg-red-600 text-slate-50 font-semibold' : 'hover:bg-slate-800 text-slate-200'
          }`}
          title="Kırmızı Çizim Kalemi"
        >
          Kalem
        </button>

        <button
          type="button"
          onClick={() => handleSetMode('highlighter')}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            mode === 'highlighter' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-200'
          }`}
          title="Fosforlu Sarı Vurgu"
        >
          Vurgu
        </button>

        <button
          type="button"
          onClick={() => handleSetMode('eraser')}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            mode === 'eraser' ? 'bg-slate-200 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-200'
          }`}
          title="Silgi"
        >
          Silgi
        </button>

        <button
          type="button"
          onClick={clearCanvas}
          className="px-2.5 py-1 rounded-full hover:bg-rose-900 text-rose-300 transition-colors"
          title="Çizimleri Temizle"
        >
          Temizle
        </button>
      </nav>
    </>
  );
}
