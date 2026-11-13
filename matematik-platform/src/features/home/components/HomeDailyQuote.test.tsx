import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { HomeDailyQuote } from './HomeDailyQuote';

describe('HomeDailyQuote hidrasyon güvenliği', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('SSR ve istemci arasında UTC gün değişse bile hatasız hidrate olur', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T23:59:59.000Z'));
    const serverHtml = renderToString(<HomeDailyQuote />);

    vi.setSystemTime(new Date('2026-11-13T00:00:01.000Z'));
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, <HomeDailyQuote />, {
          onRecoverableError,
        });
      });
      expect(onRecoverableError).not.toHaveBeenCalled();
    } finally {
      await act(async () => root?.unmount());
    }
  });
});
