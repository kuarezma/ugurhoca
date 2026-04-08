'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Calculator, LogOut, ArrowLeft, Plus, FileText,
  Image, Megaphone, Edit3, Trash2, Upload, X,
  Calendar, Eye, Download, Check, CheckCircle2, AlertCircle, Sparkles,
  Users, BookOpen, RefreshCw, GraduationCap, Send, Bell,
  UserCheck, ClipboardList, MessageSquareText, Paperclip, Ban, VolumeX, Flag,
  BarChart3, Clock, ChevronRight, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { normalizeFullNameForMatch } from '@/lib/student-identity';
import AdminStatistics from '@/components/AdminStatistics';
import FloatingShapes from '@/components/FloatingShapes';

const AnnouncementGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const [resolvedImages, setResolvedImages] = useState<string[]>(images);
  const hasMultiple = images.length > 1;

  const proxiedImageSrc = (url?: string) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    return url;
  };

  useEffect(() => {
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

    (async () => {
      const normalized = await Promise.all(images.map(resolveYandexImageUrl));
      setResolvedImages(normalized);
    })();
  }, [images]);

  return (
    <div className="relative min-h-[320px] bg-slate-900">
      <img
        src={proxiedImageSrc(resolvedImages[current] || images[current])}
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
  type: 'document' | 'assignment' | 'general' | 'message' | 'moderation' | 'report';
  is_read: boolean;
  created_at: string;
}

