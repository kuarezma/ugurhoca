"use client";

import { useState } from "react";
import { CheckCircle2, FileText, MessageSquareText, Star } from "lucide-react";
import type { AdminSubmission } from "@/features/admin/types";

type AdminSubmissionReviewCardProps = {
  onUpdateSubmission: (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => void;
  submission: AdminSubmission;
};

export default function AdminSubmissionReviewCard({
  onUpdateSubmission,
  submission,
}: AdminSubmissionReviewCardProps) {
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [grade, setGrade] = useState(submission.grade || 100);

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
        <div className="flex items-center gap-3">
          <a
            href={submission.file_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            <FileText className="w-4 h-4" />
            Dosyayı İncele
          </a>
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

      <div className="flex flex-col gap-3 pt-2 items-start sm:items-center sm:flex-row">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Geri bildirim yazın..."
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-11 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <MessageSquareText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
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
    </div>
  );
}
