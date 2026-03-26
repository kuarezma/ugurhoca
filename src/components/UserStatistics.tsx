'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, FileText, StickyNote, Clock, TrendingUp,
  Award, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Note } from '@/types/index';

interface UserStats {
  totalNotes: number;
  pinnedNotes: number;
  categoriesUsed: number;
  tagsUsed: number;
  memberSince: string;
  daysActive: number;
  documentsViewed: number;
  documentsDownloaded: number;
  assignmentsReceived: number;
}

interface UserStatisticsProps {
  userId: string;
  userCreatedAt?: string;
}

export default function UserStatistics({ userId, userCreatedAt }: UserStatisticsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setLoading(true);

    const [notesRes, sharedDocsRes, assignmentsRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', userId),
      supabase.from('shared_documents').select('*').eq('student_id', userId),
      supabase.from('assignments').select('*').eq('student_id', userId),
    ]);

    const notes = notesRes.data || [];
    const categoriesUsed = new Set(notes.map(n => n.category).filter(Boolean)).size;
    const tagsUsed = new Set(notes.flatMap(n => n.tags).filter(Boolean)).size;
    const pinnedNotes = notes.filter(n => n.is_pinned).length;

    const memberSince = userCreatedAt 
      ? new Date(userCreatedAt).toLocaleDateString('tr-TR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      : 'Bilinmiyor';

    const daysActive = userCreatedAt
      ? Math.floor((Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    setStats({
      totalNotes: notes.length,
      pinnedNotes,
      categoriesUsed,
      tagsUsed,
      memberSince,
      daysActive,
      documentsViewed: sharedDocsRes.data?.filter(d => d.is_read).length || 0,
      documentsDownloaded: 0,
      assignmentsReceived: assignmentsRes.data?.length || 0,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      icon: Calendar,
      label: 'Üyelik',
      value: stats.memberSince,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      icon: Clock,
      label: 'Aktif Gün',
      value: `${stats.daysActive} gün`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
    },
    {
      icon: StickyNote,
      label: 'Toplam Not',
      value: stats.totalNotes.toString(),
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-400',
    },
    {
      icon: Award,
      label: 'Sabitlenmiş',
      value: stats.pinnedNotes.toString(),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
    },
    {
      icon: TrendingUp,
      label: 'Kategori',
      value: stats.categoriesUsed.toString(),
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/20',
      textColor: 'text-rose-400',
    },
    {
      icon: FileText,
      label: 'Etiket',
      value: stats.tagsUsed.toString(),
      color: 'from-indigo-500 to-violet-500',
      bgColor: 'bg-indigo-500/20',
      textColor: 'text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">İstatistiklerim</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center mx-auto mb-3`}>
              <item.icon className={`w-5 h-5 ${item.textColor}`} />
            </div>
            <p className="text-xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            Belgelerim
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Görüntülenen</span>
              <span className="text-white font-semibold">{stats.documentsViewed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">İndirilen</span>
              <span className="text-white font-semibold">{stats.documentsDownloaded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Alınan Ödev</span>
              <span className="text-white font-semibold">{stats.assignmentsReceived}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            Not Aktivitesi
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Not/Kategori Oranı</span>
              <span className="text-white font-semibold">
                {stats.categoriesUsed > 0 
                  ? (stats.totalNotes / stats.categoriesUsed).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Ortalama Etiket</span>
              <span className="text-white font-semibold">
                {stats.totalNotes > 0 
                  ? (stats.tagsUsed / stats.totalNotes).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Verimlilik</span>
              <span className="text-white font-semibold">
                {stats.daysActive > 0 
                  ? (stats.totalNotes / stats.daysActive * 30).toFixed(1)
                  : '0'}/ay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
