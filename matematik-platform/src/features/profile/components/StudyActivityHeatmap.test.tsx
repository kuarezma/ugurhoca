import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudyActivityHeatmap, { calculateHeatmapLevel } from './StudyActivityHeatmap';

describe('StudyActivityHeatmap', () => {
  it('correctly calculates heatmap density levels', () => {
    expect(calculateHeatmapLevel(0)).toBe(0);
    expect(calculateHeatmapLevel(5)).toBe(1);
    expect(calculateHeatmapLevel(9)).toBe(1);
    expect(calculateHeatmapLevel(10)).toBe(2);
    expect(calculateHeatmapLevel(19)).toBe(2);
    expect(calculateHeatmapLevel(20)).toBe(3);
    expect(calculateHeatmapLevel(34)).toBe(3);
    expect(calculateHeatmapLevel(35)).toBe(4);
    expect(calculateHeatmapLevel(100)).toBe(4);
  });

  it('renders heatmap with history and displays stats', () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const mockHistory: Record<string, number> = {
      [todayStr]: 25,
      '2026-03-01': 15,
      '2026-03-02': 40,
    };

    render(
      <StudyActivityHeatmap
        history={mockHistory}
        dailyTarget={20}
        isLight={false}
      />
    );

    expect(screen.getByText('Yıllık Soru Çözüm Isı Haritası')).toBeInTheDocument();
    expect(screen.getByText('365 Gün')).toBeInTheDocument();
    expect(screen.getByText('80 Soru')).toBeInTheDocument();
    expect(screen.getByText('3 Gün')).toBeInTheDocument();
    expect(screen.getByText('40 Soru/Gün')).toBeInTheDocument();

    // Day labels
    expect(screen.getByText('Pzt')).toBeInTheDocument();
    expect(screen.getByText('Çar')).toBeInTheDocument();
    expect(screen.getByText('Cum')).toBeInTheDocument();

    // Hover or click cell
    const todayCell = screen.getByLabelText(new RegExp(`${todayStr}: 25 soru`));
    expect(todayCell).toBeInTheDocument();

    fireEvent.click(todayCell);
    expect(screen.getByText(/25 soru çözüldü/i)).toBeInTheDocument();
    expect(screen.getByText(/Hedef Tamamlandı/i)).toBeInTheDocument();

    // Hover cell
    fireEvent.mouseEnter(todayCell);
    expect(screen.getByText(/25 soru çözüldü/i)).toBeInTheDocument();
    fireEvent.mouseLeave(todayCell);
  });
});
