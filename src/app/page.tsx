'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, BookOpen, Gamepad2, FileText, ClipboardList,
  LogIn, LogOut, Menu, X, Play, Video, Brain,
  ChevronRight, Clock, Star, Lock, AppWindow
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
        } else {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Öğrenci',
            email: session.user.email,
            grade: session.user.user_metadata?.grade || 5
          });
        }
      }
    };
    checkSession();

    const loadDocuments = async () => {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setDocuments(data);
    };
    loadDocuments();
  }, []);

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
