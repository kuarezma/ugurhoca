import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContentCompletion } from './useContentCompletion';
import { useCloudFavorites } from './useCloudFavorites';
import type { ContentDocument } from '@/types';

vi.mock('@/features/analytics/trackActivity', () => ({
  trackStudentActivityEvent: vi.fn(),
}));

describe('content hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
      expect(localStorage.getItem('matematiklab_completed_docs')).toContain('doc-1');

      // Toggle off
      await act(async () => {
        await result.current.toggleCompleted(fakeDoc);
      });

      expect(result.current.isCompleted('doc-1')).toBe(false);
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
      expect(localStorage.getItem('favorites')).toContain('doc-abc');

      // Toggle off
      await act(async () => {
        await result.current.toggleFavorite('doc-abc');
      });

      expect(result.current.isFavorite('doc-abc')).toBe(false);
    });
  });
});
