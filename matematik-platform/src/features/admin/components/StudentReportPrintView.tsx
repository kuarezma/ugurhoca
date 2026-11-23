'use client';

import { useState } from 'react';
import {
  Printer,
  X,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import type {
  StudentAdminNote,
  StudentAdminStatus,
} from '@/features/admin/types';
import { useAccessibleModal } from '@/hooks/useAccessibleModal';
import { formatIstanbulDate } from '@/lib/date-format';

type ReportStudent = {
  id: string;
  name: string;
  grade?: number | string;
  email?: string;
  status?: StudentAdminStatus | string;
  totalMinutes?: number;
  weeklyCompletedMinutes?: number;
  weeklyTargetMinutes?: number;
  completedQuizzes?: number;
  completedAssignments?: number;
  averageScore?: number | null;
  adminNotes?: StudentAdminNote[];
  strongTopic?: string | null;
  focusTopic?: string | null;
};

type StudentReportPrintViewProps = {
  isOpen: boolean;
  onClose: () => void;
  student: ReportStudent | null;
};

function formatGradeText(grade?: number | string): string {
  if (grade === 'Mezun') return 'Mezun';
  if (typeof grade === 'number' && Number.isFinite(grade)) {
    return `${grade}. Sınıf`;
  }
  if (typeof grade === 'string' && grade.trim()) {
    return /^\d+$/.test(grade.trim()) ? `${grade.trim()}. Sınıf` : grade.trim();
  }
  return 'Belirtilmedi';
}

function StudentReportContent({
  onClose,
  student,
}: {
  onClose: () => void;
  student: ReportStudent;
}) {
  const modalRef = useAccessibleModal<HTMLDivElement>(true, onClose);
  const [customNote, setCustomNote] = useState('');

  const currentDate = formatIstanbulDate(new Date(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const adminNotes = (student.adminNotes || []).slice(0, 5);
  const hasAverageScore =
    typeof student.averageScore === 'number' &&
    Number.isFinite(student.averageScore);
  const hasWeeklyBreakdown =
    typeof student.weeklyCompletedMinutes === 'number' &&
    typeof student.weeklyTargetMinutes === 'number' &&
    student.weeklyTargetMinutes > 0;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 print:p-0 print:bg-white">
      <button
        type="button"
        aria-label="Rapor penceresini kapat"
        onClick={onClose}
        className="absolute inset-0 bg-scrim backdrop-blur-md print:hidden"
      />
      <div
        id="printable-worksheet-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Öğrenci Gelişim ve Takip Raporu"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border-default bg-surface-1 shadow-2xl print:max-h-none print:w-full print:border-none print:bg-white print:text-black print:shadow-none"
      >
        {/* Header - Ekranda görünen, baskıda gizlenen */}
        <div className="flex items-center justify-between border-b border-border-default bg-surface-2 px-6 py-4 print:hidden">
          <div>
            <h2 className="font-display text-base font-bold text-primary">
              Öğrenci Gelişim Özeti (A4 Rapor)
            </h2>
            <p className="text-xs text-secondary">
              Yazdırılabilir veya PDF olarak kaydedilebilir birebir takip raporu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Yazdır / PDF Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-surface-1 text-secondary transition hover:bg-surface-3 hover:text-primary"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir Rapor İçeriği */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-surface-1 p-8 print:bg-white print:p-0 print:text-black">
          {/* Rapor Başlığı */}
          <div className="border-b-2 border-brand-primary pb-4 print:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-black text-primary print:text-black">
                  UĞUR HOCA MATEMATİK
                </h1>
                <p className="text-xs font-semibold text-accent-fg print:text-slate-600">
                  Bireysel Öğrenci Gelişim & Takip Raporu
                </p>
              </div>
              <div className="text-right text-xs text-secondary print:text-slate-600">
                <p>Tarih: {currentDate}</p>
                <p>ugurhoca.com</p>
              </div>
            </div>
          </div>

          {/* Öğrenci Bilgileri */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border-subtle bg-surface-2 p-4 text-xs print:border-slate-200 print:bg-slate-50">
            <div>
              <span className="block text-secondary print:text-slate-500">
                Öğrenci Adı Soyadı
              </span>
              <span className="text-base font-bold text-primary print:text-black">
                {student.name}
              </span>
            </div>
            <div>
              <span className="block text-secondary print:text-slate-500">
                Sınıf Seviyesi
              </span>
              <span className="text-base font-bold text-primary print:text-black">
                {formatGradeText(student.grade)}
              </span>
            </div>
          </div>

          {/* İstatistik Metrikleri */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border-default bg-surface-2 p-4 print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-tone-info-fg print:text-indigo-700">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Çalışma Süresi</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-primary print:text-black">
                {student.totalMinutes ?? 0} dk
              </p>
              {hasWeeklyBreakdown ? (
                <p className="mt-1 text-[11px] text-secondary print:text-slate-600">
                  Bu hafta: {student.weeklyCompletedMinutes}/
                  {student.weeklyTargetMinutes} dk
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border-default bg-surface-2 p-4 print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-tone-success-fg print:text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Çözülen Testler</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-primary print:text-black">
                {student.completedQuizzes ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-border-default bg-surface-2 p-4 print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-accent-fg print:text-purple-700">
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Ödev Teslimleri</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-primary print:text-black">
                {student.completedAssignments ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-border-default bg-surface-2 p-4 print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-tone-warn-fg print:text-amber-700">
                <Award className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-semibold">Ortalama Skor</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-primary print:text-black">
                {hasAverageScore ? `%${student.averageScore}` : 'Veri yok'}
              </p>
            </div>
          </div>

          {student.strongTopic || student.focusTopic ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4 print:border-slate-200 print:bg-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-tone-success-fg print:text-emerald-700">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>Güçlü Konu</span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-primary print:text-black">
                  {student.strongTopic || 'Veri yok'}
                </p>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-surface-2 p-4 print:border-slate-200 print:bg-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-tone-warn-fg print:text-amber-700">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>Odak Konusu</span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-primary print:text-black">
                  {student.focusTopic || 'Tekrar gerektiren konu yok'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Öğretmen Notları & Rehberlik Alanı */}
          <div className="space-y-3 rounded-2xl border border-border-default bg-surface-2 p-5 print:border-slate-200 print:bg-slate-50">
            <h3 className="font-display text-sm font-bold text-primary print:text-black">
              Uğur Hoca Değerlendirme & Gözlem Notları
            </h3>

            {adminNotes.length > 0 ? (
              <ul className="space-y-2">
                {adminNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-border-subtle bg-surface-1 px-3.5 py-2.5 text-xs text-primary print:border-slate-200 print:bg-white print:text-slate-800"
                  >
                    <p className="whitespace-pre-wrap">{note.body}</p>
                    {note.created_at ? (
                      <p className="mt-1 text-[11px] text-tertiary print:text-slate-500">
                        {formatIstanbulDate(note.created_at, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : !customNote.trim() ? (
              <div className="rounded-xl border border-dashed border-border-default p-3 text-xs text-secondary print:border-slate-300 print:text-slate-700">
                Henüz öğretmen gözlem notu eklenmedi.
              </div>
            ) : null}

            {customNote.trim() ? (
              <div className="hidden rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 whitespace-pre-wrap print:block">
                {customNote.trim()}
              </div>
            ) : null}

            <div className="print:hidden">
              <label
                htmlFor="student-report-custom-note"
                className="mb-1.5 block text-xs font-semibold text-secondary"
              >
                Baskı için ek gözlem notu (isteğe bağlı)
              </label>
              <textarea
                id="student-report-custom-note"
                rows={3}
                value={customNote}
                onChange={(event) => setCustomNote(event.target.value)}
                placeholder="Yazdırılacak rapora özel öğretmen değerlendirmesi ekleyin..."
                className="w-full rounded-xl border border-border-default bg-surface-1 px-3 py-2 text-xs text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Rapor Alt Bilgi */}
          <div className="flex items-center justify-between border-t border-border-default pt-4 text-[11px] text-secondary print:border-slate-300 print:text-slate-600">
            <span>
              Uğur Hoca Matematik Platformu © {new Date().getFullYear()}
            </span>
            <span>ugurhoca.com — Öğrenci Gelişim Takip Sistemi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentReportPrintView({
  isOpen,
  onClose,
  student,
}: StudentReportPrintViewProps) {
  if (!isOpen || !student) return null;

  return (
    <StudentReportContent
      key={student.id}
      onClose={onClose}
      student={student}
    />
  );
}
