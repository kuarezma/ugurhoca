'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, BookOpen, Gamepad2, FileText, Upload, 
  Search, Filter, ArrowLeft, Download, Eye, 
  Clock, Users, Star, Zap, Grid, List, X, Plus,
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

export default function ContentsPage() {
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

  const loadDocuments = async () => {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (data) setDocuments(data);
    };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const localUser = localStorage.getItem('matematiklab_user');
      if (localUser) {
        const userData = JSON.parse(localUser);
        if (userData.email === 'admin@ugurhoca.com') {
          setUser({ ...userData, isAdmin: true });
          loadDocuments();
          return;
        }
      }
      
      if (!session) {
        router.push('/giris');
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
        setSelectedGrade(profile.grade);
      } else {
        const fallbackGrade = session.user.user_metadata?.grade ?? 5;
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: fallbackGrade,
          isAdmin
        });
        setSelectedGrade(fallbackGrade === 0 ? 'all' : fallbackGrade);
      }
      loadDocuments();
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

  const filteredContents = documents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || selectedGrade === 'Mezun' || content.grade?.includes(selectedGrade);
    const matchesType = selectedType === 'all' || content.type === selectedType;
    return matchesSearch && matchesGrade && matchesType;
  });

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

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
              Uğur Hoca Matematik
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
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">İçerikler</h1>
              <p className="text-slate-400">
                {user.grade}. sınıf için tüm çalışma kağıtları, testler ve oyunlar
              </p>
            </div>
            {user.isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ type: selectedType !== 'all' ? selectedType : 'worksheet', grade: [selectedGrade !== 'all' && selectedGrade !== 'Mezun' ? Number(selectedGrade) : user.grade] });
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
                        <span className="text-xs text-slate-400">{content.grade?.join(', ') || 'Tümü'}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                      {content.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
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
                        className={`flex items-center gap-1 transition-colors ${likedDocs.has(content.id) ? 'text-red-400' : 'hover:text-red-400'}`}
                      >
                        <Heart className={`w-3 h-3 ${likedDocs.has(content.id) ? 'fill-current' : ''}`} />
                        {content.likes || 0}
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (content.file_url) {
                            window.open(content.file_url, '_blank');
                            await supabase.from('documents').update({ downloads: (content.downloads || 0) + 1 }).eq('id', content.id);
                            setDocuments(documents.map(d => d.id === content.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d));
                          }
                        }}
                        className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {content.downloads || 0}
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          setShowComments(content.id);
                          const { data } = await supabase.from('comments').select('*').eq('document_id', content.id).order('created_at', { ascending: false });
                          if (data) setComments(data);
                        }}
                        className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {content.comments_count || 0}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc(content);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 font-semibold rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Önizle
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
                          className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 font-semibold rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(window.location.origin + '/icerikler?id=' + content.id);
                          alert('Link kopyalandı!');
                        }}
                        className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
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
                            className="px-3 py-2 bg-slate-700/50 hover:bg-red-600 text-slate-300 rounded-lg transition-colors"
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
                        <span>{content.grade?.join(', ') || 'Tümü'}</span>
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
                      onClick={() => setPreviewDoc(content)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      Önizle
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
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
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
                          className="px-3 py-2 bg-slate-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
                          className="px-3 py-2 bg-slate-700 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
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
                {previewDoc.file_url?.endsWith('.pdf') ? (
                  <iframe
                    src={previewDoc.file_url}
                    className="w-full h-full min-h-[60vh]"
                    title={previewDoc.title}
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
                      <option value="worksheet">Çalışma Kağıdı</option>
                      <option value="test">Yaprak Test / Deneme</option>
                      <option value="game">Oyun / Uygulama</option>
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
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.exe,.mp4,.avi,.mov"
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
        {showModal && (
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
                      <option value="worksheet">Çalışma Kağıdı</option>
                      <option value="test">Yaprak Test / Deneme</option>
                      <option value="game">Oyun / Uygulama</option>
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
                    <label className="block text-slate-300 mb-2 text-sm">Dosya Yükle (PDF, EXE, MP4 vb.)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.exe,.mp4,.avi,.mov"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
