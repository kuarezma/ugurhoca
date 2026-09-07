import { z } from 'zod';
import { apiError, apiOk } from '@/lib/api-response';
import { requireAdmin } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';
import {
  discoverWorksheetCandidatesFromSources,
  isPublicWorksheetSourceUrl,
  parseAllowedHosts,
  parseSourceUrls,
  type WorksheetCandidatePlanItem,
} from '@/lib/worksheet-candidate-discovery';

const log = createLogger('worksheet-candidates-discover');

const discoverSchema = z.object({
  annual_plan_item_id: z.string().uuid('Yıllık plan kaydı geçersiz.'),
});

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if ('error' in auth) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = discoverSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message || 'Geçersiz aday arama isteği.',
      400,
      'invalid_worksheet_candidate_discover',
    );
  }

  const sourceUrls = parseSourceUrls(process.env.WORKSHEET_CANDIDATE_SOURCE_URLS);
  const validSourceUrls = sourceUrls.filter(isPublicWorksheetSourceUrl);
  const allowedHosts = parseAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
    validSourceUrls,
  );

  if (validSourceUrls.length === 0 || allowedHosts.length === 0) {
    return apiError(
      'İzinli kaynak listesi boş. WORKSHEET_CANDIDATE_SOURCE_URLS ayarlanmalı.',
      400,
      'missing_worksheet_sources',
    );
  }

  try {
    const { data: planItem, error: planError } = await auth.serviceRole
      .from('annual_plan_items')
      .select('*')
      .eq('id', parsed.data.annual_plan_item_id)
      .single();

    if (planError || !planItem) {
      return apiError('Yıllık plan kaydı bulunamadı.', 404, 'annual_plan_item_not_found');
    }

    const discovery = await discoverWorksheetCandidatesFromSources({
      allowedHosts,
      planItem: planItem as WorksheetCandidatePlanItem,
      sourceUrls: validSourceUrls,
    });

    if (discovery.candidates.length === 0) {
      return apiOk({
        inserted: 0,
        items: [],
        searchedSources: discovery.searchedSources,
        skipped: discovery.skippedSources,
        total: 0,
      });
    }

    const { data, error } = await auth.serviceRole
      .from('worksheet_candidates')
      .upsert(discovery.candidates, {
        ignoreDuplicates: true,
        onConflict: 'grade,learning_outcome,file_url',
      })
      .select('*');

    if (error) {
      log.error('Worksheet candidate upsert failed', error);
      return apiError('Test adayları kaydedilemedi.', 500, 'worksheet_candidate_insert_failed');
    }

    const insertedRows = data || [];
    return apiOk({
      inserted: insertedRows.length,
      items: insertedRows,
      searchedSources: discovery.searchedSources,
      skipped:
        discovery.skippedSources +
        Math.max(0, discovery.candidates.length - insertedRows.length),
      total: discovery.candidates.length,
    });
  } catch (error) {
    log.error('Worksheet candidate discovery failed', error);
    return apiError(
      'Test adayı arama sırasında sunucu hatası oluştu.',
      500,
      'worksheet_candidate_discovery_failed',
    );
  }
}
