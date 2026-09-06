"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  FileText,
  MessageSquareText,
  Mic,
  MicOff,
  PenTool,
  Sparkles,
  Star,
  BookOpen,
  Layers,
} from "lucide-react";
import type { AdminSubmission } from "@/features/admin/types";
import { SubmissionDrawingModal } from "./SubmissionDrawingModal";
import TeacherFeedbackLibraryModal, {
  type FeedbackTemplateItem,
} from "./TeacherFeedbackLibraryModal";

type AdminSubmissionReviewCardProps = {
  onUpdateSubmission: (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => void;
  submission: AdminSubmission;
};

const FEEDBACK_TEMPLATES = [
  {
    label: "🌟 Kusursuz",
    grade: 100,
    text: "Tebrikler! İşlem basamakların eksiksiz ve çok temiz.",
  },
  {
    label: "⚠️ İşlem Hatası",
    grade: 80,
    text: "Gidiş yolu doğru ancak adımlarda işlem/işaret hatası var, tekrar kontrol et.",
  },
  {
    label: "💡 Kuralı İncele",
    grade: 65,
    text: "Konu kuralını tekrar gözden geçirip soruyu bir kez daha denemeni öneririm.",
  },
  {
    label: "⏳ Süre & Hız",
    grade: 90,
    text: "Eline sağlık! Bir sonraki ödevde süreyi biraz daha optimize edebilirsin.",
  },
];

export default function AdminSubmissionReviewCard({
  onUpdateSubmission,
  submission,
}: AdminSubmissionReviewCardProps) {
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [grade, setGrade] = useState(submission.grade || 100);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and append voice note label
      setIsRecording(false);
      const voiceNote = `🎙️ [${recordingSeconds} sn Sesli Öğretmen Notu Kaydedildi]`;
      setFeedback((prev) => (prev ? `${prev} ${voiceNote}` : voiceNote));
    } else {
      setIsRecording(true);
    }
  };

  const handleApplyTemplate = (item: (typeof FEEDBACK_TEMPLATES)[number]) => {
    setGrade(item.grade);
    setFeedback(item.text);
  };

  const handleAttachStep = (stepPrefix: string) => {
    setSelectedStep(stepPrefix);
    setIsLibraryOpen(true);
  };

  const handleSelectFromLibrary = (
    tmpl: FeedbackTemplateItem,
    mode: "append" | "replace",
  ) => {
    if (tmpl.grade !== undefined) {
      setGrade(tmpl.grade);
    }
    const prefix = selectedStep || tmpl.stepPrefix || "";
    const textToAdd = prefix ? `${prefix} ${tmpl.text}` : tmpl.text;

    if (mode === "replace") {
      setFeedback(textToAdd);
    } else {
      setFeedback((prev) =>
        prev.trim() ? `${prev.trim()}\n${textToAdd}` : textToAdd,
      );
    }
    setIsLibraryOpen(false);
    setSelectedStep(null);
  };

  return (
    <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white">
            {submission.student_name?.[0] || "Ö"}
          </div>
          <div>
            <p className="text-white font-bold">
              {submission.student_name || "Öğrenci"}
            </p>
            <p className="text-slate-500 text-[10px]">
              {submission.submitted_at
                ? new Date(submission.submitted_at).toLocaleString("tr-TR")
                : "Tarih yok"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {submission.file_url && (
            <>
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20"
              >
                <FileText className="w-4 h-4" />
                <span>Dosyayı Aç</span>
              </a>

              <button
                type="button"
                onClick={() => setIsDrawingOpen(true)}
                className="px-3 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                title="Öğrencinin ödev görseli üzerine çizim yap"
              >
                <PenTool className="w-4 h-4" />
                <span>Çizimle İncele</span>
              </button>
            </>
          )}

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              submission.status === "reviewed"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {submission.status === "reviewed"
              ? `Puan: ${submission.grade}`
              : "Bekliyor"}
          </span>
        </div>
      </div>

      {submission.comment && (
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">
            Öğrenci Notu
          </p>
          <p className="text-sm text-slate-300 italic">"{submission.comment}"</p>
        </div>
      )}

      {/* QUICK TEMPLATES & LIBRARY */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Hızlı Şablon:
            </span>
            {FEEDBACK_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStep(null);
              setIsLibraryOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>📚 Geri Bildirim Kütüphanesi</span>
          </button>
        </div>

        {/* STEP ATTACHMENT SHORTCUTS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/40 p-2 rounded-xl border border-white/5 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Adıma Not İliştir:
          </span>
          {[
            { label: "1. Adım", prefix: "[1. Adım: Verilenleri Belirleme]" },
            { label: "2. Adım", prefix: "[2. Adım: Formül / Denklem Kurma]" },
            { label: "3. Adım", prefix: "[3. Adım: Dört İşlem / Sadeleştirme]" },
            { label: "Sonuç", prefix: "[Sonuç: Doğrulama & Birim Kontrolü]" },
          ].map((step) => (
            <button
              key={step.label}
              type="button"
              onClick={() => handleAttachStep(step.prefix)}
              className="px-2 py-0.5 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50 hover:border-cyan-700 transition text-[11px] font-medium"
              title={`${step.prefix} için kütüphaneden not seç`}
            >
              🪜 {step.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-1 items-start sm:items-center sm:flex-row">
        <div className="flex-1 w-full flex items-start gap-2">
          <div className="relative flex-1">
            <textarea
              rows={2}
              placeholder="Geri bildirim yazın..."
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-y min-h-[44px]"
            />
            <MessageSquareText className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          </div>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 shrink-0 text-xs font-bold mt-0.5 ${
              isRecording
                ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
            title={isRecording ? "Kaydı bitir" : "Sesli not kaydet"}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>0:{recordingSeconds.toString().padStart(2, "0")}</span>
              </>
            ) : (
              <Mic className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:flex-row">
          <div className="flex items-center justify-center p-2 bg-slate-800 border border-slate-700 rounded-xl">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = grade >= star * 20;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setGrade(star * 20)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      isFilled
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <input
            type="number"
            placeholder="Not"
            max="100"
            min="0"
            value={grade}
            onChange={(event) => setGrade(Number(event.target.value) || 0)}
            className="w-full sm:w-20 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-center text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <button
            onClick={() => onUpdateSubmission(submission.id, grade, feedback)}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Puanla
          </button>
        </div>
      </div>

      {submission.file_url && (
        <SubmissionDrawingModal
          isOpen={isDrawingOpen}
          onClose={() => setIsDrawingOpen(false)}
          imageUrl={submission.file_url}
          studentName={submission.student_name ?? "Öğrenci"}
          onSaveFeedback={(notes) => {
            setFeedback((prev) => (prev ? `${prev} - ${notes}` : notes));
          }}
        />
      )}

      <TeacherFeedbackLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => {
          setIsLibraryOpen(false);
          setSelectedStep(null);
        }}
        onSelectTemplate={handleSelectFromLibrary}
        selectedStepPrefix={selectedStep}
      />
    </div>
  );
}
