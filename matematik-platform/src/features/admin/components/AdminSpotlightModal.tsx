'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  CheckCircle2,
  FileText,
  Video,
  X,
  Sparkles,
  Command,
  ArrowRight,
  ClipboardList,
  Megaphone,
  Send,
} from 'lucide-react';
import type {
  AdminActiveTab,
  AdminDocument,
  AdminQuiz,
  AdminUser,
} from '@/features/admin/types';
import type { LiveLesson } from '@/features/live-lessons/types';

export type AdminSpotlightModalProps = {
  isOpen: boolean;
  onClose: () => void;
  students: AdminUser[];
  quizzes: AdminQuiz[];
  documents: AdminDocument[];
  liveLessons: LiveLesson[];
  onSelectStudent: (student: AdminUser) => void;
  onSelectTab: (tab: AdminActiveTab) => void;
  onOpenModal: (modal: 'announcement' | 'document' | 'assignment' | 'quiz') => void;
  onOpenBroadcast?: () => void;
};

export default function AdminSpotlightModal({
  isOpen,
  onClose,
  students,
  quizzes,
  documents,
  liveLessons,
  onSelectStudent,
  onSelectTab,
  onOpenModal,
  onOpenBroadcast,
}: AdminSpotlightModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Escape handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');

  const filteredStudents = useMemo(() => {
    if (!normalizedQuery) return [];
    return students
      .filter((s) => !s.isAdmin)
      .filter(
        (s) =>
          (s.name || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          (s.email || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          String(s.grade).includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [normalizedQuery, students]);

  const filteredQuizzes = useMemo(() => {
    if (!normalizedQuery) return [];
    return quizzes
      .filter(
        (q) =>
          (q.title || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          (q.description || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          String(q.grade).includes(normalizedQuery),
      )
      .slice(0, 4);
  }, [normalizedQuery, quizzes]);

  const filteredDocuments = useMemo(() => {
    if (!normalizedQuery) return [];
    return documents
      .filter(
        (d) =>
          (d.title || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          (d.type || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery),
      )
      .slice(0, 4);
  }, [normalizedQuery, documents]);

  const filteredLessons = useMemo(() => {
    if (!normalizedQuery) return [];
    return liveLessons
      .filter(
        (l) =>
          (l.title || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery) ||
          (l.target_grade || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery),
      )
      .slice(0, 3);
  }, [normalizedQuery, liveLessons]);

  const quickActions = useMemo(
    () => [
      {
        id: 'new-quiz',
        title: 'Yeni Test Ekle',
        icon: CheckCircle2,
        category: 'Eylem',
        onClick: () => {
          onClose();
          onOpenModal('quiz');
        },
      },
      {
        id: 'new-assignment',
        title: 'Ödev Ver',
        icon: ClipboardList,
        category: 'Eylem',
        onClick: () => {
          onClose();
          onOpenModal('assignment');
        },
      },
      {
        id: 'new-announcement',
        title: 'Duyuru Yayınla',
        icon: Megaphone,
        category: 'Eylem',
        onClick: () => {
          onClose();
          onOpenModal('announcement');
        },
      },
      {
        id: 'new-broadcast',
        title: 'Sınıfa Toplu Bildirim Gönder',
        icon: Send,
        category: 'Eylem',
        onClick: () => {
          onClose();
          if (onOpenBroadcast) {
            onOpenBroadcast();
          } else {
            onOpenModal('announcement');
          }
        },
      },
      {
        id: 'goto-tracking',
        title: 'Takip Merkezine Git',
        icon: ArrowRight,
        category: 'Sekme',
        onClick: () => {
          onClose();
          onSelectTab('tracking');
        },
      },
      {
        id: 'goto-live-lessons',
        title: 'Canlı Derslere Git',
        icon: Video,
        category: 'Sekme',
        onClick: () => {
          onClose();
          onSelectTab('liveLessons');
        },
      },
    ],
    [onClose, onOpenBroadcast, onOpenModal, onSelectTab],
  );

  const filteredQuickActions = useMemo(() => {
    if (!normalizedQuery) return quickActions;
    return quickActions.filter((a) =>
      a.title.toLocaleLowerCase('tr-TR').includes(normalizedQuery),
    );
  }, [normalizedQuery, quickActions]);

  const totalResults =
    filteredStudents.length +
    filteredQuizzes.length +
    filteredDocuments.length +
    filteredLessons.length +
    filteredQuickActions.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          role="dialog"
          aria-modal="true"
          aria-label="Admin Spotlight Evrensel Arama"
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/80"
        >
          {/* Arama Input Çubuğu */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-slate-950/60">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Öğrenci, test, çalışma kağıdı veya işlem ara..."
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
                title="Temizle"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              <Command className="h-3 w-3" /> ESC
            </kbd>
          </div>

          {/* Sonuç Listesi */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {/* Öğrenciler */}
            {filteredStudents.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <User className="h-3.5 w-3.5" />
                  <span>Öğrenciler</span>
                </div>
                <div className="space-y-1">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectStudent(student);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5 group"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                          {(student.name || student.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {student.name || 'İsimsiz Öğrenci'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                        {student.grade === 'Mezun' ? 'Mezun' : `${student.grade}. Sınıf`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Testler */}
            {filteredQuizzes.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-violet-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Testler</span>
                </div>
                <div className="space-y-1">
                  {filteredQuizzes.map((quiz) => (
                    <button
                      key={quiz.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectTab('quizzes');
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{quiz.difficulty || 'Normal'}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-violet-500/20 text-violet-300 px-2.5 py-0.5 text-[11px] font-medium">
                        {String(quiz.grade) === 'Mezun' ? 'Mezun' : `${quiz.grade}. Sınıf`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Belgeler / İçerikler */}
            {filteredDocuments.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Belgeler & Çalışma Kağıtları</span>
                </div>
                <div className="space-y-1">
                  {filteredDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectTab('documents');
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                          {doc.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{doc.type || 'Doküman'}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-[11px] font-medium">
                        Aç
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Canlı Dersler */}
            {filteredLessons.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  <Video className="h-3.5 w-3.5" />
                  <span>Canlı Dersler</span>
                </div>
                <div className="space-y-1">
                  {filteredLessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectTab('liveLessons');
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          Hedef: {lesson.target_grade === 'all' ? 'Herkese açık' : `${lesson.target_grade}. sınıf`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-sky-500/20 text-sky-300 px-2.5 py-0.5 text-[11px] font-medium">
                        {lesson.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hızlı İşlemler */}
            {filteredQuickActions.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Hızlı Eylemler & Kısayollar</span>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {filteredQuickActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={action.onClick}
                        className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-left transition hover:bg-white/10 group"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                          <ActionIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                          {action.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                "{query}" ile eşleşen öğrenci, test veya içerik bulunamadı.
              </div>
            )}
          </div>

          {/* Alt Kısayol Bilgilendirmesi */}
          <div className="border-t border-white/10 px-4 py-2.5 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Seçmek veya sekmeye gitmek için bir sonuca tıklayın</span>
            <span>Kapatmak için ESC</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
