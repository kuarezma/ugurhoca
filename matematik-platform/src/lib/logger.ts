type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown> | undefined;

const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

export type SentryReporter = (
  level: 'error' | 'warn',
  scope: string,
  message: string,
  context?: LogContext,
) => void | Promise<void>;

let customReporter: SentryReporter | null = null;

export function setSentryReporterForTesting(reporter: SentryReporter | null) {
  customReporter = reporter;
}

// Vitest veya SSR sırasında bundler çakışmasını önlemek için dinamik Sentry köprüsü
export async function sendToSentry(
  level: 'error' | 'warn',
  scope: string,
  message: string,
  context?: LogContext,
) {
  if (customReporter) {
    await customReporter(level, scope, message, context);
    return;
  }
  if (isTest) return;
  try {
    const Sentry = await import('@sentry/nextjs');
    if (level === 'error') {
      const errorObj = context?.error;
      if (errorObj instanceof Error) {
        Sentry.captureException(errorObj, {
          tags: { scope },
          extra: { message, ...context },
        });
      } else {
        Sentry.captureMessage(`[${scope}] ${message}`, {
          level: 'error',
          extra: context,
        });
      }
    } else if (level === 'warn') {
      Sentry.captureMessage(`[${scope}] ${message}`, {
        level: 'warning',
        extra: context,
      });
    }
  } catch {
    // Sentry yüklenemezse veya başarısız olursa asla fırlatma
  }
}

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
        break;
      case 'error':
        console.error(...payload);
        break;
    }
  }

  if (level === 'error' || level === 'warn') {
    try {
      if (typeof window !== 'undefined' && level === 'error' && !isDev) {
        console.error(line);
      }
      void sendToSentry(level, scope, message, context);
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
