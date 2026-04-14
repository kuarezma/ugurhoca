-- Profil görselleri için public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Kendi klasörüne avatar yükleyebilir
DROP POLICY IF EXISTS "avatars_user_upload" ON storage.objects;
CREATE POLICY "avatars_user_upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- Kendi avatarını güncelleyebilir
DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- Kendi avatarını silebilir
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        (auth.uid())::text = (storage.foldername(name))[1]
    );

-- Herkes public avatarı okuyabilir
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
