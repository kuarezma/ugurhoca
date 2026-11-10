import { createLogger } from '@/lib/logger';

export const GOOGLE_DRIVE_CALLBACK_MESSAGES: Record<
  string,
  { message: string; type: 'error' | 'success' }
> = {
  auth_required: {
    message: 'Google Drive bağlantısı için tekrar giriş yapmanız gerekiyor.',
    type: 'error',
  },
  connected: {
    message: 'Google Drive bağlantısı kuruldu.',
    type: 'success',
  },
  error: {
    message: 'Google Drive bağlantısı tamamlanamadı.',
    type: 'error',
  },
  missing_refresh_token: {
    message:
      'Google Drive kalıcı erişim izni vermedi. Bağlantıyı tekrar başlatın.',
    type: 'error',
  },
  state_error: {
    message:
      'Google Drive bağlantı doğrulaması geçersiz oldu. Lütfen tekrar deneyin.',
    type: 'error',
  },
};

export const log = createLogger('admin-page');
