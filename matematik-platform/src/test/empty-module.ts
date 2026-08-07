// Test ortamı stub'ı: `server-only` / `client-only` paketleri yalnızca Next
// derlemesinde anlamlıdır. Vitest altında bu boş modüle yönlendirilir ki
// server-only işaretli modüller (ör. auth-verify.server) testlerde import edilebilsin.
export {};
