'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, BookOpen, Gamepad2, FileText, Upload, 
  Search, Filter, ArrowLeft, Download, Eye, 
  Clock, Users, Star, Zap, Grid, List
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-5"
        style={{
          width: Math.random() * 200 + 100,
          height: Math.random() * 200 + 100,
          background: ['#8b5cf6', '#ec4899', '#06b6d4'][i % 3],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}
      />
    ))}
  </div>
);

const allContents = [
  { id: 1, title: 'Rasyonel Sayılar Çalışma Kağıdı', type: 'worksheet', grade: 7, downloads: 234, views: 1250, rating: 4.8, isNew: true },
  { id: 2, title: 'Cebirsel İfadeler Testi', type: 'test', grade: 6, downloads: 189, views: 980, rating: 4.6, isNew: false },
  { id: 3, title: 'Matematik Bowling', type: 'game', grade: 5, downloads: 567, views: 2340, rating: 4.9, isNew: true },
  { id: 4, title: 'Üslü Sayılar Çalışma Kağıdı', type: 'worksheet', grade: 8, downloads: 312, views: 1560, rating: 4.7, isNew: false },
  { id: 5, title: 'Denklem Çözme Oyunu', type: 'game', grade: 7, downloads: 445, views: 1890, rating: 4.8, isNew: true },
  { id: 6, title: 'LGS Deneme Sınavı', type: 'test', grade: 8, downloads: 678, views: 3200, rating: 4.9, isNew: false },
  { id: 7, title: 'Kesirler Çalışma Kağıdı', type: 'worksheet', grade: 5, downloads: 298, views: 1450, rating: 4.5, isNew: false },
  { id: 8, title: 'Çarpanlar ve Katlar Testi', type: 'test', grade: 6, downloads: 156, views: 890, rating: 4.4, isNew: false },
  { id: 9, title: 'Sayı Avı Oyunu', type: 'game', grade: 5, downloads: 432, views: 2100, rating: 4.7, isNew: true },
  { id: 10, title: 'Oran-Orantı Çalışma Kağıdı', type: 'worksheet', grade: 7, downloads: 267, views: 1340, rating: 4.6, isNew: false },
  { id: 11, title: 'Kareköklü Sayılar Testi', type: 'test', grade: 8, downloads: 345, views: 1780, rating: 4.8, isNew: false },
  { id: 12, title: 'Matematikmemory', type: 'game', grade: 6, downloads: 389, views: 1920, rating: 4.6, isNew: true },
];

export default function ContentsPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/giris');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser({ ...profile, email: session.user.email });
        setSelectedGrade(profile.grade);
      } else {
        const fallbackGrade = session.user.user_metadata?.grade ?? 5;
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: fallbackGrade
        });
        setSelectedGrade(fallbackGrade === 0 ? 'all' : fallbackGrade);
      }
    };
    checkSession();
  }, [router]);

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'worksheet': return 'Çalışma Kağıdı';
      case 'test': return 'Test';
      case 'game': return 'Oyun';
      default: return type;
    }
  };

  const filteredContents = allContents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || content.grade === selectedGrade;
    const matchesType = selectedType === 'all' || content.type === selectedType;
    return matchesSearch && matchesGrade && matchesType;
  });

  if (!user) return null;

  return (
    <main className="min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/profil" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MatematikLab
            </span>
          </Link>

          <Link href="/profil" className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Profil
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">İçerikler</h1>
            <p className="text-slate-400">
              {user.grade}. sınıf için tüm çalışma kağıtları, testler ve oyunlar
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="İçerik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">Tüm Sınıflar</option>
                  <option value={5}>5. Sınıf</option>
                  <option value={6}>6. Sınıf</option>
                  <option value={7}>7. Sınıf</option>
                  <option value={8}>8. Sınıf</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="worksheet">Çalışma Kağıdı</option>
                  <option value="test">Test</option>
                  <option value="game">Oyun</option>
                </select>

                <div className="flex glass rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-slate-400">{filteredContents.length} içerik bulundu</span>
          </motion.div>

          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContents.map((content, i) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl overflow-hidden card-hover group"
                >
                  <div className={`h-2 bg-gradient-to-r ${getTypeColor(content.type)}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center`}>
                        {(() => {
                          const Icon = getTypeIcon(content.type);
                          return <Icon className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {content.isNew && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                            Yeni
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{content.grade}. Sınıf</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {content.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {content.downloads}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        {content.rating}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 font-semibold rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContents.map((content, i) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-5 card-hover group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center flex-shrink-0`}>
                      {(() => {
                        const Icon = getTypeIcon(content.type);
                        return <Icon className="w-7 h-7 text-white" />;
                      })()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {content.title}
                        </h3>
                        {content.isNew && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full flex-shrink-0">
                            Yeni
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {getTypeLabel(content.type)}
                        </span>
                        <span>{content.grade}. Sınıf</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {content.downloads}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          {content.rating}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>


    </main>
  );
}
