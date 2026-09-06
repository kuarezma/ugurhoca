import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackFeatureOpen } from './analytics';
import * as trackActivityModule from '@/features/analytics/trackActivity';

describe('analytics / trackFeatureOpen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('localStorage üzerindeki kullanım sayacını artırır', async () => {
    vi.spyOn(trackActivityModule, 'trackStudentActivityEvent').mockResolvedValue();

    await trackFeatureOpen('geometry_math_lab');
    await trackFeatureOpen('geometry_math_lab');
    await trackFeatureOpen('scratchpad');

    const stats = JSON.parse(localStorage.getItem('ugurhoca_feature_usage') || '{}');
    expect(stats['geometry_math_lab']).toBe(2);
    expect(stats['scratchpad']).toBe(1);
  });

  it('trackStudentActivityEvent çağrısını doğru parametrelerle tetikler', async () => {
    const spy = vi
      .spyOn(trackActivityModule, 'trackStudentActivityEvent')
      .mockResolvedValue();

    await trackFeatureOpen('formula_flashcards', { topic: 'ucgenler' });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'feature_opened',
        entityType: 'tool',
        entityId: 'formula_flashcards',
        metadata: expect.objectContaining({
          feature: 'formula_flashcards',
          topic: 'ucgenler',
        }),
      }),
    );
  });
});
