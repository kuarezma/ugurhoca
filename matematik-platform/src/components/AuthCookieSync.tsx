'use client';

import { useEffect } from 'react';
import {
  clearClientAuthSnapshotCookie,
  syncCurrentUserSnapshotCookie,
} from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';

export default function AuthCookieSync() {
  useEffect(() => {
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleSync = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      syncTimeout = setTimeout(() => {
        void syncCurrentUserSnapshotCookie();
      }, 150);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (syncTimeout) clearTimeout(syncTimeout);
        clearClientAuthSnapshotCookie();
        return;
      }

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        scheduleSync();
      }
    });

    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
