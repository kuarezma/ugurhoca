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
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: Math.random() * 80 + 40,
          height: Math.random() * 80 + 40,
          background: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316'][i % 5],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/95 backdrop-blur-lg py-3 shadow-xl' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Calculator className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MatematikLab
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <Link href="/icerikler" className="nav-link px-4 py-2 rounded-lg hover:bg-white/5">
            <BookOpen className="w-4 h-4" />
            İçerikler
          </Link>
          <Link href="/testler" className="nav-link px-4 py-2 rounded-lg hover:bg-white/5">
            <FileText className="w-4 h-4" />
            Testler
          </Link>
          <Link href="/oyunlar" className="nav-link px-4 py-2 rounded-lg hover:bg-white/5">
            <Gamepad2 className="w-4 h-4" />
            Oyunlar
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profil" className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name[0]}
                </div>
                <span className="text-white font-medium text-sm">{user.name.split(' ')[0]}</span>
                <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">{user.grade}. Sınıf</span>
              </Link>
              <button onClick={onLogout} className="btn-secondary text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="btn-secondary text-sm">
                <LogIn className="w-4 h-4" />
                Giriş
              </Link>
              <Link href="/kayit" className="btn-primary text-sm">
                <UserPlus className="w-4 h-4" />
                Kayıt
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900/95 backdrop-blur-lg mt-4 mx-4 rounded-2xl p-6"
          >
            <div className="flex flex-col gap-2">
              <Link href="/icerikler" className="nav-link py-3 px-4 rounded-xl hover:bg-white/5">İçerikler</Link>
              <Link href="/testler" className="nav-link py-3 px-4 rounded-xl hover:bg-white/5">Testler</Link>
              <Link href="/oyunlar" className="nav-link py-3 px-4 rounded-xl hover:bg-white/5">Oyunlar</Link>
              <div className="border-t border-slate-700 my-2 pt-2">
                {user ? (
                  <>
                    <Link href="/profil" className="nav-link py-3 px-4 rounded-xl hover:bg-white/5">Profil</Link>
                    <button onClick={onLogout} className="w-full text-left nav-link py-3 px-4 rounded-xl hover:bg-white/5 text-red-400">Çıkış</button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className="btn-secondary mb-2 block text-center">Giriş</Link>
                    <Link href="/kayit" className="btn-primary block text-center">Kayıt</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
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
    <main className="min-h-screen gradient-bg">
      <FloatingShapes />
      <Navbar user={user} onLogout={handleLogout} />
      
      <section className="min-h-screen flex items-center justify-center pt-20 px-4 lg:px-8">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Matematik Artık Çok Eğlenceli!</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                MatematikLab
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Çalışma kağıtları, testler, oyunlar ve daha fazlasıyla matematik öğrenmeyi keşfet!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/kayit" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3 shadow-xl shadow-purple-500/25">
                  <Zap className="w-5 h-5" />
                  Hemen Başla
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/icerikler" className="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  İçerikleri İncele
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="glass rounded-2xl p-5 lg:p-6 card-hover"
                whileHover={{ y: -5 }}
              >
                <stat.icon className="w-7 h-7 mx-auto mb-3 text-purple-400" />
                <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="py-16 lg:py-20 px-4 lg:px-8 bg-slate-900/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <Megaphone className="w-7 h-7 text-pink-400" />
                <h2 className="text-3xl lg:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                    Duyurular
                  </span>
                </h2>
              </div>
              <p className="text-slate-400">Uğur Hoca'dan önemli bilgiler</p>
            </motion.div>

            <div className="grid gap-4">
              {announcements.slice(0, 3).map((announcement, i) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 lg:p-6 card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs font-semibold rounded-full">
                          Yeni
                        </span>
                      </div>
                      <p className="text-slate-300 mb-2">{announcement.content}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.created_at).toLocaleDateString('tr-TR', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Özelliklerimiz
              </span>
            </h2>
            <p className="text-slate-400">Matematik öğrenmeyi kolaylaştıran araçlar</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-hover group"
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="glass rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 50%, rgba(139, 92, 246, 0.3), transparent 50%)',
                  'radial-gradient(circle at 100% 50%, rgba(236, 72, 153, 0.3), transparent 50%)',
                  'radial-gradient(circle at 0% 50%, rgba(139, 92, 246, 0.3), transparent 50%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <Trophy className="w-14 h-14 mx-auto mb-5 text-yellow-400" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Sınıfına Göre İçerikler
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                5. sınıftan 12. sınıfa kadar her seviye için özel içerikler. 
                Kendi sınıfını seç, sana özel çalışma kağıtlarına ve testlere eriş!
              </p>
              <Link href="/kayit" className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 shadow-xl shadow-purple-500/25">
                <UserPlus className="w-5 h-5" />
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 lg:px-8 border-t border-slate-800/50">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">MatematikLab</span>
          </div>
          <p className="text-slate-500">© 2024 MatematikLab. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}
