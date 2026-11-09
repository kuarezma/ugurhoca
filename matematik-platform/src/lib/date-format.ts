export const ISTANBUL_TIME_ZONE = 'Europe/Istanbul';

function parseDateInput(value: Date | string | number): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function handleInvalid(value: Date | string | number): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Verilen tarihi Türkiye/İstanbul ('Europe/Istanbul') saat dilimine ve 'tr-TR'
 * yerel ayarlarına göre biçimlendirir.
 */
export function formatIstanbulDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDateInput(value);
  if (!date) return handleInvalid(value);

  return date.toLocaleDateString('tr-TR', {
    ...options,
    timeZone: ISTANBUL_TIME_ZONE,
  });
}

/**
 * Verilen tarih ve saati Türkiye/İstanbul ('Europe/Istanbul') saat dilimine ve
 * 'tr-TR' yerel ayarlarına göre biçimlendirir.
 */
export function formatIstanbulDateTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDateInput(value);
  if (!date) return handleInvalid(value);

  return date.toLocaleString('tr-TR', {
    ...options,
    timeZone: ISTANBUL_TIME_ZONE,
  });
}

/**
 * Verilen saati Türkiye/İstanbul ('Europe/Istanbul') saat dilimine ve 'tr-TR'
 * yerel ayarlarına göre biçimlendirir. Varsayılan olarak saat ve dakikayı (HH:mm) döner.
 */
export function formatIstanbulTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDateInput(value);
  if (!date) return handleInvalid(value);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleTimeString('tr-TR', {
    ...(options ?? defaultOptions),
    timeZone: ISTANBUL_TIME_ZONE,
  });
}
