'use client';

import dynamic from 'next/dynamic';

export type WeeklyChartPoint = { name: string; duration: number };

export type RadarChartPoint = {
  subject: string;
  A: number;
  fullMark: number;
};

export type StudyCurvePoint = {
  cumulative: number;
  name: string;
  target: number;
};

export type ProgressChartsProps = {
  isLight: boolean;
  chartData: WeeklyChartPoint[];
  displayRadarData: RadarChartPoint[];
  studyCurveData: StudyCurvePoint[];
};

const ProgressChartsInner = dynamic(
  () => import('./ProgressChartsInner').then((mod) => mod.ProgressChartsInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        aria-busy="true"
        data-testid="progress-charts-loading"
      >
        <div className="h-80 rounded-3xl border border-default bg-surface-1 p-6 animate-pulse" />
        <div className="h-80 rounded-3xl border border-default bg-surface-1 p-6 animate-pulse" />
        <div className="h-80 rounded-3xl border border-default bg-surface-1 p-6 lg:col-span-2 animate-pulse" />
      </div>
    ),
  },
);

export function ProgressCharts(props: ProgressChartsProps) {
  return <ProgressChartsInner {...props} />;
}
