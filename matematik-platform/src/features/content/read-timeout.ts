const CONTENT_READ_TIMEOUT_MS = 10_000;

/** Yalnızca içerik okumaları: zaman aşımında hem isteği hem bekleyen UI'ı sonlandırır. */
export async function runContentRead<T>(
  read: (signal: AbortSignal) => PromiseLike<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort(
        new DOMException('Content read timed out', 'AbortError'),
      );
      reject(new Error('İçerik kaynağı yanıt vermedi. Yeniden deneyin.'));
    }, CONTENT_READ_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      Promise.resolve().then(() => read(controller.signal)),
      timeout,
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
