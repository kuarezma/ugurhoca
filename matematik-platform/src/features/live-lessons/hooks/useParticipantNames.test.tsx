import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useParticipantNames } from './useParticipantNames';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('öğrenci görünümünde ad API isteği göndermez', () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => useParticipantNames('lesson', false));
  expect(result.current).toEqual({});
  expect(fetchMock).not.toHaveBeenCalled();
});
it('öğretmen adları alır ve öğrenci görünümüne geçince temizler', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ participantNames: { student1: 'Ada Gerçek' } }),
    });
  vi.stubGlobal('fetch', fetchMock);
  const { result, rerender } = renderHook(
    ({ enabled }) => useParticipantNames('lesson', enabled),
    { initialProps: { enabled: true } },
  );
  await waitFor(() =>
    expect(result.current).toEqual({ student1: 'Ada Gerçek' }),
  );
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/live-lessons/lesson/participants',
    expect.objectContaining({ cache: 'no-store', credentials: 'same-origin' }),
  );
  rerender({ enabled: false });
  expect(result.current).toEqual({});
});
it('önceki dersin gecikmiş cevabı yeni dersin adlarını değiştiremez', async () => {
  let resolveOld!: (response: unknown) => void;
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValue({
      ok: true,
      json: async () => ({ participantNames: { student2: 'Yeni ders' } }),
    });
  vi.stubGlobal('fetch', fetchMock);
  const { result, rerender } = renderHook(
    ({ lessonId }) => useParticipantNames(lessonId, true),
    { initialProps: { lessonId: 'old' } },
  );
  rerender({ lessonId: 'new' });
  await waitFor(() =>
    expect(result.current).toEqual({ student2: 'Yeni ders' }),
  );
  await act(async () => {
    resolveOld({
      ok: true,
      json: async () => ({ participantNames: { student1: 'Eski ders' } }),
    });
  });
  expect(result.current).toEqual({ student2: 'Yeni ders' });
});
