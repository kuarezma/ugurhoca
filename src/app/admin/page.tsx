'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, LogOut, ArrowLeft, Plus, FileText, 
  Image, Megaphone, Edit3, Trash2, Upload, X,
  Calendar, Eye, Download, Check, AlertCircle, Sparkles,
  Users, BookOpen, RefreshCw, GraduationCap, Send, Bell,
  UserCheck, ClipboardList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FloatingShapes = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full opacity-10"
        style={{
          width: Math.random() * 150 + 80,
          height: Math.random() * 150 + 80,
          background: ['#f97316', '#ec4899', '#06b6d4', '#8b5cf6'][i % 4],
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: Math.random() * 4 + 3, repeat: Infinity }}
      />
    ))}
  </div>
);

const AnnouncementGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<string[]>(images);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const resolveYandexImageUrl = async (url: string) => {
      if (!url) return url;
      if (!/disk\.yandex|yadi\.sk/i.test(url)) return url;
      try {
        const res = await fetch(`https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(url)}`);
        const data = await res.json();
        return data?.href || url;
      } catch {
        return url;
      }
    };

    (async () => {
      const normalized = await Promise.all(images.map(resolveYandexImageUrl));
      setResolvedImages(normalized);
    })();
  }, [images]);

  return (
    <div className="relative min-h-[320px] bg-slate-900">
      <img
        src={resolvedImages[current] || images[current]}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      {hasMultiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((prev) => (prev - 1 + resolvedImages.length) % resolvedImages.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/40 text-white/90 hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((prev) => (prev + 1) % resolvedImages.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/40 text-white/90 hover:bg-black/60"
          >
            ›
          </button>
        </>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {resolvedImages.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`h-2.5 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
              aria-label={`Görsel ${i + 1}`}
            />
          ))}
        </div>
        <span className="px-2 py-1 rounded-full bg-black/40 text-white text-xs">
          {current + 1}/{resolvedImages.length}
        </span>
      </div>
    </div>
  );
};

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  image_urls?: string[];
  link_url?: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  file_name?: string;
  grade: number[];
  downloads: number;
  views?: number;
  created_at: string;
}

interface SharedDoc {
  id: string;
  document_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  document_title: string;
  document_type: string;
  file_url: string;
  is_read: boolean;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'document' | 'assignment' | 'general';
  is_read: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'documents' | 'writings' | 'users' | 'privateStudents' | 'gradeUpdate' | 'assignments'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [privateStudents, setPrivateStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'announcement' | 'editAnnouncement' | 'document' | 'writing' | 'assignment' | 'editUser' | 'student' | 'sendDoc' | 'editDocument'>('announcement');
  const [formData, setFormData] = useState<any>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const setupAdmin = () => {
      const admin = {
        id: 'admin-1',
        name: 'Uğur Hoca',
        email: 'admin@ugurhoca.com',
        password: 'admin123',
        grade: 5,
        isAdmin: true
      };
      localStorage.setItem('matematiklab_user', JSON.stringify(admin));
      return admin;
    };

    const checkAuth = () => {
      let localUser = localStorage.getItem('matematiklab_user');
      
      if (!localUser) {
        const admin = {
          id: 'admin-1',
          name: 'Uğur Hoca',
          email: 'admin@ugurhoca.com',
          password: 'admin123',
          grade: 5,
          isAdmin: true
        };
        localStorage.setItem('matematiklab_user', JSON.stringify(admin));
        localUser = JSON.stringify(admin);
      }
      
      const userData = JSON.parse(localUser);
      if (userData.email === 'admin@ugurhoca.com') {
        setUser(userData);
        loadData();
      } else {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  const loadData = async () => {
    const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(annData || []);
    
    const { data: docData } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    setDocuments(docData || []);
    
    // Tüm kullanıcıları getir
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (usersData) setAllUsers(usersData);

    // Özel ders öğrencilerini getir
    const { data: studentsData } = await supabase.from('profiles').select('*').eq('is_private_student', true);
    if (studentsData) setPrivateStudents(studentsData);

    const { data: assignData } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
    if (assignData) setAssignments(assignData);

    // Paylaşılan belgeleri getir
    const { data: sharedData } = await supabase.from('shared_documents').select('*').order('created_at', { ascending: false });
    if (sharedData) setSharedDocs(sharedData);

    // Bildirimleri getir
    const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (notifData) setNotifications(notifData);
  };

  // Her 5 saniyede kullanıcıları yenile
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setAllUsers(data);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const openModal = (type: 'announcement' | 'editAnnouncement' | 'document' | 'writing' | 'assignment' | 'student' | 'sendDoc', studentId?: string, doc?: any) => {
    setModalType(type);
    if (studentId) setSelectedStudent(studentId);
    if (doc) setSelectedDoc(doc);
    setFormData({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const imageUrls = modalType === 'announcement'
      ? String(formData.image_urls || '')
          .split('\n')
          .map((url: string) => url.trim())
          .filter(Boolean)
      : [];

    const newItem = {
      ...formData,
      type: modalType === 'announcement' ? undefined : modalType,
      created_at: new Date().toISOString(),
      downloads: 0,
      image_url: modalType === 'announcement' ? (imageUrls[0] || formData.image_url || '') : formData.image_url,
      image_urls: modalType === 'announcement' ? imageUrls : formData.image_urls,
      link_url: modalType === 'announcement' ? formData.link_url || '' : formData.link_url,
    };
    if (modalType === 'assignment') {
      const { data, error } = await supabase.from('assignments').insert([{
        title: formData.title,
        description: formData.description,
        student_id: selectedStudent,
      }]).select();
      if (!error && data) {
        setAssignments([data[0], ...assignments]);
        
        const student = allUsers.find(u => u.id === selectedStudent);
        await supabase.from('notifications').insert([{
          user_id: selectedStudent,
          title: 'Yeni Ödev',
          message: `"${formData.title}" başlıklı yeni bir ödeviniz var.`,
          type: 'assignment',
        }]);
      }
    } else if (modalType === 'announcement') {
      const { data, error } = await supabase.from('announcements').insert([newItem]).select();
      if (!error && data) {
        setAnnouncements([data[0], ...announcements]);
        
        // Tüm kullanıcılara bildirim gönder
        const allStudents = allUsers.filter(u => u.email !== 'admin@ugurhoca.com');
        const notificationInserts = allStudents.map(student => ({
          user_id: student.id,
          title: 'Yeni Duyuru',
          message: formData.title,
          type: 'general',
        }));
        if (notificationInserts.length > 0) {
          await supabase.from('notifications').insert(notificationInserts);
        }
      } else {
        const fallbackItem = { ...newItem, id: Date.now().toString() };
        const updated = [fallbackItem, ...announcements];
        setAnnouncements(updated);
        localStorage.setItem('matematiklab_announcements', JSON.stringify(updated));
      }
    } else if (modalType === 'editAnnouncement') {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: formData.title,
          content: formData.description,
          image_url: imageUrls[0] || formData.image_url || '',
          image_urls: imageUrls.length ? imageUrls : [],
          link_url: formData.link_url || '',
        })
        .eq('id', editingAnnouncement.id);

      if (!error) {
        const updated = announcements.map(a => a.id === editingAnnouncement.id ? {
          ...a,
          title: formData.title,
          content: formData.description,
          image_url: imageUrls[0] || formData.image_url || '',
          image_urls: imageUrls.length ? imageUrls : [],
          link_url: formData.link_url || '',
        } : a);
        setAnnouncements(updated);
        localStorage.setItem('matematiklab_announcements', JSON.stringify(updated));
      }
    } else if (modalType === 'document' || modalType === 'writing') {
      const { data, error } = await supabase.from('documents').insert([newItem]).select();
      if (!error && data) {
        setDocuments([data[0], ...documents]);
      } else {
        const fallbackItem = { ...newItem, id: Date.now().toString() };
        const updated = [fallbackItem, ...documents];
        setDocuments(updated);
        localStorage.setItem('matematiklab_documents', JSON.stringify(updated));
      }
    }

    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setFormData({});
    }, 1500);
  };

  const deleteItem = async (type: string, id: string) => {
    if (confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
      if (type === 'assignment') {
        await supabase.from('assignments').delete().eq('id', id);
        setAssignments(assignments.filter(a => a.id !== id));
      } else if (type === 'shared_document') {
        await supabase.from('shared_documents').delete().eq('id', id);
        setSharedDocs(sharedDocs.filter(d => d.id !== id));
      } else if (type === 'announcement') {
        await supabase.from('announcements').delete().eq('id', id);
        const updated = announcements.filter(a => a.id !== id);
        setAnnouncements(updated);
        localStorage.setItem('matematiklab_announcements', JSON.stringify(updated)); 
      } else {
        await supabase.from('documents').delete().eq('id', id);
        const updated = documents.filter(d => d.id !== id);
        setDocuments(updated);
        localStorage.setItem('matematiklab_documents', JSON.stringify(updated)); 
      }
    }
  };

  const editAssignment = async (assignment: any) => {
    const title = prompt('Ödev başlığı', assignment.title || '');
    if (title === null) return;
    const description = prompt('Ödev açıklaması', assignment.description || '');
    if (description === null) return;

    const { error } = await supabase
      .from('assignments')
      .update({ title, description })
      .eq('id', assignment.id);

    if (!error) {
      setAssignments(assignments.map(a => a.id === assignment.id ? { ...a, title, description } : a));
    }
  };

  const editSharedDocument = async (doc: any) => {
    const document_title = prompt('Belge başlığı', doc.document_title || '');
    if (document_title === null) return;
    const file_url = prompt('Belge bağlantısı', doc.file_url || '');
    if (file_url === null) return;

    const { error } = await supabase
      .from('shared_documents')
      .update({ document_title, file_url })
      .eq('id', doc.id);

    if (!error) {
      setSharedDocs(sharedDocs.map(d => d.id === doc.id ? { ...d, document_title, file_url } : d));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!user) return null;

  return (
    <main className="min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Uğur Hoca Matematik
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden md:block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold">
              Admin Paneli
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/profil" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
              <ArrowLeft className="w-5 h-5" />
              Profil'e Dön
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Paneli</h1>
            <p className="text-slate-400">Hoş geldiniz, Uğur Hoca!</p>
          </motion.div>

          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { id: 'announcements', label: 'Duyurular', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
              { id: 'documents', label: 'Belgeler', icon: FileText, color: 'from-blue-500 to-cyan-500' },
              { id: 'writings', label: 'Yazılar', icon: Edit3, color: 'from-purple-500 to-violet-500' },
              { id: 'users', label: 'Kullanıcılar', icon: Users, color: 'from-green-500 to-emerald-500' },
              { id: 'privateStudents', label: 'Öğrencilerim', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
              { id: 'gradeUpdate', label: 'Sınıf Güncelle', icon: RefreshCw, color: 'from-teal-500 to-cyan-500' },
              { id: 'assignments', label: 'Ödevlendirme', icon: ClipboardList, color: 'from-rose-500 to-pink-500' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 rounded-2xl flex items-center gap-3 transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'glass text-slate-300 hover:text-white'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span className="font-semibold">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {activeTab !== 'users' && activeTab !== 'gradeUpdate' && activeTab !== 'assignments' && (
            <div className="flex justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(activeTab === 'announcements' ? 'announcement' : activeTab === 'documents' ? 'document' : 'writing')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Yeni Ekle
              </motion.button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {announcements.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Megaphone className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz duyuru yok</p>
                  </div>
                ) : (
                  announcements.map((announcement, i) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl overflow-hidden card-hover"
                    >
                      {(announcement.image_urls?.length || announcement.image_url) ? (
                        <AnnouncementGallery
                          images={announcement.image_urls?.length ? announcement.image_urls : [announcement.image_url as string]}
                          title={announcement.title}
                        />
                      ) : null}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-xs font-semibold">
                                Haber
                              </span>
                              <span className="text-slate-400 text-sm flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(announcement.created_at)}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{announcement.title}</h3>
                            <p className="text-slate-300">{announcement.content}</p>
                          </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingAnnouncement(announcement);
                                  setFormData({
                                    title: announcement.title,
                                    description: announcement.content,
                                    image_urls: (announcement.image_urls?.length ? announcement.image_urls : announcement.image_url ? [announcement.image_url] : []).join('\n'),
                                    link_url: announcement.link_url || '',
                                  });
                                  setModalType('editAnnouncement');
                                  setShowModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteItem('announcement', announcement.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Tüm İçerikler ({documents.length})</h3>
                  <button
                    onClick={async () => {
                      if (!confirm('Eski içeriklerin kategori türlerini güncellemek istediğinize emin misiniz?\n\n• worksheet → Yaprak Test\n• test → Deneme\n• game → Oyun\n• document → Yaprak Test\n• writing → Ders Notları')) return;
                      
                      const updates = [
                        { old: 'worksheet', new: 'yaprak-test' },
                        { old: 'document', new: 'yaprak-test' },
                        { old: 'test', new: 'deneme' },
                        { old: 'game', new: 'oyunlar' },
                        { old: 'writing', new: 'ders-notlari' },
                      ];
                      
                      let updated = 0;
                      for (const u of updates) {
                        const { data, error } = await supabase
                          .from('documents')
                          .update({ type: u.new })
                          .eq('type', u.old);
                        if (!error) updated++;
                      }
                      
                      alert(`${updated} kategori güncellendi!`);
                      loadData();
                    }}
                    className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                  >
                    Kategorileri Güncelle
                  </button>
                </div>
                {documents.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz içerik yok</p>
                  </div>
                ) : (
                  documents.map((doc, i) => {
                    const typeColors: Record<string, string> = {
                      'yaprak-test': 'from-blue-500 to-cyan-500',
                      'deneme': 'from-purple-500 to-pink-500',
                      'oyunlar': 'from-orange-500 to-red-500',
                      'ders-notlari': 'from-green-500 to-emerald-500',
                      'ders-videolari': 'from-red-500 to-orange-500',
                      'programlar': 'from-cyan-500 to-blue-500',
                      'worksheet': 'from-blue-500 to-cyan-500',
                      'test': 'from-purple-500 to-pink-500',
                      'game': 'from-orange-500 to-red-500',
                    };
                    const typeLabels: Record<string, string> = {
                      'yaprak-test': 'Yaprak Test',
                      'deneme': 'Deneme',
                      'oyunlar': 'Oyun',
                      'ders-notlari': 'Ders Notları',
                      'ders-videolari': 'Ders Videoları',
                      'programlar': 'Programlar',
                    };
                    return (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass rounded-2xl p-6 card-hover"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeColors[doc.type] || 'from-slate-500 to-slate-600'} flex items-center justify-center flex-shrink-0`}>
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-white truncate">{doc.title}</h3>
                                <span className={`px-3 py-1 bg-gradient-to-r ${typeColors[doc.type] || 'from-slate-500 to-slate-600'} rounded-full text-white text-xs font-semibold flex-shrink-0`}>
                                  {typeLabels[doc.type] || doc.type}
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm line-clamp-1">{doc.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(doc.created_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  {doc.downloads || 0} indirme
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {doc.views || 0} görüntülenme
                                </span>
                                {doc.grade && (
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {Array.isArray(doc.grade) ? doc.grade.join(', ') : doc.grade}. Sınıf
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingDoc(doc);
                                setFormData(doc);
                                setModalType('editDocument');
                                setShowModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteItem('document', doc.id)}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === 'writings' && (
              <motion.div
                key="writings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {documents.filter(d => d.type === 'writing').length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Edit3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz yazı yok</p>
                  </div>
                ) : (
                  documents.filter(d => d.type === 'writing').map((writing, i) => (
                    <motion.div
                      key={writing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-6 card-hover"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full text-white text-xs font-semibold">
                              Yazı
                            </span>
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(writing.created_at)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{writing.title}</h3>
                          <p className="text-slate-300 whitespace-pre-wrap">{writing.description}</p>
                        </div>
                        <button
                          onClick={() => deleteItem('writing', writing.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-slate-400">{allUsers.filter(u => u.email !== 'admin@ugurhoca.com').length} öğrenci</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loadData}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                  </motion.button>
                </div>
                {allUsers.filter(u => u.email !== 'admin@ugurhoca.com').length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz kullanıcı yok</p>
                  </div>
                ) : (
                  allUsers.filter(u => u.email !== 'admin@ugurhoca.com').map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-5 card-hover"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                            {u.name?.[0] || '?'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{u.name || 'İsimsiz'}</h3>
                            <p className="text-slate-400 text-sm">{u.email}</p>
                            <p className="text-slate-500 text-xs mt-1">Sınıf: {u.grade || 'Belirtilmemiş'} • Kayıt: {u.created_at ? formatDate(u.created_at) : 'Bilinmiyor'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setFormData({ name: u.name || '', grade: u.grade || 5 });
                            setModalType('editUser');
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg hover:from-green-500/40 hover:to-emerald-500/40 transition-all font-semibold flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Düzenle
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'privateStudents' && (
              <motion.div
                key="privateStudents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Özel Ders Öğrencilerim</h2>
                    <p className="text-slate-400">Bireysel öğrencilerinizi ve ödevlerini yönetin</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal('student')}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5" />
                    Yeni Öğrenci Ekle
                  </motion.button>
                </div>

                {privateStudents.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400 mb-4">Henüz özel ders öğrenciniz yok</p>
                    <p className="text-slate-500 text-sm">Öğrenci eklemek için profil sayfasından "Özel Ders Öğrencisi" seçeneğini kullanın</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {privateStudents.map((student, i) => {
                      const studentAssignments = assignments.filter(a => a.student_id === student.id);
                      return (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass rounded-2xl overflow-hidden card-hover"
                        >
                          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                          <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                                {student.name?.[0] || '?'}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">{student.name || 'İsimsiz'}</h3>
                                <p className="text-slate-400 text-sm">{student.email}</p>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-400">Ödevler</span>
                                <span className="text-amber-400 font-semibold">{studentAssignments.length} adet</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, studentAssignments.length * 20)}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              {studentAssignments.slice(0, 3).map(assign => (
                                <div key={assign.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                                  <span className="text-slate-300 text-sm truncate flex-1">{assign.title}</span>
                                  <button
                                    onClick={() => deleteItem('assignment', assign.id)}
                                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              {studentAssignments.length > 3 && (
                                <p className="text-slate-500 text-xs text-center">+{studentAssignments.length - 3} ödev daha</p>
                              )}
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedStudent(student.id);
                                openModal('assignment');
                              }}
                              className="w-full mt-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-lg hover:from-amber-500/40 hover:to-orange-500/40 transition-all font-semibold flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Ödev Ekle
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'gradeUpdate' && (
              <motion.div
                key="gradeUpdate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="glass rounded-3xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Sınıf Güncelleme</h2>
                      <p className="text-slate-400">Tüm öğrencilerin sınıfını bir üst seviyeye taşı</p>
                    </div>
                  </div>

                  <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-teal-300 font-medium mb-1">Bu işlem ne yapar?</p>
                        <p className="text-slate-400">
                          Tüm öğrencilerin sınıfı otomatik olarak +1 artırılır. 
                          Örneğin: 5. sınıf → 6. sınıf, 12. sınıf → 12. sınıf (sabit kalır)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-slate-300 mb-3">Mevcut durum:</p>
                    <div className="grid grid-cols-4 gap-3">
                      {[5, 6, 7, 8, 9, 10, 11, 12, 'Mezun'].map(grade => {
                        const count = allUsers.filter(u => u.grade === grade && u.email !== 'admin@ugurhoca.com').length;
                        return (
                          <div key={grade} className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-white">{count}</div>
                            <div className="text-xs text-slate-400">{grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-slate-500 text-sm mb-6">
                    Son güncelleme: <span className="text-slate-300 font-medium">{localStorage.getItem('lastGradeUpdate') || 'Henüz yapılmadı'}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!confirm('Tüm öğrencilerin sınıfını güncellemek istediğinizden emin misiniz?')) return;
                      
                      setIsSubmitting(true);
                      const currentYear = new Date().getFullYear();
                      
                      for (const u of allUsers) {
                        if (u.isAdmin || u.grade >= 12 || u.grade === 'Mezun') continue;
                        await supabase.from('profiles').update({ grade: u.grade + 1 }).eq('id', u.id);
                      }
                      
                      localStorage.setItem('lastGradeUpdate', `${currentYear} - Temmuz`);
                      loadData();
                      setIsSubmitting(false);
                      alert('Sınıflar başarıyla güncellendi!');
                    }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Sınıfları Güncelle
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div
                key="assignments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Ödevlendirme</h2>
                    <p className="text-slate-400">Belge gönder veya ödev ver</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openModal('sendDoc')}
                      className="btn-primary"
                    >
                      <Send className="w-5 h-5" />
                      Belge Gönder
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openModal('assignment')}
                      className="btn-primary"
                    >
                      <Plus className="w-5 h-5" />
                      Ödev Ver
                    </motion.button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5 text-rose-400" />
                      Gönderilen Belgeler
                    </h3>
                    {sharedDocs.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Henüz belge gönderilmedi</p>
                    ) : (
                      <div className="space-y-3">
                        {sharedDocs.map(doc => (
                          <div key={doc.id} className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{doc.document_title}</p>
                                <p className="text-slate-400 text-sm">{doc.student_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${doc.is_read ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {doc.is_read ? 'Görüldü' : 'Bekliyor'}
                              </span>
                              <button onClick={() => editSharedDocument(doc)} className="text-slate-400 hover:text-blue-400 transition-colors" title="Düzenle">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteItem('shared_document', doc.id)} className="text-slate-400 hover:text-red-400 transition-colors" title="Sil">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-purple-400" />
                      Ödevler
                    </h3>
                    {assignments.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Henüz ödev verilmedi</p>
                    ) : (
                      <div className="space-y-3">
                        {assignments.map(asmt => (
                          <div key={asmt.id} className="bg-slate-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white font-medium">{asmt.title}</p>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => editAssignment(asmt)}
                                  className="text-slate-400 hover:text-blue-400"
                                  title="Düzenle"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteItem('assignment', asmt.id)}
                                  className="text-slate-400 hover:text-red-400"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-400 text-sm">{asmt.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
              className="glass rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {modalType === 'announcement' ? 'Yeni Duyuru' : modalType === 'editAnnouncement' ? 'Duyuru Düzenle' : modalType === 'document' ? 'Yeni Belge' : modalType === 'editDocument' ? 'Belge Düzenle' : modalType === 'assignment' ? 'Yeni Ödev' : modalType === 'student' ? 'Yeni Öğrenci' : modalType === 'editUser' ? 'Kullanıcı Düzenle' : modalType === 'sendDoc' ? 'Belge Gönder' : 'Yeni Yazı'}
                </h2>
                <button onClick={() => { setShowModal(false); setEditingUser(null); }} className="text-slate-400 hover:text-white">
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
                  <p className="text-slate-400">{modalType === 'editUser' ? 'Kullanıcı güncellendi' : 'İçeriğiniz eklendi'}</p>
                </motion.div>
              ) : modalType === 'editUser' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  
                  if (editingUser) {
                    const { error } = await supabase
                      .from('profiles')
                      .update({ name: formData.name, grade: formData.grade })
                      .eq('id', editingUser.id);
                    
                    if (!error) {
                      setSuccess(true);
                      loadData();
                      setTimeout(() => {
                        setShowModal(false);
                        setEditingUser(null);
                        setSuccess(false);
                      }, 1500);
                    }
                  }
                  setIsSubmitting(false);
                }} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Ad Soyad</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="Adını girin..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Sınıf</label>
                    <select
                      value={formData.grade || ''}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value === 'Mezun' ? 'Mezun' : parseInt(e.target.value) })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="">Sınıf seçin</option>
                      <option value="5">5. Sınıf</option>
                      <option value="6">6. Sınıf</option>
                      <option value="7">7. Sınıf</option>
                      <option value="8">8. Sınıf</option>
                      <option value="9">9. Sınıf</option>
                      <option value="10">10. Sınıf</option>
                      <option value="11">11. Sınıf</option>
                      <option value="12">12. Sınıf</option>
                      <option value="Mezun">Mezun</option>
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </motion.button>
                </form>
              ) : modalType === 'sendDoc' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  
                  const selectedStudentUser = allUsers.find(u => u.id === formData.student_id);
                  
                  const { data, error } = await supabase.from('shared_documents').insert([{
                    document_id: selectedDoc?.id || formData.document_id,
                    student_id: formData.student_id,
                    student_name: selectedStudentUser?.name || 'Öğrenci',
                    student_email: selectedStudentUser?.email || '',
                    document_title: selectedDoc?.title || formData.document_title,
                    document_type: selectedDoc?.type || 'document',
                    file_url: selectedDoc?.file_url || formData.file_url,
                  }]).select();
                  
                  if (!error && data) {
                    setSharedDocs([data[0], ...sharedDocs]);
                    
                    await supabase.from('notifications').insert([{
                      user_id: formData.student_id,
                      title: 'Yeni Belge',
                      message: `"${selectedDoc?.title || formData.document_title}" başlıklı bir belge gönderildi.`,
                      type: 'document',
                    }]);
                    
                    setSuccess(true);
                    setTimeout(() => {
                      setShowModal(false);
                      setSuccess(false);
                      setFormData({});
                      setSelectedDoc(null);
                    }, 1500);
                  }
                  setIsSubmitting(false);
                }} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Belge Seç</label>
                    <select
                      required
                      value={formData.document_id || ''}
                      onChange={(e) => {
                        const doc = documents.find(d => d.id === e.target.value);
                        setFormData({ ...formData, document_id: e.target.value });
                        if (doc) setSelectedDoc(doc);
                      }}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="">Belge seçin</option>
                      {documents.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Öğrenci Seç</label>
                    <select
                      required
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="">Öğrenci seçin</option>
                      {allUsers.filter(u => u.email !== 'admin@ugurhoca.com').map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name || student.email} - {student.grade === 'Mezun' ? 'Mezun' : `${student.grade}. Sınıf`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : (
                      <>
                        <Send className="w-5 h-5" />
                        Gönder
                      </>
                    )}
                  </motion.button>
                </form>
              ) : modalType === 'editDocument' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  
                  const { error } = await supabase
                    .from('documents')
                    .update({
                      title: formData.title,
                      description: formData.description,
                      type: formData.type,
                      file_url: formData.file_url,
                      video_url: formData.video_url,
                    })
                    .eq('id', editingDoc.id);
                  
                  if (!error) {
                    setSuccess(true);
                    setDocuments(documents.map(d => d.id === editingDoc.id ? { ...d, ...formData } : d));
                    setTimeout(() => {
                      setShowModal(false);
                      setSuccess(false);
                      setFormData({});
                      setEditingDoc(null);
                    }, 1500);
                  }
                  setIsSubmitting(false);
                }} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Açıklama</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Kategori</label>
                    <select
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Kategori seçin</option>
                      <option value="ders-notlari">Ders Notları</option>
                      <option value="yaprak-test">Yaprak Test</option>
                      <option value="ders-videolari">Ders Videoları</option>
                      <option value="deneme">Deneme</option>
                      <option value="programlar">Programlar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Dosya Linki</label>
                    <input
                      type="url"
                      value={formData.file_url || ''}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">YouTube URL</label>
                    <input
                      type="url"
                      value={formData.video_url || ''}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </motion.button>
                </form>
              ) : modalType === 'student' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  
                  const { data, error } = await supabase.from('profiles').insert([{
                    name: formData.name,
                    email: formData.email,
                    grade: formData.grade,
                    is_private_student: true
                  }]).select();
                  
                  if (!error && data) {
                    setPrivateStudents([data[0], ...privateStudents]);
                    setSuccess(true);
                    setTimeout(() => {
                      setShowModal(false);
                      setSuccess(false);
                      setFormData({});
                    }, 1500);
                  }
                  setIsSubmitting(false);
                }} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Öğrenci Adı</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">E-posta</label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="ogrenci@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Sınıf</label>
                    <select
                      required
                      value={formData.grade || ''}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value === 'Mezun' ? 'Mezun' : parseInt(e.target.value) })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="">Sınıf seçin</option>
                      <option value="5">5. Sınıf</option>
                      <option value="6">6. Sınıf</option>
                      <option value="7">7. Sınıf</option>
                      <option value="8">8. Sınıf</option>
                      <option value="9">9. Sınıf</option>
                      <option value="10">10. Sınıf</option>
                      <option value="11">11. Sınıf</option>
                      <option value="12">12. Sınıf</option>
                      <option value="Mezun">Mezun</option>
                    </select>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Ekleniyor...' : 'Öğrenci Ekle'}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {modalType === 'assignment' && (
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm">Öğrenci Seç</label>
                      <select
                        required
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                 focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="">Öğrenci seçin</option>
                        {privateStudents.map(s => (
                          <option key={s.id} value={s.id}>{s.name || s.email}</option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  {(modalType === 'announcement' || modalType === 'editAnnouncement') && (
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm">Görsel Linkleri</label>
                      <textarea
                        rows={4}
                        value={formData.image_urls || ''}
                        onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                        placeholder={`Her satıra bir Yandex görsel linki yapıştır\nhttps://.../foto1.jpg\nhttps://.../foto2.jpg`}
                      />
                      <p className="text-xs text-slate-500 mt-2">Her satıra 1 görsel linki gir. İlk görsel kapak olur.</p>
                    </div>
                  )}

                  {(modalType === 'announcement' || modalType === 'editAnnouncement') && (
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm">Detay Linki</label>
                      <input
                        type="url"
                        value={formData.link_url || ''}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                 focus:outline-none focus:border-pink-500 transition-colors"
                        placeholder="PDF ya da site linki"
                      />
                      <p className="text-xs text-slate-500 mt-2">PDF, site veya başka bir detay bağlantısı ekleyebilirsin.</p>
                    </div>
                  )}

                  {modalType === 'document' && (
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
                        <option value="ders-notlari">Ders Notları</option>
                        <option value="yaprak-test">Yaprak Test</option>
                        <option value="ders-videolari">Ders Videoları</option>
                        <option value="deneme">Deneme</option>
                        <option value="programlar">Programlar</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">
                      {modalType === 'announcement' || modalType === 'editAnnouncement' ? 'Duyuru İçeriği' : modalType === 'document' ? 'Belge Açıklaması' : modalType === 'assignment' ? 'Ödev Detayları' : 'Yazı İçeriği'}
                    </label>
                    <textarea
                      required
                      rows={modalType === 'document' || modalType === 'assignment' ? 3 : 6}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder={modalType === 'document' ? 'Belge hakkında bilgi...' : modalType === 'assignment' ? 'Hangi sayfalar / kaynaklar yapılacak?' : 'İçeriği buraya yazın...'}
                    />
                  </div>

                  {modalType === 'document' && (
                    <>
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
                                const { data, error } = await supabase.storage
                                  .from('documents')
                                  .upload(fileName, file);
                                
                                if (error) {
                                  alert('Dosya yüklenemedi: ' + error.message);
                                } else {
                                  const { data: urlData } = supabase.storage
                                    .from('documents')
                                    .getPublicUrl(fileName);
                                  setFormData({ ...formData, file_url: urlData.publicUrl, file_name: file.name });
                                }
                                setIsSubmitting(false);
                              }
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <label 
                            htmlFor="file-upload"
                            className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-6 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-500 transition-colors"
                          >
                            <Upload className="w-5 h-5" />
                            <span>{formData.file_name || 'Dosya seç (PDF, EXE, MP4...) veya buraya sürükle'}</span>
                          </label>
                        </div>
                      </div>
                      <div className="text-center text-slate-500 text-sm">veya</div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Link (Google Drive, vb.)</label>
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
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_admin_only"
                          checked={formData.is_admin_only || false}
                          onChange={(e) => setFormData({ ...formData, is_admin_only: e.target.checked })}
                          className="w-5 h-5 accent-red-500"
                        />
                        <label htmlFor="is_admin_only" className="text-slate-300 cursor-pointer">
                          <span className="font-semibold text-red-400">Sadece Bana Özel</span>
                          <span className="text-slate-400 text-sm ml-2">(Diğer kullanıcılar göremez)</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Hedef Sınıflar</label>
                        <div className="flex flex-wrap gap-2">
                          {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                            <label key={grade} className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={formData.grades?.includes(grade) || false}
                                onChange={(e) => {
                                  const grades = formData.grades || [];
                                  if (e.target.checked) {
                                    setFormData({ ...formData, grades: [...grades, grade] });
                                  } else {
                                    setFormData({ ...formData, grades: grades.filter((g: number) => g !== grade) });
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
                              checked={formData.grades?.includes('Mezun') || false}
                              onChange={(e) => {
                                const grades = formData.grades || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, grades: [...grades, 'Mezun'] });
                                } else {
                                  setFormData({ ...formData, grades: grades.filter((g: string | number) => g !== 'Mezun') });
                                }
                              }}
                              className="w-4 h-4 accent-purple-500"
                            />
                            <span className="text-white text-sm">Mezun</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all glow-button flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ekleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Yayınla
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
