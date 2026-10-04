select (not exists (select 1 from pg_policies where schemaname='public' and tablename='shared_documents' and policyname='shared_documents_select')
   and exists (select 1 from pg_policies where schemaname='public' and tablename='shared_documents' and policyname='shared_documents_select_own')
   and not has_table_privilege('anon','public.shared_documents','SELECT')
   and not has_table_privilege('anon','public.chat_users','SELECT') and not has_table_privilege('authenticated','public.chat_users','SELECT')
   and not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_users' and policyname in ('chat_users_insert','chat_users_update','chat_users_select_own','chat_users_select'))
   and (to_regclass('public.chat_users') is not null)) as ok,
  (not exists (select 1 from pg_policies where schemaname='storage' and (policyname like 'documents flreew_%' or policyname='Allow anonymous uploads'))
   and exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_support_upload') and exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='documents_admin_all')) as storage_ok;
