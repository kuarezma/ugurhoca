import type { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';
import {
  discoverWorksheetCandidatesFromSources,
  isPublicWorksheetSourceUrl,
  parseAllowedHosts,
  parseSourceUrls,
  type WorksheetCandidatePlanItem,
} from '@/lib/worksheet-candidate-discovery';

const log = createLogger('worksheet-candidate-scan');
const MAX_PLAN_ITEMS_PER_RUN = 20;
const MAX_PLAN_ITEMS_TO_LOAD = 300;

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

export function selectWorksheetPlanItemsForScan(
  planItems: WorksheetCandidatePlanItem[],
  today: string,
) {
  const byGrade = new Map<number, WorksheetCandidatePlanItem[]>();

  for (const planItem of planItems) {
    byGrade.set(planItem.grade, [...(byGrade.get(planItem.grade) || []), planItem]);
  }

  return Array.from(byGrade.entries())
    .sort(([leftGrade], [rightGrade]) => leftGrade - rightGrade)
    .flatMap(([, gradeItems]) => {
      const sortedItems = [...gradeItems].sort((left, right) =>
        String(left.week_start || '').localeCompare(String(right.week_start || '')),
      );
      const currentItems = sortedItems.filter(
        (item) =>
          String(item.week_start || '') <= today &&
          String(item.week_end || '') >= today,
      );

      if (currentItems.length > 0) {
        return currentItems;
      }

      const nearestItem = sortedItems
        .map((item) => ({
          distance: getPlanItemDistanceInDays(item, today),
          item,
        }))
        .sort((left, right) => left.distance - right.distance)[0]?.item;

      return nearestItem ? [nearestItem] : [];
    })
    .slice(0, MAX_PLAN_ITEMS_PER_RUN);
}

export async function scanCurrentWeekWorksheetCandidates(
  serviceRole: SupabaseClient,
): Promise<WorksheetCandidateScanResult> {
  const sourceUrls = parseSourceUrls(process.env.WORKSHEET_CANDIDATE_SOURCE_URLS);
  const validSourceUrls = sourceUrls.filter(isPublicWorksheetSourceUrl);
  const allowedHosts = parseAllowedHosts(
    process.env.WORKSHEET_CANDIDATE_ALLOWED_HOSTS,
    validSourceUrls,
  );

  if (validSourceUrls.length === 0 || allowedHosts.length === 0) {
    throw new Error(
      'İzinli kaynak listesi boş. WORKSHEET_CANDIDATE_SOURCE_URLS ayarlanmalı.',
    );
  }

  const today = getIstanbulDateString();
  const { data: planRows, error: planError } = await serviceRole
    .from('annual_plan_items')
    .select('*')
    .order('grade', { ascending: true })
    .order('week_start', { ascending: true })
    .limit(MAX_PLAN_ITEMS_TO_LOAD);

  if (planError) {
    throw new Error('Yıllık plan satırları alınamadı.');
  }

  const planItems = selectWorksheetPlanItemsForScan(
    (planRows || []) as WorksheetCandidatePlanItem[],
    today,
  );

  let inserted = 0;
  let skipped = 0;
  let total = 0;
  let searchedSources = 0;
  const failures: Array<{ plan_item_id: string; message: string }> = [];

  for (const planItem of planItems) {
    try {
      const discovery = await discoverWorksheetCandidatesFromSources({
        allowedHosts,
        planItem,
        sourceUrls: validSourceUrls,
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
    planItems: planItems.length,
    searchedSources,
    skipped,
    today,
    total,
  };
}

function getPlanItemDistanceInDays(
  planItem: Pick<WorksheetCandidatePlanItem, 'week_end' | 'week_start'>,
  today: string,
) {
  const todayTime = Date.parse(`${today}T00:00:00.000Z`);
  const weekStartTime = Date.parse(`${planItem.week_start || ''}T00:00:00.000Z`);
  const weekEndTime = Date.parse(`${planItem.week_end || ''}T00:00:00.000Z`);

  if (!Number.isFinite(todayTime)) {
    return Number.MAX_SAFE_INTEGER;
  }

  if (Number.isFinite(weekStartTime) && weekStartTime > todayTime) {
    return Math.round((weekStartTime - todayTime) / 86_400_000);
  }

  if (Number.isFinite(weekEndTime) && weekEndTime < todayTime) {
    return Math.round((todayTime - weekEndTime) / 86_400_000);
  }

  return 0;
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
