type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown> | undefined;

const isDev = process.env.NODE_ENV !== 'production';

function format(level: LogLevel, scope: string, message: string) {
  const prefix = `[ugur-hoca:${scope}]`;
  return `${prefix} ${message}`;
}

function emit(level: LogLevel, scope: string, message: string, context?: LogContext) {
  if (!isDev && level === 'debug') {
    return;
  }

  const line = format(level, scope, message);

  if (isDev) {
    const payload = context && Object.keys(context).length > 0 ? [line, context] : [line];
    switch (level) {
      case 'debug':
      case 'info':
        // Yalnızca geliştirme ortamında ayrıntılı log üretiyoruz.
        // eslint-disable-next-line no-console
        console.info(...payload);
        return;
      case 'warn':
        console.warn(...payload);
        return;
      case 'error':
        console.error(...payload);
        return;
    }
  }

  if (level === 'error' || level === 'warn') {
    try {
      // Prod: keep a lightweight channel for future Sentry integration.
      // Today we surface warnings/errors on the browser console only; no network calls.
      if (typeof window !== 'undefined' && level === 'error') {
        console.error(line);
      }
    } catch {
      // swallow: logger must never throw
    }
  }
}

export type Logger = {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, error?: unknown, context?: LogContext) => void;
};

export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) => emit('debug', scope, message, context),
    info: (message, context) => emit('info', scope, message, context),
    warn: (message, context) => emit('warn', scope, message, context),
    error: (message, error, context) => {
      const merged: Record<string, unknown> = { ...(context ?? {}) };
      if (error !== undefined) {
        if (error instanceof Error) {
          merged.error = { name: error.name, message: error.message, stack: error.stack };
        } else {
          merged.error = error;
        }
      }
      emit('error', scope, message, merged);
    },
  };
}

export const logger = createLogger('app');
