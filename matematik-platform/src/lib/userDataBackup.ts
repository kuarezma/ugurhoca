export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_APP_IDENTIFIER = 'ugur-hoca-matematik';

export interface UserBackupPayload {
  app: string;
  version: number;
  exportedAt: string;
  data: {
    dailyGoal: Record<string, unknown> | null;
    mistakesBank: unknown[];
    topicChecklist: Record<string, boolean> | null;
    liveQuestions: unknown[];
  };
}

const STORAGE_KEYS = {
  dailyGoal: 'ugurhoca_daily_goal_v1',
  mistakesBank: 'ugur_hoca_mistakes_bank_v1',
  topicChecklist: 'ugurhoca_topic_checklist_v1',
  liveQuestions: 'ugur_hoca_live_questions_pool_v1',
};

/**
 * Tarayıcıdaki yerel kullanıcı verilerini toplar ve bir yedekleme objesi oluşturur.
 */
export function generateUserDataBackup(): UserBackupPayload {
  let dailyGoal: Record<string, unknown> | null = null;
  let mistakesBank: unknown[] = [];
  let topicChecklist: Record<string, boolean> | null = null;
  let liveQuestions: unknown[] = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const dg = localStorage.getItem(STORAGE_KEYS.dailyGoal);
      if (dg) dailyGoal = JSON.parse(dg) as Record<string, unknown>;
    } catch {
      // ignore
    }

    try {
      const mb = localStorage.getItem(STORAGE_KEYS.mistakesBank);
      if (mb) {
        const parsed = JSON.parse(mb);
        if (Array.isArray(parsed)) mistakesBank = parsed;
      }
    } catch {
      // ignore
    }

    try {
      const tc = localStorage.getItem(STORAGE_KEYS.topicChecklist);
      if (tc) {
        const parsed = JSON.parse(tc);
        if (parsed && typeof parsed === 'object') {
          topicChecklist = parsed as Record<string, boolean>;
        }
      }
    } catch {
      // ignore
    }

    try {
      const lq = localStorage.getItem(STORAGE_KEYS.liveQuestions);
      if (lq) {
        const parsed = JSON.parse(lq);
        if (Array.isArray(parsed)) liveQuestions = parsed;
      }
    } catch {
      // ignore
    }
  }

  return {
    app: BACKUP_APP_IDENTIFIER,
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      dailyGoal,
      mistakesBank,
      topicChecklist,
      liveQuestions,
    },
  };
}

/**
 * Yedek objesini JSON dizesine dönüştürür.
 */
export function exportUserDataBackupJson(): string {
  return JSON.stringify(generateUserDataBackup(), null, 2);
}

/**
 * Tarayıcıda indirme tetikler.
 */
export function downloadUserDataBackupFile(): void {
  if (typeof window === 'undefined') return;

  const jsonStr = exportUserDataBackupJson();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `ugurhoca-yedek-${dateStr}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Yüklenen dosyanın geçerli bir Uğur Hoca yedek dosyası olup olmadığını doğrular.
 */
export function validateUserDataBackup(payload: unknown): {
  valid: boolean;
  error?: string;
  data?: UserBackupPayload;
} {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Yedek dosyası geçerli bir JSON nesnesi içermiyor.' };
  }

  const p = payload as Record<string, unknown>;

  if (p.app !== BACKUP_APP_IDENTIFIER) {
    return {
      valid: false,
      error: 'Bu dosya Uğur Hoca Matematik Platformu için geçerli bir yedekleme dosyası değil.',
    };
  }

  if (typeof p.version !== 'number' || p.version > BACKUP_SCHEMA_VERSION) {
    return {
      valid: false,
      error: 'Yedekleme dosya sürümü desteklenmiyor ya da daha yeni bir sürüme ait.',
    };
  }

  if (!p.data || typeof p.data !== 'object') {
    return { valid: false, error: 'Yedekleme dosyasında veri bloğu bulunamadı.' };
  }

  return { valid: true, data: p as unknown as UserBackupPayload };
}

/**
 * JSON string'i ayrıştırıp doğrular ve localStorage'a aktarır.
 */
export function importUserDataBackup(jsonContent: string): {
  success: boolean;
  message: string;
  stats?: {
    dailyStreak: number;
    mistakesCount: number;
    topicsCount: number;
  };
} {
  try {
    const parsed: unknown = JSON.parse(jsonContent);
    const validation = validateUserDataBackup(parsed);

    if (!validation.valid || !validation.data) {
      return {
        success: false,
        message: validation.error || 'Doğrulama hatası oluştu.',
      };
    }

    const { data } = validation.data;

    if (typeof window !== 'undefined' && window.localStorage) {
      if (data.dailyGoal) {
        localStorage.setItem(STORAGE_KEYS.dailyGoal, JSON.stringify(data.dailyGoal));
      }
      if (Array.isArray(data.mistakesBank)) {
        localStorage.setItem(STORAGE_KEYS.mistakesBank, JSON.stringify(data.mistakesBank));
      }
      if (data.topicChecklist) {
        localStorage.setItem(STORAGE_KEYS.topicChecklist, JSON.stringify(data.topicChecklist));
      }
      if (Array.isArray(data.liveQuestions)) {
        localStorage.setItem(STORAGE_KEYS.liveQuestions, JSON.stringify(data.liveQuestions));
      }
    }

    const streak =
      typeof data.dailyGoal?.currentStreak === 'number' ? data.dailyGoal.currentStreak : 0;
    const mistakesCount = Array.isArray(data.mistakesBank) ? data.mistakesBank.length : 0;
    const topicsCount = data.topicChecklist
      ? Object.values(data.topicChecklist).filter(Boolean).length
      : 0;

    return {
      success: true,
      message: 'Verileriniz başarıyla geri yüklendi!',
      stats: {
        dailyStreak: streak,
        mistakesCount,
        topicsCount,
      },
    };
  } catch (err: unknown) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.code === 22)
    ) {
      return {
        success: false,
        message: 'Tarayıcı depolama alanı yetersiz. Lütfen tarayıcı önbelleğini temizleyip tekrar deneyin.',
      };
    }
    return {
      success: false,
      message: 'JSON dosyası çözümlenemedi. Dosyanın bozulmamış olduğundan emin olun.',
    };
  }
}
