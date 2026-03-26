'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, LogOut, ArrowLeft, Settings, ChevronRight, Shield, Bell,
  FileText, ClipboardList, BookOpen, CheckCircle2, Clock3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
          background: ['#f97316', '#ec4899', '#06b6d4', '#10b981', '#8b5cf6', '#6366f1'][i],
          left: `${(i * 18) % 90}%`,
          top: `${(i * 15) % 85}%`,
        }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'document' | 'assignment' | 'general' | 'message';
  is_read: boolean;
  created_at: string;
}

interface SharedDoc {
  id: string;
  document_title: string;
  document_type: string;
  file_url: string;
  is_read: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<Notification | null>(null);
  const docsRef = useRef<HTMLHeadingElement | null>(null);
  const assignmentsRef = useRef<HTMLHeadingElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/giris');
        return;
      }
      
      const isAdmin = session.user.email === 'admin@ugurhoca.com';
      if (isAdmin) {
        router.push('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setUser({ ...profile, email: session.user.email, isAdmin });
      } else {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email,
          grade: session.user.user_metadata?.grade ?? 5,
          isAdmin
        });
      }
      
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (notifData) setNotifications(notifData);
      
      const { data: sharedData } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false });
      if (sharedData) setSharedDocs(sharedData);
      
      const { data: asmtData } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', session.user.id)
        .order('created_at', { ascending: false });
      if (asmtData) setAssignments(asmtData);
      
      setLoading(false);
    }
    loadData();
  }, [router]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }

    setShowNotifications(false);

    if (notif.type === 'document') {
      const doc = sharedDocs[0];
      if (doc?.file_url) {
        window.open(doc.file_url, '_blank', 'noopener,noreferrer');
        return;
      }

      docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (notif.type === 'assignment') {
      const assignment = assignments[0];
      if (assignment) {
        setSelectedAssignment(assignment);
        return;
      }

      assignmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (notif.type === 'message') {
      setSelectedMessage(notif);
    }
  };

  const getNotificationStyle = (notif: Notification) => {
    if (notif.is_read) {
      return {
        wrapper: 'border-slate-700/60 bg-slate-700/20 hover:bg-slate-700/35',
        icon: CheckCircle2,
        iconWrap: 'bg-emerald-500/15 text-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-300',
        status: 'Görüldü',
      };
    }

    if (notif.type === 'assignment') {
      return {
        wrapper: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15',
        icon: Clock3,
        iconWrap: 'bg-amber-500/15 text-amber-300',
        badge: 'bg-amber-500/15 text-amber-200',
        status: 'Görülmedi',
      };
    }

    if (notif.type === 'document') {
      return {
        wrapper: 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15',
        icon: Clock3,
        iconWrap: 'bg-sky-500/15 text-sky-300',
        badge: 'bg-sky-500/15 text-sky-200',
        status: 'Görülmedi',
      };
    }

    if (notif.type === 'message') {
      return {
        wrapper: 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15',
        icon: Clock3,
        iconWrap: 'bg-indigo-500/15 text-indigo-300',
        badge: 'bg-indigo-500/15 text-indigo-200',
        status: 'Mesaj',
      };
    }

    return {
      wrapper: 'border-pink-500/20 bg-pink-500/10 hover:bg-pink-500/15',
      icon: Clock3,
      iconWrap: 'bg-pink-500/15 text-pink-300',
      badge: 'bg-pink-500/15 text-pink-200',
      status: 'Görülmedi',
    };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </main>
    );
  }

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center gap-2">
              <img src="/ugur.jpeg" alt="Uğur Hoca" className="w-9 h-9 rounded-lg object-cover" />
              <span className="text-lg font-bold text-white">
                Uğur Hoca
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {!user.isAdmin && (
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-slate-400 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Ana Sayfa
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showNotifications && !user.isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-14 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-bold">Bildirimler</h3>
            <span className="text-xs text-slate-400">{unreadCount} okunmamış</span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Henüz bildirim yok</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map(notif => (
                (() => {
                  const style = getNotificationStyle(notif);
                  const Icon = style.icon;
                  return (
                <button 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 transition-colors border-l-4 ${style.wrapper}`}
                >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconWrap}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white font-medium text-sm">{notif.title}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${style.badge}`}>
                            {style.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{notif.message}</p>
                        <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[11px]">
                          {notif.type === 'assignment' ? 'Ödev' : notif.type === 'document' ? 'Belge' : 'Genel'}
                        </span>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(notif.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 mt-1 ${notif.is_read ? 'text-emerald-400' : 'text-amber-300'}`} />
                    </div>
                  </button>
                  );
                })()
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="pt-14 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                whileHover={{ scale: 1.05 }}
              >
                {user.name?.[0] || '?'}
              </motion.div>
              
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-slate-400 text-sm">{user.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  {user.isAdmin ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-300 font-semibold text-sm">Yönetici</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span className="text-indigo-300 font-semibold text-sm">
                        {user.grade === 'Mezun' ? 'Mezun' : `${user.grade}. Sınıf`}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {user.isAdmin ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4">Yönetim Alanı</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  href="/admin"
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Admin Paneli</h3>
                        <p className="text-slate-400 text-sm">Duyuru ve içerik yönetimi</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  </div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {(sharedDocs.length > 0 || assignments.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 ref={docsRef} className="text-xl font-bold text-white mb-4">Gelen Belgeler</h2>
                  {sharedDocs.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      {sharedDocs.map(doc => (
                        <a 
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors flex items-center gap-4"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.is_read ? 'bg-slate-700' : 'bg-indigo-500/20'}`}>
                            <FileText className={`w-5 h-5 ${doc.is_read ? 'text-slate-400' : 'text-indigo-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{doc.document_title}</p>
                            <p className="text-slate-400 text-sm">
                              {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          {!doc.is_read && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">Yeni</span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {assignments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 ref={assignmentsRef} className="text-xl font-bold text-white mb-4">Ödevlerim</h2>
                  <div className="space-y-3">
                    {assignments.map(asmt => (
                      <div 
                        key={asmt.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{asmt.title}</p>
                          <p className="text-slate-400 text-sm mt-1">{asmt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedAssignment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setSelectedAssignment(null)}
                >
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">Ödev</p>
                        <h3 className="text-2xl font-bold text-white">{selectedAssignment.title}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedAssignment.description || 'Ayrıntı bulunmuyor.'}</p>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
                      >
                        Kapat
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {selectedMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setSelectedMessage(null)}
                >
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">Mesaj</p>
                        <h3 className="text-2xl font-bold text-white">{selectedMessage.title}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="w-6 h-6 rotate-45" />
                      </button>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedMessage.message}</p>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
                      >
                        Kapat
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {notifications.length === 0 && sharedDocs.length === 0 && assignments.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-12"
                >
                  <Bell className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Henüz bir şey yok</p>
                  <p className="text-slate-500 text-sm mt-2">Uğur Hoca size belge veya ödev gönderdiğinde burada görünecek</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
