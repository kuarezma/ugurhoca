import { describe, expect, it, beforeEach } from 'vitest';
import {
  getPortfolioItems,
  savePortfolioItem,
  removePortfolioItem,
  type PortfolioItem,
} from './portfolioStorage';

describe('portfolioStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockItem: PortfolioItem = {
    id: 'test-port-1',
    title: 'Fraktal Ağaç Çizimi',
    topic: 'Fraktallar ve Geometri',
    category: 'project',
    grade: '8',
    studentReflection: 'Ağacın her dalında 1/2 oranında küçülme uygulayarak geometrik örüntüyü çizdim.',
    teacherFeedback: 'Matematik ve sanatın mükemmel birleşimi!',
    score: 98,
    date: '2026-09-05',
    tags: ['Fraktal', 'Geometri'],
  };

  it('retrieves default portfolio items when storage is empty', () => {
    const items = getPortfolioItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].title).toContain('Çarpanlara Ayırma');
  });

  it('saves new portfolio item', () => {
    savePortfolioItem(mockItem);
    const items = getPortfolioItems();
    expect(items.some((i) => i.id === 'test-port-1')).toBe(true);
  });

  it('updates existing portfolio item', () => {
    savePortfolioItem(mockItem);
    savePortfolioItem({ ...mockItem, score: 100 });
    const items = getPortfolioItems();
    const updated = items.find((i) => i.id === 'test-port-1');
    expect(updated?.score).toBe(100);
  });

  it('removes portfolio item by id', () => {
    savePortfolioItem(mockItem);
    removePortfolioItem('test-port-1');
    const items = getPortfolioItems();
    expect(items.some((i) => i.id === 'test-port-1')).toBe(false);
  });
});
