'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, LogOut, ArrowLeft, Plus, FileText, 
  Image, Megaphone, Edit3, Trash2, Upload, X,
  Calendar, Eye, Download, Check, AlertCircle, Sparkles,
  Users, BookOpen
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  grade: number[];
  downloads: number;
  created_at: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'documents' | 'writings' | 'users' | 'privateStudents'>('announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [privateStudents, setPrivateStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'announcement' | 'document' | 'writing' | 'assignment' | 'editUser' | 'student'>('announcement');
  const [formData, setFormData] = useState<any>({});
  const [editingUser, setEditingUser] = useState<any>(null);
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

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email === 'admin@ugurhoca.com') {
          setUser({ email: session.user.email, name: session.user.user_metadata?.name || 'Uğur Hoca' });
          loadData();
        } else {
          const adminUser = setupAdmin();
          setUser(adminUser);
          loadData();
        }
      } else {
        const localUser = localStorage.getItem('matematiklab_user');
        if (localUser) {
          const userData = JSON.parse(localUser);
          if (userData.email === 'admin@ugurhoca.com') {
            setUser(userData);
            loadData();
          } else {
            const adminUser = setupAdmin();
            setUser(adminUser);
            loadData();
          }
        } else {
          const adminUser = setupAdmin();
          setUser(adminUser);
          loadData();
        }
      }
    };
    checkAuth();
  }, [router]);

  const loadData = async () => {
    const { data: annData, error: annError } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    const { data: docData, error: docError } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    
    if (annError) {
      console.warn('Supabase okuma hatası (Duyurular):', annError);
      const localAnn = JSON.parse(localStorage.getItem('matematiklab_announcements') || '[]');
      setAnnouncements(localAnn.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } else {
      setAnnouncements(annData);
    }
    
    if (docError) {
      console.warn('Supabase okuma hatası (Belgeler):', docError);
      const localDoc = JSON.parse(localStorage.getItem('matematiklab_documents') || '[]');
      setDocuments(localDoc.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } else {
      setDocuments(docData);
    }
    
    // Tüm kullanıcıları getir
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (usersData) setAllUsers(usersData);

    // Özel ders öğrencilerini getir
    const { data: studentsData } = await supabase.from('profiles').select('*').eq('is_private_student', true);
    if (studentsData) setPrivateStudents(studentsData);

    const { data: assignData } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
    if (assignData) setAssignments(assignData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const openModal = (type: 'announcement' | 'document' | 'writing' | 'assignment' | 'student', studentId?: string) => {
    setModalType(type);
    if (studentId) setSelectedStudent(studentId);
    setFormData({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newItem = {
      ...formData,
      type: modalType === 'announcement' ? undefined : modalType,
      created_at: new Date().toISOString(),
      downloads: 0,
    };
    if (modalType === 'assignment') {
      const { data, error } = await supabase.from('assignments').insert([{
        title: formData.title,
        description: formData.description,
        student_id: selectedStudent,
      }]).select();
      if (!error && data) {
        setAssignments([data[0], ...assignments]);
      }
    } else if (modalType === 'announcement') {
      const { data, error } = await supabase.from('announcements').insert([newItem]).select();
      if (!error && data) {
        setAnnouncements([data[0], ...announcements]);
      } else {
        const fallbackItem = { ...newItem, id: Date.now().toString() };
        const updated = [fallbackItem, ...announcements];
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
          <Link href="/profil" className="flex items-center gap-3">
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
              { id: 'privateStudents', label: 'Öğrencilerim', icon: BookOpen, color: 'from-amber-500 to-orange-500' }
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

          {activeTab !== 'users' && (
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
                      className="glass rounded-2xl p-6 card-hover"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-xs font-semibold">
                              Duyuru
                            </span>
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(announcement.created_at)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{announcement.title}</h3>
                          <p className="text-slate-300">{announcement.content}</p>
                        </div>
                        <button
                          onClick={() => deleteItem('announcement', announcement.id)}
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

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {documents.filter(d => d.type === 'document').length === 0 ? (
                  <div className="col-span-full glass rounded-2xl p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz belge yok</p>
                  </div>
                ) : (
                  documents.filter(d => d.type === 'document').map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl overflow-hidden card-hover"
                    >
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <button
                            onClick={() => deleteItem('document', doc.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{doc.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{doc.description}</p>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(doc.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {doc.downloads}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
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
                {allUsers.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz kullanıcı yok</p>
                  </div>
                ) : (
                  allUsers.map((u, i) => (
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
                  {modalType === 'announcement' ? 'Yeni Duyuru' : modalType === 'document' ? 'Yeni Belge' : modalType === 'assignment' ? 'Yeni Ödev' : modalType === 'student' ? 'Yeni Öğrenci' : modalType === 'editUser' ? 'Kullanıcı Düzenle' : 'Yeni Yazı'}
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
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
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
                      onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
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

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">
                      {modalType === 'announcement' ? 'Duyuru İçeriği' : modalType === 'document' ? 'Belge Açıklaması' : modalType === 'assignment' ? 'Ödev Detayları' : 'Yazı İçeriği'}
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
                        <label className="block text-slate-300 mb-2 text-sm">Dosya URL (Google Drive, vb.)</label>
                        <input
                          type="url"
                          value={formData.file_url || ''}
                          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="https://drive.google.com/..."
                        />
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
