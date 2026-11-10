import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import {
  buildWorksheetStandardTitle,
  buildWorksheetDescription,
  getWorksheetGradeValue,
  getWorksheetOrder,
  getWorksheetOutcomeLabel,
  getWorksheetTitleTopic,
  getWorksheetVisibleDescription,
  isWorksheetType,
} from '@/features/content/worksheet';
import type {
  AdminDocument,
  AnnualPlanImportResult,
  GoogleDriveConnectionStatus,
  WorksheetCandidate,
  WorksheetCandidateApprovalResult,
  WorksheetCandidateDiscoveryResult,
  WorksheetCandidateSourceStatus,
  WorksheetCandidateStatus,
  WorksheetCandidateWeekScanResult,
} from '@/features/admin/types';

const requestAdminAnnualPlanImport = async (file: File) => {
  const session = await getClientSession();
  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/admin-annual-plan/import', {
    body: formData,
    credentials: 'same-origin',
    headers,
    method: 'POST',
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: AnnualPlanImportResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Yıllık plan içe aktarılamadı.');
  }

  if (!payload?.data) {
    throw new Error('Yıllık plan içe aktarma sonucu alınamadı.');
  }

  return payload.data;
};

const requestWorksheetCandidateDiscovery = async (annualPlanItemId: string) => {
  const session = await getClientSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch('/api/admin-worksheet-candidates/discover', {
    body: JSON.stringify({ annual_plan_item_id: annualPlanItemId }),
    credentials: 'same-origin',
    headers,
    method: 'POST',
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: WorksheetCandidateDiscoveryResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message || 'Test adayı araması yapılamadı.',
    );
  }

  if (!payload?.data) {
    throw new Error('Test adayı arama sonucu alınamadı.');
  }

  return payload.data;
};

const requestWorksheetCandidateWeekScan = async () => {
  const session = await getClientSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(
    '/api/admin-worksheet-candidates/discover-week',
    {
      credentials: 'same-origin',
      headers,
      method: 'POST',
    },
  );

  const payload = (await response.json().catch(() => null)) as {
    data?: WorksheetCandidateWeekScanResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Bu hafta taraması yapılamadı.');
  }

  if (!payload?.data) {
    throw new Error('Bu hafta tarama sonucu alınamadı.');
  }

  return payload.data;
};

