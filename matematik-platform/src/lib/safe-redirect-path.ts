/** Yalnızca güvenli yerel yolları kabul eder; kodlanmış kaçışları da denetler. */
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string') return '/';
  let decoded = value;
  // Her çözme turu metni kısaltır; çift kodlanmış kaçışlar da denetlenir.
  for (;;) {
    if (
      !decoded.startsWith('/') ||
      decoded.includes('//') ||
      decoded.includes('\\') ||
      Array.from(decoded).some(
        (char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127,
      )
    )
      return '/';
    try {
      const url = new URL(decoded, 'https://local.invalid');
      if (
        url.origin !== 'https://local.invalid' ||
        url.pathname.startsWith('//')
      )
        return '/';
      const next = decodeURIComponent(decoded);
      if (next === decoded) return value;
      decoded = next;
    } catch {
      return '/';
    }
  }
}
