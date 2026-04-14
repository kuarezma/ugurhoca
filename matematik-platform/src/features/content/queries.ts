import { isAdminEmail } from '@/lib/admin';
import { getClientSession } from '@/lib/auth-client';
import { supabase } from '@/lib/supabase/client';
import type { Comment, ContentDocument } from '@/types';
import type {
  ContentComment,
  ContentDocumentsPayload,
  ContentFormState,
  ContentGradeFilter,
  ContentPageUser,
  ContentPrefetchPayload,
} from '@/features/content/types';
import {
  CONTENT_PAGE_SIZE,
  CONTENT_TYPE_MAPPING,
} from '@/features/content/constants';

const CONTENT_DOCUMENT_CACHE_TTL_MS = 60_000;

type ContentDocumentCacheEntry = {
  payload: ContentDocumentsPayload;
  timestamp: number;
};

const contentDocumentCache = new Map<string, ContentDocumentCacheEntry>();
const pendingContentDocumentRequests = new Map<
  string,
  Promise<ContentDocumentsPayload>
>();
const contentPrefetchCache = new Map<
  string,
  { grade: ContentGradeFilter; timestamp: number }
>();
const pendingContentPrefetchRequests = new Map<
  string,
  Promise<ContentPrefetchPayload>
>();

const getContentDocumentCacheKey = (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
) => `${page}:${pageSize}:${String(gradeFilter)}:${typeFilter}`;

export const clearContentDocumentCache = () => {
  contentDocumentCache.clear();
  pendingContentDocumentRequests.clear();
  contentPrefetchCache.clear();
  pendingContentPrefetchRequests.clear();
};

export const seedContentDocumentCache = (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
  payload: ContentDocumentsPayload,
) => {
  const cacheKey = getContentDocumentCacheKey(
    page,
    pageSize,
    gradeFilter,
    typeFilter,
  );

  contentDocumentCache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });
};

export const prefetchContentDocuments = async (typeFilter: string) => {
  const normalizedType =
    typeof typeFilter === 'string' && typeFilter.length > 0 ? typeFilter : 'all';
  const prefetched = contentPrefetchCache.get(normalizedType);

  if (prefetched) {
    const cacheKey = getContentDocumentCacheKey(
      1,
      CONTENT_PAGE_SIZE,
      prefetched.grade,
      normalizedType,
    );
    const cached = contentDocumentCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CONTENT_DOCUMENT_CACHE_TTL_MS) {
      return {
        ...cached.payload,
        grade: prefetched.grade,
        type: normalizedType,
      };
    }
  }

  const pendingRequest = pendingContentPrefetchRequests.get(normalizedType);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    const response = await fetch(
      `/api/content-prefetch?type=${encodeURIComponent(normalizedType)}`,
      {
        credentials: 'same-origin',
      },
    );
    const payload = (await response.json().catch(() => null)) as
      | { data?: ContentPrefetchPayload; error?: { message?: string } }
      | null;

    if (!response.ok || !payload?.data) {
      throw new Error(
        payload?.error?.message || 'Icerik on hazirligi yuklenemedi.',
      );
    }

    seedContentDocumentCache(
      1,
      CONTENT_PAGE_SIZE,
      payload.data.grade,
      payload.data.type,
      {
        count: payload.data.count,
        documents: payload.data.documents,
      },
    );
    contentPrefetchCache.set(payload.data.type, {
      grade: payload.data.grade,
      timestamp: Date.now(),
    });

    return payload.data;
  })();

  pendingContentPrefetchRequests.set(normalizedType, request);

  try {
    return await request;
  } finally {
    pendingContentPrefetchRequests.delete(normalizedType);
  }
};

export const loadContentDocuments = async (
  page: number,
  pageSize: number,
  gradeFilter: ContentGradeFilter,
  typeFilter: string,
) => {
  const cacheKey = getContentDocumentCacheKey(
    page,
    pageSize,
    gradeFilter,
    typeFilter,
  );
  const cached = contentDocumentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CONTENT_DOCUMENT_CACHE_TTL_MS) {
    return cached.payload;
  }

  const pendingRequest = pendingContentDocumentRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const normalizedTypeFilter = CONTENT_TYPE_MAPPING[typeFilter] || typeFilter;

    let countQuery = supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (gradeFilter !== 'all') {
      countQuery = countQuery.contains('grade', [gradeFilter]);
    }

    if (typeFilter !== 'all') {
      countQuery = countQuery.eq('type', normalizedTypeFilter);
    }

    let dataQuery = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (gradeFilter !== 'all') {
      dataQuery = dataQuery.contains('grade', [gradeFilter]);
    }

    if (typeFilter !== 'all') {
      dataQuery = dataQuery.eq('type', normalizedTypeFilter);
    }

    const [{ count }, { data }] = await Promise.all([
      countQuery,
      dataQuery.range(from, to),
    ]);

    const payload = {
      count: count || 0,
      documents: (data || []) as ContentDocument[],
    };

    seedContentDocumentCache(page, pageSize, gradeFilter, typeFilter, payload);

    return payload;
  })();

  pendingContentDocumentRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    pendingContentDocumentRequests.delete(cacheKey);
  }
};

export const resolveContentUser = async () => {
  const localUser = localStorage.getItem('matematiklab_user');

  if (localUser) {
    const userData = JSON.parse(localUser) as ContentPageUser;

    if (isAdminEmail(userData.email)) {
      return { ...userData, isAdmin: true };
    }
  }

  const session = await getClientSession();

  if (!session) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const isAdmin = isAdminEmail(session.user.email);

  if (profile) {
    return {
      ...(profile as Record<string, unknown>),
      email: session.user.email ?? '',
      isAdmin,
    } as ContentPageUser;
  }

  return {
    email: session.user.email ?? '',
    grade: session.user.user_metadata?.grade ?? 5,
    id: session.user.id,
    isAdmin,
    name: session.user.user_metadata?.name || 'Öğrenci',
  } as ContentPageUser;
};

export const createContentDocument = async (payload: ContentFormState) => {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        ...payload,
        created_at: new Date().toISOString(),
        downloads: 0,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  clearContentDocumentCache();

  return (data?.[0] || null) as ContentDocument | null;
};

export const uploadContentFile = async (file: File) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('documents').getPublicUrl(fileName);

  return {
    fileName: file.name,
    publicUrl: data.publicUrl,
  };
};

export const updateContentDocument = async (
  documentId: string,
  payload: ContentFormState,
) => {
  const { data, error } = await supabase
    .from('documents')
    .update(payload)
    .eq('id', documentId)
    .select();

  if (error) {
    throw error;
  }

  clearContentDocumentCache();

  return (data?.[0] || null) as ContentDocument | null;
};

export const deleteContentDocument = async (documentId: string) => {
  const { error } = await supabase.from('documents').delete().eq('id', documentId);

  if (error) {
    throw error;
  }

  clearContentDocumentCache();
};

export const updateDocumentMetric = async (
  documentId: string,
  payload: Partial<Pick<ContentDocument, 'comments_count' | 'downloads' | 'likes'>>,
) => {
  const { error } = await supabase
    .from('documents')
    .update(payload)
    .eq('id', documentId);

  if (error) {
    throw error;
  }

  clearContentDocumentCache();
};

export const loadDocumentComments = async (documentId: string) => {
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  return (data || []) as ContentComment[];
};

export const createDocumentComment = async (payload: {
  content: string;
  document_id: string;
  user_id?: string;
  user_name?: string;
}) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([payload])
    .select();

  if (error) {
    throw error;
  }

  return (data?.[0] || null) as Comment | null;
};
