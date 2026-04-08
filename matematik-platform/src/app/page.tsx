'use client';

import Link from 'next/link';
import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, BookOpen, Gamepad2, FileText, ClipboardList,
  LogIn, LogOut, Menu, X, Play, Video, Brain,
  ChevronRight, Clock, Star, Lock, AppWindow,
  Bell, Download, AlertCircle, ExternalLink, FileText as FileDoc, FolderOpen,
  MessageSquareText, Paperclip, Send, Upload, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import { ExamCountdown } from '@/components/ExamCountdown';
import { featuredExams } from '@/lib/examDates';

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
    href: '/icerikler?type=ders-notlari'
  },
  { 
    id: 'kitaplar', 
    icon: BookOpen, 
    title: 'Kitaplar', 
    desc: 'Kitap önerileri ve pdf\'leri',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    href: '/icerikler?type=kitaplar'
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
    href: '/icerikler?type=ders-videolari'
  },
  { 
    id: 'deneme', 
    icon: FileText, 
    title: 'Deneme', 
    desc: 'Deneme sınavları',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    href: '/icerikler?type=deneme'
  },
  { 
    id: 'sinav', 
    icon: ClipboardList, 
    title: 'Sınav', 
    desc: 'Sınavlar ve testler',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    href: '/icerikler?type=sinav'
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
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    href: '/programlar'
  },
];

