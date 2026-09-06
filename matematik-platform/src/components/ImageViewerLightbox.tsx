'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, RotateCw, X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { acquireBodyScrollLock, releaseBodyScrollLock } from '@/hooks/useAccessibleModal';

type ImageViewerLightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export default function ImageViewerLightbox({
  src,
  alt = 'Görsel önizleme',
  onClose,
}: ImageViewerLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!src) return;
    acquireBodyScrollLock();
    return () => {
      releaseBodyScrollLock();
    };
  }, [src]);

  if (!src) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(3.5, prev + 0.3));
  const handleZoomOut = () => setScale((prev) => Math.max(0.6, prev - 0.3));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      style={{ overscrollBehavior: 'contain' }}
      className="fixed inset-0 z-[160] flex flex-col bg-slate-950/92 backdrop-blur-md overscroll-contain"
    >
      {/* Kontrol Çubuğu */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 text-white">
        <div className="flex items-center gap-2 truncate pr-2 text-sm font-semibold">
          <span className="truncate">{alt}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
            %{Math.round(scale * 100)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Yakınlaştır"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Uzaklaştır"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            aria-label="Döndür"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Sıfırla"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            download
            aria-label="Orijinal görseli indir"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Görsel Görüntüleme Sahnesi */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {/* Arka Plan Kapatma Butonu */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Önizlemeyi kapat"
          className="absolute inset-0 h-full w-full cursor-zoom-out bg-transparent border-none p-0 focus:outline-none"
        />

        <div
          className="relative z-10 max-h-[85vh] max-w-[90vw] transition-transform duration-200 ease-out pointer-events-auto"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            unoptimized
            className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