export default function AdminPage() {
  const RETENTION_DAYS = 180;
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'statistics' | 'announcements' | 'documents' | 'writings' | 'users' | 'privateStudents' | 'messages' | 'gradeUpdate' | 'assignments' | 'quizzes'>('statistics');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [privateStudents, setPrivateStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<SharedDoc[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState<any[]>([]);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [submissionGrade, setSubmissionGrade] = useState<number>(100);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'announcement' | 'editAnnouncement' | 'document' | 'writing' | 'assignment' | 'editUser' | 'student' | 'sendDoc' | 'editDocument' | 'adminMessage' | 'quiz' | 'editQuiz' | 'addQuestion'>('announcement');
  const [formData, setFormData] = useState<any>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [adminMsgRecipient, setAdminMsgRecipient] = useState<any>(null);
  const [adminMsgTitle, setAdminMsgTitle] = useState('');
  const [adminMsgText, setAdminMsgText] = useState('');
  const [adminMsgImageUrl, setAdminMsgImageUrl] = useState('');
  const [adminMsgImagePreview, setAdminMsgImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Supabase session kontrolü
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/giris');
        return;
      }

      // Admin email kontrolü
      const adminEmails = ['admin@ugurhoca.com', 'admin@matematiklab.com'];
      if (!adminEmails.includes(session.user.email || '')) {
        router.push('/');
        return;
      }

      const adminUser = {
        id: session.user.id,
        name: 'Uğur Hoca',
        email: session.user.email,
        grade: 5,
        isAdmin: true
      };
      
      setUser(adminUser);
      loadData();
    };
    checkAuth();
  }, [router]);

  const loadSubmissions = async (assignmentId: string) => {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });
    
    if (data) {
      setSelectedAssignmentSubmissions(data);
    }
  };

  const updateSubmission = async (submissionId: string, grade: number, feedback: string) => {
    const { error } = await supabase
      .from('assignment_submissions')
      .update({ 
        grade, 
        feedback, 
        status: 'reviewed' 
      })
      .eq('id', submissionId);
    
    if (!error) {
      if (activeAssignment) loadSubmissions(activeAssignment.id);
      alert('Değerlendirme kaydedildi.');
    }
  };

  const loadData = async () => {
    const { data: annData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements((annData || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    
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

    // Quiz'leri getir
    const { data: quizData } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (quizData) setQuizzes(quizData);

    // Chat odalarını getir
    const { data: rooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (roomsError) {
      console.error("Chat rooms çekilirken hata:", roomsError.message);
    } else if (rooms) {
      setChatRooms(rooms);
    }

    const retentionCutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('notifications')
      .delete()
      .in('type', ['message', 'moderation', 'report'])
      .lt('created_at', retentionCutoff);

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

  const loadChatMessages = async (roomId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('ts', { ascending: true });
    if (data) setChatMessages(data);
  };

  const sendChatMessage = async (roomId: string, text: string) => {
    if (!text.trim()) return;
    const { error } = await supabase.from('chat_messages').insert([{
      room_id: roomId,
      sender_tc: 'admin',
      display_name: 'Uğur Hoca',
      text: text.trim(),
      ts: Date.now()
    }]);
    if (!error) {
      setReplyText('');
      loadChatMessages(roomId);
    }
  };

  const openModal = (type: 'announcement' | 'editAnnouncement' | 'document' | 'writing' | 'assignment' | 'student' | 'sendDoc' | 'quiz' | 'editQuiz' | 'addQuestion', studentId?: string, doc?: any) => {
    setModalType(type);
    if (studentId) setSelectedStudent(studentId);
    if (doc) setSelectedDoc(doc);
    setFormData({});
    setShowModal(true);
  };

  const loadQuizQuestions = async (quizId: string) => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true });
    if (data) setQuizQuestions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const imageUrls = modalType === 'announcement' || modalType === 'editAnnouncement'
      ? String(formData.image_urls || '')
          .split('\n')
          .map((url: string) => url.trim())
          .filter(Boolean)
      : [];

    const newItem = modalType === 'announcement' || modalType === 'editAnnouncement'
      ? {
          title: formData.title,
          content: formData.description,
          ...(imageUrls[0] ? { image_url: imageUrls[0] } : {}),
          ...(imageUrls.length ? { image_urls: imageUrls } : {}),
          ...(formData.link_url ? { link_url: formData.link_url } : {}),
        }
      : {
          ...formData,
          type: modalType === 'document' ? formData.type : modalType,
          downloads: 0,
        };
    if (modalType === 'assignment') {
      const { data, error } = await supabase.from('assignments').insert([{
        title: formData.title,
        description: formData.description,
        student_id: selectedStudent || null,
        grade: formData.grade || null,
        due_date: formData.due_date || null
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
        console.error('Announcement insert failed:', error, newItem);
        alert(error?.message ? `Duyuru kaydedilemedi: ${error.message}` : 'Duyuru kaydedilemedi. Lütfen tekrar deneyin.');
      }
      loadData();
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
      }
      loadData();
    } else if (modalType === 'document' || modalType === 'writing') {
      const documentItem = {
        ...newItem,
        answer_key_text: formData.answer_key_text || null,
        solution_url: formData.solution_url || null,
      };
      const { data, error } = await supabase.from('documents').insert([documentItem]).select();
      if (!error && data) {
        setDocuments([data[0], ...documents]);
      } else {
        alert('Belge kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } else if (modalType === 'quiz') {
      const { data, error } = await supabase.from('quizzes').insert([{
        title: formData.title,
        grade: formData.grade,
        time_limit: formData.time_limit,
        difficulty: formData.difficulty,
        description: formData.description,
        is_active: true,
      }]).select();
      if (!error && data) {
        setQuizzes([data[0], ...quizzes]);
      } else {
        alert('Test kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } else if (modalType === 'editQuiz') {
      const { error } = await supabase
        .from('quizzes')
        .update({
          title: formData.title,
          grade: formData.grade,
          time_limit: formData.time_limit,
          difficulty: formData.difficulty,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq('id', selectedQuiz.id);
      if (!error) {
        setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? { ...q, ...formData } : q));
      }
    } else if (modalType === 'addQuestion') {
      const { data, error } = await supabase.from('quiz_questions').insert([{
        quiz_id: selectedQuiz.id,
        question: formData.question,
        options: formData.options,
        correct_index: formData.correct_index,
        question_order: quizQuestions.length,
        explanation: formData.explanation,
      }]).select();
      if (!error && data) {
        setQuizQuestions([...quizQuestions, data[0]]);
      } else {
        alert('Soru eklenemedi. Lütfen tekrar deneyin.');
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

  const togglePrivateStudent = async (userId: string, isCurrentlyPrivate: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_private_student: !isCurrentlyPrivate })
      .eq('id', userId);
    
    if (!error) {
      alert(`Öğrenci "Özel Ders" listesinden ${isCurrentlyPrivate ? 'çıkarıldı' : 'eklendi'}.`);
      loadData();
    } else {
      alert('İşlem başarısız: ' + error.message);
    }
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
        setAnnouncements(announcements.filter(a => a.id !== id));
      } else if (type === 'quiz') {
        await supabase.from('quizzes').delete().eq('id', id);
        setQuizzes(quizzes.filter(q => q.id !== id));
      } else {
        await supabase.from('documents').delete().eq('id', id);
        setDocuments(documents.filter(d => d.id !== id));
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

  const parseMessagePayload = (notification: Notification | null) => {
    if (!notification) return null;
    try {
      const parsed = JSON.parse(notification.message);
      if (parsed && typeof parsed === 'object' && parsed.text) return parsed;
    } catch {}
    return null;
  };

  const adminProfileIds = (allUsers || [])
    .filter((u) => u.email === 'admin@ugurhoca.com' || u.email === 'admin@matematiklab.com')
    .map((u) => u.id)
    .filter(Boolean);

  const adminTargetIds = new Set([user?.id, ...adminProfileIds].filter(Boolean));

  const isIncomingAdminMessage = (n: Notification) => {
    if (n.type !== 'message') return false;
    if (!adminTargetIds.has(n.user_id)) return false;
    return !!parseMessagePayload(n);
  };

  const unreadNotifications = notifications.filter((n) => isIncomingAdminMessage(n) && !n.is_read);

  const getNotificationBody = (notification: Notification | null) => {
    const payload = parseMessagePayload(notification);
    return payload?.text || notification?.message || '';
  };

  const parseModerationPayload = (notification: Notification | null) => {
    if (!notification || notification.type !== 'moderation') return null;
    try {
      const parsed = JSON.parse(notification.message);
      if (parsed && typeof parsed === 'object' && parsed.sender_id && parsed.action) return parsed;
    } catch {}
    return null;
  };

  const getSenderActionStatus = (senderId?: string) => {
    if (!senderId) return { blocked: false, muted: false };

    for (const n of notifications) {
      const mod = parseModerationPayload(n);
      if (!mod || mod.sender_id !== senderId) continue;

      if (mod.action === 'block') return { blocked: true, muted: false, expires_at: null };

      if (mod.action === 'mute') {
        const active = mod.expires_at && new Date(mod.expires_at).getTime() > Date.now();
        if (active) return { blocked: false, muted: true, expires_at: mod.expires_at };
      }
    }

    return { blocked: false, muted: false };
  };

  const markNotificationAsRead = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));

      if (notification.type === 'message') {
        const payload = parseMessagePayload(notification);
        if (payload?.sender_id) {
          await supabase.from('notifications').insert([{ 
            user_id: payload.sender_id,
            title: 'Mesajın okundu',
            message: 'Uğur Hoca mesajını okudu.',
            type: 'message',
          }]);
        }
      }
    }
    setSelectedNotification(notification);
    setShowNotifications(false);
    setReplyText('');
  };

  const extractUrls = (text: string) => text.match(/https?:\/\/[^\s<>"]+/g) || [];

  const studentMessages = notifications.filter((n) => isIncomingAdminMessage(n));

  const groupedMessages = studentMessages.reduce((acc, msg) => {
    const payload = parseMessagePayload(msg);
    const senderId = payload?.sender_id || msg.id;
    if (!acc[senderId]) {
      acc[senderId] = [];
    }
    acc[senderId].push(msg);
    return acc;
  }, {} as Record<string, typeof studentMessages>);

  const sortedGroupIds = Object.keys(groupedMessages).sort((a, b) => {
    const aMsgs = groupedMessages[a];
    const bMsgs = groupedMessages[b];
    const aTime = new Date(aMsgs[0].created_at).getTime();
    const bTime = new Date(bMsgs[0].created_at).getTime();
    return bTime - aTime;
  });

  const applyModerationAction = async (action: 'block' | 'mute' | 'report') => {
    const payload = parseMessagePayload(selectedNotification);
    if (!selectedNotification || !payload?.sender_id) return;

    const reason = prompt(
      action === 'report'
        ? 'Rapor notu (opsiyonel)'
        : action === 'mute'
          ? 'Sessize alma nedeni (opsiyonel)'
          : 'Engelleme nedeni (opsiyonel)',
      ''
    ) || '';

    const moderationPayload = {
      sender_id: payload.sender_id,
      sender_name: payload.sender_name || '',
      sender_email: payload.sender_email || '',
      action,
      reason,
      created_at: new Date().toISOString(),
      expires_at: action === 'mute' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      source_notification_id: selectedNotification.id,
    };

    await supabase.from('notifications').insert([
      {
        user_id: user.id,
        title: action === 'report' ? 'Mesaj raporlandı' : action === 'mute' ? 'Öğrenci sessize alındı' : 'Öğrenci engellendi',
        message: JSON.stringify(moderationPayload),
        type: action === 'report' ? 'report' : 'moderation',
      },
    ]);

    if (action !== 'report') {
      await supabase.from('notifications').insert([
        {
          user_id: payload.sender_id,
          title: action === 'mute' ? 'Mesaj gönderimi geçici kapatıldı' : 'Mesaj gönderiminiz engellendi',
          message: action === 'mute'
            ? '7 gün boyunca Uğur Hoca\'ya mesaj gönderemezsiniz.'
            : 'Mesaj gönderim hakkınız kaldırıldı.',
          type: 'message',
        },
      ]);
    }

    await loadData();
    alert(action === 'report' ? 'Mesaj raporlandı.' : action === 'mute' ? 'Öğrenci 7 gün sessize alındı.' : 'Öğrenci engellendi.');
  };

  const sendReply = async () => {
    const payload = parseMessagePayload(selectedNotification);
    if (!selectedNotification || !payload?.sender_id || !replyText.trim()) return;

    await supabase.from('notifications').insert([{ 
      user_id: payload.sender_id,
      title: 'Uğur Hoca cevapladı',
      message: replyText.trim(),
      type: 'message',
    }]);

    setReplyText('');
    alert('Cevap gönderildi.');
  };

  const deleteMessage = async (notificationId: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
    if (error) {
      alert('Mesaj silinemedi: ' + error.message);
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  if (!user) return null;

  return (
    <main className="admin-page min-h-screen gradient-bg pb-20">
      <FloatingShapes />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/10 py-3 px-4 sm:py-4 sm:px-6 shadow-lg shadow-black/20">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent leading-tight">
              Uğur Hoca Matematik
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <span className="hidden md:block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold">
              Admin Paneli
            </span>
            <button onClick={handleLogout} className="btn-secondary text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 right-4 left-4 sm:left-auto sm:w-[420px] z-50 max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div>
              <h3 className="text-white font-bold">Bildirimler</h3>
              <p className="text-slate-400 text-xs">Öğrenci mesajları ve istekler</p>
            </div>
            <span className="text-xs text-slate-400">{unreadNotifications.length} okunmamış</span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Henüz bildirim yok</p>
          ) : (
            <div className="divide-y divide-slate-700/70">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif)}
                  className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${notif.is_read ? 'bg-slate-800/40' : 'bg-indigo-500/10'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
                      {notif.type === 'message' ? <MessageSquareText className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white font-medium text-sm">{notif.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${notif.is_read ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
                          {notif.is_read ? 'Görüldü' : 'Yeni'}
                        </span>
                      </div>
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2 whitespace-pre-line">{getNotificationBody(notif)}</p>
                      <p className="text-slate-500 text-[11px] mt-2">{new Date(notif.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-700 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">Öğrenci Mesajı</p>
                  <h3 className="text-2xl font-bold text-white">{selectedNotification.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{new Date(selectedNotification.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteMessage(selectedNotification.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                  <button onClick={() => setSelectedNotification(null)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">{getNotificationBody(selectedNotification)}</p>
                {parseMessagePayload(selectedNotification)?.metadata && (
                  <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-300 space-y-1">
                    <p>IP: {parseMessagePayload(selectedNotification)?.metadata?.ip || 'unknown'}</p>
                    <p className="truncate">Cihaz: {parseMessagePayload(selectedNotification)?.metadata?.user_agent || 'unknown'}</p>
                    <p>Zaman: {new Date(parseMessagePayload(selectedNotification)?.created_at || selectedNotification.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                )}
                {parseMessagePayload(selectedNotification)?.sender_id && (
                  <div className="flex flex-wrap items-center gap-2">
                    {getSenderActionStatus(parseMessagePayload(selectedNotification)?.sender_id).blocked && (
                      <span className="px-2 py-1 rounded-full text-[11px] bg-red-500/20 text-red-300">Bu kullanıcı engelli</span>
                    )}
                    {getSenderActionStatus(parseMessagePayload(selectedNotification)?.sender_id).muted && (
                      <span className="px-2 py-1 rounded-full text-[11px] bg-amber-500/20 text-amber-300">
                        Sessizde (bitiş: {new Date(getSenderActionStatus(parseMessagePayload(selectedNotification)?.sender_id).expires_at).toLocaleDateString('tr-TR')})
                      </span>
                    )}
                  </div>
                )}
                {parseMessagePayload(selectedNotification)?.attachments?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">Ekler</p>
                    <div className="flex flex-wrap gap-2">
                      {parseMessagePayload(selectedNotification).attachments.map((file: any) => (
                        <a
                          key={file.url}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                        >
                          <Paperclip className="w-4 h-4" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNotification.type === 'message' && parseMessagePayload(selectedNotification)?.sender_id && (
                  <div className="space-y-3 pt-4 border-t border-slate-700">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyModerationAction('report')}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-700/60 px-3 py-2 text-slate-200 hover:bg-slate-700"
                      >
                        <Flag className="w-4 h-4" />
                        Raporla
                      </button>
                      <button
                        onClick={() => applyModerationAction('mute')}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-2 text-amber-300 hover:bg-amber-500/30"
                      >
                        <VolumeX className="w-4 h-4" />
                        7 Gün Sessize Al
                      </button>
                      <button
                        onClick={() => applyModerationAction('block')}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/30"
                      >
                        <Ban className="w-4 h-4" />
                        Engelle
                      </button>
                    </div>
                    <label className="block text-slate-300 text-sm">Cevap yaz</label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      placeholder="Öğrenciye cevap yaz..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={sendReply}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 sm:pt-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <Link href="/profil" className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4 text-sm sm:text-base">
              <ArrowLeft className="w-5 h-5" />
              Profil'e Dön
            </Link>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Admin Paneli</h1>
            <p className="text-slate-400 text-sm sm:text-base">Hoş geldiniz, Uğur Hoca!</p>
          </motion.div>

          <div className="sticky top-16 z-40 -mx-4 sm:mx-0 mb-6 sm:mb-8 px-4 sm:px-0 py-3 sm:py-0">
          <div className="flex flex-nowrap gap-1.5 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'statistics', label: 'İstatistikler', shortLabel: 'İstat.', icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
              { id: 'announcements', label: 'Duyurular', shortLabel: 'Duy.', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
              { id: 'documents', label: 'Belgeler', shortLabel: 'Bel.', icon: FileText, color: 'from-blue-500 to-cyan-500' },
              { id: 'writings', label: 'Yazılar', shortLabel: 'Yazı', icon: Edit3, color: 'from-purple-500 to-violet-500' },
              { id: 'users', label: 'Kullanıcılar', shortLabel: 'Kull.', icon: Users, color: 'from-green-500 to-emerald-500' },
              { id: 'privateStudents', label: 'Öğrencilerim', shortLabel: 'Öğr.', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
              { id: 'messages', label: 'Mesajlar', shortLabel: 'Msj.', icon: MessageSquareText, color: 'from-indigo-500 to-purple-500' },
              { id: 'gradeUpdate', label: 'Sınıf Güncelle', shortLabel: 'Sınıf', icon: RefreshCw, color: 'from-teal-500 to-cyan-500' },
              { id: 'assignments', label: 'Ödevlendirme', shortLabel: 'Ödev', icon: ClipboardList, color: 'from-rose-500 to-pink-500' },
              { id: 'quizzes', label: 'Testler', shortLabel: 'Test', icon: CheckCircle2, color: 'from-violet-500 to-purple-500' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative overflow-hidden px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2.5 transition-all whitespace-nowrap shrink-0 border shadow-md ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white border-white/20 shadow-${tab.color.includes('pink') ? 'pink' : tab.color.includes('blue') ? 'cyan' : tab.color.includes('green') ? 'emerald' : 'violet'}-500/30`
                    : `bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800/80`
                }`}
              >
                {activeTab === tab.id && <span className="absolute inset-0 bg-white/10 pointer-events-none" />}
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="relative font-semibold text-[11px] sm:text-sm">{activeTab === tab.id ? tab.label : tab.shortLabel}</span>
              </motion.button>
            ))}
            </div>
          </div>

          {activeTab !== 'statistics' && activeTab !== 'users' && activeTab !== 'gradeUpdate' && activeTab !== 'assignments' && activeTab !== 'quizzes' && (
            <div className="flex justify-stretch sm:justify-end mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal(activeTab === 'announcements' ? 'announcement' : activeTab === 'documents' ? 'document' : 'writing')}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Yeni Ekle
              </motion.button>
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="flex justify-stretch sm:justify-end mb-6 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('quiz')}
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Yeni Test
              </motion.button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminStatistics />
              </motion.div>
            )}

            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Duyurular & Bildirim Panosu</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Öğrencilerinize göndereceğiniz haberleri yönetin</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal('announcement')}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Megaphone className="w-5 h-5" />
                    Yeni Duyuru Ekle
                  </motion.button>
                </div>

                {announcements.length === 0 ? (
                  <div className="glass rounded-3xl p-12 sm:p-16 text-center border border-white/5">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Megaphone className="w-12 h-12 text-blue-400/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Henüz Duyuru Yok</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Sistemde yayınlanan hiçbir bildirim/duyuru bulunmuyor. Yeni bir duyuru ekleyerek öğrencilerinizi bilgilendirebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((announcement, i) => (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass relative rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-white/5 flex flex-col h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80"
                      >
                        {/* Status Label */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 backdrop-blur-md rounded-full text-blue-300 text-xs font-bold shadow-lg flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            Yayında
                          </span>
                        </div>

                        {/* Image Gallery veya Placeholder */}
                        <div className="h-48 relative overflow-hidden bg-slate-900">
                          {announcement.image_urls?.length || announcement.image_url ? (
                            <div className="absolute inset-0">
                              <AnnouncementGallery
                                images={announcement.image_urls?.length ? announcement.image_urls : [announcement.image_url as string]}
                                title={announcement.title}
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                              <Megaphone className="w-16 h-16 text-slate-700/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {formatDate(announcement.created_at)}
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{announcement.title}</h3>
                          
                          <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                            {announcement.content}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                            <button
                              onClick={() => {
                                setEditingAnnouncement(announcement);
                                setFormData({
                                  title: announcement.title,
                                  description: announcement.content,
                                  image_urls: (announcement.image_urls?.length ? announcement.image_urls : announcement.image_url ? [announcement.image_url] : []).join('\n'),
                                  image_url: announcement.image_url || '',
                                  link_url: announcement.link_url || '',
                                });
                                setModalType('editAnnouncement');
                                setShowModal(true);
                              }}
                              className="flex-1 py-2.5 bg-slate-800/50 text-blue-400 hover:bg-slate-700 hover:text-blue-300 rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-slate-700"
                            >
                              <Edit3 className="w-4 h-4" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteItem('announcement', announcement.id)}
                              className="flex-1 py-2.5 bg-slate-800/50 text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-xl transition-colors font-medium text-sm flex items-center justify-center gap-2 border border-slate-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Kaldır
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
                      if (!confirm('Eski içeriklerin kategori türlerini güncellemek istediğinize emin misiniz?\n\n• worksheet → Yaprak Test\n• test → Sınav\n• game → Oyunlar\n• document → Yaprak Test\n• writing → Ders Notları\n• ders-notuari-kitaplar → Ders Notları\n• deneme → Deneme')) return;
                      
                      const updates = [
                        { old: 'worksheet', new: 'yaprak-test' },
                        { old: 'document', new: 'yaprak-test' },
                        { old: 'test', new: 'sinav' },
                        { old: 'game', new: 'oyunlar' },
                        { old: 'writing', new: 'ders-notlari' },
                        { old: 'ders-notuari-kitaplar', new: 'ders-notlari' },
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
                      'ders-notlari': 'from-blue-500 to-cyan-500',
                      'kitaplar': 'from-indigo-500 to-violet-500',
                      'yaprak-test': 'from-purple-500 to-pink-500',
                      'ders-videolari': 'from-red-500 to-orange-500',
                      'deneme': 'from-green-500 to-emerald-500',
                      'sinav': 'from-teal-500 to-cyan-500',
                      'oyunlar': 'from-yellow-500 to-amber-500',
                      'programlar': 'from-pink-500 to-rose-500',
                      'worksheet': 'from-purple-500 to-pink-500',
                      'test': 'from-teal-500 to-cyan-500',
                      'game': 'from-yellow-500 to-amber-500',
                      'ders-notuari-kitaplar': 'from-green-500 to-emerald-500',
                    };
                    const typeLabels: Record<string, string> = {
                      'ders-notlari': 'Ders Notları',
                      'kitaplar': 'Kitaplar',
                      'yaprak-test': 'Yaprak Test',
                      'ders-videolari': 'Ders Videoları',
                      'deneme': 'Deneme',
                      'sinav': 'Sınav',
                      'oyunlar': 'Oyun',
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
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-xl font-bold text-white relative">
                            {u.name?.[0] || '?'}
                            {u.is_private_student && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-[var(--bg-elevated)] shadow-sm">
                                <Star className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{u.name || 'İsimsiz'}</h3>
                            <p className="text-slate-400 text-sm">{u.email}</p>
                            <p className="text-slate-500 text-xs mt-1">Sınıf: {u.grade || 'Belirtilmemiş'} • Kayıt: {u.created_at ? formatDate(u.created_at) : 'Bilinmiyor'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            onClick={() => togglePrivateStudent(u.id, u.is_private_student || false)}
                            className={`px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg transition-all font-semibold flex items-center gap-2 ${
                              u.is_private_student 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${u.is_private_student ? 'fill-amber-500' : ''}`} />
                            <span className="hidden sm:inline">
                              {u.is_private_student ? 'Özel Dersten Çıkar' : 'Özel Derse Ekle'}
                            </span>
                          </button>
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
                        <button
                          onClick={() => {
                            setAdminMsgRecipient(u);
                            setAdminMsgTitle('');
                            setAdminMsgText('');
                            setModalType('adminMessage');
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-lg hover:from-purple-500/40 hover:to-pink-500/40 transition-all font-semibold flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Mesaj Yaz
                        </button>
                      </div>
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
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Özel Ders Öğrencilerim</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Bireysel öğrencilerinizi ve ödevlerini yönetin</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal('student')}
                    className="btn-primary w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    Yeni Öğrenci Ekle
                  </motion.button>
                </div>

                {privateStudents.length === 0 ? (
                  <div className="glass rounded-2xl p-8 sm:p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400 mb-4">Henüz özel ders öğrenciniz yok</p>
                    <p className="text-slate-500 text-sm">Öğrenci eklemek için profil sayfasından "Özel Ders Öğrencisi" seçeneğini kullanın</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                            <div className="p-4 sm:p-6">
                             <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white">
                                 {student.name?.[0] || '?'}
                               </div>
                               <div>
                                 <h3 className="text-lg font-bold text-white">{student.name || 'İsimsiz'}</h3>
                                 <p className="text-slate-400 text-sm break-all">{student.email}</p>
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

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Sohbetler</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Öğrencilerle yapılan canlı sohbetler</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MessageSquareText className="w-4 h-4" />
                    {chatRooms.length} aktif oda
                  </div>
                </div>

                {chatRooms.length === 0 ? (
                  <div className="glass rounded-2xl p-8 sm:p-12 text-center">
                    <MessageSquareText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz sohbet başlatılmadı</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Odalar Listesi */}
                    <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {chatRooms.map((room) => {
                        const isActive = activeChatRoom?.id === room.id;
                        const studentName = room.name || 'Öğrenci';
                        
                        return (
                          <button
                            key={room.id}
                            onClick={() => {
                              setActiveChatRoom(room);
                              loadChatMessages(room.id);
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                              isActive 
                                ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                                : 'glass border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{studentName}</p>
                                <p className="text-[10px] text-slate-500">{new Date(room.updated_at).toLocaleString('tr-TR')}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Mesajlasma Alani */}
                    <div className="lg:col-span-2 flex flex-col h-[600px] glass rounded-2xl overflow-hidden border border-white/5">
                      {activeChatRoom ? (
                        <>
                          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                {activeChatRoom.name?.[0] || 'Ö'}
                              </div>
                              <span className="text-white font-semibold text-sm">{activeChatRoom.name}</span>
                            </div>
                            <button onClick={async () => {
                                if (confirm('Bu odayı silmek istediğinizden emin misiniz?')) {
                                  await supabase.from('chat_rooms').delete().eq('id', activeChatRoom.id);
                                  setActiveChatRoom(null);
                                  loadData();
                                }
                              }} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((msg: any) => {
                              const isAdmin = msg.sender_tc === 'admin';
                              return (
                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    isAdmin 
                                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                                      : 'bg-slate-800 text-slate-300 rounded-tl-none border border-white/5'
                                  }`}>
                                    {!isAdmin && <p className="text-[10px] font-bold text-indigo-400 mb-1">{msg.display_name}</p>}
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-white/60' : 'text-slate-500'}`}>
                                      {new Date(msg.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="p-4 bg-slate-900/50 border-t border-white/10">
                            <div className="flex gap-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendChatMessage(activeChatRoom.id, replyText);
                                  }
                                }}
                                placeholder="Mesajınızı yazın..."
                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-10 resize-none"
                              />
                              <button
                                onClick={() => sendChatMessage(activeChatRoom.id, replyText)}
                                className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-colors"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                          <MessageSquareText className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-sm">Konuşma seçmek için soldan bir oda seçin</p>
                        </div>
                      )}
                    </div>
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
                    <p className="text-slate-400 text-sm sm:text-base">Belge gönder veya ödev ver</p>
                  </div>
                   <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openModal('sendDoc')}
                       className="btn-primary w-full sm:w-auto justify-center"
                    >
                      <Send className="w-5 h-5" />
                      Belge Gönder
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openModal('assignment')}
                       className="btn-primary w-full sm:w-auto justify-center"
                    >
                      <Plus className="w-5 h-5" />
                      Ödev Ver
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="glass rounded-2xl p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5 text-rose-400" />
                      Gönderilen Belgeler
                    </h3>
                    {sharedDocs.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Henüz belge gönderilmedi</p>
                    ) : (
                      <div className="space-y-3">
                        {sharedDocs.map(doc => (
                          <div key={doc.id} className="bg-slate-800/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-rose-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium break-words">{doc.document_title}</p>
                                <p className="text-slate-400 text-sm break-all">{doc.student_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
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

                  <div className="glass rounded-2xl p-4 sm:p-6">
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div>
                                <p className="text-white font-medium break-words">{asmt.title}</p>
                                <p className="text-[10px] text-slate-500">
                                  {asmt.grade ? `${asmt.grade}. Sınıf` : 'Özel'} • 
                                  Son: {asmt.due_date ? new Date(asmt.due_date).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button 
                                  onClick={() => {
                                    setActiveAssignment(asmt);
                                    loadSubmissions(asmt.id);
                                    setShowSubmissionsModal(true);
                                  }}
                                  className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded hover:bg-indigo-500/30 transition-colors"
                                >
                                  Teslimatlar
                                </button>
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
                            <p className="text-slate-400 text-sm line-clamp-2">{asmt.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quizzes' && (
              <motion.div
                key="quizzes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Testler</h2>
                  <p className="text-slate-400 text-sm sm:text-base">Matematik testlerini yönet</p>
                </div>

                {quizzes.length === 0 ? (
                  <div className="glass rounded-2xl p-8 sm:p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Henüz test yok</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map((quiz: any) => (
                      <div key={quiz.id} className="glass rounded-2xl p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{quiz.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{quiz.grade}. Sınıf</span>
                              <span>•</span>
                              <span>{quiz.difficulty}</span>
                              <span>•</span>
                              <span>{quiz.time_limit} dk</span>
                            </div>
                          </div>
                          {!quiz.is_active && (
                            <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs">Pasif</span>
                          )}
                        </div>
                        {quiz.description && (
                          <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setFormData(quiz);
                              openModal('editQuiz');
                            }}
                            className="flex-1 py-2 bg-slate-700/50 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                          >
                            Düzenle
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              loadQuizQuestions(quiz.id);
                              openModal('addQuestion');
                            }}
                            className="flex-1 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors"
                          >
                            Soru Ekle
                          </motion.button>
                          <button
                            onClick={() => deleteItem('quiz', quiz.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
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
                  {modalType === 'announcement' ? 'Yeni Duyuru' : modalType === 'editAnnouncement' ? 'Duyuru Düzenle' : modalType === 'document' ? 'Yeni Belge' : modalType === 'editDocument' ? 'Belge Düzenle' : modalType === 'assignment' ? 'Yeni Ödev' : modalType === 'student' ? 'Yeni Öğrenci' : modalType === 'editUser' ? 'Kullanıcı Düzenle' : modalType === 'sendDoc' ? 'Belge Gönder' : modalType === 'adminMessage' ? 'Öğrenciye Mesaj Yaz' : modalType === 'quiz' ? 'Yeni Test' : modalType === 'editQuiz' ? 'Test Düzenle' : modalType === 'addQuestion' ? 'Soru Ekle' : 'Yeni Yazı'}
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
              ) : modalType === 'adminMessage' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adminMsgRecipient) return;
                  setIsSubmitting(true);
                  try {
                    await fetch('/api/admin-message', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        student_id: adminMsgRecipient.id,
                        student_name: adminMsgRecipient.name,
                        title: adminMsgTitle || 'Uğur Hoca\'dan Mesaj',
                        message: adminMsgText,
                        image_url: adminMsgImageUrl || null,
                        sender_id: 'admin',
                        sender_name: 'Uğur Hoca',
                      }),
                    });
                    setSuccess(true);
                    setTimeout(() => {
                      setShowModal(false);
                      setSuccess(false);
                      setAdminMsgRecipient(null);
                      setAdminMsgTitle('');
                      setAdminMsgText('');
                      setAdminMsgImageUrl('');
                      setAdminMsgImagePreview(null);
                    }, 1500);
                  } catch {
                    alert('Mesaj gönderilemedi.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-5">
                  {adminMsgRecipient && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
                        {adminMsgRecipient.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{adminMsgRecipient.name || 'İsimsiz'}</p>
                        <p className="text-slate-400 text-xs">{adminMsgRecipient.email}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Başlık</label>
                    <input
                      type="text"
                      value={adminMsgTitle}
                      onChange={(e) => setAdminMsgTitle(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Mesaj başlığı..."
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Resim (Opsiyonel)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const fileName = `admin_msg_${Date.now()}_${file.name}`;
                            const { data, error } = await supabase.storage
                              .from('documents')
                              .upload(fileName, file);
                            
                            if (!error && data) {
                              const { data: urlData } = supabase.storage
                                .from('documents')
                                .getPublicUrl(fileName);
                              setAdminMsgImageUrl(urlData.publicUrl);
                              setAdminMsgImagePreview(URL.createObjectURL(file));
                            }
                          }
                        }}
                        className="hidden"
                        id="admin-msg-image"
                      />
                      <label 
                        htmlFor="admin-msg-image"
                        className="flex items-center justify-center gap-2 w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-xl px-4 py-4 text-slate-400 cursor-pointer hover:bg-slate-800 hover:border-purple-500 transition-colors"
                      >
                        <Image className="w-5 h-5" />
                        <span>Resim seç veya sürükle</span>
                      </label>
                    </div>
                    {adminMsgImagePreview && (
                      <div className="mt-3 relative inline-block">
                        <img 
                          src={adminMsgImagePreview} 
                          alt="Önizleme" 
                          className="max-h-32 rounded-lg border border-white/10"
                        />
                        <button
                          onClick={() => {
                            setAdminMsgImageUrl('');
                            setAdminMsgImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Mesaj</label>
                    <textarea
                      required
                      value={adminMsgText}
                      onChange={(e) => setAdminMsgText(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder="Öğrenciye mesajınızı yazın..."
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || !adminMsgText.trim()}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
                      answer_key_text: formData.answer_key_text || null,
                      solution_url: formData.solution_url || null,
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
                      <option value="kitaplar">Kitaplar</option>
                      <option value="yaprak-test">Yaprak Test</option>
                      <option value="ders-videolari">Ders Videoları</option>
                      <option value="deneme">Deneme</option>
                      <option value="sinav">Sınav</option>
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
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Cevap Anahtarı (Metin)</label>
                    <textarea
                      value={formData.answer_key_text || ''}
                      onChange={(e) => setFormData({ ...formData, answer_key_text: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-green-500 transition-colors resize-none"
                      placeholder="Cevap anahtarını buraya yazın... (opsiyonel)"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">Çözüm PDF (Drive Link)</label>
                    <input
                      type="url"
                      value={formData.solution_url || ''}
                      onChange={(e) => setFormData({ ...formData, solution_url: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                               focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="https://drive.google.com/... (çözümlü PDF varsa)"
                    />
                    {formData.solution_url && (
                      <p className="text-green-400 text-xs mt-1">ÇÖZÜMLÜ badge'i otomatik eklenecek</p>
                    )}
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
                    name_normalized: normalizeFullNameForMatch(String(formData.name ?? '')),
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Öğrenci (Özel)</label>
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="">İsteğe bağlı seçim</option>
                          {privateStudents.map(s => (
                            <option key={s.id} value={s.id}>{s.name || s.email}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Sınıf (Genel)</label>
                        <select
                          value={formData.grade || ''}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-purple-500 transition-colors"
                        >
                          <option value="">Sınıf seçin</option>
                          {[5,6,7,8,9,10,11,12].map(g => (
                            <option key={g} value={g}>{g}. Sınıf</option>
                          ))}
                          <option value="Mezun">Mezun</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-300 mb-2 text-sm">Teslim Tarihi</label>
                        <input
                          type="datetime-local"
                          value={formData.due_date || ''}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
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
                        <option value="kitaplar">Kitaplar</option>
                        <option value="yaprak-test">Yaprak Test</option>
                        <option value="ders-videolari">Ders Videoları</option>
                        <option value="deneme">Deneme</option>
                        <option value="sinav">Sınav</option>
                        <option value="programlar">Programlar</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm">
                      {modalType === 'announcement' || modalType === 'editAnnouncement' ? 'Duyuru İçeriği' : modalType === 'document' ? 'Belge Açıklaması' : modalType === 'assignment' ? 'Ödev Detayları' : modalType === 'quiz' || modalType === 'editQuiz' ? 'Test Açıklaması' : 'Yazı İçeriği'}
                    </label>
                    <textarea
                      required={modalType !== 'quiz' && modalType !== 'editQuiz'}
                      rows={modalType === 'document' || modalType === 'assignment' || modalType === 'quiz' || modalType === 'editQuiz' ? 3 : 6}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                               focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder={modalType === 'document' ? 'Belge hakkında bilgi...' : modalType === 'assignment' ? 'Hangi sayfalar / kaynaklar yapılacak?' : modalType === 'quiz' || modalType === 'editQuiz' ? 'Test hakkında bilgi...' : 'İçeriği buraya yazın...'}
                    />
                  </div>

                  {modalType === 'quiz' || modalType === 'editQuiz' ? (
                    <>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Sınıf</label>
                        <select
                          required
                          value={formData.grade || ''}
                          onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                                   focus:outline-none focus:border-violet-500 transition-colors"
                        >
                          <option value="">Sınıf seçin</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                            <option key={grade} value={grade}>{grade}. Sınıf</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Süre (Dakika)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.time_limit || ''}
                          onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                                   focus:outline-none focus:border-violet-500 transition-colors"
                          placeholder="Örn: 15"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Zorluk Seviyesi</label>
                        <select
                          required
                          value={formData.difficulty || ''}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                                   focus:outline-none focus:border-violet-500 transition-colors"
                        >
                          <option value="">Zorluk seçin</option>
                          <option value="Kolay">Kolay</option>
                          <option value="Orta">Orta</option>
                          <option value="Zor">Zor</option>
                        </select>
                      </div>
                      {modalType === 'editQuiz' && (
                        <div>
                          <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active || false}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            Aktif
                          </label>
                        </div>
                      )}
                    </>
                  ) : null}

                  {modalType === 'addQuestion' && (
                    <>
                      <div>
                        <label className="block text-slate-300 mb-2 font-bold uppercase tracking-wider text-xs">Soru Metni</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.question || ''}
                          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-4 text-white
                                   focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none shadow-inner"
                          placeholder="Soruyu buraya yazın..."
                        />
                      </div>
                      
                      {/* Şıklar - Modern UX */}
                      <div>
                        <label className="block text-slate-300 mb-3 font-bold uppercase tracking-wider text-xs">Şıklar ve Doğru Cevap</label>
                        <div className="space-y-3">
                          {[0, 1, 2, 3].map((index) => {
                            const optionLetters = ['A', 'B', 'C', 'D'];
                            const isCorrect = formData.correct_index === index;
                            
                            return (
                              <div key={index} className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-800/30'}`}>
                                <div className="pl-3 pr-1">
                                  <input 
                                    type="radio" 
                                    name="correct_option" 
                                    checked={isCorrect}
                                    onChange={() => setFormData({ ...formData, correct_index: index })}
                                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                    required
                                  />
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-300'}`}>
                                  {optionLetters[index]}
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={formData.options?.[index] || ''}
                                  onChange={(e) => {
                                    const newOptions = [...(formData.options || ['', '', '', ''])];
                                    newOptions[index] = e.target.value;
                                    setFormData({ ...formData, options: newOptions });
                                  }}
                                  className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 text-sm py-2"
                                  placeholder={`${optionLetters[index]} Şıkkını girin...`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-amber-500 mb-2 font-bold uppercase tracking-wider text-xs flex items-center gap-1 mt-4">
                          <AlertCircle className="w-3.5 h-3.5" /> Çözüm / Açıklama (Opsiyonel)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.explanation || ''}
                          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-white
                                   focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                          placeholder="Öğrenci soruyu yanlış yaptığında göreceği açıklama..."
                        />
                      </div>
                    </>
                  )}

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
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Cevap Anahtarı (Metin)</label>
                        <textarea
                          value={formData.answer_key_text || ''}
                          onChange={(e) => setFormData({ ...formData, answer_key_text: e.target.value })}
                          rows={3}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-green-500 transition-colors resize-none"
                          placeholder="Cevap anahtarını buraya yazın... (opsiyonel)"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm">Çözüm PDF (Drive Link)</label>
                        <input
                          type="url"
                          value={formData.solution_url || ''}
                          onChange={(e) => setFormData({ ...formData, solution_url: e.target.value })}
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                                   focus:outline-none focus:border-green-500 transition-colors"
                          placeholder="https://drive.google.com/... (çözümlü PDF varsa)"
                        />
                        {formData.solution_url && (
                          <p className="text-green-400 text-xs mt-1">ÇÖZÜMLÜ badge'i otomatik eklenecek</p>
                        )}
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
                            <label key={grade} className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10 min-w-[calc(50%-0.25rem)] sm:min-w-0">
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
                          <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer hover:bg-white/10 min-w-[calc(50%-0.25rem)] sm:min-w-0">
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

      {/* Ödev Teslimatları Modalı */}
      <AnimatePresence>
          {showSubmissionsModal && activeAssignment && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSubmissionsModal(false)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] glass rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white leading-tight">{activeAssignment.title}</h2>
                      <p className="text-slate-400 text-sm">Teslim Edilen Ödevler ({selectedAssignmentSubmissions.length})</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSubmissionsModal(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {selectedAssignmentSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">Henüz teslimat yapılmadı</p>
                    </div>
                  ) : (
                    selectedAssignmentSubmissions.map((sub: any) => (
                      <div key={sub.id} className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white">
                              {sub.student_name?.[0] || 'Ö'}
                            </div>
                            <div>
                              <p className="text-white font-bold">{sub.student_name}</p>
                              <p className="text-slate-500 text-[10px]">{new Date(sub.submitted_at).toLocaleString('tr-TR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <a 
                              href={sub.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                            >
                              <FileText className="w-4 h-4" />
                              Dosyayı İncele
                            </a>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              sub.status === 'reviewed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {sub.status === 'reviewed' ? `Puan: ${sub.grade}` : 'Bekliyor'}
                            </span>
                          </div>
                        </div>

                        {sub.comment && (
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Öğrenci Notu</p>
                            <p className="text-sm text-slate-300 italic">"{sub.comment}"</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2 items-start sm:items-center">
                          <div className="flex-1 w-full relative">
                            <input
                              type="text"
                              placeholder="Geri bildirim yazın..."
                              defaultValue={sub.feedback || ''}
                              id={`feedback-${sub.id}`}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <MessageSquareText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {/* Star Rating Section */}
                            <div className="flex items-center justify-center p-2 bg-slate-800 border border-slate-700 rounded-xl">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const currentGradeObj = document.getElementById(`grade-${sub.id}`) as HTMLInputElement;
                                const currentGrade = currentGradeObj ? parseInt(currentGradeObj.value) || 0 : sub.grade || 0;
                                const isFilled = currentGrade >= star * 20;
                                
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const gradeInput = document.getElementById(`grade-${sub.id}`) as HTMLInputElement;
                                      if (gradeInput) gradeInput.value = (star * 20).toString();
                                      // Trigger re-render of stars manually or let React handle if we bound it to state
                                      // For now simple dom update approach:
                                      e.currentTarget.parentElement?.querySelectorAll('svg').forEach((svg, i) => {
                                         if (i < star) {
                                           svg.classList.add('text-amber-400', 'fill-amber-400');
                                           svg.classList.remove('text-slate-600');
                                         } else {
                                           svg.classList.remove('text-amber-400', 'fill-amber-400');
                                           svg.classList.add('text-slate-600');
                                         }
                                      });
                                    }}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star className={`w-5 h-5 transition-colors ${
                                      isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                    }`} />
                                  </button>
                                );
                              })}
                            </div>
                            
                            <input
                              type="number"
                              placeholder="Not"
                              max="100"
                              min="0"
                              defaultValue={sub.grade || 100}
                              id={`grade-${sub.id}`}
                              className="w-full sm:w-20 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-center text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            
                            <button
                              onClick={() => {
                                const fb = (document.getElementById(`feedback-${sub.id}`) as HTMLInputElement)?.value;
                                const gr = (document.getElementById(`grade-${sub.id}`) as HTMLInputElement)?.value;
                                updateSubmission(sub.id, parseInt(gr), fb);
                              }}
                              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Puanla
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
}
