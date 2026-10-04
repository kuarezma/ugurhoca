select not exists (select 1 from pg_policies where schemaname='public' and coalesce(qual,'')||coalesce(with_check,'') like '%matematiklab%')
   and (select count(*) from pg_policies where schemaname='public' and policyname in ('announcements_insert','announcements_update','announcements_delete','documents_insert','documents_delete','submissions_admin_all','user_badges_admin_all','chat_users_admin_all'))=8 as ok,
  not exists (select 1 from pg_policies where schemaname='storage' and coalesce(qual,'')||coalesce(with_check,'') like '%matematiklab%') as storage_ok;
