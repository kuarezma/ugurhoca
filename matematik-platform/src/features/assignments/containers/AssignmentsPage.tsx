'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/components/ThemeProvider';
import { requireClientSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/error-utils';
import { createLogger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

const log = createLogger('assignments-page');
import type { AppUser, Assignment, Submission } from '@/types';

const AssignmentSubmissionModal = dynamic(
  () =>
    import('@/features/assignments/components/AssignmentSubmissionModal').then(
      (m) => ({ default: m.AssignmentSubmissionModal }),
    ),
  { ssr: false },
);

type AssignmentsPageProps = {
  initialAssignments?: Assignment[];
  initialSubmissions?: Record<string, Submission>;
  initialUser?: AppUser | null;
  isHydrated?: boolean;
};

export default function OdevlerPage({
  initialAssignments = [],
  initialSubmissions = {},
  initialUser = null,
  isHydrated = false,
}: AssignmentsPageProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const isLight = theme === 'light';
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [loading, setLoading] = useState(!isHydrated);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    initialSubmissions,
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [comment, setComment] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const initialUserKey = useMemo(
    () =>
      initialUser ? `${initialUser.id}:${String(initialUser.grade)}` : null,
    [initialUser],
  );

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
      const session = await requireClientSession({ router });
      if (!session) {
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const resolvedUser = { ...profile, email: session.user.email };
        setUser(resolvedUser);

        if (
          isHydrated &&
          `${resolvedUser.id}:${String(resolvedUser.grade)}` === initialUserKey
        ) {
          setLoading(false);
          return;
        }

        const [assignmentsRes, submissionsRes] = await Promise.all([
          supabase
            .from('assignments')
            .select('*')
            .or(`grade.eq.${profile.grade},student_id.eq.${profile.id}`)
            .order('created_at', { ascending: false }),
          supabase
            .from('assignment_submissions')
            .select('*')
            .eq('student_id', profile.id),
        ]);

        if (assignmentsRes.data) setAssignments(assignmentsRes.data);
        if (submissionsRes.data) {
          const subsMap: Record<string, Submission> = {};
          submissionsRes.data.forEach((sub) => {
            subsMap[sub.assignment_id] = sub;
          });
          setSubmissions(subsMap);
        }
      } else {
        const fallbackUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Öğrenci',
          email: session.user.email ?? '',
          grade: session.user.user_metadata?.grade ?? 5,
        };

        setUser(fallbackUser);

        if (
          isHydrated &&
          `${fallbackUser.id}:${String(fallbackUser.grade)}` === initialUserKey
        ) {
          setLoading(false);
          return;
        }

        const [assignmentsRes, submissionsRes] = await Promise.all([
          supabase
            .from('assignments')
            .select('*')
            .or(`grade.eq.${fallbackUser.grade},student_id.eq.${fallbackUser.id}`)
            .order('created_at', { ascending: false }),
          supabase
            .from('assignment_submissions')
            .select('*')
            .eq('student_id', fallbackUser.id),
        ]);

        if (assignmentsRes.data) setAssignments(assignmentsRes.data);
        if (submissionsRes.data) {
          const subsMap: Record<string, Submission> = {};
          submissionsRes.data.forEach((sub) => {
            subsMap[sub.assignment_id] = sub;
          });
          setSubmissions(subsMap);
        }
      }
      setLoading(false);
    };

    fetchUserAndAssignments();
  }, [initialUserKey, isHydrated, router]);

  const handleFileUpload = async (assignmentId: string, file: File) => {
    if (!user) return;
    
    // Güvenlik kontrolleri
    if (file.size > 5 * 1024 * 1024) {
      showToast('warning', "Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('warning', 'Sadece PDF ve Görsel (JPG, PNG) dosyaları yüklenebilir.');
      return;
    }

    setUploading(assignmentId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${assignmentId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Fake progress animation for better UX
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev && prev < 90 ? prev + Math.random() * 15 : prev);
      }, 300);

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      clearInterval(progressInterval);
      if (uploadError) throw uploadError;
      
      setUploadProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      const { data: submissionData, error: dbError } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          student_id: user.id,
          student_name: user.name,
          file_url: publicUrl,
          comment: comment
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setTimeout(() => {
        setSubmissions(prev => ({ ...prev, [assignmentId]: submissionData }));
        setSelectedAssignment(null);
        setComment('');
        setUploadProgress(null);
        showToast('success', 'Ödev başarıyla yüklendi.');
      }, 500);
      
    } catch (error) {
      log.error('Yükleme hatası', error);
      showToast(
        'error',
        `Ödev yüklenirken bir hata oluştu: ${getErrorMessage(error)}`,
      );
      setUploadProgress(null);
    } finally {
      setUploading(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, assignmentId: string) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (uploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(assignmentId, file);
  };

  if (loading) {
    return (
      <main className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-slate-900'} pb-20`}>
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6" aria-busy="true" aria-live="polite">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 border space-y-4 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" rounded="full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-32" rounded="lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const computeDueStatus = (dueDate: string | null | undefined, submitted: boolean) => {
    if (!dueDate) return { label: null as string | null, tone: 'neutral' as const };
    const due = new Date(dueDate).getTime();
    const now = Date.now();
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
    if (submitted) {
      return { label: 'Teslim edildi', tone: 'success' as const };
    }
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      return { label: `${abs} gün geçti`, tone: 'danger' as const };
    }
    if (diffDays === 0) return { label: 'Bugün son gün', tone: 'danger' as const };
    if (diffDays <= 2) return { label: `${diffDays} gün kaldı`, tone: 'warning' as const };
    if (diffDays <= 7) return { label: `${diffDays} gün kaldı`, tone: 'info' as const };
    return { label: `${diffDays} gün kaldı`, tone: 'success' as const };
  };

  const activeSubmission = selectedAssignment
    ? submissions[selectedAssignment.id]
    : undefined;

  return (
    <main className={`min-h-screen ${isLight ? 'bg-slate-50' : 'bg-slate-900'} pb-20`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${
        isLight ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Geri Dön</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle compact />
            <div className={`w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.[0] || 'Ö'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Önemli Ödevlerin</h1>
          <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
            {user?.grade}. Sınıf için atanan ödevlerini buradan takip edip teslim edebilirsin.
          </p>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            tone="soft"
            icon={<ClipboardList className="h-8 w-8" aria-hidden="true" />}
            title="Henüz ödev yok"
            description="Şu an için teslim etmen gereken bir ödev bulunmuyor. Tekrar ve testlerle güçlendirmeye devam et."
            action={
              <Link
                href="/testler"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange px-5 text-sm font-semibold text-white shadow-brand-glow transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Test çözmeye git
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => {
              const submission = submissions[assignment.id];
              const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
              const isSubmitted = !!submission;
              const isReviewed = submission?.status === 'reviewed';
              const dueStatus = computeDueStatus(assignment.due_date, isSubmitted);
              const statusTone: 'success' | 'info' | 'danger' | 'warning' = isReviewed
                ? 'success'
                : isSubmitted
                  ? 'info'
                  : isPastDue
                    ? 'danger'
                    : 'warning';
              const statusLabel = isReviewed
                ? 'İncelendi'
                : isSubmitted
                  ? 'Teslim edildi'
                  : isPastDue
                    ? 'Süresi geçti'
                    : 'Bekliyor';

              return (
                <motion.div
                  key={assignment.id}
                  layoutId={assignment.id}
                  whileHover={{ y: -2 }}
                  className={`group relative rounded-3xl p-6 border transition-all focus-within:ring-2 focus-within:ring-brand-primary ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-lg'
                      : 'bg-slate-800 border-slate-700 hover:border-brand-primary/40 hover:shadow-brand-glow/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 justify-between mb-4">
                    <Badge tone={statusTone}>{statusLabel}</Badge>
                    {dueStatus.label && (
                      <Badge tone={dueStatus.tone} leadingIcon={<Clock className="h-3 w-3" aria-hidden="true" />}>
                        {dueStatus.label}
                      </Badge>
                    )}
                  </div>

                  <h3 className={`font-display text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {assignment.title}
                  </h3>
                  <p className={`text-sm mb-5 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {assignment.description}
                  </p>

                  {assignment.due_date && (
                    <p className={`mb-4 text-xs font-medium ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      Son teslim:{' '}
                      {new Date(assignment.due_date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {isSubmitted ? (
                      <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                        Puan:{' '}
                        {submission.grade !== null && submission.grade !== undefined
                          ? submission.grade
                          : 'Bekliyor'}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Teslim bekliyor
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedAssignment(assignment)}
                      aria-label={isSubmitted ? 'Teslim detaylarını gör' : 'Ödev teslim et'}
                      className={`inline-flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                        isSubmitted
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gradient-to-r from-brand-primary via-brand-pink to-brand-orange text-white shadow-brand-glow hover:-translate-y-0.5'
                      }`}
                    >
                      {isSubmitted ? 'Detayları gör' : 'Ödev teslim et'}
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedAssignment && (
          <AssignmentSubmissionModal
            key={selectedAssignment.id}
            activeSubmission={activeSubmission}
            assignment={selectedAssignment}
            comment={comment}
            isDragging={isDragging}
            isLight={isLight}
            onClose={() => setSelectedAssignment(null)}
            onCommentChange={setComment}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, selectedAssignment.id)}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleFileUpload(selectedAssignment.id, file);
              }
            }}
            onOverlayClick={() => setSelectedAssignment(null)}
            uploadProgress={uploadProgress}
            uploading={uploading}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
