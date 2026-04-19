'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { createLogger } from '@/lib/logger';

const log = createLogger('daily-streak');

const STORAGE_KEY = 'uh.lastDailyStreakTouch';

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Öğrenci profil ekranına her gün ilk girdiğinde streak'i bir kez günceller.
 * Aynı günde birden fazla çağrı olmaması için localStorage tarihi kullanır.
 * RPC idempotenttir; yine de boş trafiği önlemek için filtre ekliyoruz.
 */
export function useDailyStreakTouch(userId: string | null | undefined, isAdmin: boolean | undefined) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!userId || isAdmin || triggeredRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const today = getTodayKey();
    const lastTouch = window.localStorage.getItem(STORAGE_KEY);

    if (lastTouch === `${userId}:${today}`) {
      return;
    }

    triggeredRef.current = true;

    void (async () => {
      const { error } = await supabase.rpc('touch_daily_streak');
      if (error) {
        log.warn('Streak RPC çağrısı başarısız', { error });
        triggeredRef.current = false;
        return;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, `${userId}:${today}`);
      } catch {
        // Quota hatası yok sayılır; ertesi gün yeniden dener.
      }
    })();
  }, [userId, isAdmin]);
}
