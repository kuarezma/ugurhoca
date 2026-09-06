export type PortfolioCategory = 'solution' | 'project' | 'exam' | 'reflection';

export interface PortfolioItem {
  id: string;
  title: string;
  topic: string;
  category: PortfolioCategory;
  grade: string;
  studentReflection: string;
  teacherFeedback?: string;
  score?: number;
  date: string;
  tags: string[];
}

export const PORTFOLIO_STORAGE_KEY = 'ugurhoca_student_portfolio_items';

export const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Çarpanlara Ayırma Model Tasarımı',
    topic: 'Özdeşlikler & Geometrik Modelleme',
    category: 'solution',
    grade: '8',
    studentReflection: 'Karton ve renkli kağıtlarla (a+b)² geometrik ispatını yaptım. Formülü ezberlemek yerine alan mantığını tam anladım.',
    teacherFeedback: 'Harika bir somutlaştırma örneği! Cebirsel ifadenin alan karşılığını çok net anlatmışsın.',
    score: 100,
    date: '2026-09-02',
    tags: ['LGS', 'Geometrik İspat', 'Cebir'],
  },
  {
    id: 'port-2',
    title: 'Üçgen Eşitsizliği Şehir Planı Analizi',
    topic: 'Üçgenler & Pisagor',
    category: 'project',
    grade: '8',
    studentReflection: 'Harita üzerinde üç farklı nokta seçip en kısa yol hesaplamalarında üçgen eşitsizliği kuralını uyguladım.',
    teacherFeedback: 'Gerçek hayatla matematiği ilişkilendiren harika bir proje.',
    score: 95,
    date: '2026-08-25',
    tags: ['Proje', 'Pisagor', 'Optimizasyon'],
  },
];

export function getPortfolioItems(): PortfolioItem[] {
  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_ITEMS;
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIO_ITEMS));
      return DEFAULT_PORTFOLIO_ITEMS;
    }
    return JSON.parse(raw) as PortfolioItem[];
  } catch {
    return DEFAULT_PORTFOLIO_ITEMS;
  }
}

export function savePortfolioItem(item: PortfolioItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const items = getPortfolioItems();
    const existingIdx = items.findIndex((i) => i.id === item.id);
    if (existingIdx >= 0) {
      items[existingIdx] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to save portfolio item:', error);
    return false;
  }
}

export function removePortfolioItem(itemId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const items = getPortfolioItems().filter((i) => i.id !== itemId);
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Failed to remove portfolio item:', error);
    return false;
  }
}
