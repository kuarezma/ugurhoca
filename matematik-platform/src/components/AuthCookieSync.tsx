'use client';

import { useEffect } from 'react';
import {
  clearClientAuthSnapshotCookie,
  clearSignedOutMarker,
  clearUserProfileCache,
  syncCurrentUserSnapshotCookie,
  writeAccessTokenCookie,
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
    } = supabase.auth.onAuthStateChange((event, session) => {
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
        if (event === 'SIGNED_IN') {
          // Yeni giriş: önceki çıkışın "POST etme" işareti kalkar.
          clearSignedOutMarker();
        }
        clearUserProfileCache();
        if (session?.access_token) {
          writeAccessTokenCookie(session.access_token);
        }
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
