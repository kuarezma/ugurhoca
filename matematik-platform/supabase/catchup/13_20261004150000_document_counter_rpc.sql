-- catchup: BİREBİR KOPYA — kaynak supabase/migrations/20261004150000_document_counter_rpc.sql (PR #10, commit 5d4caa3; bu dalda yok)
-- catchup: "-- catchup" ile işaretli satırlar dışında kaynakla aynıdır (verify-copies.sh).
-- ==========================================================
-- F1B-B: Belge sayaçları (views / downloads / likes) için dar yetkili RPC.
--
-- Önceden PATCH /api/content-documents kimlik doğrulamasız istekleri
-- service_role istemcisiyle documents tablosuna yazıyordu (oku → +1 → yaz):
-- herkes sayaçları sınırsız şişirebiliyor, rota da tüm tabloya tam yetkiyle
-- dokunuyordu. Bu fonksiyon yalnızca tek satırın tek bir izinli sayacını
-- atomik olarak 1 artırır; başka sütun ya da satır değiştiremez.
--
-- * counter yalnızca 'views' | 'downloads' | 'likes'. Dinamik SQL yok; her
--   dal sabit bir UPDATE (sütun adı enjeksiyonu mümkün değil).
-- * Belge yoksa no-op: NULL döner (rota 404'e çevirir).
-- * likes: beğeninin kullanıcı başına tekil olmasını sağlayan bir tablo yok
--   (ayrı iş). Oturum zorunluluğu rotada (token getUser ile) uygulanır;
--   fonksiyon yalnız service_role'den çağrıldığı için auth.uid() burada
--   her zaman NULL olurdu, bu yüzden kontrol fonksiyonda değil.
-- * likes sütunu repo migration zincirinde ve eski kurulum betiğinde tanımlı
--   değil (kod ve sıralama sorgusu var olduğunu varsayıyor). Yalnız eksikse
--   eklenir; mevcut veri değişmez.
-- * documents tablosu migration'larla değil eski kurulum betiğiyle
--   oluşturuldu; 20260419220000 gibi bu migration da tablonun var olduğunu
--   varsayar.
-- * EXECUTE yalnız service_role: anon/authenticated'a açık olsaydı PostgREST
--   /rpc üzerinden doğrudan çağrı rotanın rate limit'ini ve likes oturum
--   kontrolünü atlardı. Supabase'in varsayılan ACL'i anon'a açıkça EXECUTE
--   verdiği için PUBLIC, anon ve authenticated'dan ayrıca alınır.
-- ==========================================================

SET lock_timeout = '5s';

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_document_counter(
  doc_id uuid,
  counter text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_value integer;
BEGIN
  IF counter = 'views' THEN
    UPDATE public.documents SET views = COALESCE(views, 0) + 1 WHERE id = doc_id RETURNING views INTO new_value;
  ELSIF counter = 'downloads' THEN
    UPDATE public.documents SET downloads = COALESCE(downloads, 0) + 1 WHERE id = doc_id RETURNING downloads INTO new_value;
  ELSIF counter = 'likes' THEN
    UPDATE public.documents SET likes = COALESCE(likes, 0) + 1 WHERE id = doc_id RETURNING likes INTO new_value;
  ELSE
    RAISE EXCEPTION 'invalid counter' USING ERRCODE = '22023';
  END IF;

  RETURN new_value;
END;
$$;

COMMENT ON FUNCTION public.increment_document_counter(uuid, text) IS
  'documents satırının izinli tek sayacını (views/downloads/likes) 1 artırır; belge yoksa NULL. Yalnız service_role; likes oturum kontrolü rotada.';

REVOKE ALL ON FUNCTION public.increment_document_counter(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_document_counter(uuid, text) TO service_role;
