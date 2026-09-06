import { supabase } from '@/lib/supabase/client';
import {
  type SavedMistakeQuestion,
  getSavedMistakes,
  saveMistakesList,
} from './mistakeStorage';

/**
 * Benzersiz soru anahtarı üretir (ID veya normalize edilmiş soru metni).
 */
export const getMistakeKey = (m: SavedMistakeQuestion): string => {
  if (m.question?.id) return String(m.question.id);
  if (m.id) return m.id;
  const text = m.question?.question || '';
  return text.slice(0, 60).trim().toLowerCase();
};

/**
 * İki farklı cihazdan veya yerel/bulut kaynağından gelen hata listelerini
 * çakışmaları en güncel (Last-Write-Wins) ve kalıcı öğrenme (Mastered) kurallarıyla birleştirir.
 */
export const mergeMistakes = (
  local: SavedMistakeQuestion[],
  remote: SavedMistakeQuestion[],
): SavedMistakeQuestion[] => {
  const map = new Map<string, SavedMistakeQuestion>();

  // 1. Önce uzak/bulut kayıtlarını haritaya ekle
  for (const item of remote) {
    const key = getMistakeKey(item);
    if (key) {
      map.set(key, item);
    }
  }

  // 2. Yerel kayıtlarla birleştir
  for (const localItem of local) {
    const key = getMistakeKey(localItem);
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, localItem);
      continue;
    }

    // Çakışma çözümleme:
    // Eğer birinde soru öğrenildiyse (mastered) kalıcı olarak öğrenildi say
    const mastered = Boolean(localItem.mastered || existing.mastered);

    // Daha yüksek review stage veya daha yeni inceleme
    const localStage = localItem.reviewStage ?? 0;
    const existingStage = existing.reviewStage ?? 0;
    const reviewStage = Math.max(localStage, existingStage);

    const localTime = new Date(localItem.lastReviewedAt || localItem.savedAt || 0).getTime();
    const existingTime = new Date(existing.lastReviewedAt || existing.savedAt || 0).getTime();
    const isLocalNewer = localTime >= existingTime;

    const chosen = isLocalNewer ? localItem : existing;

    map.set(key, {
      ...chosen,
      mastered,
      reviewStage,
      reviewCount: Math.max(localItem.reviewCount ?? 0, existing.reviewCount ?? 0),
      reason: localItem.reason || existing.reason,
      nextReviewDate: isLocalNewer
        ? (localItem.nextReviewDate || existing.nextReviewDate)
        : (existing.nextReviewDate || localItem.nextReviewDate),
    });
  }

  // Tarihe göre yeniden eskiye sırala ve en fazla 200 adet tut
  return Array.from(map.values())
    .sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime())
    .slice(0, 200);
};

export type SyncResult = {
  success: boolean;
  count: number;
  error?: string;
  mistakes: SavedMistakeQuestion[];
};

let syncInProgress = false;

/**
 * Oturum açmış öğrencinin hata defterini Supabase bulut veritabanı ile çift yönlü eşitler.
 * Tarayıcıdaki eski veya çevrimdışı veriler hesaba taşınır, diğer cihazlardaki hatalar getirilir.
 */
export async function syncMistakesWithCloud(userId?: string): Promise<SyncResult> {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, mistakes: [] };
  }

  if (syncInProgress) {
    return { success: true, count: getSavedMistakes().length, mistakes: getSavedMistakes() };
  }

  syncInProgress = true;

  try {
    let activeUserId = userId;
    if (!activeUserId) {
      const { data } = await supabase.auth.getUser();
      activeUserId = data?.user?.id;
    }

    if (!activeUserId) {
      // Oturum yok, sadece yerel veriyi döndür
      const local = getSavedMistakes();
      return { success: true, count: local.length, mistakes: local };
    }

    const localMistakes = getSavedMistakes();

    // 1. Buluttaki hataları çek
    const { data: cloudRows, error: fetchError } = await supabase
      .from('user_mistakes')
      .select('*')
      .eq('user_id', activeUserId);

    if (fetchError) {
      // Bulut tablosu henüz migration almamış veya erişilemiyorsa güvenle yerelde kal
      return { success: false, count: localMistakes.length, error: fetchError.message, mistakes: localMistakes };
    }

    // Bulut satırlarını SavedMistakeQuestion formatına çevir
    const remoteMistakes: SavedMistakeQuestion[] = (cloudRows || []).map((row) => ({
      id: row.id,
      question: row.question_data,
      quizTitle: row.quiz_title || undefined,
      savedAt: row.saved_at,
      mastered: Boolean(row.mastered),
      reason: row.reason || undefined,
      reviewStage: row.review_stage ?? 0,
      nextReviewDate: row.next_review_date || undefined,
      lastReviewedAt: row.last_reviewed_at || undefined,
      reviewCount: row.review_count ?? 0,
    }));

    // 2. Çift yönlü birleştir (Merge)
    const merged = mergeMistakes(localMistakes, remoteMistakes);

    // 3. Yerel depolamaya kaydet
    saveMistakesList(merged);

    // 4. Bulutu güncelle (Upsert)
    if (merged.length > 0) {
      const upsertPayload = merged.map((m) => ({
        id: m.id || `mistake_${activeUserId}_${getMistakeKey(m)}`,
        user_id: activeUserId,
        question_id: getMistakeKey(m),
        question_data: m.question,
        quiz_title: m.quizTitle || null,
        saved_at: m.savedAt || new Date().toISOString(),
        mastered: m.mastered,
        reason: m.reason || null,
        review_stage: m.reviewStage ?? 0,
        next_review_date: m.nextReviewDate || null,
        last_reviewed_at: m.lastReviewedAt || null,
        review_count: m.reviewCount ?? 0,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('user_mistakes').upsert(upsertPayload, {
        onConflict: 'user_id,question_id',
      });
    }

    return {
      success: true,
      count: merged.length,
      mistakes: merged,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Senkronizasyon hatası';
    return {
      success: false,
      count: getSavedMistakes().length,
      error: message,
      mistakes: getSavedMistakes(),
    };
  } finally {
    syncInProgress = false;
  }
}
