"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { DashboardQuizResult } from "@/types/dashboard";

interface RecentResultsProps {
  results: DashboardQuizResult[];
}

function RecentResults({ results }: RecentResultsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Son Test Sonuçların</h2>
          <p className="mt-1 text-sm text-slate-400">
            Yakın zamanda çözdüğün testlerin kısa özeti.
          </p>
        </div>
        <Link
          href="/testler"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Testlere Git
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-white">Henüz çözdüğün test görünmüyor.</p>
          <p className="mt-1 text-sm text-slate-400">
            İlk testini çözünce sonuçların burada listelenecek.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.slice(0, 3).map((result) => (
            <div
              key={result.id}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                <CheckCircle2 className="h-5 w-5 text-violet-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  {result.quizzes?.title || "Test"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>%{result.score}</span>
                  <span>•</span>
                  <span>{result.total_questions} soru</span>
                  <span>•</span>
                  <span>
                    {new Date(result.completed_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default memo(RecentResults);
