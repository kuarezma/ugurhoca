'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  MessageCircle,
  KeyRound,
  FileSpreadsheet,
  Printer,
  Award,
  Send,
  BookOpen,
} from 'lucide-react';
import type {
  AdminAssignment,
  AdminQuizResultRow,
  AdminStudySessionRow,
  AdminSubmission,
  AdminUser,
} from '@/features/admin/types';
import { useToast } from '@/components/Toast';

type AdminClassroomTabProps = {
  students: AdminUser[];
  assignments: AdminAssignment[];
  quizResults: AdminQuizResultRow[];
  submissions: AdminSubmission[];
  studySessions: AdminStudySessionRow[];
  onSendMessage: (student: AdminUser) => void;
  onViewProfile: (student: AdminUser) => Promise<void> | void;
  onOpenReportModal?: (student: AdminUser) => void;
  onQuickResetPassword?: (student: AdminUser) => void;
};

type ViewMode = 'roster' | 'matrix' | 'risk';

const getCurrentWeekStart = () => {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
};

export default function AdminClassroomTab({
  students,
  assignments,
  quizResults,
  submissions,
  studySessions,
  onSendMessage,
  onViewProfile,
  onOpenReportModal,
  onQuickResetPassword,
}: AdminClassroomTabProps) {
  const { showToast } = useToast();

  // 1. Sınıf Seçimi
  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    for (const s of students) {
      if (s.grade !== undefined && s.grade !== null) {
        grades.add(String(s.grade));
      }
    }
    const list = Array.from(grades).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
    return list.length > 0 ? list : ['8', '7', '6', '5'];
  }, [students]);

  const [selectedGrade, setSelectedGrade] = useState<string>(() =>
    availableGrades.includes('8') ? '8' : availableGrades[0] || '8',
  );

  const [viewMode, setViewMode] = useState<ViewMode>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Rehberlik notlarını localStorage'da kalıcı tutalım
  const getSavedNote = useCallback((studentId: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`ugurhoca_guidance_note_${studentId}`) || '';
    }
    return '';
  }, []);

  const handleSaveNote = useCallback(
    (studentId: string, text: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ugurhoca_guidance_note_${studentId}`, text);
        showToast('success', 'Rehberlik gözlem notu kaydedildi.');
      }
    },
    [showToast],
  );

  const currentWeekStart = useMemo(() => getCurrentWeekStart(), []);

  // 2. Seçili Sınıftaki Öğrenciler ve İstatistikleri
  const classStudents = useMemo(() => {
    return students.filter((s) => String(s.grade) === String(selectedGrade));
  }, [students, selectedGrade]);

  // Sınıf ödevleri
  const classAssignments = useMemo(() => {
    return assignments
      .filter((a) => !a.target_grade || String(a.target_grade) === String(selectedGrade))
      .slice(0, 5);
  }, [assignments, selectedGrade]);

  // Öğrenci bazlı detaylı sınıf metrikleri
  const studentMetrics = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    return classStudents.map((student) => {
      const studentResults = quizResults.filter((r) => r.user_id === student.id);
      const studentSubmissions = submissions.filter((s) => s.student_id === student.id);
      const studentSessions = studySessions.filter((s) => s.user_id === student.id);

      // Toplam ve bu hafta çözülen sorular
      const totalQuestions = studentResults.reduce(
        (sum, r) => sum + (r.total_questions || 0),
        0,
      );

      const weekQuestions = studentResults
        .filter((r) => r.completed_at && new Date(r.completed_at) >= currentWeekStart)
        .reduce((sum, r) => sum + (r.total_questions || 0), 0);

      // Ortalama puan
      const averageScore =
        studentResults.length > 0
          ? Math.round(
              studentResults.reduce((sum, r) => sum + (r.score || 0), 0) /
                studentResults.length,
            )
          : null;

      // Son aktivite zamanı
      const allDates: number[] = [];
      studentResults.forEach((r) => r.completed_at && allDates.push(new Date(r.completed_at).getTime()));
      studentSubmissions.forEach((s) => s.submitted_at && allDates.push(new Date(s.submitted_at).getTime()));
      studentSessions.forEach((s) => s.date && allDates.push(new Date(s.date).getTime()));
      
      const lastActiveTime = allDates.length > 0 ? Math.max(...allDates) : null;
      const isInactive = !lastActiveTime || now - lastActiveTime > sevenDaysMs;

      // Son ödev durumu
      const latestAssignment = classAssignments[0];
      const latestSubmission = latestAssignment
        ? studentSubmissions.find((s) => s.assignment_id === latestAssignment.id)
        : null;

      return {
        student,
        totalQuestions,
        weekQuestions,
        averageScore,
        lastActiveTime,
        isInactive,
        latestSubmission,
        submissionsCount: studentSubmissions.length,
      };
    });
  }, [classStudents, quizResults, submissions, studySessions, currentWeekStart, classAssignments]);

  // Filtrelenmiş Liste
  const filteredMetrics = useMemo(() => {
    let list = studentMetrics;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        (item.student.name || '').toLowerCase().includes(query),
      );
    }

    if (viewMode === 'risk') {
      // Riskli öğrenciler: inaktif olanlar veya hiç soru çözmeyenler veya son ödevi eksik olanlar
      list = list.filter(
        (item) => item.isInactive || item.weekQuestions === 0 || !item.latestSubmission,
      );
    }

    return list;
  }, [studentMetrics, searchQuery, viewMode]);

  // Sınıf Özeti Metrikleri
  const totalClassWeekQuestions = useMemo(
    () => studentMetrics.reduce((sum, m) => sum + m.weekQuestions, 0),
    [studentMetrics],
  );

  const avgWeekQuestions = useMemo(
    () =>
      studentMetrics.length > 0
        ? Math.round(totalClassWeekQuestions / studentMetrics.length)
        : 0,
    [totalClassWeekQuestions, studentMetrics.length],
  );

  const activeStudentsCount = useMemo(
    () => studentMetrics.filter((m) => !m.isInactive).length,
    [studentMetrics],
  );

  const atRiskCount = useMemo(
    () => studentMetrics.filter((m) => m.isInactive || m.weekQuestions === 0).length,
    [studentMetrics],
  );

  const topStudent = useMemo(() => {
    if (studentMetrics.length === 0) return null;
    return [...studentMetrics].sort((a, b) => b.weekQuestions - a.weekQuestions)[0];
  }, [studentMetrics]);

  // Toplu Hatırlatma Gönder
  const handleSendBatchReminder = () => {
    const missingCount = studentMetrics.filter((m) => !m.latestSubmission).length;
    showToast(
      'info',
      `${selectedGrade}. Sınıfta son ödevi eksik olan ${missingCount} öğrenciye hatırlatma bildirimi planlandı.`,
    );
  };

  // Yazdır / Print
  const handlePrintRoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Sınıf Şube Seçici */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 shrink-0">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Sınıf Rehberliği Masası
              </span>
              <span className="text-xs text-slate-400">2026-2027 Eğitim Yılı</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {selectedGrade}. Sınıf Şube Yönetim & Takip Panosu
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Öğrenci soru sayıları, ödev tamamlama karneleri ve birebir rehberlik takibi.
            </p>
          </div>
        </div>

        {/* Grade Switcher Tabs & Print */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
            {availableGrades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrintRoster}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all shadow-sm"
            title="Sınıf takip çizelgesini A4 yazdır"
          >
            <Printer className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden sm:inline">Çizelge Yazdır</span>
          </button>
        </div>
      </div>

      {/* 2. Kuşbakışı Sınıf Sağlık Kartları (4 KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Sınıf Mevcudu</span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {classStudents.length} <span className="text-sm font-semibold text-slate-400">Öğrenci</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeStudentsCount} Aktif Çalışıyor</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Bu Hafta Çözülen Soru</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {totalClassWeekQuestions.toLocaleString('tr-TR')} <span className="text-sm font-semibold text-slate-400">Soru</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Öğrenci başına ortalama: <strong className="text-amber-300">{avgWeekQuestions} soru</strong>
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Destek / Risk Radarı</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-2">
            {atRiskCount} <span className="text-sm font-semibold text-slate-400">Öğrenci</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Son 7 günde hareketsiz veya ödevi eksik
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Haftanın Sınıf Yıldızı</span>
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-2 truncate">
            {topStudent?.student.name || '—'}
          </div>
          <p className="text-xs text-purple-300 mt-1">
            {topStudent ? `Bu hafta ${topStudent.weekQuestions} soru çözdü 🌟` : 'Henüz veri yok'}
          </p>
        </div>
      </div>

      {/* 3. Görünüm Seçici & Arama / Hızlı Butonlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-white/10 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'roster'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Öğrenci Listesi & Karneler
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Ödev Takip Matrisi
            </button>
            <button
              type="button"
              onClick={() => setViewMode('risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'risk'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚠️ Risk Radarı ({atRiskCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Öğrenci ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSendBatchReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold transition-all shrink-0"
            title="Ödevi eksik olan öğrencilere toplu hatırlatma"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ödev Hatırlat</span>
          </button>
        </div>
      </div>

      {/* 4. Görünüm 1: Sınıf Öğrenci Listesi & Canlı Karneler */}
      {viewMode === 'roster' || viewMode === 'risk' ? (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Öğrenci</th>
                  <th className="py-3.5 px-4 text-center">Bu Hafta Soru</th>
                  <th className="py-3.5 px-4 text-center">Toplam Soru</th>
                  <th className="py-3.5 px-4 text-center">Başarı Ort.</th>
                  <th className="py-3.5 px-4">Son Ödev Durumu</th>
                  <th className="py-3.5 px-4">Son Giriş</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Rehberlik Notu</th>
                  <th className="py-3.5 px-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Bu filtreye uygun öğrenci bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredMetrics.map((item, idx) => {
                    const student = item.student;
                    const note = editingNotes[student.id] !== undefined
                      ? editingNotes[student.id]
                      : getSavedNote(student.id);

                    const lastActiveStr = item.lastActiveTime
                      ? new Date(item.lastActiveTime).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Hiç girmedi';

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-white/5 transition-colors ${
                          item.isInactive ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {student.name?.[0] || 'Ö'}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => onViewProfile(student)}
                                className="font-bold text-white text-sm hover:text-indigo-400 hover:underline text-left transition"
                                title="Öğrenci detayını aç"
                              >
                                {student.name || 'İsimsiz'}
                              </button>
                              <div className="text-[11px] text-slate-400">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-black ${
                              item.weekQuestions > 50
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.weekQuestions > 0
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {item.weekQuestions} Soru
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-300">
                          {item.totalQuestions} Soru
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.averageScore !== null ? (
                            <span className="font-bold text-indigo-300">
                              %{item.averageScore}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.latestSubmission ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Teslim Edildi
                              {item.latestSubmission.grade !== null && (
                                <strong className="text-white ml-1">
                                  ({item.latestSubmission.grade}P)
                                </strong>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Teslim Edilmedi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          <span
                            className={item.isInactive ? 'text-rose-400 font-semibold' : ''}
                          >
                            {lastActiveStr}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Rehberlik notu ekle..."
                            value={note}
                            onChange={(e) =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }))
                            }
                            onBlur={() => handleSaveNote(student.id, note)}
                            className="w-full px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSendMessage(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                              title="Öğrenciye mesaj gönder"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenReportModal?.(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-white/10 transition"
                              title="Gelişim karnesini aç & paylaş"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickResetPassword?.(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 transition"
                              title="Şifreyi sıfırla (123456 yap)"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 5. Görünüm 2: Ödev Takip Matrisi (Sınıf Çizelgesi) */
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">
                {selectedGrade}. Sınıf Ödev Teslim Defteri
              </h3>
              <p className="text-xs text-slate-400">
                Her ödev için öğrencilerin teslim ve puan durumu tek ekranda.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Teslim Edildi
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" /> Eksik
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold">
                  <th className="py-3 px-4 w-10">#</th>
                  <th className="py-3 px-4 min-w-[160px]">Öğrenci Adı</th>
                  {classAssignments.map((ass) => (
                    <th key={ass.id} className="py-3 px-4 text-center min-w-[120px]">
                      <div className="font-bold text-white truncate max-w-[140px]" title={ass.title}>
                        {ass.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {ass.due_date ? new Date(ass.due_date).toLocaleDateString('tr-TR') : 'Süresiz'}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Genel Teslim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {classStudents.map((student, sIdx) => {
                  const studentSubs = submissions.filter((s) => s.student_id === student.id);
                  const deliveredCount = classAssignments.filter((ass) =>
                    studentSubs.some((s) => s.assignment_id === ass.id),
                  ).length;
                  const ratio = classAssignments.length > 0 ? Math.round((deliveredCount / classAssignments.length) * 100) : 0;

                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-500">{sIdx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-white">{student.name}</td>
                      {classAssignments.map((ass) => {
                        const sub = studentSubs.find((s) => s.assignment_id === ass.id);
                        return (
                          <td key={ass.id} className="py-2.5 px-4 text-center">
                            {sub ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
                                ✓ {sub.grade !== null ? `${sub.grade}P` : 'Tamam'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 font-bold">
                                ✕ Yok
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`font-black ${
                            ratio >= 80
                              ? 'text-emerald-400'
                              : ratio >= 50
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          %{ratio} ({deliveredCount}/{classAssignments.length})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
