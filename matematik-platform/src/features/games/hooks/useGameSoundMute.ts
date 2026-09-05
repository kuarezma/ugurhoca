'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isSoundMuted,
  setSoundMuted,
  toggleSoundMuted,
} from '@/features/games/utils/gameAudio';

export function useGameSoundMute() {
  const [muted, setMutedState] = useState<boolean>(false);

  useEffect(() => {
    // Initial read on client mount
    setMutedState(isSoundMuted());

    const handleMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.muted === 'boolean') {
        setMutedState(customEvent.detail.muted);
      } else {
        setMutedState(isSoundMuted());
      }
    };

    window.addEventListener('ugurhoca:sound-mute-changed', handleMuteChange);
    window.addEventListener('storage', handleMuteChange);

    return () => {
      window.removeEventListener('ugurhoca:sound-mute-changed', handleMuteChange);
      window.removeEventListener('storage', handleMuteChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = toggleSoundMuted();
    setMutedState(next);
    return next;
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setSoundMuted(value);
    setMutedState(value);
  }, []);

  return {
    isMuted: muted,
    toggleMute: toggle,
    setMuted,
  };
}
