/**
 * Ultra hafif (<2KB) İstemci Tarafı Mikro-İlerleme ve Oyunlaştırma (IndexedDB)
 * Kullanıcının üyelik veya sunucu bağlantısı olmadan çözdüğü soruları,
 * gün serilerini (streak) ve istatistiklerini tarayıcıda saklar.
 */

export interface SolvedQuestionRecord {
  id: string;
  topic: string;
  isCorrect: boolean;
  score: number;
  timestamp: number;
  dateStr: string;
}

export interface UserStreakStats {
  currentStreak: number;
  lastActiveDate: string | null;
  totalCorrect: number;
  totalSolved: number;
}

export class EduProgressDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'UgurHocaEduDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  public async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new Error('IndexedDB is not supported in this environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('solvedQuestions')) {
          const store = db.createObjectStore('solvedQuestions', { keyPath: 'id' });
          store.createIndex('topic', 'topic', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('userStats')) {
          db.createObjectStore('userStats', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  public async recordAnswer({
    questionId,
    topic,
    isCorrect,
    score = 10,
  }: {
    questionId: string;
    topic: string;
    isCorrect: boolean;
    score?: number;
  }): Promise<boolean> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['solvedQuestions', 'userStats'], 'readwrite');
      const qStore = tx.objectStore('solvedQuestions');
      const statsStore = tx.objectStore('userStats');

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // 1. Soru kaydını ekle/güncelle
      const record: SolvedQuestionRecord = {
        id: questionId,
        topic,
        isCorrect,
        score: isCorrect ? score : 0,
        timestamp: now.getTime(),
        dateStr: todayStr,
      };
      qStore.put(record);

      // 2. Seri ve sayaç güncellemesi
      const statsReq = statsStore.get('streakStats');
      statsReq.onsuccess = () => {
        const existing = statsReq.result?.data as UserStreakStats | undefined;
        const stats: UserStreakStats = existing || {
          currentStreak: 0,
          lastActiveDate: null,
          totalCorrect: 0,
          totalSolved: 0,
        };

        stats.totalSolved += 1;
        if (isCorrect) stats.totalCorrect += 1;

        if (stats.lastActiveDate !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (stats.lastActiveDate === yesterdayStr) {
            stats.currentStreak += 1;
          } else {
            stats.currentStreak = 1;
          }
          stats.lastActiveDate = todayStr;
        }

        statsStore.put({ key: 'streakStats', data: stats });
      };

      tx.oncomplete = () => {
        if (isCorrect && typeof window !== 'undefined') {
          triggerMicroCelebration();
        }
        resolve(true);
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  public async getStreakInfo(): Promise<UserStreakStats> {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('userStats', 'readonly');
        const req = tx.objectStore('userStats').get('streakStats');
        req.onsuccess = () => {
          const data = req.result?.data as UserStreakStats | undefined;
          resolve(
            data || {
              currentStreak: 0,
              lastActiveDate: null,
              totalCorrect: 0,
              totalSolved: 0,
            }
          );
        };
        req.onerror = () => {
          resolve({
            currentStreak: 0,
            lastActiveDate: null,
            totalCorrect: 0,
            totalSolved: 0,
          });
        };
      });
    } catch {
      return {
        currentStreak: 0,
        lastActiveDate: null,
        totalCorrect: 0,
        totalSolved: 0,
      };
    }
  }

  public async getSolvedCount(): Promise<number> {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('solvedQuestions', 'readonly');
        const req = tx.objectStore('solvedQuestions').count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }
}

/**
 * 0-Kütüphane, Hafif Canvas Konfeti & Başarı Animasyonu (<1KB)
 */
export function triggerMicroCelebration(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '10000';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const particles = Array.from({ length: 45 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2 + 50,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.7) * 16,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
  }));

  let frameId: number;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let activeCount = 0;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // Yerçekimi
      p.alpha -= 0.015;
      p.rotation += p.rotSpeed;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeCount > 0) {
      frameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frameId);
      canvas.remove();
    }
  }

  animate();
}

export const eduProgressDB = new EduProgressDB();
