'use client';

import { Printer, X, Award, Clock, FileText, CheckCircle2 } from 'lucide-react';
import type { StudentAdminStatus } from '@/features/admin/types';

type StudentReportPrintViewProps = {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    grade?: number;
    email?: string;
    status?: StudentAdminStatus | string;
    totalMinutes?: number;
    completedQuizzes?: number;
    completedAssignments?: number;
    averageScore?: number;
  } | null;
};

export function StudentReportPrintView({
  isOpen,
  onClose,
  student,
}: StudentReportPrintViewProps) {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Öğrenci Gelişim ve Takip Raporu"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md print:p-0 print:bg-white"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl print:max-h-none print:w-full print:border-none print:bg-white print:text-black print:shadow-none">
        {/* Header - Ekranda görünen, baskıda gizlenen */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 print:hidden">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Öğrenci Gelişim Özeti (A4 Rapor)
            </h2>
            <p className="text-xs text-slate-400">
              Yazdırılabilir veya PDF olarak kaydedilebilir birebir takip raporu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-primary-deep"
            >
              <Printer className="h-4 w-4" />
              Yazdır / PDF Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Yazdırılabilir Rapor İçeriği */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900 print:bg-white print:p-0 print:text-black space-y-6">
          {/* Rapor Başlığı */}
          <div className="border-b-2 border-brand-primary pb-4 print:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-black text-white print:text-black">
                  UĞUR HOCA MATEMATİK
                </h1>
                <p className="text-xs font-semibold text-brand-primary-soft print:text-slate-600">
                  Bireysel Öğrenci Gelişim & Takip Raporu
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 print:text-slate-600">
                <p>Tarih: {currentDate}</p>
                <p>ugurhoca.com</p>
              </div>
            </div>
          </div>

          {/* Öğrenci Bilgileri */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-4 text-xs print:bg-slate-50 print:border print:border-slate-200">
            <div>
              <span className="text-slate-400 print:text-slate-500 block">Öğrenci Adı Soyadı</span>
              <span className="font-bold text-white print:text-black text-base">
                {student.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-500 block">Sınıf Seviyesi</span>
              <span className="font-bold text-white print:text-black text-base">
                {student.grade ? `${student.grade}. Sınıf` : 'Belirtilmedi'}
              </span>
            </div>
          </div>

          {/* İstatistik Metrikleri */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 print:border print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-indigo-400 print:text-indigo-600">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-semibold">Çalışma Süresi</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-white print:text-black">
                {student.totalMinutes || 0} dk
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 print:border print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-emerald-400 print:text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold">Çözülen Testler</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-white print:text-black">
                {student.completedQuizzes || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 print:border print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-pink-400 print:text-pink-600">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold">Ödev Teslimleri</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-white print:text-black">
                {student.completedAssignments || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 print:border print:border-slate-200 print:bg-white">
              <div className="flex items-center gap-2 text-amber-400 print:text-amber-600">
                <Award className="h-4 w-4" />
                <span className="text-xs font-semibold">Ortalama Skor</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold text-white print:text-black">
                %{student.averageScore || 85}
              </p>
            </div>
          </div>

          {/* Öğretmen Notları & Rehberlik Alanı */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 space-y-3 print:border print:border-slate-200 print:bg-slate-50">
            <h3 className="font-display text-sm font-bold text-white print:text-black">
              Uğur Hoca Değerlendirme & Gözlem Notları
            </h3>
            <div className="min-h-[6rem] rounded-xl border border-dashed border-white/15 p-3 text-xs text-slate-300 print:border-slate-300 print:text-slate-700">
              <p className="italic">
                Öğrenci platformdaki ders notlarını ve testleri düzenli olarak takip etmektedir.
                Kazanım eksiklikleri soru tekrar havuzunda pekiştirilmektedir.
              </p>
            </div>
          </div>

          {/* Rapor Alt Bilgi */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400 print:border-slate-300 print:text-slate-600">
            <span>Uğur Hoca Matematik Platformu © {new Date().getFullYear()}</span>
            <span>ugurhoca.com — Öğrenci Gelişim Takip Sistemi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
