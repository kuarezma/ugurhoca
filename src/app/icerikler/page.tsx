'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Calculator, BookOpen, Gamepad2, FileText, Upload, Play,
  Search, Filter, ArrowLeft, Download, Eye,
  Calendar, Users, Star, Zap, Grid, List, X, Plus,
  ClipboardList, Heart, Share2, MessageCircle, Bookmark, Check, Edit3, Trash2
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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

function ContentsPageInner() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all' | 'Mezun'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showVideo, setShowVideo] = useState<string | null>(null);
  const [likedDocs, setLikedDocs] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  // Yeni İçerik Ekle Modalı (Hızlı Ekleme) State'leri
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Önizleme Modalı State'leri
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  // Düzenleme Modalı State'leri (Admin)
  const [editDoc, setEditDoc] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get('type') || 'all';

  const normalizeGrade = (value: any): number | 'all' | 'Mezun' => {
    if (value === 'Mezun') return 'Mezun';
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 'all';
  };

  const loadDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocuments(data);
  };

  useEffect(() => {
    if (typeFromUrl && typeFromUrl !== 'all') {
      setSelectedType(typeFromUrl);
    } else if (typeFromUrl === 'all') {
      setSelectedType('all');
    }
  }, [typeFromUrl]);

  useEffect(() => {
    loadDocuments();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const localUser = localStorage.getItem('matematiklab_user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        if (userData.email === 'admin@ugurhoca.com') {
          setUser({ ...userData, isAdmin: true });
          return;
        }
      }
      
      if (!session) {
        setUser(null);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      const isAdmin = session.user.email === 'admin@ugurhoca.com';

      if (profile) {
        setUser({ ...profile, email: session.user.email, isAdmin });
        setSelectedGrade(isAdmin ? 'all' : normalizeGrade(profile.grade));
      } else {
        const fallbackGrade = session.user.user_metadata?.grade ?? 5;
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: fallbackGrade,
          isAdmin
        });
        setSelectedGrade(isAdmin ? 'all' : normalizeGrade(fallbackGrade));
      }
    };
    checkSession();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worksheet': return BookOpen;
      case 'test': return FileText;
      case 'game': return Gamepad2;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    const mapped = typeMapping[type] || type;
    switch (mapped) {
      case 'yaprak-test': return 'from-blue-500 to-cyan-500';
      case 'deneme': return 'from-purple-500 to-pink-500';
      case 'oyunlar': return 'from-orange-500 to-red-500';
      case 'ders-notlari': return 'from-green-500 to-emerald-500';
      case 'ders-videolari': return 'from-red-500 to-orange-500';
      case 'programlar': return 'from-cyan-500 to-blue-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    const mapped = typeMapping[type] || type;
    switch (mapped) {
      case 'yaprak-test': return 'Yaprak Test';
      case 'deneme': return 'Deneme-Sınav';
      case 'oyunlar': return 'Oyun';
      case 'ders-notlari': return 'Ders Notları';
      case 'ders-videolari': return 'Ders Videoları';
      case 'programlar': return 'Programlar';
      default: return type;
    }
  };

  const getContentKindLabel = (content: any) => {
    const mapped = typeMapping[content?.type] || content?.type;
    if (mapped === 'ders-videolari' || content?.video_url) return 'Video';
    if (typeof content?.file_url === 'string' && content.file_url.toLowerCase().includes('.pdf')) return 'PDF';
    return 'Dosya';
  };

  const typeMapping: Record<string, string> = {
    'ders-notlari': 'ders-notlari',
    'yaprak-test': 'yaprak-test',
    'ders-videolari': 'ders-videolari',
    'video': 'ders-videolari',
    'deneme': 'deneme',
    'test': 'test',
    'worksheet': 'yaprak-test',
    'oyunlar': 'oyunlar',
    'game': 'oyunlar',
    'programlar': 'programlar',
    'document': 'yaprak-test',
    'writing': 'ders-notlari',
  };

  const mappedType = typeMapping[selectedType] || selectedType;

  const filteredContents = documents.filter(content => {
    if (!content || !content.title) return false;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const grades = Array.isArray(content.grade) ? content.grade.map((g: any) => String(g)) : [];
    const matchesGrade =
      user?.isAdmin ||
      selectedGrade === 'all' ||
      grades.length === 0 ||
      grades.includes(String(selectedGrade));
    const contentType = typeMapping[content.type] || content.type;
    const matchesType = mappedType === 'all' || contentType === mappedType;
    return matchesSearch && matchesGrade && matchesType;
  });

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getDriveId = (url: string) => {
    if (!url) return null;
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/?]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const previewVideoId = previewDoc?.video_url ? getYouTubeId(previewDoc.video_url) : null;
  const driveId = previewDoc?.file_url ? getDriveId(previewDoc.file_url) : null;

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    const url = new URL(window.location.href);
    if (type === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', type);
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newItem = {
      ...formData,
      created_at: new Date().toISOString(),
      downloads: 0,
    };

    console.log('Kaydedilecek veri:', newItem);
    const { data, error } = await supabase.from('documents').insert([newItem]).select();
    console.log('Sonuç:', data, 'Hata:', error);
    
    if (error) {
      alert('Kaydetme hatası: ' + error.message);
      setIsSubmitting(false);
      return;
    }
    
    if (data) {
      setDocuments([data[0], ...documents]);
    }

    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setFormData({});
    }, 1500);
  };

  const profileHref = user?.isAdmin ? '/admin' : user ? '/profil' : '/giris';

  const requireLogin = () => {
    if (!user) {
      if (confirm('Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına yönlendirileceksiniz.')) {
        router.push('/giris');
      }
      return false;
    }
    return true;
  };

  return (
    <main className="min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b1220]/95 backdrop-blur-md border-b border-white/10 py-4 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <Link href={profileHref} className="text-slate-300 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            {user?.isAdmin ? 'Admin Panel' : 'Profil'}
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-6 xl:px-8">
        <div className="max-w-[1760px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {selectedType === 'all' ? 'İçerikler' : 
                 selectedType === 'yaprak-test' ? 'Yaprak Testler' :
                 selectedType === 'deneme' ? 'Deneme-Sınavlar' :
                 selectedType === 'oyunlar' ? 'Oyunlar' :
                 selectedType === 'ders-notlari' ? 'Ders Notları' :
                 selectedType === 'ders-videolari' ? 'Ders Videoları' :
                 selectedType === 'programlar' ? 'Programlar' : 'İçerikler'}
              </h1>
              <p className="text-slate-400">
                {selectedType === 'all'
                  ? (selectedGrade === 'all' ? 'Tüm sınıflar için içerikler' : `${selectedGrade}. sınıf için tüm içerikler`)
                  : (selectedGrade === 'all' ? 'Seçili kategoride, tüm sınıflardaki içerikler' : 'Seçili kategorideki içerikler')}
              </p>
            </div>
            {user?.isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFormData({ type: selectedType !== 'all' ? selectedType : 'yaprak-test', grade: [selectedGrade !== 'all' && selectedGrade !== 'Mezun' ? Number(selectedGrade) : (user?.grade ?? 5)] });
                  setShowModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Hızlı İçerik Ekle
              </motion.button>
            )}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all') {
                      setSelectedGrade('all');
                    } else if (value === 'Mezun') {
                      setSelectedGrade('Mezun');
                    } else {
                      setSelectedGrade(parseInt(value));
                    }
                  }}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">Tüm Sınıflar</option>
                  <option value={5}>5. Sınıf</option>
                  <option value={6}>6. Sınıf</option>
                  <option value={7}>7. Sınıf</option>
                  <option value={8}>8. Sınıf</option>
                  <option value={9}>9. Sınıf</option>
                  <option value={10}>10. Sınıf</option>
                  <option value={11}>11. Sınıf</option>
                  <option value={12}>12. Sınıf</option>
                  <option value="Mezun">Mezun</option>
                </select>

                {user && !user.isAdmin && (
                  <button
                    onClick={() => setSelectedGrade(selectedGrade === 'all' ? (user.grade ?? 'all') : 'all')}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      selectedGrade === 'all'
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {selectedGrade === 'all' ? 'Tüm Sınıflar Açık' : 'Diğer Sınıfları da Göster'}
                  </button>
                )}

                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                           focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">Tüm Türler</option>
                  <option value="yaprak-test">Yaprak Test</option>
                  <option value="deneme">Deneme-Sınav</option>
                  <option value="oyunlar">Oyun</option>
                  <option value="ders-notlari">Ders Notları</option>
                  <option value="ders-videolari">Ders Videoları</option>
                  <option value="programlar">Programlar</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredContents.map((content, i) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-3xl overflow-hidden border border-white/10 card-hover group"
                >
                  <div className={`h-2 bg-gradient-to-r ${getTypeColor(content.type)}`} />
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-4 sm:mb-5">
                      {content.file_url && /drive\.google\.com/i.test(content.file_url) ? (
                        <img
                          src={`/api/image-proxy?url=${encodeURIComponent(content.file_url)}`}
                          alt={content.title}
                           className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center ${content.file_url && /drive\.google\.com/i.test(content.file_url) ? 'hidden' : ''}`}>
                        {(() => {
                          const Icon = getTypeIcon(content.type);
                          return <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                        })()}
                      </div>
                      <div className="flex flex-wrap justify-end items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.origin + '/icerikler?id=' + content.id);
                            alert('Link kopyalandı!');
                          }}
                          className="w-9 h-9 rounded-full bg-slate-800/70 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                        <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-400/20">
                          {getContentKindLabel(content)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
                          {Array.isArray(content.grade) && content.grade.length > 0 ? `${content.grade[0]}. Sınıf` : 'Tüm Sınıflar'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-400/20">
                          {getTypeLabel(content.type)}
                        </span>
                        {content.isNew && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-400/20">
                            Yeni
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-slate-400 text-base mb-4 line-clamp-1">{getTypeLabel(content.type)}</p>

                    <div className="border-t border-white/10 my-4" />

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-400 text-xs sm:text-sm mb-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="w-4 h-4" />
                        <span className="truncate">{content.author || content.owner_name || 'Uğur Hoca'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{content.created_at ? new Date(content.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-300 mb-4 sm:mb-5">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (likedDocs.has(content.id)) {
                            setLikedDocs(prev => { const n = new Set(prev); n.delete(content.id); return n; });
                            await supabase.from('documents').update({ likes: Math.max(0, (content.likes || 0) - 1) }).eq('id', content.id);
                          } else {
                            setLikedDocs(prev => new Set([...prev, content.id]));
                            await supabase.from('documents').update({ likes: (content.likes || 0) + 1 }).eq('id', content.id);
                          }
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${likedDocs.has(content.id) ? 'text-red-400' : 'hover:text-red-400'}`}
                      >
                        <Heart className={`w-5 h-5 ${likedDocs.has(content.id) ? 'fill-current' : ''}`} />
                        {content.likes || 0}
                      </button>
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Star className="w-5 h-5 fill-current" />
                        {Math.round(content.rating || 0)}
                      </div>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (content.file_url) {
                            window.open(content.file_url, '_blank');
                            await supabase.from('documents').update({ downloads: (content.downloads || 0) + 1 }).eq('id', content.id);
                            setDocuments(documents.map(d => d.id === content.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                          }
                        }}
                        className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        {content.downloads || 0}
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          setShowComments(content.id);
                          const { data } = await supabase.from('comments').select('*').eq('document_id', content.id).order('created_at', { ascending: false });
                          if (data) setComments(data);
                        }}
                        className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {content.comments_count || 0}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc(content);
                        }}
                        className="flex-1 min-w-[150px] py-3 bg-slate-800/70 border border-white/10 text-slate-100 font-semibold rounded-2xl hover:bg-slate-700/70 transition-all flex items-center justify-center gap-2"
                      >
                        {content.type === 'ders-videolari' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
                      </motion.button>
                      {content.file_url && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (content.file_url) {
                              window.open(content.file_url, '_blank');
                              await supabase.from('documents').update({ downloads: (content.downloads || 0) + 1 }).eq('id', content.id);
                              setDocuments(documents.map(d => d.id === content.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                            }
                          }}
                          className="basis-full sm:basis-auto px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> İndir
                        </motion.button>
                      )}
                      {user?.isAdmin && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDoc(content);
                              setEditFormData({ ...content });
                              setIsEditing(false);
                            }}
                            className="px-3 py-2 bg-slate-700/50 hover:bg-blue-600 text-slate-300 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
                                await supabase.from('documents').delete().eq('id', content.id);
                                setDocuments(documents.filter(d => d.id !== content.id));
                              }
                            }}
                            className="px-3 py-2 bg-red-600/35 hover:bg-red-600 text-red-100 rounded-lg transition-colors border border-red-400/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
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
                  className="glass rounded-3xl border border-white/10 p-4 sm:p-6 card-hover group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {content.file_url && /drive\.google\.com/i.test(content.file_url) ? (
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(content.file_url)}`}
                            alt={content.title}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getTypeColor(content.type)} flex items-center justify-center flex-shrink-0 ${content.file_url && /drive\.google\.com/i.test(content.file_url) ? 'hidden' : ''}`}>
                          {(() => {
                            const Icon = getTypeIcon(content.type);
                            return <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />;
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {content.title}
                          </h3>
                          <p className="text-slate-400">{getTypeLabel(content.type)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.origin + '/icerikler?id=' + content.id);
                            alert('Link kopyalandı!');
                          }}
                          className="w-9 h-9 rounded-full bg-slate-800/70 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                        <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-400/20">
                          {getContentKindLabel(content)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
                          {Array.isArray(content.grade) && content.grade.length > 0 ? `${content.grade[0]}. Sınıf` : 'Tüm Sınıflar'}
                        </span>
                        {content.isNew && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-400/20">
                            Yeni
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/10" />

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{content.author || content.owner_name || 'Uğur Hoca'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{content.created_at ? new Date(content.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-300">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (likedDocs.has(content.id)) {
                            setLikedDocs(prev => { const n = new Set(prev); n.delete(content.id); return n; });
                            await supabase.from('documents').update({ likes: Math.max(0, (content.likes || 0) - 1) }).eq('id', content.id);
                          } else {
                            setLikedDocs(prev => new Set([...prev, content.id]));
                            await supabase.from('documents').update({ likes: (content.likes || 0) + 1 }).eq('id', content.id);
                          }
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${likedDocs.has(content.id) ? 'text-red-400' : 'hover:text-red-400'}`}
                      >
                        <Heart className={`w-5 h-5 ${likedDocs.has(content.id) ? 'fill-current' : ''}`} />
                        {content.likes || 0}
                      </button>
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Star className="w-5 h-5 fill-current" />
                        {Math.round(content.rating || 0)}
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        {content.comments_count || 0}
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                        <Download className="w-5 h-5" />
                        {content.downloads || 0}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPreviewDoc(content)}
                        className="flex-1 min-w-[130px] sm:min-w-[180px] py-2.5 sm:py-3 bg-slate-800/70 border border-white/10 text-slate-100 font-semibold rounded-2xl hover:bg-slate-700/70 transition-all flex items-center justify-center gap-2"
                      >
                        {content.type === 'ders-videolari' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {content.type === 'ders-videolari' ? 'İzle' : 'Önizle'}
                      </motion.button>
                      {content.file_url && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            window.open(content.file_url, '_blank');
                            await supabase.from('documents').update({ downloads: (content.downloads || 0) + 1 }).eq('id', content.id);
                            setDocuments(documents.map(d => d.id === content.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                          }}
                          className="basis-full sm:basis-auto px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> İndir
                        </motion.button>
                      )}
                      {user?.isAdmin && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditDoc(content);
                              setEditFormData({ ...content });
                              setIsEditing(false);
                            }}
                            className="px-3 py-2 bg-slate-700/50 hover:bg-blue-600 text-slate-300 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              if (confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
                                await supabase.from('documents').delete().eq('id', content.id);
                                setDocuments(documents.filter(d => d.id !== content.id));
                              }
                            }}
                            className="px-3 py-2 bg-red-600/35 hover:bg-red-600 text-red-100 rounded-lg transition-colors border border-red-400/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Önizleme Modalı --- */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-5xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{previewDoc.title}</h3>
                  <p className="text-slate-400 text-sm">{previewDoc.description}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden rounded-xl bg-slate-900 min-h-[60vh]">
                {previewDoc.type === 'ders-videolari' && previewVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${previewVideoId}`}
                    className="w-full h-full min-h-[60vh]"
                    title={previewDoc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : previewDoc.file_url?.endsWith('.pdf') ? (
                  <iframe
                    src={previewDoc.file_url}
                    className="w-full h-full min-h-[60vh]"
                    title={previewDoc.title}
                  />
                ) : driveId ? (
                  <iframe
                    src={`https://drive.google.com/file/d/${driveId}/preview`}
                    className="w-full h-full min-h-[60vh]"
                    title={previewDoc.title}
                    allow="autoplay"
                  />
                ) : previewDoc.video_url ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(previewDoc.video_url)}`}
                    className="w-full h-full min-h-[60vh]"
                    title={previewDoc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : previewDoc.file_url ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
                    <FileText className="w-24 h-24 text-slate-500 mb-4" />
                    <p className="text-white text-lg font-semibold mb-2">Dosya Önizlemesi</p>
                    <p className="text-slate-400 mb-6">Bu dosya türü önizlenemiyor</p>
                    <a
                      href={previewDoc.file_url}
                      download
                      onClick={async () => {
                        await supabase.from('documents').update({ downloads: (previewDoc.downloads || 0) + 1 }).eq('id', previewDoc.id);
                        setDocuments(documents.map(d => d.id === previewDoc.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                        setPreviewDoc({ ...previewDoc, downloads: (previewDoc.downloads || 0) + 1 });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      İndir ve Görüntüle
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
                    <p className="text-slate-400">Dosya bulunamadı</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {previewDoc.views || 0} görüntülenme
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {previewDoc.downloads || 0} indirme
                  </span>
                </div>
                <a
                  href={previewDoc.file_url}
                  download
                  onClick={async () => {
                    await supabase.from('documents').update({ downloads: (previewDoc.downloads || 0) + 1 }).eq('id', previewDoc.id);
                    setDocuments(documents.map(d => d.id === previewDoc.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  İndir
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Düzenleme Modalı (Admin) --- */}
      <AnimatePresence>
        {editDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setEditDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-6 h-6 text-blue-400" />
                  İçeriği Düzenle
                </h2>
                <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {editSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Güncellendi!</h3>
                  <p className="text-slate-400">İçeriğiniz başarıyla güncellendi.</p>
                </motion.div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsEditing(true);
                  
                  const { data, error } = await supabase
                    .from('documents')
                    .update(editFormData)
                    .eq('id', editDoc.id)
                    .select();
                  
                  if (error) {
                    alert('Güncelleme hatası: ' + error.message);
                    setIsEditing(false);
                    return;
                  }
                  
                  if (data) {
                    setDocuments(documents.map(d => d.id === editDoc.id ? data[0] : d));
                  }
                  
                  setIsEditing(false);
                  setEditSuccess(true);
                  setTimeout(() => {
                    setEditDoc(null);
                    setEditSuccess(false);
                  }, 1500);
                }} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
                    <select
                      required
                      value={editFormData.type || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="yaprak-test">Yaprak Test</option>
                      <option value="deneme">Deneme-Sınav</option>
                      <option value="oyunlar">Oyun / Uygulama</option>
                      <option value="ders-notlari">Ders Notları</option>
                      <option value="ders-videolari">Ders Videoları</option>
                      <option value="programlar">Programlar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Açıklama</label>
                    <textarea
                      required
                      rows={3}
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Dosya Linki</label>
                    <input
                      type="url"
                      value={editFormData.file_url || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, file_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">YouTube Video URL</label>
                    <input
                      type="url"
                      value={editFormData.video_url || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Yeni Dosya Yükle</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept={undefined}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsEditing(true);
                            const fileName = `${Date.now()}_${file.name}`;
                            const { data, error } = await supabase.storage
                              .from('documents')
                              .upload(fileName, file);
                            
                            if (error) {
                              alert('Dosya yüklenemedi: ' + error.message);
                              setIsEditing(false);
                            } else {
                              const { data: urlData } = supabase.storage
                                .from('documents')
                                .getPublicUrl(fileName);
                              setEditFormData({ ...editFormData, file_url: urlData.publicUrl, file_name: file.name });
                              setIsEditing(false);
                            }
                          }
                        }}
                        className="hidden"
                        id="edit-file-upload"
                      />
                      <label 
                        htmlFor="edit-file-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-6 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span>{editFormData.file_name || 'Yeni dosya seç (opsiyonel)'}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Hedef Sınıflar</label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <label key={grade} className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
                          <input
                            type="checkbox"
                            checked={editFormData.grade?.includes(grade) || false}
                            onChange={(e) => {
                              const grades = editFormData.grade || [];
                              if (e.target.checked) {
                                setEditFormData({ ...editFormData, grade: [...grades, grade] });
                              } else {
                                setEditFormData({ ...editFormData, grade: grades.filter((g: number) => g !== grade) });
                              }
                            }}
                            className="w-4 h-4 accent-blue-500"
                          />
                          <span className="text-white text-sm">{grade}. Sınıf</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
                        <input
                          type="checkbox"
                          checked={editFormData.grade?.includes('Mezun') || false}
                          onChange={(e) => {
                            const grades = editFormData.grade || [];
                            if (e.target.checked) {
                              setEditFormData({ ...editFormData, grade: [...grades, 'Mezun'] });
                            } else {
                              setEditFormData({ ...editFormData, grade: grades.filter((g: string | number) => g !== 'Mezun') });
                            }
                          }}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-white text-sm">Mezun</span>
                      </label>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isEditing}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Güncelle
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Hızlı İçerik Ekle Modalı --- */}
      <AnimatePresence>
        {showModal && user?.isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6 text-purple-400" />
                  Yeni İçerik Ekle
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Başarılı!</h3>
                  <p className="text-slate-400">İçeriğiniz anında eklendi ve yayınlandı.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Başlık girin..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
                    <select
                      required
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">Kategori seçin</option>
                      <option value="yaprak-test">Yaprak Test</option>
                      <option value="deneme">Deneme-Sınav</option>
                      <option value="oyunlar">Oyun / Uygulama</option>
                      <option value="ders-notlari">Ders Notları</option>
                      <option value="ders-videolari">Ders Videoları</option>
                      <option value="programlar">Programlar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Açıklama</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder="İçerik hakkında bilgi..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Dosya Yükle (Tüm dosya türleri)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept={undefined}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsSubmitting(true);
                            const fileName = `${Date.now()}_${file.name}`;
                            console.log('Dosya yükleniyor:', fileName);
                            const { data, error } = await supabase.storage
                              .from('documents')
                              .upload(fileName, file);
                            console.log('Yükleme sonucu:', data, error);
                            
                            if (error) {
                              alert('Dosya yüklenemedi: ' + error.message);
                              setIsSubmitting(false);
                            } else {
                              const { data: urlData } = supabase.storage
                                .from('documents')
                                .getPublicUrl(fileName);
                              console.log('Dosya URL:', urlData.publicUrl);
                              setFormData({ ...formData, file_url: urlData.publicUrl, file_name: file.name });
                              setIsSubmitting(false);
                            }
                          }
                        }}
                        className="hidden"
                        id="quick-file-upload"
                      />
                      <label 
                        htmlFor="quick-file-upload"
                        className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-6 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-500 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span>{formData.file_name || 'Dosya seç (PDF, EXE, MP4...) veya buraya sürükle'}</span>
                      </label>
                    </div>
                  </div>

                  <div className="text-center text-slate-500 text-sm">veya</div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Tıkla/İndir Linki (Google Drive vb.)</label>
                    <input
                      type="url"
                      value={formData.file_url || ''}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value, file_name: '' })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">YouTube Video URL</label>
                    <input
                      type="url"
                      value={formData.video_url || ''}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Hedef Sınıflar</label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <label key={grade} className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
                          <input
                            type="checkbox"
                            checked={formData.grade?.includes(grade) || false}
                            onChange={(e) => {
                              const grades = formData.grade || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, grade: [...grades, grade] });
                              } else {
                                setFormData({ ...formData, grade: grades.filter((g: number) => g !== grade) });
                              }
                            }}
                            className="w-4 h-4 accent-purple-500"
                          />
                          <span className="text-white text-sm">{grade}. Sınıf</span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
                        <input
                          type="checkbox"
                          checked={formData.grade?.includes('Mezun') || false}
                          onChange={(e) => {
                            const grades = formData.grade || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, grade: [...grades, 'Mezun'] });
                            } else {
                              setFormData({ ...formData, grade: grades.filter((g: string | number) => g !== 'Mezun') });
                            }
                          }}
                          className="w-4 h-4 accent-purple-500"
                        />
                        <span className="text-white text-sm">Mezun</span>
                      </label>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ekleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Hızlı Yayınla
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <button
                onClick={() => setShowVideo(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video rounded-2xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${showVideo}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowComments(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Yorumlar</h3>
                <button onClick={() => setShowComments(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Henüz yorum yok. İlk yorumu sen yap!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">{comment.user_name || 'Anonim'}</span>
                        <span className="text-slate-500 text-xs">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newComment.trim()) return;
                  const { data } = await supabase.from('comments').insert([{
                    document_id: showComments,
                    user_id: user?.id,
                    user_name: user?.name || 'Anonim',
                    content: newComment
                  }]).select();
                  if (data) {
                    setComments([data[0], ...comments]);
                    setNewComment('');
                    const doc = documents.find(d => d.id === showComments);
                    if (doc) {
                      await supabase.from('documents').update({ comments_count: (doc.comments_count || 0) + 1 }).eq('id', showComments);
                      setDocuments(documents.map(d => d.id === showComments ? { ...d, comments_count: (d.comments_count || 0) + 1 } : d));
                    }
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorum yaz..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                    Gönder
                  </button>
                </form>
              ) : (
                <div className="text-center py-3 text-slate-400 text-sm">
                  Yorum yapmak için <a href="/giris" className="text-purple-400 hover:text-purple-300 font-semibold">giriş yapın</a>.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function ContentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <ContentsPageInner />
    </Suspense>
  );
}
