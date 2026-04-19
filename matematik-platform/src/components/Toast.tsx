'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  durationMs?: number;
  action?: ToastAction;
}

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success:
    'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
  error:
    'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300',
  info:
    'bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300',
  warning:
    'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300',
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, action: options?.action }]);
      const duration = options?.durationMs ?? DEFAULT_DURATION;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => showToast('success', message, options),
    [showToast],
  );
  const error = useCallback(
    (message: string, options?: ToastOptions) => showToast('error', message, options),
    [showToast],
  );
  const info = useCallback(
    (message: string, options?: ToastOptions) => showToast('info', message, options),
    [showToast],
  );
  const warning = useCallback(
    (message: string, options?: ToastOptions) => showToast('warning', message, options),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, dismiss: removeToast }}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="fixed bottom-24 right-4 z-[110] flex flex-col gap-2 sm:bottom-28 sm:right-6"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
              className={`animate-toast-in flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-lg ${colors[toast.type]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 flex flex-col gap-1.5">
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="self-start rounded-lg border border-current/30 px-2 py-1 text-xs font-semibold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Bildirimi kapat"
                className="rounded-md p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
