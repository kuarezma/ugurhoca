import { requireAdmin } from '@/lib/api-auth';

export const GOOGLE_DRIVE_OAUTH_STATE_COOKIE = 'ugur_google_drive_oauth_state';

// admin-worksheet-candidates ve import-questions rotalarındaki yetki
// kontrolüyle aynıydı, ayrıca kopyalanmıştı — artık tek kaynak @/lib/api-auth.
export const requireGoogleDriveAdmin = requireAdmin;
