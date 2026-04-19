"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { DashboardDocument } from "@/types/dashboard";

interface RecentDocumentsProps {
  documents: DashboardDocument[];
}

function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Son Belgeler</h2>
        <p className="mt-1 text-sm text-slate-400">
          Uğur Hoca tarafından paylaşılan son belgeler.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 text-white">Henüz sana özel belge görünmüyor.</p>
          <p className="mt-1 text-sm text-slate-400">
            Yeni belge paylaşıldığında burada kısa liste halinde yer alacak.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.slice(0, 4).map((doc) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  doc.is_read ? "bg-slate-700" : "bg-indigo-500/20"
                }`}
              >
                <FileText
                  className={`h-5 w-5 ${
                    doc.is_read ? "text-slate-400" : "text-indigo-300"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {doc.document_title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date(doc.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!doc.is_read ? (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-[11px] font-semibold text-indigo-300">
                    Yeni
                  </span>
                ) : null}
                <Download className="h-4 w-4 text-slate-400" />
              </div>
            </a>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default memo(RecentDocuments);
