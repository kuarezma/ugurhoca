-- anon rolü public şemadaki tablolarda INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/
-- TRIGGER/MAINTAIN yetkisine sahipti (Supabase varsayılanı GRANT ALL). Hiçbir
-- tabloda anon'a uygulanabilen yazma politikası yok; yazmalar zaten RLS ile
-- reddediliyor. Bu yüzden yetkiyi kaldırmak mevcut davranışı değiştirmez, ama
-- TRUNCATE gibi RLS'in koruyamadığı işlemleri de kapatır. SELECT yetkisi,
-- anonim içerik okuyan sayfalar için olduğu gibi bırakıldı.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON ALL TABLES IN SCHEMA public FROM anon;
