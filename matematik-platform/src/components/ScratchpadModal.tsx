'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtractorOverlay from '@/components/ProtractorOverlay';
import { createLogger } from '@/lib/logger';

import {
  hexToRgba,
  type ToolType,
  type BackgroundPattern,
  type ScratchpadQuestionContext,
  type ScratchpadDocumentContext,
  type ScratchpadModalProps,
} from './ScratchpadModal/types';
import { drawBackground } from './ScratchpadModal/canvasBackgrounds';
import {
  drawCoordinatePlaneOnCanvas,
  drawNumberLineOnCanvas,
  drawGeometricShapeOnCanvas,
} from './ScratchpadModal/geometricTools';
import { ScratchpadQuestionPanel } from './ScratchpadModal/ScratchpadQuestionPanel';
import { ScratchpadDocumentPanel } from './ScratchpadModal/ScratchpadDocumentPanel';
import { ScratchpadToolbar } from './ScratchpadModal/ScratchpadToolbar';

export type {
  ScratchpadDocumentContext,
  ScratchpadQuestionContext,
  ScratchpadModalProps,
  BackgroundPattern,
};

const log = createLogger('scratchpad-modal');
const scratchpadCache = new Map<string, ImageData>();

export default function ScratchpadModal({
  isOpen,
  onClose,
  title = 'Karalama & İşlem Tahtası',
  questionContext,
  documentContext,
}: ScratchpadModalProps) {
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose, {
    enableHistoryBack: false,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [color, setColor] = useState('#facc15');
  const [lineWidth, setLineWidth] = useState(3);
  const [backgroundPattern, setBackgroundPattern] =
    useState<BackgroundPattern>('grid');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [preLineState, setPreLineState] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoHistory, setRedoHistory] = useState<ImageData[]>([]);
  const [showQuestionPanel, setShowQuestionPanel] = useState(
    Boolean(questionContext),
  );
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<number>>(
    new Set(),
  );
  const [showProtractor, setShowProtractor] = useState(false);
  const [showPatternMenu, setShowPatternMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);

  const [showDocument, setShowDocument] = useState(true);
  const [documentExpanded, setDocumentExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');

  const cacheKey = documentContext
    ? 'doc-scratchpad-' + (documentContext.documentId || documentContext.title)
    : questionContext?.questionId || 'default-scratchpad';

  const toggleFullscreen = async () => {
    setFullscreenError('');
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (modalRef.current?.requestFullscreen) {
        await modalRef.current.requestFullscreen();
      } else {
        setFullscreenError(
          'Bu tarayıcı tam ekranı desteklemiyor. İşlem tahtasını bu pencerede kullanabilirsin.',
        );
      }
    } catch {
      setFullscreenError(
        'Tam ekran açılamadı. İşlem tahtasını bu pencerede kullanabilirsin.',
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    const syncFullscreen = () =>
      setIsFullscreen(document.fullscreenElement === modal);
    syncFullscreen();
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      if (modal && document.fullscreenElement === modal) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [isOpen, modalRef]);

  useEffect(() => {
    if (isLight && color === '#f8fafc') {
      setColor('#0f172a');
    } else if (!isLight && color === '#0f172a') {
      setColor('#f8fafc');
    }
  }, [isLight, color]);

  useEffect(() => {
    if (isOpen) {
      setShowQuestionPanel(Boolean(questionContext));
      setEliminatedOptions(new Set());
    }
  }, [isOpen, questionContext]);

  const toggleEliminateOption = (idx: number) => {
    setEliminatedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawBackground(ctx, rect.width, rect.height, backgroundPattern, isLight);
    const cached = scratchpadCache.get(cacheKey);
    if (cached) {
      // Panel ve tam ekran boyutu değişse de çizimin tamamını koru.
      const snapshot = document.createElement('canvas');
      snapshot.width = cached.width;
      snapshot.height = cached.height;
      const snapshotContext = snapshot.getContext('2d');
      if (snapshotContext) {
        snapshotContext.putImageData(cached, 0, 0);
        ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
      }
    }
    try {
      const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initial]);
      setRedoHistory([]);
    } catch (e) {
      log.warn('Canvas initial state yakalanamadı', { error: e });
    }
  }, [backgroundPattern, isLight, cacheKey]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(setupCanvas, 60);
    const observer = new ResizeObserver(setupCanvas);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }
    window.addEventListener('resize', setupCanvas);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isOpen, setupCanvas]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      scratchpadCache.set(cacheKey, img);
      setHistory((prev) => [...prev.slice(-25), img]);
      setRedoHistory([]);
    } catch (e) {
      log.warn('Canvas state kaydedilemedi', { error: e });
    }
  }, [cacheKey]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'line') {
      setIsDrawing(true);
      setLineStart({ x, y });
      try {
        setPreLineState(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch {}
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = isLight ? '#ffffff' : '#090d16';
      ctx.lineWidth = lineWidth * 5;
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = hexToRgba(color, 0.35);
      ctx.lineWidth = lineWidth * 3.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'line' && lineStart && preLineState) {
      ctx.putImageData(preLineState, 0, 0);
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
    setLineStart(null);
    setPreLineState(null);
    saveState();
  };

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const current = history[history.length - 1];
    const prev = history[history.length - 2];
    ctx.putImageData(prev, 0, 0);
    setRedoHistory((r) => [current, ...r]);
    setHistory((h) => {
      const next = h.slice(0, -1);
      if (cacheKey && next.length > 0) {
        scratchpadCache.set(cacheKey, next[next.length - 1]);
      }
      return next;
    });
  }, [history, cacheKey]);

  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const next = redoHistory[0];
    ctx.putImageData(next, 0, 0);
    setHistory((h) => {
      const updated = [...h, next];
      if (cacheKey) {
        scratchpadCache.set(cacheKey, next);
      }
      return updated;
    });
    setRedoHistory((r) => r.slice(1));
  }, [redoHistory, cacheKey]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawBackground(ctx, rect.width, rect.height, backgroundPattern, isLight);
    saveState();
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ugur-hoca-karalama-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      log.error('Çözüm görseli indirilemedi', { error: e });
    }
  };

  // Kısayollar: Ctrl+Z, Ctrl+Y
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo]);

  const handleDrawCoordinatePlane = () => {
    if (!canvasRef.current) return;
    drawCoordinatePlaneOnCanvas(canvasRef.current, color, lineWidth, saveState);
  };

  const handleDrawNumberLine = () => {
    if (!canvasRef.current) return;
    drawNumberLineOnCanvas(canvasRef.current, color, lineWidth, saveState);
  };

  const handleDrawGeometricShape = (
    shape: 'triangle' | 'circle' | 'rectangle',
  ) => {
    if (!canvasRef.current) return;
    drawGeometricShapeOnCanvas(
      canvasRef.current,
      shape,
      color,
      lineWidth,
      saveState,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative z-10 flex w-full flex-col overflow-hidden border border-border-default bg-surface-1 shadow-2xl ${isFullscreen ? 'h-dvh max-w-none' : 'h-[95dvh] max-w-7xl rounded-3xl'}`}
      >
        <ErrorBoundary
          fallback={({ reset }) => (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-slate-700 dark:text-slate-300">
              <p className="text-sm">
                Karalama tahtası yüklenirken beklenmedik bir durum oluştu.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 rounded-xl font-semibold text-xs transition bg-brand-primary hover:bg-brand-primary-soft text-slate-950 dark:text-slate-950 shadow-btn-3d-green active:translate-y-1 active:shadow-none"
                >
                  Tuvali Yeniden Başlat
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-slate-700 dark:text-white font-semibold text-xs transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border-default bg-surface-1 px-3 py-2 text-primary">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-pressed={isFullscreen}
              className="rounded-lg border border-border-default px-3 py-2 text-xs font-semibold hover:bg-surface-2"
            >
              {isFullscreen ? 'Tam ekrandan çık' : 'Tam ekran aç'}
            </button>
            {documentContext && (
              <button
                type="button"
                onClick={() => setShowDocument((value) => !value)}
                aria-pressed={showDocument}
                className="rounded-lg border border-border-default px-3 py-2 text-xs font-semibold hover:bg-surface-2"
              >
                {showDocument
                  ? 'Dokümanı gizle / Tahtayı göster'
                  : 'Dokümanı göster'}
              </button>
            )}
            {fullscreenError && (
              <p role="status" className="text-xs text-secondary">
                {fullscreenError}
              </p>
            )}
          </div>
          {/* Header & Araç Çubuğu */}
          <ScratchpadToolbar
            title={title}
            isLight={isLight}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            color={color}
            setColor={setColor}
            lineWidth={lineWidth}
            setLineWidth={setLineWidth}
            backgroundPattern={backgroundPattern}
            setBackgroundPattern={setBackgroundPattern}
            showPatternMenu={showPatternMenu}
            setShowPatternMenu={setShowPatternMenu}
            showShapesMenu={showShapesMenu}
            setShowShapesMenu={setShowShapesMenu}
            showProtractor={showProtractor}
            setShowProtractor={setShowProtractor}
            historyLength={history.length}
            redoHistoryLength={redoHistory.length}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onExport={handleExportPNG}
            onToggleLight={() => setIsLight((prev) => !prev)}
            onClose={onClose}
            questionContext={questionContext}
            showQuestionPanel={showQuestionPanel}
            setShowQuestionPanel={setShowQuestionPanel}
            onDrawCoordinatePlane={handleDrawCoordinatePlane}
            onDrawNumberLine={handleDrawNumberLine}
            onDrawGeometricShape={handleDrawGeometricShape}
          />

          {/* Gövde: Soru Bölmesi + Çizim Alanı */}
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            {documentContext && (
              <div
                className={`${showDocument ? 'block' : 'hidden'} w-full shrink-0 border-r border-border-default ${documentExpanded ? 'md:w-2/3' : 'md:w-1/2'}`}
              >
                <ScratchpadDocumentPanel
                  key={cacheKey}
                  documentContext={documentContext}
                  expanded={documentExpanded}
                  onToggleExpanded={() =>
                    setDocumentExpanded((value) => !value)
                  }
                />
              </div>
            )}
            <ScratchpadQuestionPanel
              questionContext={questionContext!}
              showQuestionPanel={Boolean(questionContext && showQuestionPanel)}
              isLight={isLight}
              eliminatedOptions={eliminatedOptions}
              onToggleEliminateOption={toggleEliminateOption}
            />

            {/* Canvas Çizim Alanı */}
            <div
              className={`relative min-w-0 flex-1 cursor-crosshair touch-none transition-colors ${documentContext && showDocument ? 'hidden md:block' : ''} ${
                isLight ? 'bg-white' : 'bg-[#090d16]'
              }`}
            >
              <canvas
                ref={canvasRef}
                aria-label="İşlem tahtası çizim alanı"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="h-full w-full block"
              />

              <ProtractorOverlay
                isOpen={showProtractor}
                onClose={() => setShowProtractor(false)}
                isLight={isLight}
              />
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
