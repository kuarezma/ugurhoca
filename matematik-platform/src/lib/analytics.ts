import { trackStudentActivityEvent } from '@/features/analytics/trackActivity';
import { logger } from '@/lib/logger';

export type FeatureEventName =
  | 'geometry_math_lab'
  | 'formula_flashcards'
  | 'formula_speed_drill'
  | 'visual_math_proofs'
  | 'exam_pacing_coach'
  | 'latex_helper'
  | 'scratchpad'
  | 'protractor_tool'
  | 'formula_cheat_sheet'
  | 'mistake_notebook'
  | 'optical_sheet'
  | 'outcome_analysis'
  | (string & {});

/**
 * Platform özellik ve modal açılışlarını hem yerel hem de sunucu tarafında izler.
 * Supabase bağlantısı yoksa veya kullanıcı oturum açmamışsa sessizce yerel sayacı günceller.
 */
export async function trackFeatureOpen(
  feature: FeatureEventName,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    // 1. Yerel sayaç (localStorage)
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ugurhoca_feature_usage') || '{}';
        const stats = JSON.parse(raw) as Record<string, number>;
        stats[feature] = (stats[feature] || 0) + 1;
        localStorage.setItem('ugurhoca_feature_usage', JSON.stringify(stats));
      } catch {
        // storage disabled or quota exceeded
      }
    }

    // 2. Logger / Sentry Breadcrumb
    logger.debug(`[Feature Open] ${feature}`, { feature, ...metadata });

    // 3. Supabase Student Activity Event
    await trackStudentActivityEvent({
      eventType: 'feature_opened',
      entityType: 'tool',
      entityId: feature,
      metadata: {
        feature,
        openedAt: new Date().toISOString(),
        ...metadata,
      },
    });
  } catch (err) {
    logger.warn(`Feature tracking error: ${feature}`, {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
