'use client';

import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Brain, Calendar } from 'lucide-react';

export type WeeklyChartPoint = { name: string; duration: number };

export type RadarChartPoint = {
  subject: string;
  A: number;
  fullMark: number;
};

type ProgressChartsProps = {
  isLight: boolean;
  chartData: WeeklyChartPoint[];
  displayRadarData: RadarChartPoint[];
};

export function ProgressCharts({
  isLight,
  chartData,
  displayRadarData,
}: ProgressChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-3xl border p-6 ${
          isLight
            ? 'border-slate-200 bg-white'
            : 'border-slate-700 bg-slate-800/50'
        }`}
      >
        <div className="mb-6 flex items-center gap-2">
          <Calendar
            className={`h-5 w-5 ${isLight ? 'text-blue-500' : 'text-blue-400'}`}
          />
          <h2
            className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            Haftalık Analiz
          </h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke={isLight ? '#94a3b8' : '#64748b'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={isLight ? '#94a3b8' : '#64748b'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: isLight ? '#f1f5f9' : '#1e293b' }}
                contentStyle={{
                  backgroundColor: isLight ? '#fff' : '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: isLight ? '#000' : '#fff',
                }}
              />
              <Bar dataKey="duration" radius={[6, 6, 6, 6]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.duration > 0
                        ? isLight
                          ? '#6366f1'
                          : '#818cf8'
                        : isLight
                          ? '#e2e8f0'
                          : '#334155'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`flex flex-col rounded-3xl border p-6 ${
          isLight
            ? 'border-slate-200 bg-white'
            : 'border-slate-700 bg-slate-800/50'
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Brain
            className={`h-5 w-5 ${isLight ? 'text-pink-500' : 'text-pink-400'}`}
          />
          <h2
            className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
          >
            Matematik Becerisi Ağı
          </h2>
        </div>

        <div className="h-64 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayRadarData}>
              <PolarGrid stroke={isLight ? '#e2e8f0' : '#334155'} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: isLight ? '#475569' : '#94a3b8',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Yetkinlik"
                dataKey="A"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={isLight ? 0.3 : 0.4}
              />
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                contentStyle={{
                  backgroundColor: isLight ? '#fff' : '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
