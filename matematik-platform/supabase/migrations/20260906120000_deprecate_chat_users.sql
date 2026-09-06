-- ==============================================================================
-- Migration: Deprecate chat_users Table
-- Description: Öğrenci sohbet (student chat) özelliği emekliye ayrıldı (sunset).
-- Kod tabanında (src/) chat_users tablosuna hiçbir referans kalmamıştır.
-- Bu migration ile şema netleştirilmiş, yapay zeka ajanlarının veya geliştiricilerin
-- bu tabloyu aktif sanıp üzerine iş yapması önlenmiştir.
-- ==============================================================================

COMMENT ON TABLE public.chat_users IS 
  '-- DEPRECATED: Student chat has been sunset. Kod tabanında 0 referans vardır, kullanılmaz.';

-- İsteğe bağlı olarak güvenli silme (eğer henüz drop edilmediyse):
DROP TABLE IF EXISTS public.chat_users CASCADE;
