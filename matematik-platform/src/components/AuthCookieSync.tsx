'use client';

import { useEffect } from 'react';
import {
  clearClientAuthSnapshotCookie,
  syncCurrentUserSnapshotCookie,
} from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';

export default function AuthCookieSync() {
  useEffect(() => {
    void syncCurrentUserSnapshotCookie();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearClientAuthSnapshotCookie();
        return;
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        void syncCurrentUserSnapshotCookie();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
