'use client';

import { useCallback } from 'react';

const BRAND_COLORS = ['#7C3AED', '#EC4899', '#06B6D4', '#FACC15', '#22C55E', '#FB923C'];

export type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  scalar?: number;
};

function shouldSkip(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export async function fireConfetti(options: ConfettiOptions = {}) {
  if (shouldSkip()) return;
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: BRAND_COLORS,
      ...options,
    });
  } catch {
    // swallow: confetti is a nice-to-have
  }
}

export async function fireSideCannons(options: Pick<ConfettiOptions, 'particleCount' | 'colors'> = {}) {
  if (shouldSkip()) return;
  try {
    const { default: confetti } = await import('canvas-confetti');
    const defaults = {
      spread: 70,
      ticks: 70,
      gravity: 0.9,
      decay: 0.94,
      startVelocity: 35,
      colors: options.colors ?? BRAND_COLORS,
      particleCount: options.particleCount ?? 60,
    };
    confetti({ ...defaults, angle: 60, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, angle: 120, origin: { x: 1, y: 0.7 } });
  } catch {
    // swallow
  }
}

export function useConfetti() {
  return useCallback(async (options?: ConfettiOptions) => {
    await fireConfetti(options);
  }, []);
}
