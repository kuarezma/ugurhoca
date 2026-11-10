'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ScrollableChipRow({
  children,
  isLight = true,
  className = '',
}: {
  children: ReactNode;
  isLight?: boolean;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateScroll();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [updateScroll]);

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -160, behavior: 'smooth' });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 160, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftPos = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeftPos = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.3;
      el.scrollLeft = scrollLeftPos - walk;
    };

    const onMouseUp = () => {
      isDown = false;
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="group/scrollrow relative flex items-center min-w-0 w-full">
      {/* Sol Kaydırma Oku & Hafif Gradyan Fade */}
      {canScrollLeft && (
        <>
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r ${
              isLight
                ? 'from-white via-white/80 to-transparent'
                : 'from-slate-900 via-slate-900/80 to-transparent'
            }`}
          />
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Sola kaydır"
            title="Sola kaydır"
            className={`absolute left-0 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
              isLight
                ? 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {/* Kaydırılabilir İçerik */}
      <div
        ref={rowRef}
        className={`flex items-center gap-1.5 overflow-x-auto overflow-y-hidden overscroll-contain pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full cursor-grab active:cursor-grabbing ${className}`}
        style={{ overscrollBehavior: 'contain' }}
      >
        {children}
      </div>

      {/* Sağ Kaydırma Oku & Hafif Gradyan Fade */}
      {canScrollRight && (
        <>
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l ${
              isLight
                ? 'from-white via-white/80 to-transparent'
                : 'from-slate-900 via-slate-900/80 to-transparent'
            }`}
          />
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Sağa kaydır"
            title="Sağa kaydır"
            className={`absolute right-0 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
              isLight
                ? 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
