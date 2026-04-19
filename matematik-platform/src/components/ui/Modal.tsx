'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { cn } from '@/lib/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  hideCloseButton?: boolean;
  disableBackdropClose?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  hideCloseButton = false,
  disableBackdropClose = false,
  children,
  footer,
  className,
}: ModalProps) {
  const labelId = useId();
  const descriptionId = useId();
  const containerRef = useAccessibleModal<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={disableBackdropClose ? undefined : onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? labelId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-3xl border shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)]',
              'bg-white text-slate-900 border-slate-200',
              'dark:bg-slate-900 dark:text-white dark:border-white/10',
              SIZE[size],
              className,
            )}
          >
            {(title || !hideCloseButton) && (
              <div className="flex shrink-0 items-start justify-between gap-3 p-5 sm:p-6 border-b border-slate-200/70 dark:border-white/10">
                <div className="min-w-0">
                  {title ? (
                    <h2
                      id={labelId}
                      className="font-display text-xl sm:text-2xl font-bold leading-tight"
                    >
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
                {!hideCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Kapat"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
              {children}
            </div>
            {footer ? (
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200/70 bg-slate-50/60 p-4 sm:flex-row sm:justify-end sm:p-5 dark:border-white/10 dark:bg-slate-950/40">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
