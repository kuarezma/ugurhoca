import { apiOk } from '@/lib/api-response';
import { requireGoogleDriveAdmin } from '@/app/api/admin-google-drive/_shared';
import { getGoogleDriveOAuthConfigStatus } from '@/lib/google-drive-oauth';

export async function GET(request: Request) {
  const auth = await requireGoogleDriveAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const { data } = await auth.serviceRole
    .from('google_drive_connections')
    .select('admin_user_id, google_email, connected_at, updated_at')
    .eq('admin_user_id', auth.user.id)
    .maybeSingle();

  return apiOk({
    ...getGoogleDriveOAuthConfigStatus(),
    connected: Boolean(data),
    connected_at: data?.connected_at ?? null,
    google_email: data?.google_email ?? null,
    updated_at: data?.updated_at ?? null,
  });
}

export async function DELETE(request: Request) {
  const auth = await requireGoogleDriveAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  await auth.serviceRole
    .from('google_drive_connections')
    .delete()
    .eq('admin_user_id', auth.user.id);

  return apiOk({ connected: false });
}
