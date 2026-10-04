select ((to_regclass('public.shared_documents') is not null) and (to_regclass('public.chat_users') is not null) and exists (select 1 from pg_proc where pronamespace='public'::regnamespace and proname='is_admin_email')) as ok,
  exists (select 1 from pg_policies where schemaname='public' and tablename='shared_documents' and policyname='shared_documents_select') as insecure_select_policy_present,
  has_table_privilege('anon','public.shared_documents','SELECT') as anon_reads_shared_documents,
  (select count(*) from pg_policies where schemaname='storage' and (policyname like 'documents flreew_%' or policyname='Allow anonymous uploads')) as anon_storage_policies;
