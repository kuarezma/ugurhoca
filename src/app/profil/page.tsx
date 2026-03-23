'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, BookOpen, Gamepad2, FileText, Upload, 
  LogOut, ArrowLeft, Award, Clock, TrendingUp, Settings,
  ChevronRight, Zap, Trophy, Target, Megaphone, Calendar, Edit3, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: Math.random() * 100 + 50,
          height: Math.random() * 100 + 50,
          background: ['#8b5cf6', '#ec4899', '#06b6d4'][i % 3],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
      />
    ))}
  </div>
);

const sampleContents = [
  { id: 1, title: 'Rasyonel Sayılar', type: 'worksheet', grade: 7, downloads: 234, isNew: true },
  { id: 2, title: 'Cebirsel İfadeler Testi', type: 'test', grade: 6, downloads: 189, isNew: false },
  { id: 3, title: 'Matematik Bowling', type: 'game', grade: 5, downloads: 567, isNew: true },
  { id: 4, title: 'Üslü Sayılar Çalışma Kağıdı', type: 'worksheet', grade: 8, downloads: 312, isNew: false },
  { id: 5, title: 'Denklem Çözme Oyunu', type: 'game', grade: 7, downloads: 445, isNew: true },
  { id: 6, title: 'LGS Deneme Sınavı', type: 'test', grade: 8, downloads: 678, isNew: false },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/giris');
        return;
      }
      
      const isAdmin = session.user.email === 'admin@ugurhoca.com';
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser({ ...profile, email: session.user.email, isAdmin });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: session.user.user_metadata?.grade ?? 5,
          is_private_student: session.user.user_metadata?.is_private_student || false,
          isAdmin
        });
      }
      
      const { data: asmts } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false });
      if (asmts) setAssignments(asmts);
      
      const savedAnnouncements = JSON.parse(localStorage.getItem('matematiklab_announcements') || '[]');
      const savedDocs = JSON.parse(localStorage.getItem('matematiklab_documents') || '[]');
      setAnnouncements(savedAnnouncements.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setAdminDocs(savedDocs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </main>
    );
  }

  if (!user) return null;

  const userContents = sampleContents.filter(c => c.grade === user.grade);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worksheet': return BookOpen;
      case 'test': return FileText;
      case 'game': return Gamepad2;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'worksheet': return 'from-blue-500 to-cyan-500';
      case 'test': return 'from-purple-500 to-pink-500';
      case 'game': return 'from-orange-500 to-red-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <main className="min-h-screen gradient-bg">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <button onClick={handleLogout} className="btn-secondary text-sm">
            <LogOut className="w-4 h-4" />
            Çıkış
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                whileHover={{ scale: 1.1 }}
              >
                {user.name[0]}
              </motion.div>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-slate-400">{user.email}</p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {user.isAdmin ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full">
                      <Award className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-300 font-semibold">Yönetici</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-semibold">{user.grade}. Sınıf</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  <Settings className="w-4 h-4" />
                  Ayarlar
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Trophy, label: 'Başarımlar', value: '12', color: 'from-yellow-500 to-orange-500' },
              { icon: Target, label: 'Tamamlanan', value: '45', color: 'from-green-500 to-emerald-500' },
              { icon: Zap, label: 'Puan', value: '1,250', color: 'from-purple-500 to-pink-500' },
              { icon: Clock, label: 'Çalışma Saati', value: '28h', color: 'from-blue-500 to-cyan-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                {user.grade === 0 ? 'Tüm İçerikler' : `${user.grade}. Sınıf İçerikleri`}
              </h2>
              <Link href="/icerikler" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userContents.map((content, i) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="glass rounded-2xl overflow-hidden card-hover group"
                >
                  <div className={`h-3 bg-gradient-to-r ${getTypeColor(content.type)}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center`}>
                        {(() => {
                          const Icon = getTypeIcon(content.type);
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      {content.isNew && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                          Yeni
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {content.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{content.grade}. Sınıf</span>
                      <span className="text-slate-400">{content.downloads} indirme</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 font-semibold rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                    >
                      İncele
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {user?.is_private_student && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Özel Ders Ödevlerim
              </h2>
              {assignments.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Harika gidiyorsun! Şu an bekleyen ödevin yok.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {assignments.map((asmt, i) => (
                    <motion.div
                      key={asmt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="glass rounded-xl p-5 border-l-4 border-indigo-500 card-hover"
                    >
                      <h3 className="text-lg font-bold text-white mb-2">{asmt.title}</h3>
                      <p className="text-slate-300 text-sm mb-3">{asmt.description}</p>
                      <div className="text-xs text-slate-500 font-medium">
                        Veriliş: {new Date(asmt.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 glass rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Önerilen İçerikler
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Üslü Sayılar', 'Cebirsel İfadeler', 'Denklemler', 'Oran-Orantı', 'Yüzdeler', 'Geometri'].map((tag, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 cursor-pointer transition-all"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Megaphone className="w-6 h-6 text-pink-400" />
                Duyurular
              </h2>
              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann, i) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{ann.title}</h3>
                        <p className="text-slate-300 text-sm mb-2">{ann.content}</p>
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(ann.created_at).toLocaleDateString('tr-TR', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {adminDocs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                Uğur Hoca'dan Belgeler
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {adminDocs.slice(0, 4).map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="glass rounded-xl p-4 card-hover flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === 'writing' 
                        ? 'bg-gradient-to-br from-purple-500 to-violet-500' 
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {doc.type === 'writing' ? (
                        <Edit3 className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{doc.title}</h4>
                      <p className="text-slate-400 text-sm truncate">{doc.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {user.isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mt-12"
            >
              <Link href="/admin" className="block glass rounded-2xl p-6 card-hover hover:border-orange-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Admin Paneli</h3>
                      <p className="text-slate-400">Duyuru ve içerik yönetimi</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>


    </main>
  );
}
