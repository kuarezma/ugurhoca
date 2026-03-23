'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, BookOpen, Gamepad2, FileText, Upload, 
  LogIn, UserPlus, LogOut, Menu, X,
  Sparkles, Zap, Trophy, Users, Star, Play,
  Megaphone, Calendar
} from 'lucide-react';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: 60,
          height: 60,
          background: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316'][i % 5],
          left: `${(i * 11) % 95}%`,
          top: `${(i * 13) % 90}%`,
        }}
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3 + (i * 0.5),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MatematikLab
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/icerikler" className="text-slate-300 hover:text-white transition-colors font-medium">
              İçerikler
            </Link>
            <Link href="/testler" className="text-slate-300 hover:text-white transition-colors font-medium">
              Testler
            </Link>
            <Link href="/oyunlar" className="text-slate-300 hover:text-white transition-colors font-medium">
              Oyunlar
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profil" className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.name[0]}
                  </div>
                  <span className="font-medium">{user.name.split(' ')[0]}</span>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{user.grade}. Sınıf</span>
                </Link>
                <button onClick={onLogout} className="ml-4 text-slate-400 hover:text-white transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className="text-slate-300 hover:text-white transition-colors font-medium">
                  Giriş
                </Link>
                <Link href="/kayit" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
                  Kayıt
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
            <div className="px-4 py-4 space-y-3">
              <Link href="/icerikler" className="block text-slate-300 hover:text-white py-2">İçerikler</Link>
              <Link href="/testler" className="block text-slate-300 hover:text-white py-2">Testler</Link>
              <Link href="/oyunlar" className="block text-slate-300 hover:text-white py-2">Oyunlar</Link>
              <div className="border-t border-slate-700 pt-3 mt-3">
                {user ? (
                  <>
                    <Link href="/profil" className="block text-slate-300 hover:text-white py-2">Profil</Link>
                    <button onClick={onLogout} className="text-red-400 py-2">Çıkış</button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className="block text-slate-300 hover:text-white py-2">Giriş</Link>
                    <Link href="/kayit" className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 rounded-lg font-semibold mt-2">Kayıt</Link>
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
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('matematiklab_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedAnnouncements = JSON.parse(localStorage.getItem('matematiklab_announcements') || '[]');
    setAnnouncements(savedAnnouncements.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('matematiklab_user');
    setUser(null);
    window.location.href = '/';
  };

  const features = [
    { icon: BookOpen, title: 'Çalışma Kağıtları', desc: 'Konu anlatımlı etkinlikler', color: 'from-blue-500 to-cyan-500' },
    { icon: FileText, title: 'Online Testler', desc: 'Interaktif sorular', color: 'from-purple-500 to-pink-500' },
    { icon: Gamepad2, title: 'Eğlenceli Oyunlar', desc: 'Öğrenirken eğlen', color: 'from-orange-500 to-red-500' },
    { icon: Upload, title: 'Dosya Paylaşımı', desc: 'PDF ve dokümanlar', color: 'from-green-500 to-emerald-500' },
  ];

  const stats = [
    { icon: Users, value: '1000+', label: 'Öğrenci' },
    { icon: BookOpen, value: '500+', label: 'İçerik' },
    { icon: Gamepad2, value: '50+', label: 'Oyun' },
    { icon: Star, value: '4.9', label: 'Puan' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <FloatingShapes />
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="pt-16">
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-slate-300">Matematik Artık Çok Eğlenceli!</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  MatematikLab
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/kayit" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
                  <Zap className="w-5 h-5" />
                  Hemen Başla
                </Link>
                <Link href="/icerikler" className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
                  <Play className="w-5 h-5" />
                  İçerikleri İncele
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <stat.icon className="w-7 h-7 mx-auto mb-3 text-purple-400" />
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {announcements.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-16 bg-slate-900/50">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <Megaphone className="w-7 h-7 text-pink-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Duyurular</h2>
              </div>

              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann, i) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                          <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full font-medium">Yeni</span>
                        </div>
                        <p className="text-slate-400 mb-2">{ann.content}</p>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(ann.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Özelliklerimiz
              </span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all"
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-3xl p-8 sm:p-12 text-center">
              <Trophy className="w-14 h-14 mx-auto mb-5 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Sınıfına Göre İçerikler
              </h2>
              <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                5. sınıftan 12. sınıfa kadar her seviye için özel içerikler.
              </p>
              <Link href="/kayit" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
                <UserPlus className="w-5 h-5" />
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          </div>
        </section>

        <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-800">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">MatematikLab</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 MatematikLab. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
