import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSoundMute } from './useGameSoundMute';
import { setSoundMuted, isSoundMuted } from '@/features/games/utils/gameAudio';

describe('useGameSoundMute hook', () => {
  beforeEach(() => {
    localStorage.clear();
    setSoundMuted(false);
  });

  it('provides initial mute state and toggles reactive state', () => {
    const { result } = renderHook(() => useGameSoundMute());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(isSoundMuted()).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(isSoundMuted()).toBe(false);
  });

  it('reacts to window sound mute change event', () => {
    const { result } = renderHook(() => useGameSoundMute());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      setSoundMuted(true);
    });

    expect(result.current.isMuted).toBe(true);
  });
});
