export interface AhaMomentItem {
  id: string;
  studentId: string;
  category: 'Cebir' | 'Geometri' | 'Problem Stratejisi' | 'Pratik İşlem';
  momentText: string;
  reaction: 'mindblown' | 'lightbulb' | 'relief' | 'rocket';
  topic: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export const AHA_MOMENTS_STORAGE_KEY = 'ugurhoca_aha_moments';

function getLocalDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DEFAULT_AHA_MOMENTS: AhaMomentItem[] = [
  {
    id: 'aha-1',
    studentId: 'std-1',
    category: 'Cebir',
    momentText: 'İki kare farkı (a² - b²) aslında büyük bir kareden küçük bir kareyi kesip yanına eklemekmiş!',
    reaction: 'mindblown',
    topic: 'Cebirsel İfadeler',
    date: getLocalDateString(new Date(Date.now() - 86400000 * 2)),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'aha-2',
    studentId: 'std-1',
    category: 'Geometri',
    momentText: 'Üçgende kenarortayların kesişim noktası (ağırlık merkezi), üçgeni parmak ucunda dengede tutan yerdir.',
    reaction: 'lightbulb',
    topic: 'Üçgenler',
    date: getLocalDateString(new Date(Date.now() - 86400000)),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'aha-3',
    studentId: 'std-1',
    category: 'Problem Stratejisi',
    momentText: 'Yeni nesil sorularda metin ne kadar uzunsa, matematiksel işlem o kadar basit oluyor. Önce sorunun son cümlesini okumalıyım!',
    reaction: 'rocket',
    topic: 'LGS Problem Stratejileri',
    date: getLocalDateString(new Date()),
    createdAt: new Date().toISOString(),
  },
];

export function getAhaMoments(): AhaMomentItem[] {
  if (typeof window === 'undefined') return DEFAULT_AHA_MOMENTS;
  try {
    const raw = localStorage.getItem(AHA_MOMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AHA_MOMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_AHA_MOMENTS));
      return DEFAULT_AHA_MOMENTS;
    }
    return JSON.parse(raw) as AhaMomentItem[];
  } catch {
    return DEFAULT_AHA_MOMENTS;
  }
}

export function saveAhaMoment(item: AhaMomentItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const moments = getAhaMoments();
    const existingIdx = moments.findIndex((m) => m.id === item.id);
    if (existingIdx >= 0) {
      moments[existingIdx] = item;
    } else {
      moments.unshift(item);
    }
    localStorage.setItem(AHA_MOMENTS_STORAGE_KEY, JSON.stringify(moments));
    return true;
  } catch (error) {
    console.error('Failed to save Aha moment:', error);
    return false;
  }
}

export function deleteAhaMoment(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const moments = getAhaMoments();
    const filtered = moments.filter((m) => m.id !== id);
    localStorage.setItem(AHA_MOMENTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}
