import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContentCompletion } from './useContentCompletion';
import { useCloudFavorites } from './useCloudFavorites';
import { supabase } from '@/lib/supabase/client';
import type { ContentDocument } from '@/types';

vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('content hooks', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('keeps favorites and completions separate when the signed-in user changes', async () => {
    const doc = {
      id: 'private-doc',
      title: 'Test',
      type: 'yaprak-test',
      grade: [8],
    } as ContentDocument;
    const { result, rerender } = renderHook(
      ({ userId }) => ({
        favorites: useCloudFavorites(userId),
        completion: useContentCompletion(userId),
      }),
      { initialProps: { userId: 'user-a' } },
    );
    await act(async () => {
      await result.current.favorites.toggleFavorite(doc.id);
      await result.current.completion.toggleCompleted(doc);
    });
    rerender({ userId: 'user-b' });
    expect(result.current.favorites.isFavorite(doc.id)).toBe(false);
    expect(result.current.completion.isCompleted(doc.id)).toBe(false);
    rerender({ userId: 'user-a' });
    expect(result.current.favorites.isFavorite(doc.id)).toBe(true);
    expect(result.current.completion.isCompleted(doc.id)).toBe(true);
  });

  it('never exposes the previous user during the first render after an account switch', async () => {
    const observations: {
      userId: string;
      favorite: boolean;
      completed: boolean;
    }[] = [];
    const doc = {
      id: 'private-doc',
      title: 'Test',
      type: 'yaprak-test',
      grade: [8],
    } as ContentDocument;
    const { result, rerender } = renderHook(
      ({ userId }) => {
        const favorites = useCloudFavorites(userId);
        const completion = useContentCompletion(userId);
        observations.push({
          userId,
          favorite: favorites.isFavorite(doc.id),
          completed: completion.isCompleted(doc.id),
        });
        return { favorites, completion };
      },
      { initialProps: { userId: 'user-a' } },
    );
    await act(async () => {
      await result.current.favorites.toggleFavorite(doc.id);
      await result.current.completion.toggleCompleted(doc);
    });
    rerender({ userId: 'user-b' });
    expect(
      observations
        .filter((item) => item.userId === 'user-b')
        .every((item) => !item.favorite && !item.completed),
    ).toBe(true);
  });

  describe('useContentCompletion', () => {
    it('toggles document completion and persists in localStorage', async () => {
      const { result } = renderHook(() => useContentCompletion('user-1'));

      expect(result.current.isCompleted('doc-1')).toBe(false);

      const fakeDoc: ContentDocument = {
        id: 'doc-1',
        title: 'Üslü Sayılar Test 1',
        type: 'yaprak-test',
        grade: [8],
        created_at: new Date().toISOString(),
      };

      await act(async () => {
        await result.current.toggleCompleted(fakeDoc);
      });

      expect(result.current.isCompleted('doc-1')).toBe(true);
      expect(
        localStorage.getItem('matematiklab_completed_docs:user-1'),
      ).toContain('doc-1');

      // Toggle off
      await act(async () => {
        await result.current.toggleCompleted(fakeDoc);
      });

      expect(result.current.isCompleted('doc-1')).toBe(false);
    });

    it('merges cloud activity events into local completions', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

      // Yerelde önceden tamamlanmış bir doküman olsun
      localStorage.setItem(
        'matematiklab_completed_docs:user-sync',
        JSON.stringify(['local-doc-1']),
      );

      const mockIn = vi.fn().mockResolvedValue({
        data: [{ entity_id: 'cloud-doc-2' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const { result } = renderHook(() => useContentCompletion('user-sync'));

      await waitFor(() => {
        expect(result.current.isCompleted('cloud-doc-2')).toBe(true);
      });

      expect(result.current.isCompleted('local-doc-1')).toBe(true);
      expect(
        localStorage.getItem('matematiklab_completed_docs:user-sync'),
      ).toContain('cloud-doc-2');
    });
  });

  describe('useCloudFavorites', () => {
    it('toggles favorite state and persists in localStorage', async () => {
      const { result } = renderHook(() => useCloudFavorites('user-1'));

      expect(result.current.isFavorite('doc-abc')).toBe(false);

      await act(async () => {
        await result.current.toggleFavorite('doc-abc');
      });

      expect(result.current.isFavorite('doc-abc')).toBe(true);
      expect(localStorage.getItem('favorites:user-1')).toContain('doc-abc');

      // Toggle off
      await act(async () => {
        await result.current.toggleFavorite('doc-abc');
      });

      expect(result.current.isFavorite('doc-abc')).toBe(false);
    });
  });
});
