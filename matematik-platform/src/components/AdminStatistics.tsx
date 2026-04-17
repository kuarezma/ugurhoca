'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  FileText,
  StickyNote,
  ClipboardList,
  Calendar,
  TrendingUp,
  Activity,
  Award,
  Download,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admin';

interface SiteStats {
  totalUsers: number;
  totalDocuments: number;
  totalNotes: number;
  totalAssignments: number;
  totalDownloads: number;
  totalViews: number;
  usersByGrade: { grade: string; count: number }[];
  recentSignups: number;
  mostActiveDay: string;
}

export default function AdminStatistics() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  const loadStats = useCallback(async () => {
    setLoading(true);

    const now = new Date();
    let dateFilter = '';

    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = weekAgo.toISOString();
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = monthAgo.toISOString();
    }

    const [usersRes, docsRes, notesRes, assignmentsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('documents').select('*', { count: 'exact' }),
      supabase.from('notes').select('*', { count: 'exact' }),
      supabase.from('assignments').select('*', { count: 'exact' }),
    ]);

    const users = usersRes.data || [];
    const documents = docsRes.data || [];

    const nonAdminUsers = users.filter((u) => !isAdminEmail(u.email));

    const gradeCounts: Record<string, number> = {};
    nonAdminUsers.forEach((u) => {
      const grade = u.grade === 'Mezun' ? 'Mezun' : `${u.grade}. Sınıf`;
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });

    const usersByGrade = Object.entries(gradeCounts)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => {
        if (a.grade === 'Mezun') return 1;
        if (b.grade === 'Mezun') return -1;
        return parseInt(a.grade) - parseInt(b.grade);
      });

    const totalDownloads = documents.reduce(
      (sum, d) => sum + (d.downloads || 0),
      0,
    );
    const totalViews = documents.reduce((sum, d) => sum + (d.views || 0), 0);

    const recentSignups = dateFilter
      ? nonAdminUsers.filter(
          (u) => new Date(u.created_at) >= new Date(dateFilter),
        ).length
      : 0;

    setStats({
      totalUsers: nonAdminUsers.length,
      totalDocuments: documents.length,
      totalNotes: notesRes.count || 0,
      totalAssignments: assignmentsRes.count || 0,
      totalDownloads,
      totalViews,
      usersByGrade,
      recentSignups,
      mostActiveDay: '-',
    });

    setLoading(false);
  }, [timeRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Site İstatistikleri</h2>
          <p className="text-slate-400 text-sm mt-1">Platformun genel durumu</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {range === 'week'
                ? '7 Gün'
                : range === 'month'
                  ? '30 Gün'
                  : 'Tümü'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Toplam Kullanıcı"
          value={stats.totalUsers}
          color="from-blue-500 to-cyan-500"
          subtext={`${stats.recentSignups} yeni (${timeRange === 'week' ? '7 gün' : timeRange === 'month' ? '30 gün' : 'tüm zaman'})`}
        />
        <StatCard
          icon={FileText}
          label="Toplam Belge"
          value={stats.totalDocuments}
          color="from-green-500 to-emerald-500"
          subtext={`${stats.totalDownloads} indirme`}
        />
        <StatCard
          icon={StickyNote}
          label="Toplam Not"
          value={stats.totalNotes}
          color="from-purple-500 to-pink-500"
          subtext="öğrenciler tarafından"
        />
        <StatCard
          icon={ClipboardList}
          label="Toplam Ödev"
          value={stats.totalAssignments}
          color="from-orange-500 to-red-500"
          subtext="öğrencilere verildi"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Download}
          label="Toplam İndirme"
          value={stats.totalDownloads}
          color="from-teal-500 to-cyan-500"
          iconColor="text-teal-400"
        />
        <StatCard
          icon={Eye}
          label="Toplam Görüntülenme"
          value={stats.totalViews}
          color="from-indigo-500 to-purple-500"
          iconColor="text-indigo-400"
        />
        <StatCard
          icon={Activity}
          label="Aktif Kullanıcı"
          value={stats.totalUsers}
          color="from-rose-500 to-pink-500"
          iconColor="text-rose-400"
          subtext="kayıtlı"
        />
        <StatCard
          icon={Award}
          label="İçerik Kalitesi"
          value={
            Math.round(
              (stats.totalDownloads / Math.max(stats.totalDocuments, 1)) * 10,
            ) / 10
          }
          color="from-amber-500 to-yellow-500"
          iconColor="text-amber-400"
          subtext="ort. indirme/belge"
          suffix=""
        />
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Sınıflara Göre Dağılım
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {stats.usersByGrade.map(({ grade, count }) => (
            <div
              key={grade}
              className="animate-fade-in bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-colors"
            >
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-xs text-slate-400 mt-1">{grade}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-end gap-1 h-24">
            {stats.usersByGrade.map(({ grade, count }, i) => {
              const maxCount = Math.max(
                ...stats.usersByGrade.map((g) => g.count),
                1,
              );
              const height = (count / maxCount) * 100;
              return (
                <div
                  key={grade}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg min-h-[8px] transition-[height] duration-500 ease-out"
                  style={{
                    height: `${height}%`,
                    transitionDelay: `${i * 50}ms`,
                  }}
                  title={`${grade}: ${count} kullanıcı`}
                />
              );
            })}
          </div>
          <div className="flex gap-1 mt-2">
            {stats.usersByGrade.map(({ grade }) => (
              <div key={grade} className="flex-1 text-center">
                <span className="text-[10px] text-slate-500 truncate block">
                  {grade.replace('. Sınıf', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Son Kayıtlar
          </h3>
          <div className="space-y-3">
            {[
              ...stats.usersByGrade.reduce(
                (acc, g) => acc.concat(Array(g.count).fill(g.grade)),
                [] as string[],
              ),
            ]
              .slice(0, 5)
              .map((grade, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-700 rounded-full w-full" />
                  </div>
                  <span className="text-xs text-slate-400">{grade}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Platform Metrikleri
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Kullanıcı/Belge Oranı</span>
              <span className="text-white font-semibold">
                {(stats.totalUsers / Math.max(stats.totalDocuments, 1)).toFixed(
                  1,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Belge Başına Ort. İndirme</span>
              <span className="text-white font-semibold">
                {Math.round(
                  stats.totalDownloads / Math.max(stats.totalDocuments, 1),
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Öğrenci Not Ortalaması</span>
              <span className="text-white font-semibold">
                {Math.round(stats.totalNotes / Math.max(stats.totalUsers, 1))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Etkinlik Oranı</span>
              <span className="text-white font-semibold">
                {(
                  ((stats.totalNotes + stats.totalAssignments) /
                    Math.max(stats.totalUsers, 1)) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtext,
  iconColor = 'text-white',
  suffix = '',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  subtext?: string;
  iconColor?: string;
  suffix?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 card-hover animate-fade-up">
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">
          {value.toLocaleString('tr-TR')}
          {suffix}
        </p>
        <p className="text-slate-400 text-sm mt-1">{label}</p>
        {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
