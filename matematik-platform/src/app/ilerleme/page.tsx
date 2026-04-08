'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  ArrowLeft, Target, Flame, Brain, TrendingUp, Calendar, 
  Clock, Plus, X, Video, BookOpen, PenTool, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

const TOPICS = [
  'Çarpanlar ve Katlar', 'Üslü İfadeler', 'Kareköklü İfadeler', 
  'Veri Analizi', 'Olasılık', 'Cebirsel İfadeler', 'Doğrusal Denklemler',
  'Eşitsizlikler', 'Üçgenler', 'Dönüşüm Geometrisi', 'Geometrik Cisimler'
];

export default function IlerlemePage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [goal, setGoal] = useState<any>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [activityType, setActivityType] = useState('test');
  const [duration, setDuration] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [addingSession, setAddingSession] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/giris';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    setUser(profile || { id: session.user.id, name: 'Öğrenci', email: session.user.email });

    // Verileri çek
    const [sessionsRes, progressRes, goalRes] = await Promise.all([
      supabase.from('study_sessions').select('*').eq('user_id', session.user.id).order('date', { ascending: false }),
      supabase.from('user_progress').select('*').eq('user_id', session.user.id).order('mastery_level', { ascending: false }),
      supabase.from('study_goals').select('*').eq('user_id', session.user.id)
    ]);

    setSessions(sessionsRes.data || []);
    setProgressData(progressRes.data || []);
    
    // Geçerli haftanın hedefini bul veya varsayılan oluştur
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff)).toISOString().split('T')[0];
    
    const currentGoal = goalRes.data?.find(g => g.week_start === startOfWeek);
    if (currentGoal) {
      setGoal(currentGoal);
    } else {
      setGoal({ target_duration: 600, week_start: startOfWeek });
    }
    
    setLoading(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) return;
    if (!selectedTopic) return;
    
    setAddingSession(true);
    
    try {
      const durationNum = parseInt(duration);
      
      // 1. Session kaydet
      const { error: sessionError } = await supabase.from('study_sessions').insert([{
        user_id: user.id,
        activity_type: activityType,
        duration: durationNum,
        topics: [selectedTopic],
        date: new Date().toISOString().split('T')[0]
      }]);
      
      if (sessionError) throw sessionError;

      // 2. Progress güncelle (Basit bir formül: Her 10 dk çalışma %2 artırır (max 100))
      const existingProgress = progressData.find(p => p.topic === selectedTopic);
      const masteryIncrement = Math.min(100, Math.floor(durationNum / 5));
      const newMastery = Math.min(100, (existingProgress?.mastery_level || 0) + masteryIncrement);
      
      const { error: progressError } = await supabase.from('user_progress').upsert([{
        id: existingProgress?.id,
        user_id: user.id,
        topic: selectedTopic,
        mastery_level: newMastery,
        practice_count: (existingProgress?.practice_count || 0) + 1,
        last_practiced: new Date().toISOString()
      }], { onConflict: 'user_id, topic' });
      
      if (progressError) throw progressError;

      setShowAddModal(false);
      setDuration('');
      setSelectedTopic('');
      loadDashboardData();
      
    } catch (error: any) {
      console.error(error);
      alert('Kayıt eklenirken bir hata oluştu');
    } finally {
      setAddingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hafta verilerini grafik için hazırla
  const getWeeklyChartData = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data = days.map(d => ({ name: d, duration: 0 }));
    
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Pzt
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0,0,0,0);

    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= startOfWeek) {
        let index = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
        if (index >= 0 && index < 7) {
          data[index].duration += session.duration;
        }
      }
    });

    return data;
  };

  const chartData = getWeeklyChartData();
  const currentWeekTotal = chartData.reduce((acc, curr) => acc + curr.duration, 0);
  const goalPercentage = Math.min(100, Math.round((currentWeekTotal / goal.target_duration) * 100));
  
  const weakTopics = progressData.filter(p => p.mastery_level < 50);
  const strongTopics = progressData.filter(p => p.mastery_level >= 80);

  return (
    <main className={`min-h-screen pb-20 ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/profil" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 font-medium">
            <ArrowLeft className="w-5 h-5" /> Geri Dön
          </Link>
          <ThemeToggle compact />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Başlık ve Çalışma Ekle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Gelişim Ekranı</h1>
            <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>Çalışmalarını takip et, hedeflerine ulaş.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Çalışma Ekle
          </button>
        </div>

        {/* Üst Paneller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Haftalık Hedef */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`col-span-1 md:col-span-2 rounded-3xl p-6 sm:p-8 relative overflow-hidden border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br blur-3xl opacity-20 pointer-events-none ${isLight ? 'from-orange-500 to-red-500' : 'from-orange-500 to-red-500'}`} />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full relative">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className={`w-5 h-5 ${isLight ? 'text-orange-500' : 'text-orange-400'}`} />
                      <h3 className={`font-bold uppercase tracking-wider text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Haftalık Hedef</h3>
                    </div>
                    <p className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentWeekTotal} <span className={`text-lg font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/ {goal.target_duration} dk</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${goalPercentage >= 100 ? 'text-emerald-500' : isLight ? 'text-orange-500' : 'text-orange-400'}`}>
                      %{goalPercentage}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className={`h-4 w-full rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${goalPercentage >= 100 ? 'from-emerald-400 to-green-500' : 'from-orange-400 to-red-500'}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stat */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-center border ${isLight ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100' : 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-indigo-500/20'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
              <Flame className="w-6 h-6" />
            </div>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-indigo-900/50' : 'text-indigo-200/50'}`}>Toplam Çalışma</h3>
            <p className={`text-3xl font-black ${isLight ? 'text-indigo-900' : 'text-white'}`}>
              {sessions.reduce((acc, curr) => acc + curr.duration, 0)} <span className="text-lg font-medium opacity-50">dk</span>
            </p>
          </motion.div>
        </div>

        {/* Ana İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bar Grafiği */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-3xl p-6 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className={`w-5 h-5 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
              <h2 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Haftalık Analiz</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke={isLight ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isLight ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: isLight ? '#f1f5f9' : '#1e293b' }}
                    contentStyle={{ backgroundColor: isLight ? '#fff' : '#0f172a', border: 'none', borderRadius: '12px', color: isLight ? '#000' : '#fff' }} 
                  />
                  <Bar dataKey="duration" radius={[6, 6, 6, 6]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.duration > 0 ? (isLight ? '#6366f1' : '#818cf8') : (isLight ? '#e2e8f0' : '#334155')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Konu Yetkinlikleri */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-3xl p-6 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'} flex flex-col max-h-[400px]`}>
            <div className="flex items-center gap-2 mb-6">
              <Brain className={`w-5 h-5 ${isLight ? 'text-pink-500' : 'text-pink-400'}`} />
              <h2 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Konu Yeterliliği</h2>
            </div>
            
            {progressData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Brain className="w-12 h-12 mb-3 grayscale" />
                <p>Henüz bir çalışma kaydın yok.<br/>Ekledikçe burada göreceksin.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {progressData.map(prog => (
                  <div key={prog.id} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{prog.topic}</span>
                      <span className={`font-bold ${prog.mastery_level > 70 ? 'text-emerald-500' : prog.mastery_level < 40 ? 'text-red-500' : 'text-amber-500'}`}>%{prog.mastery_level}</span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                      <div 
                        className={`h-full rounded-full ${prog.mastery_level > 70 ? 'bg-emerald-500' : prog.mastery_level < 40 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${prog.mastery_level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Çalışma Ekle Modalı */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800'}`}>
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className={`text-2xl font-bold mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Çalışma Ekle</h2>
              
              <form onSubmit={handleAddSession} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Aktivite Tipi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'test', label: 'Test Çözümü', icon: PenTool },
                      { id: 'video', label: 'Video İzleme', icon: Video },
                      { id: 'kitap', label: 'Kitap Okuma', icon: BookOpen }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setActivityType(type.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${activityType === type.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400' : isLight ? 'border-slate-200 text-slate-500 hover:border-slate-300' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        <type.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Konu</label>
                  <select
                    required
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'}`}
                  >
                    <option value="">Konu seçin...</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Süre (Dakika)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="600"
                    placeholder="Örn: 45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingSession}
                  className="w-full py-4 mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {addingSession ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {addingSession ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
