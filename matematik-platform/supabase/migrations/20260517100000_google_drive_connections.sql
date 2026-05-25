CREATE TABLE IF NOT EXISTS public.google_drive_connections (
  admin_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT,
  refresh_token TEXT NOT NULL,
  scope TEXT,
  token_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.google_drive_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "google_drive_connections_admin_all" ON public.google_drive_connections;
CREATE POLICY "google_drive_connections_admin_all" ON public.google_drive_connections
  FOR ALL TO authenticated
  USING (public.is_admin_email())
  WITH CHECK (public.is_admin_email());
