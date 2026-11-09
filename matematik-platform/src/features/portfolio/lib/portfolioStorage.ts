import { createLogger } from '@/lib/logger';

const log = createLogger('portfolio:storage');

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

export const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [];

export function getPortfolioItems(): PortfolioItem[] {
  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_ITEMS;
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) {
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
    log.error('Failed to save portfolio item', error);
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
    log.error('Failed to remove portfolio item', error);
    return false;
  }
}
