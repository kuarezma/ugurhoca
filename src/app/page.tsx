'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, BookOpen, Gamepad2, FileText, ClipboardList,
  LogIn, LogOut, Menu, X, Play, Video, Brain,
  ChevronRight, Clock, Star, Lock, AppWindow,
  Bell, Download, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-5"
        style={{
          width: 80,
          height: 80,
          background: ['#6366f1', '#ec4899', '#06b6d4', '#f97316', '#10b981', '#8b5cf6'][i],
          left: `${(i * 18) % 90}%`,
          top: `${(i * 15) % 85}%`,
        }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

const categories = [
  { 
    id: 'ders-notlari', 
    icon: BookOpen, 
    title: 'Ders Notları', 
    desc: 'Konu anlatımları ve özetler',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    href: '/icerikler?type=ders-notu'
  },
  { 
    id: 'yaprak-test', 
    icon: ClipboardList, 
    title: 'Yaprak Test', 
    desc: 'Bol soru, bol pratik',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    href: '/icerikler?type=yaprak-test'
  },
  { 
    id: 'ders-videolari', 
    icon: Video, 
    title: 'Ders Videoları', 
    desc: 'Video anlatımlar',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    href: '/icerikler?type=video'
  },
  { 
    id: 'deneme', 
    icon: FileText, 
    title: 'Deneme', 
    desc: 'Sınav simulasyonları',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    href: '/icerikler?type=deneme'
  },
  { 
    id: 'oyunlar', 
    icon: Gamepad2, 
    title: 'Oyunlar', 
    desc: 'Eğlenirken öğren',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    href: '/oyunlar'
  },
  { 
    id: 'programlar', 
    icon: AppWindow, 
    title: 'Programlar', 
    desc: 'Eğitim uygulamaları',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    href: '/icerikler?type=programlar'
  },
];

const recentContents = [
  { title: 'Rasyonel Sayılar - Yaprak Test 1', type: 'Yaprak Test', grade: 7, time: '10 dk' },
  { title: 'Üslü Sayılar Ders Videosu', type: 'Video', grade: 8, time: '25 dk' },
  { title: 'Cebirsel İfadeler Özet', type: 'Ders Notu', grade: 6, time: '5 dk' },
];

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <img src="/uğur.jpeg" alt="Uğur Hoca" className="w-9 h-9 rounded-lg object-cover" />
            <span className="text-lg font-bold text-white">
              Uğur Hoca
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                href={cat.href}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                {cat.title}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profil" className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="font-medium">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors ml-2">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
                  Giriş
                </Link>
                <Link href="/kayit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all text-sm">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              {categories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={cat.href}
                  className="flex items-center gap-3 text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <cat.icon className="w-5 h-5" />
                  {cat.title}
                </Link>
              ))}
              <div className="border-t border-slate-700 pt-3 mt-3">
                {user ? (
                  <>
                    <Link href="/profil" className="block text-slate-300 hover:text-white py-2">Profil</Link>
                    <button onClick={onLogout} className="text-red-400 py-2">Çıkış</button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className="block text-slate-300 hover:text-white py-2">Giriş</Link>
                    <Link href="/kayit" className="block bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center py-2 rounded-lg font-semibold mt-2">Kayıt Ol</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [dismissedAssignments, setDismissedAssignments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({ ...profile, email: session.user.email });
          loadUserAssignments(session.user.id);
        } else {
          const grade = session.user.user_metadata?.grade || 5;
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Öğrenci',
            email: session.user.email,
            grade: grade
          });
          loadUserAssignments(session.user.id);
        }
      }
    };
    checkSession();

    const loadDocuments = async () => {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setDocuments(data);
    };
    loadDocuments();

    const loadAllAssignments = async () => {
      const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      if (data) setAssignments(data);
    };
    loadAllAssignments();
  }, []);

  const loadUserAssignments = async (userId: string) => {
    const { data: sharedDocs } = await supabase
      .from('shared_documents')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const allAssignments = [
      ...(sharedDocs || []).map(d => ({ ...d, source: 'shared' })),
      ...(notifs || []).filter(n => n.type === 'assignment' || n.type === 'document').map(n => ({ ...n, source: 'notification' }))
    ];
    
    setUserAssignments(allAssignments);
  };

  const handleDismissAssignment = async (assignment: any) => {
    if (assignment.source === 'shared') {
      await supabase.from('shared_documents').delete().eq('id', assignment.id);
    } else if (assignment.source === 'notification') {
      await supabase.from('notifications').delete().eq('id', assignment.id);
    }
    setDismissedAssignments(prev => new Set([...prev, assignment.id]));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <FloatingShapes />
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="pt-14">
        {user && userAssignments.filter(a => !dismissedAssignments.has(a.id)).length > 0 && (
          <section className="px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-3xl" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-3xl" />
                
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-6 sm:p-8">
                  <button
                    onClick={() => {
                      userAssignments.forEach(a => {
                        if (!dismissedAssignments.has(a.id)) {
                          handleDismissAssignment(a);
                        }
                      });
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Tümünü gizle"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-start gap-4 pr-8">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                        <Bell className="w-7 h-7 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {userAssignments.filter(a => !dismissedAssignments.has(a.id)).length}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                        Sana Gönderilen Ödevler
                      </h2>
                      <p className="text-slate-400 text-sm mb-4">
                        Uğur Hoca sana {userAssignments.filter(a => !dismissedAssignments.has(a.id)).length} tane ödev/materyal gönderdi!
                      </p>
                      
                      <div className="space-y-3">
                        {userAssignments.filter(a => !dismissedAssignments.has(a.id)).slice(0, 3).map((assignment, i) => (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 hover:bg-slate-800/70 transition-colors group"
                          >
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                if (assignment.file_url) {
                                  window.open(assignment.file_url, '_blank');
                                } else if (assignment.message) {
                                  alert(assignment.message);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/50 to-red-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-orange-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-medium truncate group-hover:text-orange-300 transition-colors">
                                    {assignment.document_title || assignment.title || 'Ödev'}
                                  </h4>
                                  <p className="text-slate-400 text-xs truncate">
                                    {assignment.message || assignment.content || 'Materyali incele ve çöz'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignment.file_url && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-lg flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  İndir
                                </span>
                              )}
                              <span className="text-slate-500 text-xs">
                                {new Date(assignment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissAssignment(assignment);
                                }}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Kaldır"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {userAssignments.filter(a => !dismissedAssignments.has(a.id)).length > 3 && (
                        <Link 
                          href="/profil"
                          className="inline-flex items-center gap-2 mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                        >
                          Tüm ödevleri gör ({userAssignments.filter(a => !dismissedAssignments.has(a.id)).length})
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}
        
        <section className="px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Ne Çalışmak İstiyorsun?
              </h1>
              <p className="text-slate-400">
                Hızlı erişim için kategoriyi seç
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={cat.href}
                    className={`block ${cat.bgColor} border ${cat.borderColor} rounded-2xl p-5 sm:p-6 text-center hover:scale-105 transition-transform`}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-sm sm:text-base mb-1">{cat.title}</h3>
                    <p className="text-slate-400 text-xs hidden sm:block">{cat.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {documents.length > 0 && (
          <section className="px-4 py-8 sm:py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Son Eklenenler</h2>
                <Link href="/icerikler" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <a
                    key={doc.id}
                    href={doc.file_url || doc.video_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categories.find(c => c.id === doc.type)?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center flex-shrink-0`}>
                          {(() => {
                            const Icon = categories.find(c => c.id === doc.type)?.icon || FileText;
                            return <Icon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{doc.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="capitalize">{doc.type}</span>
                            {doc.grade && <span>{doc.grade.join(', ')}. Sınıf</span>}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    </motion.div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {!user && (
          <section className="px-4 py-12 sm:py-16">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Hemen Başla, Ücretsiz!
                </h2>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  Tüm içeriklere erişmek için kayıt ol. Sadece 30 saniye!
                </p>
                <Link href="/kayit" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all">
                  <Play className="w-5 h-5" />
                  Ücretsiz Kayıt Ol
                </Link>
              </div>
            </div>
          </section>
        )}

        <footer className="px-4 py-6 border-t border-slate-800/50 mt-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Uğur Hoca Matematik</span>
            </div>
            <p className="text-slate-500 text-xs">© 2026 Uğur Hoca Matematik, tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
