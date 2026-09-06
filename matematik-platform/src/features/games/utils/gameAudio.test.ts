import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  gameAudio,
  isSoundMuted,
  setSoundMuted,
  toggleSoundMuted,
  SOUND_MUTED_STORAGE_KEY,
} from './gameAudio';

describe('gameAudio global mute preference', () => {
  beforeEach(() => {
    localStorage.clear();
    setSoundMuted(false);
  });

  it('defaults to unmuted when no preference is saved', () => {
    expect(isSoundMuted()).toBe(false);
    expect(gameAudio.isMuted()).toBe(false);
  });

  it('persists mute state to localStorage and dispatches window event', () => {
    const eventSpy = vi.fn();
    window.addEventListener('ugurhoca:sound-mute-changed', eventSpy);

    setSoundMuted(true);
    expect(localStorage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('true');
    expect(isSoundMuted()).toBe(true);
    expect(eventSpy).toHaveBeenCalledTimes(1);

    setSoundMuted(false);
    expect(localStorage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('false');
    expect(isSoundMuted()).toBe(false);

    window.removeEventListener('ugurhoca:sound-mute-changed', eventSpy);
  });

  it('toggles mute state correctly', () => {
    expect(isSoundMuted()).toBe(false);

    const firstToggle = toggleSoundMuted();
    expect(firstToggle).toBe(true);
    expect(isSoundMuted()).toBe(true);

    const secondToggle = toggleSoundMuted();
    expect(secondToggle).toBe(false);
    expect(isSoundMuted()).toBe(false);
  });

  it('bypasses sound generation when muted', () => {
    setSoundMuted(true);

    // If muted, getContext is never called and sound doesn't throw even without AudioContext
    expect(() => {
      gameAudio.playCorrect();
      gameAudio.playWrong();
      gameAudio.playPop();
      gameAudio.playCombo(3);
      gameAudio.playSlice();
      gameAudio.playWhack();
      gameAudio.playNitro();
      gameAudio.playLevelUp();
      gameAudio.playFanfare();
      gameAudio.playPomodoroBell();
    }).not.toThrow();
  });
});
