'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Clock, CheckCircle2, 
  Upload, FileText, ChevronRight, ArrowLeft,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getClientSession } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import type { AppUser, Assignment, Submission } from '@/types';

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
      const session = await getClientSession();
      if (!session) {
        window.location.href = '/giris';
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
  }, [initialUserKey, isHydrated]);

  const handleFileUpload = async (assignmentId: string, file: File) => {
    if (!user) return;
    
    // Güvenlik kontrolleri
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece PDF ve Görsel (JPG, PNG) dosyaları yüklenebilir.');
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
      }, 500);
      
    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert(
        'Ödev yüklenirken bir hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Ödevler yükleniyor...</p>
        </div>
      </div>
    );
  }

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
          <div className={`rounded-3xl p-12 text-center border-2 border-dashed ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
          }`}>
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-500 opacity-20" />
            <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Henüz Ödev Yok</h3>
            <p className="text-slate-400">Şu an için teslim etmen gereken bir ödev bulunumuyor. Rahatla!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((assignment) => {
              const submission = submissions[assignment.id];
              const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
              const isSubmitted = !!submission;
              const isReviewed = submission?.status === 'reviewed';

              return (
                <motion.div
                  key={assignment.id}
                  layoutId={assignment.id}
                  className={`relative rounded-3xl p-6 border transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Durum Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isReviewed 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isSubmitted 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : isPastDue 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isReviewed ? 'İncelendi' : isSubmitted ? 'Teslim Edildi' : isPastDue ? 'Süresi Geçti' : 'Bekliyor'}
                    </div>
                    {assignment.due_date && (
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${isPastDue && !isSubmitted ? 'text-red-400' : 'text-slate-500'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(assignment.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </div>
                    )}
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{assignment.title}</h3>
                  <p className={`text-sm mb-6 line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{assignment.description}</p>

                  <div className="flex items-center justify-between">
                    {isSubmitted ? (
                      <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        Puan: {submission.grade !== null && submission.grade !== undefined ? submission.grade : 'Bekliyor'}
                      </div>
                    ) : (
                      <div />
                    )}
                    
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isSubmitted
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                      }`}
                    >
                      {isSubmitted ? 'Detayları Gör' : 'Ödev Teslim Et'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload/Detail Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAssignment(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 overflow-hidden ${
                isLight ? 'bg-white' : 'bg-slate-900 border border-slate-800'
              }`}
            >
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedAssignment.title}
                </h2>
                <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {selectedAssignment.description}
                </p>
              </div>

              {activeSubmission ? (
                // Teslim Edilmis Odev Detayi
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-white/5 border border-white/5'}`}>
                    <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Teslimat Detayı</p>
                    <div className="flex items-center justify-between mb-4">
                      <a 
                        href={activeSubmission.file_url ?? '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        <FileText className="w-5 h-5" />
                        Dosyayı Görüntüle
                      </a>
                      <span className="text-xs text-slate-500 font-medium">
                        {activeSubmission.submitted_at
                          ? new Date(activeSubmission.submitted_at).toLocaleString('tr-TR')
                          : '-'}
                      </span>
                    </div>
                    {activeSubmission.comment && (
                      <p className={`text-sm italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        "{activeSubmission.comment}"
                      </p>
                    ) || <p className="text-sm text-slate-500">Not eklenmemiş.</p>}
                  </div>

                  {activeSubmission.status === 'reviewed' && (
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-emerald-500">Uğur Hoca'nın Notu</span>
                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">
                          {activeSubmission.grade ?? '-'} / 100
                        </div>
                      </div>
                      <p className="text-sm text-emerald-400 leading-relaxed">
                        {activeSubmission.feedback || 'Harika iş çıkarmışsın! Başarılarının devamını dilerim.'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              ) : (
                // Yeni Teslimat Formu
                <div className="space-y-5">
                  <div>
                    <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Hocana Not (Opsiyonel)</label>
                    <textarea
                      placeholder="Ödevle ilgili eklemek istediğin bir şey var mı?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 h-24 resize-none transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(selectedAssignment.id, file);
                      }}
                      disabled={!!uploading}
                    />
                    <label
                      htmlFor="file-upload"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, selectedAssignment.id)}
                      className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                        uploading 
                          ? 'opacity-80 pointer-events-none border-indigo-500/30'
                          : isDragging
                            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Upload Progress Bar Background */}
                      {uploadProgress !== null && (
                        <div 
                           className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300 ease-out z-0"
                           style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                        />
                      )}
                      
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 ${isDragging ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30 scale-110' : 'bg-slate-800 border border-slate-700'}`}>
                        {uploading ? (
                          <div className="flex items-center gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <Upload className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-slate-300'}`} />
                        )}
                      </div>
                      <div className="text-center z-10">
                        <p className={`font-bold mb-1 ${isDragging ? 'text-indigo-400 text-base' : 'text-white text-sm'}`}>
                          {uploading 
                            ? `Yükleniyor... ${Math.round(uploadProgress || 0)}%` 
                            : isDragging 
                              ? 'Buraya Bırak' 
                              : 'Dosyayı Sürükle veya Seç'}
                        </p>
                        <p className="text-xs text-slate-500">PDF, JPG veya PNG (Max 5MB)</p>
                      </div>
                    </label>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 leading-relaxed uppercase tracking-tighter">
                    Ödevi teslim ettiğinde Uğur Hoca'ya bildirim gidecektir. Teslim tarihinden sonra yüklediğin ödevler "Gecikmiş" olarak işaretlenebilir.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
