import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressChartsInner } from './ProgressChartsInner';
import { ProgressCharts } from './ProgressCharts';

describe('ProgressCharts Bileşenleri', () => {
  const mockWeeklyData = [
    { name: 'Pzt', duration: 45 },
    { name: 'Sal', duration: 60 },
    { name: 'Çar', duration: 0 },
  ];

  const mockRadarData = [
    { subject: 'Üslü İfadeler', A: 85, fullMark: 100 },
    { subject: 'Kareköklü İfadeler', A: 70, fullMark: 100 },
    { subject: 'Çarpanlar ve Katlar', A: 90, fullMark: 100 },
  ];

  const mockStudyCurve = [
    { name: '1. Gün', cumulative: 45, target: 85 },
    { name: '2. Gün', cumulative: 105, target: 170 },
  ];

  it('ProgressChartsInner dolu verilerle tüm bölüm başlıklarını render eder', () => {
    render(
      <ProgressChartsInner
        isLight={true}
        chartData={mockWeeklyData}
        displayRadarData={mockRadarData}
        studyCurveData={mockStudyCurve}
      />,
    );

    expect(screen.getByText('Haftalık Analiz')).toBeInTheDocument();
    expect(screen.getByText('Matematik Becerisi Ağı')).toBeInTheDocument();
    expect(screen.getByText('Haftalık Çalışma Eğrisi')).toBeInTheDocument();
    expect(
      screen.getByText('600 dk hedef çizgisiyle karşılaştırma'),
    ).toBeInTheDocument();
  });

  it('displayRadarData boş olduğunda açıklayıcı boş durum mesajı gösterir', () => {
    render(
      <ProgressChartsInner
        isLight={false}
        chartData={mockWeeklyData}
        displayRadarData={[]}
        studyCurveData={mockStudyCurve}
      />,
    );

    expect(
      screen.getByText(
        'Konu dağılımı grafiği için en az 3 farklı konuda çalışma veya test tamamlamalısın.',
      ),
    ).toBeInTheDocument();
  });

  it('ProgressCharts wrapper bileşeni sorunsuz mount olur', () => {
    const { container } = render(
      <ProgressCharts
        isLight={true}
        chartData={mockWeeklyData}
        displayRadarData={mockRadarData}
        studyCurveData={mockStudyCurve}
      />,
    );

    expect(container).toBeInTheDocument();
  });
});
