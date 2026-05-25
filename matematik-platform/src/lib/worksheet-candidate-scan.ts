import type { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';
import {
  discoverWorksheetCandidatesFromSources,
  parseAllowedHosts,
  parseSourceUrls,
  type WorksheetCandidatePlanItem,
} from '@/lib/worksheet-candidate-discovery';

const log = createLogger('worksheet-candidate-scan');
const MAX_PLAN_ITEMS_PER_RUN = 20;

export type WorksheetCandidateScanResult = {
  failures: Array<{ plan_item_id: string; message: string }>;
  inserted: number;
  ok: boolean;
  planItems: number;
  searchedSources: number;
  skipped: number;
  today: string;
  total: number;
};

export async function scanCurrentWeekWorksheetCandidates(
  serviceRole: SupabaseClient,
): Promise<WorksheetCandidateScanResult> {
  const sourceUrls = parseSourceUrls(process.env.WORKSHEET_CANDIDATE_SOURCE_URLS);
  const allowedHosts = parseAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
    sourceUrls,
  );

  if (sourceUrls.length === 0 || allowedHosts.length === 0) {
    throw new Error(
      'İzinli kaynak listesi boş. WORKSHEET_CANDIDATE_SOURCE_URLS ayarlanmalı.',
    );
  }

  const today = getIstanbulDateString();
  const { data: planItems, error: planError } = await serviceRole
    .from('annual_plan_items')
    .select('*')
    .lte('week_start', today)
    .gte('week_end', today)
    .order('grade', { ascending: true })
    .limit(MAX_PLAN_ITEMS_PER_RUN);

  if (planError) {
    throw new Error('Yıllık plan satırları alınamadı.');
  }

  let inserted = 0;
  let skipped = 0;
  let total = 0;
  let searchedSources = 0;
  const failures: Array<{ plan_item_id: string; message: string }> = [];

  for (const planItem of (planItems || []) as WorksheetCandidatePlanItem[]) {
    try {
      const discovery = await discoverWorksheetCandidatesFromSources({
        allowedHosts,
        planItem,
        sourceUrls,
      });

      searchedSources += discovery.searchedSources;
      total += discovery.candidates.length;
      skipped += discovery.skippedSources;

      if (discovery.candidates.length === 0) {
        continue;
      }

      const { data, error } = await serviceRole
        .from('worksheet_candidates')
        .upsert(discovery.candidates, {
          ignoreDuplicates: true,
          onConflict: 'grade,learning_outcome,file_url',
        })
        .select('id');

      if (error) {
        throw error;
      }

      const insertedRows = data || [];
      inserted += insertedRows.length;
      skipped += Math.max(0, discovery.candidates.length - insertedRows.length);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Aday arama hatası oluştu.';
      failures.push({ message, plan_item_id: planItem.id });
      log.error('Plan satırı aday arama hatası', {
        error,
        planItemId: planItem.id,
      });
    }
  }

  return {
    failures,
    inserted,
    ok: failures.length === 0,
    planItems: planItems?.length || 0,
    searchedSources,
    skipped,
    today,
    total,
  };
}

function getIstanbulDateString() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}