const requestWorksheetCandidateApproval = async (candidateId: string) => {
  const session = await getClientSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch('/api/admin-worksheet-candidates/approve', {
    body: JSON.stringify({ candidate_id: candidateId }),
    credentials: 'same-origin',
    headers,
    method: 'POST',
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: WorksheetCandidateApprovalResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Aday test yayınlanamadı.');
  }

  if (!payload?.data) {
    throw new Error('Aday test yayınlama sonucu alınamadı.');
  }

  return payload.data;
};

const requestWorksheetCandidateSourceStatus = async () => {
  const session = await getClientSession();
  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(
    '/api/admin-worksheet-candidates/source-status?live=1',
    {
      credentials: 'same-origin',
      headers,
    },
  );

  const payload = (await response.json().catch(() => null)) as {
    data?: WorksheetCandidateSourceStatus;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Kaynak ayarları okunamadı.');
  }

  if (!payload?.data) {
    throw new Error('Kaynak ayarı sonucu alınamadı.');
  }

  return payload.data;
};

const requestGoogleDriveRoute = async <TResult>(
  path: '/api/admin-google-drive/auth-url' | '/api/admin-google-drive/status',
  method: 'GET' | 'DELETE' = 'GET',
) => {
  const session = await getClientSession();
  const headers: Record<string, string> = {};

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(path, {
    credentials: 'same-origin',
    headers,
    method,
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: TResult;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error?.message || 'Google Drive işlemi yapılamadı.',
    );
  }

  return payload?.data as TResult;
};

export const importAdminAnnualPlan = (file: File) =>
  requestAdminAnnualPlanImport(file);

export const discoverAdminWorksheetCandidates = (annualPlanItemId: string) =>
  requestWorksheetCandidateDiscovery(annualPlanItemId);

export const scanCurrentWeekWorksheetCandidates = () =>
  requestWorksheetCandidateWeekScan();

export const approveAdminWorksheetCandidate = (candidateId: string) =>
  requestWorksheetCandidateApproval(candidateId);

export const loadWorksheetCandidateSourceStatus = () =>
  requestWorksheetCandidateSourceStatus();

export const loadGoogleDriveConnectionStatus = () =>
  requestGoogleDriveRoute<GoogleDriveConnectionStatus>(
    '/api/admin-google-drive/status',
  );

export const disconnectGoogleDriveConnection = () =>
  requestGoogleDriveRoute<GoogleDriveConnectionStatus>(
    '/api/admin-google-drive/status',
    'DELETE',
  );

export const loadGoogleDriveAuthUrl = () =>
  requestGoogleDriveRoute<{ url: string }>('/api/admin-google-drive/auth-url');

export const updateWorksheetCandidateStatus = async ({
  candidateId,
  rejectionReason,
  reviewedBy,
  status,
}: {
  candidateId: string;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  status: Extract<WorksheetCandidateStatus, 'pending' | 'rejected'>;
}) => {
  const updates = {
    rejection_reason:
      status === 'rejected' ? rejectionReason?.trim() || null : null,
    reviewed_at: status === 'pending' ? null : new Date().toISOString(),
    reviewed_by: status === 'pending' ? null : (reviewedBy ?? null),
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('worksheet_candidates')
    .update(updates)
    .eq('id', candidateId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as WorksheetCandidate;
};

const gradesAreEqual = (
  left?: AdminDocument['grade'],
  right?: AdminDocument['grade'],
) => JSON.stringify(left ?? []) === JSON.stringify(right ?? []);

export const migrateLegacyWorksheetDocuments = async (
  documents: AdminDocument[],
) => {
  const worksheetDocuments = documents.filter((document) =>
    isWorksheetType(document.type),
  );

  let updated = 0;

  for (const document of worksheetDocuments) {
    const grade = getWorksheetGradeValue(document.grade);
    const outcome = getWorksheetOutcomeLabel(document);
    const nextDescription = buildWorksheetDescription({
      description: getWorksheetVisibleDescription(document),
      order: getWorksheetOrder(document),
      outcome,
    });
    const nextGrade = grade ? [grade] : document.grade;
    const nextTitle =
      typeof grade === 'number'
        ? buildWorksheetStandardTitle({
            grade,
            order: getWorksheetOrder(document) || 1,
            outcome,
            subject: getWorksheetTitleTopic({
              outcome,
              subject: getWorksheetVisibleDescription(document),
            }),
          })
        : document.title;

    if (
      nextDescription === (document.description || '') &&
      gradesAreEqual(nextGrade, document.grade) &&
      nextTitle === document.title
    ) {
      continue;
    }

    const { error } = await supabase
      .from('documents')
      .update({
        description: nextDescription,
        grade: nextGrade,
        title: nextTitle,
      })
      .eq('id', document.id);

    if (!error) {
      updated += 1;
    }
  }

  return updated;
};

export const refreshAdminDocumentCategories = async () => {
  const updates = [
    { next: 'yaprak-test', old: 'worksheet' },
    { next: 'yaprak-test', old: 'document' },
    { next: 'deneme-sinav', old: 'test' },
    { next: 'deneme-sinav', old: 'deneme' },
    { next: 'deneme-sinav', old: 'sinav' },
    { next: 'oyunlar', old: 'game' },
    { next: 'ders-notlari', old: 'writing' },
    { next: 'ders-notlari', old: 'ders-notuari-kitaplar' },
  ];

  let updated = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from('documents')
      .update({ type: update.next })
      .eq('type', update.old);

    if (!error) {
      updated++;
    }
  }

  return updated;
};
