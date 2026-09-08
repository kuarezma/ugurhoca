'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface InteractiveMathCanvasProps {
  className?: string;
  width?: number;
  height?: number;
  autoStart?: boolean;
}

export function InteractiveMathCanvas({
  className = '',
  width = 400,
  height = 300,
  autoStart = true,
}: InteractiveMathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [isOffscreenSupported, setIsOffscreenSupported] = useState(true);
  const [primeCount, setPrimeCount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animating, setAnimating] = useState(autoStart);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let worker: Worker | null = null;
    try {
      worker = new Worker('/workers/math-canvas-worker.js');
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (data?.type === 'PRIMES_RESULT') {
          setPrimeCount(data.count);
          setIsCalculating(false);
        }
      };

      const canvas = canvasRef.current;
      if (canvas && typeof canvas.transferControlToOffscreen === 'function') {
        try {
          const offscreen = canvas.transferControlToOffscreen();
          worker.postMessage(
            {
              type: 'INIT_CANVAS',
              canvas: offscreen,
              width,
              height,
            },
            [offscreen]
          );

          if (autoStart) {
            worker.postMessage({ type: 'START_ANIMATION', speed: 1 });
          }
          setIsOffscreenSupported(true);
        } catch {
          setIsOffscreenSupported(false);
        }
      } else {
        setIsOffscreenSupported(false);
      }

      setIsWorkerReady(true);
    } catch {
      setIsOffscreenSupported(false);
    }

    return () => {
      if (worker) {
        worker.postMessage({ type: 'STOP_ANIMATION' });
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, [width, height, autoStart]);

  const handleCalculatePrimes = useCallback(() => {
    if (!workerRef.current || isCalculating) return;
    setIsCalculating(true);
    workerRef.current.postMessage({
      type: 'CALCULATE_PRIMES',
      max: 100000,
    });
  }, [isCalculating]);

  const toggleAnimation = useCallback(() => {
    if (!workerRef.current) return;
    if (animating) {
      workerRef.current.postMessage({ type: 'STOP_ANIMATION' });
      setAnimating(false);
    } else {
      workerRef.current.postMessage({ type: 'START_ANIMATION', speed: 1 });
      setAnimating(true);
    }
  }, [animating]);

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 ${className}`}>
      <div className="flex items-center justify-between w-full mb-3">
        <h3 className="text-sm font-semibold tracking-wide text-slate-300">
          Harmonik Eğri & Web Worker İzolasyonu
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isOffscreenSupported ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {isOffscreenSupported ? 'OffscreenCanvas Aktif' : 'Standart Mod'}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800/80 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block max-w-full h-auto"
          aria-label="Web Worker destekli etkileşimli matematiksel harmonik animasyonu"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between w-full mt-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAnimation}
            disabled={!isWorkerReady}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {animating ? 'Animasyonu Durdur' : 'Animasyonu Başlat'}
          </button>
          <button
            type="button"
            onClick={handleCalculatePrimes}
            disabled={!isWorkerReady || isCalculating}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            {isCalculating ? 'Hesaplanıyor...' : '100k Asal Sayı Bul'}
          </button>
        </div>

        {primeCount !== null && (
          <span className="text-slate-400">
            Sonuç: <strong className="text-blue-400 font-semibold">{primeCount.toLocaleString('tr-TR')}</strong> adet asal sayı
          </span>
        )}
      </div>
    </div>
  );
}
