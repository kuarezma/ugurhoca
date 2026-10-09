'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Share2,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'share';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  durationMs?: number;
  action?: ToastAction;
}

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  share: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  share: Share2,
};

const toastStyles: Record<
  ToastType,
  {
    container: string;
    iconWrapper: string;
    titleColor: string;
    textColor: string;
    stripe: string;
  }
> = {
  share: {
    container:
      'bg-gradient-to-br from-purple-50 via-indigo-50/90 to-fuchsia-50/70 dark:from-purple-950/90 dark:via-slate-900/95 dark:to-indigo-950/90 border-2 border-purple-400 dark:border-purple-500/70 shadow-xl shadow-purple-500/15',
    iconWrapper:
      'bg-purple-500/20 dark:bg-purple-500/30 border border-purple-400/50 dark:border-purple-400/40 text-purple-700 dark:text-purple-300',
    titleColor: 'text-purple-900 dark:text-purple-200',
    textColor: 'text-purple-950 dark:text-purple-100',
    stripe: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600',
  },
  success: {
    container:
      'bg-gradient-to-br from-emerald-50 via-teal-50/90 to-emerald-50/70 dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-teal-950/90 border-2 border-emerald-400 dark:border-emerald-500/70 shadow-xl shadow-emerald-500/15',
    iconWrapper:
      'bg-emerald-500/20 dark:bg-emerald-500/30 border border-emerald-400/50 dark:border-emerald-400/40 text-emerald-700 dark:text-emerald-300',
    titleColor: 'text-emerald-900 dark:text-emerald-200',
    textColor: 'text-emerald-950 dark:text-emerald-100',
    stripe: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600',
  },
  info: {
    container:
      'bg-gradient-to-br from-sky-50 via-blue-50/90 to-cyan-50/70 dark:from-sky-950/90 dark:via-slate-900/95 dark:to-blue-950/90 border-2 border-sky-400 dark:border-sky-500/70 shadow-xl shadow-sky-500/15',
    iconWrapper:
      'bg-sky-500/20 dark:bg-sky-500/30 border border-sky-400/50 dark:border-sky-400/40 text-sky-700 dark:text-sky-300',
    titleColor: 'text-sky-900 dark:text-sky-200',
    textColor: 'text-sky-950 dark:text-sky-100',
    stripe: 'bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-600',
  },
  warning: {
    container:
      'bg-gradient-to-br from-amber-50 via-yellow-50/90 to-amber-50/70 dark:from-amber-950/90 dark:via-slate-900/95 dark:to-yellow-950/90 border-2 border-amber-400 dark:border-amber-500/70 shadow-xl shadow-amber-500/15',
    iconWrapper:
      'bg-amber-500/20 dark:bg-amber-500/30 border border-amber-400/50 dark:border-amber-400/40 text-amber-700 dark:text-amber-300',
    titleColor: 'text-amber-900 dark:text-amber-200',
    textColor: 'text-amber-950 dark:text-amber-100',
    stripe: 'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600',
  },
  error: {
    container:
      'bg-gradient-to-br from-rose-50 via-red-50/90 to-rose-50/70 dark:from-rose-950/90 dark:via-slate-900/95 dark:to-red-950/90 border-2 border-rose-400 dark:border-rose-500/70 shadow-xl shadow-rose-500/15',
    iconWrapper:
      'bg-rose-500/20 dark:bg-rose-500/30 border border-rose-400/50 dark:border-rose-400/40 text-rose-700 dark:text-rose-300',
    titleColor: 'text-rose-900 dark:text-rose-200',
    textColor: 'text-rose-950 dark:text-rose-100',
    stripe: 'bg-gradient-to-r from-rose-600 via-pink-500 to-red-600',
  },
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
      setToasts((prev) => [
        ...prev,
        { id, type, title: options?.title, message, action: options?.action },
      ]);
      const duration = options?.durationMs ?? DEFAULT_DURATION;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast('success', message, options),
    [showToast],
  );
  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast('error', message, options),
    [showToast],
  );
  const info = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast('info', message, options),
    [showToast],
  );
  const warning = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast('warning', message, options),
    [showToast],
  );
  const share = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast('share', message, options),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        info,
        warning,
        share,
        dismiss: removeToast,
      }}
    >
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 z-[120] flex flex-col gap-2.5 max-w-sm ml-auto"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const style = toastStyles[toast.type] || toastStyles.info;
          return (
            <div
              key={toast.id}
              role={
                toast.type === 'error' || toast.type === 'warning'
                  ? 'alert'
                  : 'status'
              }
              className={`pointer-events-auto relative overflow-hidden animate-toast-in flex items-start gap-3 rounded-2xl p-4 shadow-xl backdrop-blur-xl ${style.container}`}
            >
              <div
                className={`absolute top-0 inset-x-0 h-1 ${style.stripe}`}
                aria-hidden="true"
              />
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconWrapper}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5 min-w-0 pt-0.5">
                {toast.title && (
                  <p
                    className={`text-xs font-black tracking-wide ${style.titleColor}`}
                  >
                    {toast.title}
                  </p>
                )}
                <p
                  className={`text-xs sm:text-sm font-semibold leading-snug break-words ${style.textColor}`}
                >
                  {toast.message}
                </p>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 self-start rounded-lg border border-current/30 px-2.5 py-1 text-xs font-bold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Bildirimi kapat"
                className="rounded-lg p-1.5 opacity-70 hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
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
