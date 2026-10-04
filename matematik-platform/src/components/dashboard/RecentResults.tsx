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
      className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Son Test Sonuçların</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Yakın zamanda çözdüğün testlerin kısa özeti.
          </p>
        </div>
        <Link
          href="/testler"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Testlere Git
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-5 py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">Henüz çözdüğün test görünmüyor.</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            İlk testini çözünce sonuçların burada listelenecek.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.slice(0, 3).map((result) => (
            <div
              key={result.id}
              className="flex items-start gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                <CheckCircle2 className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">
                  {result.quizzes?.title || "Test"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">%{result.score}</span>
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