const recentContents = [
  { title: 'Rasyonel Sayılar - Yaprak Test 1', type: 'Yaprak Test', grade: 7, time: '10 dk' },
  { title: 'Üslü Sayılar Ders Videosu', type: 'Video', grade: 8, time: '25 dk' },
  { title: 'Cebirsel İfadeler Özet', type: 'Ders Notu', grade: 6, time: '5 dk' },
];

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const profileHref = user?.isAdmin ? '/admin' : '/profil';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b ${
      isLight
        ? 'bg-white/90 border-slate-200/90 shadow-sm shadow-slate-200/80'
        : 'bg-slate-900/95 border-slate-800/50'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <img src="/ugur.jpeg" alt="Uğur Hoca" className="w-9 h-9 rounded-lg object-cover" />
            <span className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Uğur Hoca
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                href={cat.href}
                className={`transition-colors text-sm font-medium ${
                  isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.title}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle compact />
            {user ? (
              <>
                <Link href={profileHref} className={`flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.name?.[0] || '?'}
                  </div>
                  <span className="font-medium">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={onLogout} className={`transition-colors ml-2 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/giris" className={`transition-colors text-sm font-medium ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
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
            className={`md:hidden border-t ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}
          >
            <div className="px-4 py-4 space-y-2">
              {categories.map(cat => (
                <Link 
                  key={cat.id} 
                  href={cat.href}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                    isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  {cat.title}
                </Link>
              ))}
              <div className={`border-t pt-3 mt-3 ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                <div className="mb-3">
                  <ThemeToggle className="w-full justify-center" />
                </div>
                {user ? (
                  <>
                    <Link href={profileHref} className={`block py-2 ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>{user.isAdmin ? 'Admin Panel' : 'Profil'}</Link>
                    <button onClick={onLogout} className="text-red-400 py-2">Çıkış</button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className={`block py-2 ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>Giriş</Link>
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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [writings, setWritings] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [dismissedAssignments, setDismissedAssignments] = useState<Set<string>>(new Set());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportAttachments, setSupportAttachments] = useState<{ name: string; url: string; kind: 'image' | 'file' }[]>([]);
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  const getAnnouncementLinkLabel = (url?: string) => {
    if (!url) return 'Detaya Git';
    const lower = url.toLowerCase();
    if (lower.includes('.pdf')) return 'PDF Aç';
    if (lower.includes('drive.google') || lower.includes('yadi.sk') || lower.includes('disk.yandex')) return 'Dosyayı Aç';
    return 'Siteye Git';
  };

  const getAnnouncementLinkIcon = (url?: string) => {
    if (!url) return ExternalLink;
    const lower = url.toLowerCase();
    if (lower.includes('.pdf')) return FileDoc;
    if (lower.includes('drive.google') || lower.includes('yadi.sk') || lower.includes('disk.yandex')) return FolderOpen;
    return ExternalLink;
  };

  const isNewContent = (createdAt?: string) => {
    if (!createdAt) return false;
    const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const resolveYandexImageUrl = async (url: string) => {
    if (!url) return url;
    if (!/disk\.yandex|yadi\.sk/i.test(url)) return url;
    try {
      const res = await fetch(`/api/yandex-resolve?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return data?.href || url;
    } catch {
      return url;
    }
  };

  const proxiedImageSrc = (url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  const uploadSupportAttachments = async (files: FileList | null) => {
    if (!files?.length) return;

    const uploads = await Promise.all(Array.from(files).map(async (file) => {
      const fileName = `support_${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
      const { data, error } = await supabase.storage.from('documents').upload(fileName, file, { upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(data.path);
      const kind: 'image' | 'file' = file.type.startsWith('image/') ? 'image' : 'file';
      return { name: file.name, url: urlData.publicUrl, kind };
    }));

    setSupportAttachments(prev => [...prev, ...uploads]);
  };

  const removeSupportAttachment = (index: number) => {
    setSupportAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSupportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || user.isAdmin) return;
    if (!supportMessage.trim() && supportAttachments.length === 0) return;

    if (!user.id) {
      alert('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.');
      return;
    }

    setSupportSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yap.');
        setSupportSending(false);
        return;
      }

      const payload = {
        sender_id: session.user.id,
        sender_name: user.name || 'Öğrenci',
        sender_email: user.email || session.user.email || '',
        text: supportMessage.trim(),
        attachments: supportAttachments,
      };

      const res = await fetch('/api/support-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(responseData?.error || `Sunucu hatası (${res.status}).`);
      }

      setSupportMessage('');
      setSupportAttachments([]);
      setSupportSent(true);
      setTimeout(() => setSupportSent(false), 3000);
    } catch (error: any) {
      console.error('Support message error:', error);
      alert(error?.message || 'Mesaj gönderilemedi. Lütfen tekrar dene.');
    } finally {
      setSupportSending(false);
    }
  };

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

    const loadWritings = async () => {
      const { data } = await supabase.from('documents').select('*').eq('type', 'writing').order('created_at', { ascending: false }).limit(4);
      if (data) setWritings(data);
    };
    loadWritings();

    const loadAllAssignments = async () => {
      const { data } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
      if (data) setAssignments(data);
    };
    loadAllAssignments();

    const loadAnnouncements = async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(4);
      const merged = [...(data || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

      const normalized = await Promise.all(merged.map(async (item) => {
        const images = item.image_urls?.length ? item.image_urls : item.image_url ? [item.image_url] : [];
        const resolvedImageUrls = await Promise.all(images.map(resolveYandexImageUrl));
        return {
          ...item,
          image_url: resolvedImageUrls[0] || item.image_url,
          image_urls: resolvedImageUrls.length > 0 ? resolvedImageUrls : item.image_urls,
        };
      }));

      setAnnouncements(normalized);
    };
    loadAnnouncements();
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
      ...(notifs || [])
        .filter(n => (n.type === 'assignment' || n.type === 'document') && !n.is_read)
        .map(n => ({ ...n, source: 'notification' }))
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
    <main className={`relative min-h-screen ${
      isLight
        ? 'bg-white light-atmosphere'
        : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
    }`}>
      <FloatingShapes />
      <Navbar user={user} onLogout={handleLogout} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-14">
        <section className="px-4 pt-4 pb-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 ${isLight ? 'light-section p-6 sm:p-8' : ''}`}
            >
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isLight ? 'light-text-strong' : 'text-white'}`}>
                Ne Çalışmak İstiyorsun?
              </h1>
              <p className={isLight ? 'light-text-muted' : 'text-slate-400'}>
                Hızlı erişim için kategoriyi seç
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={cat.href}
                    className={`block border rounded-2xl p-5 sm:p-7 lg:p-6 text-center transition-all ${
                      isLight
                        ? 'light-card hover:-translate-y-0.5'
                        : `${cat.bgColor} ${cat.borderColor} hover:scale-105`
                    }`}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className={`font-bold text-sm sm:text-base mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{cat.title}</h3>
                    <p className={`text-xs hidden sm:block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{cat.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mx-auto mt-4 grid max-w-3xl gap-2 sm:grid-cols-2">
              {featuredExams.filter((exam) => exam.featured).map((exam) => (
                <ExamCountdown key={exam.id} exam={exam} isLight={isLight} />
              ))}
            </div>
          </div>
        </section>

        {announcements.length > 0 && (
          <section className="px-4 pt-2 pb-3 sm:py-6">
            <div className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg sm:text-2xl font-bold ${isLight ? 'light-text-strong' : 'text-white'}`}>Haberler</h2>
                  <p className={`text-sm ${isLight ? 'light-text-muted' : 'text-slate-400'}`}>Kısa duyuru başlıkları. Detay için tıkla.</p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 xl:grid-cols-4 md:overflow-visible md:pb-0">
                {announcements.map((item, i) => {
                  const images = item.image_urls?.length ? item.image_urls : item.image_url ? [item.image_url] : [];
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedAnnouncement(item)}
                      className={`relative text-left rounded-2xl overflow-hidden transition-all min-w-[82vw] sm:min-w-[46vw] md:min-w-0 md:w-full ${
                        isLight
                          ? 'light-card hover:-translate-y-0.5'
                          : 'glass hover:scale-[1.01]'
                      }`}
                    >
                      {isNewContent(item.created_at) && (
                        <span className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-pink-500 text-white text-[10px] font-bold shadow-lg">Yeni</span>
                      )}
                      {images[0] && (
                        <div className="h-32 sm:h-36 overflow-hidden">
                          <img src={proxiedImageSrc(images[0])} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-3 sm:p-4">
                        <div className={`flex items-center gap-2 mb-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Bell className="w-4 h-4 text-pink-400" />
                          {new Date(item.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold line-clamp-2 mb-1 sm:mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                        <p className={`text-xs sm:text-sm line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{item.content}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {user && userAssignments.filter(a => !dismissedAssignments.has(a.id)).length > 0 && (
          <section className="px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden"
              >
                <div className={`absolute inset-0 rounded-3xl ${isLight ? 'bg-gradient-to-r from-amber-100/70 via-rose-100/60 to-pink-100/60' : 'bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20'}`} />
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${isLight ? 'bg-gradient-to-br from-amber-300/45 to-rose-300/35' : 'bg-gradient-to-br from-orange-500/30 to-red-500/30'}`} />
                
                <div className={`relative backdrop-blur-xl border rounded-3xl p-6 sm:p-8 ${isLight ? 'bg-white/90 border-amber-200 shadow-[0_20px_44px_rgba(251,146,60,0.18)]' : 'bg-slate-900/80 border-orange-500/30'}`}>
                  <button
                    onClick={() => {
                      userAssignments.forEach(a => {
                        if (!dismissedAssignments.has(a.id)) {
                          handleDismissAssignment(a);
                        }
                      });
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
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
                      <h2 className={`text-xl sm:text-2xl font-bold mb-1 ${isLight ? 'light-text-strong' : 'text-white'}`}>
                        Sana Gönderilen Ödevler
                      </h2>
                      <p className={`text-sm mb-4 ${isLight ? 'light-text-muted' : 'text-slate-400'}`}>
                        Uğur Hoca sana {userAssignments.filter(a => !dismissedAssignments.has(a.id)).length} tane ödev/materyal gönderdi!
                      </p>
                      
                      <div className="space-y-3">
                        {userAssignments.filter(a => !dismissedAssignments.has(a.id)).slice(0, 3).map((assignment, i) => (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors group ${isLight ? 'bg-slate-50 border border-slate-200 hover:bg-slate-100' : 'bg-slate-800/50 hover:bg-slate-800/70'}`}
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
                                  <h4 className={`font-medium truncate transition-colors ${isLight ? 'text-slate-900 group-hover:text-amber-700' : 'text-white group-hover:text-orange-300'}`}>
                                    {assignment.document_title || assignment.title || 'Ödev'}
                                  </h4>
                                  <p className={`text-xs truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
                          href="/odevler"
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

        {writings.length > 0 && (
          <section className="px-4 py-3 sm:py-6">
            <div className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg sm:text-2xl font-bold ${isLight ? 'light-text-strong' : 'text-white'}`}>Yazılar</h2>
                  <p className={`text-sm ${isLight ? 'light-text-muted' : 'text-slate-400'}`}>Kısa yazılar ve paylaşımlar.</p>
                </div>
                <Link href="/icerikler?type=writing" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 xl:grid-cols-4 md:overflow-visible md:pb-0">
                {writings.map((writing, i) => (
                  <motion.button
                    key={writing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`text-left rounded-2xl overflow-hidden transition-all min-w-[82vw] sm:min-w-[46vw] md:min-w-0 md:w-full ${
                      isLight
                        ? 'light-card hover:-translate-y-0.5'
                        : 'glass hover:scale-[1.01]'
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className={`flex items-center gap-2 mb-2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Bell className="w-4 h-4 text-purple-400" />
                        {new Date(writing.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                      <h3 className={`text-sm sm:text-base font-bold line-clamp-2 mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{writing.title}</h3>
                      <p className={`text-xs sm:text-sm line-clamp-4 whitespace-pre-wrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{writing.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {documents.length > 0 && (
          <section className="px-4 py-8 sm:py-12">
            <div className={`max-w-6xl mx-auto ${isLight ? 'light-section p-5 sm:p-6' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'light-text-strong' : 'text-white'}`}>Son Eklenenler</h2>
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
                      className={`relative rounded-xl p-4 transition-all cursor-pointer ${
                        isLight
                          ? 'light-card hover:border-slate-300'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isNewContent(doc.created_at) && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold">Yeni</span>
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categories.find(c => c.id === doc.type)?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center flex-shrink-0`}>
                          {(() => {
                            const Icon = categories.find(c => c.id === doc.type)?.icon || FileText;
                            return <Icon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{doc.title}</h3>
                          <div className={`flex items-center gap-3 text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
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
              <div className={`border rounded-3xl p-6 sm:p-8 text-center ${
                isLight
                  ? 'light-soft-panel shadow-[0_18px_42px_rgba(99,102,241,0.14)]'
                  : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/20'
              }`}>
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Hemen Başla, Ücretsiz!
                </h2>
                <p className={`mb-6 max-w-md mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
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

        <section className="px-4 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl ${
              isLight
                ? 'light-section'
                : 'border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90'
            }`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_30%)]" />
              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold mb-3">
                      <MessageSquareText className="w-4 h-4" />
                      Uğur Hoca'ya Yaz
                    </div>
                    <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Sorunu yaz, belge veya resim ekle</h2>
                    <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Mesajın ve eklerin doğrudan bana bildirim olarak gelir.</p>
                  </div>
                  {user && !user.isAdmin && (
                    <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <Paperclip className="w-4 h-4" />
                      PDF, resim ve kısa not gönderebilirsin
                    </div>
                  )}
                </div>

                {user && !user.isAdmin ? (
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <label className={`block mb-2 text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Mesajın</label>
                      <textarea
                        rows={5}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Uğur Hoca, ..."
                        className={`w-full rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none ${
                          isLight
                            ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400'
                            : 'bg-slate-800/60 border border-slate-700 text-white placeholder:text-slate-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-2 text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Belge / Resim Ekle</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        id="support-upload"
                        onChange={async (e) => {
                          if (e.target.files?.length) {
                            try {
                              await uploadSupportAttachments(e.target.files);
                              e.target.value = '';
                            } catch {
                              alert('Dosya yüklenemedi.');
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="support-upload"
                        className={`flex items-center justify-center gap-2 w-full rounded-2xl border border-dashed px-4 py-5 transition-colors cursor-pointer ${
                          isLight
                            ? 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-indigo-500'
                            : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:border-indigo-500'
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                        Resim veya belge seç
                      </label>
                    </div>

                    {supportAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {supportAttachments.map((file, index) => (
                          <div key={`${file.url}-${index}`} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-white/5 border-white/10 text-slate-200'
                          }`}>
                            {file.kind === 'image' ? <ImageIcon className="w-4 h-4 text-pink-300" /> : <FileDoc className="w-4 h-4 text-sky-300" />}
                            <span className="max-w-[180px] truncate">{file.name}</span>
                            <button type="button" onClick={() => removeSupportAttachment(index)} className="text-slate-400 hover:text-white">×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Gönderdiğin mesaj anında bildirim olarak iletilir.</p>
                      <button
                        type="submit"
                        disabled={supportSending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-60"
                      >
                        <Send className="w-4 h-4" />
                        {supportSending ? 'Gönderiliyor...' : 'Gönder'}
                      </button>
                    </div>

                    {supportSent && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300 text-sm">
                        Mesajın gönderildi.
                      </div>
                    )}
                  </form>
                ) : (
                  <div className={`rounded-2xl border p-5 ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                    Mesaj göndermek için giriş yapman gerekiyor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className={`px-4 py-6 border-t mt-8 ${isLight ? 'border-slate-200 bg-slate-50/70 backdrop-blur-sm' : 'border-slate-800/50'}`}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Uğur Hoca Matematik</span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>© 2026 Uğur Hoca Matematik, tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl"
            >
                      {(selectedAnnouncement.image_urls?.length || selectedAnnouncement.image_url) && (
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-slate-950 p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedAnnouncement.image_urls?.length ? selectedAnnouncement.image_urls : [selectedAnnouncement.image_url]).filter(Boolean).map((img: string, idx: number) => (
                        <img key={idx} src={proxiedImageSrc(img)} alt={selectedAnnouncement.title} className="w-full h-56 object-cover rounded-xl" />
                      ))}
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold">Haber</span>
                      <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{selectedAnnouncement.title}</h2>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{selectedAnnouncement.content}</p>
                    {selectedAnnouncement.link_url && (
                      (() => {
                        const LinkIcon = getAnnouncementLinkIcon(selectedAnnouncement.link_url);
                        return (
                      <a
                        href={selectedAnnouncement.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {getAnnouncementLinkLabel(selectedAnnouncement.link_url)}
                        <ChevronRight className="w-4 h-4" />
                      </a>
                        );
                      })()
                    )}
                    <p className="text-slate-500 text-sm mt-6">{new Date(selectedAnnouncement.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              )}

              {!selectedAnnouncement.image_urls?.length && !selectedAnnouncement.image_url && (
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold">Haber</span>
                    <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{selectedAnnouncement.title}</h2>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{selectedAnnouncement.content}</p>
                  {selectedAnnouncement.link_url && (
                    (() => {
                      const LinkIcon = getAnnouncementLinkIcon(selectedAnnouncement.link_url);
                      return (
                    <a
                      href={selectedAnnouncement.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {getAnnouncementLinkLabel(selectedAnnouncement.link_url)}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                      );
                    })()
                  )}
                  <p className="text-slate-500 text-sm mt-6">{new Date(selectedAnnouncement.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
