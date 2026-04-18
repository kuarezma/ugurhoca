export function getErrorMessage(
  error: unknown,
  fallback = 'Bilinmeyen bir hata oluştu.',
) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}
