"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  Edit3,
  Eye,
  FileText,
  FolderTree,
  GraduationCap,
  Trash2,
} from "lucide-react";
import {
  ADMIN_DOCUMENT_TYPE_COLORS,
  ADMIN_DOCUMENT_TYPE_LABELS,
} from "@/features/admin/constants";
import {
  getWorksheetOutcomeLabel,
  getWorksheetVisibleDescription,
  isWorksheetType,
} from "@/features/content/worksheet";
import type {
  AdminDocument,
  AdminFormState,
} from "@/features/admin/types";

type AdminDocumentsTabProps = {
  documents: AdminDocument[];
  formatDate: (dateString?: string | null) => string;
  onDelete: (id: string) => void;
  onEdit: (document: AdminDocument, nextFormData: AdminFormState) => void;
  onMigrateWorksheets: () => void;
  onRefreshCategories: () => void;
};

export default function AdminDocumentsTab({
  documents,
  formatDate,
  onDelete,
  onEdit,
  onMigrateWorksheets,
  onRefreshCategories,
}: AdminDocumentsTabProps) {
  return (
    <motion.div
      key="documents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-white">
          Tüm İçerikler ({documents.length})
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <button
            onClick={onMigrateWorksheets}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium"
          >
            Yaprak Test Geçişi
          </button>
          <button
            onClick={onRefreshCategories}
            className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-medium"
          >
            Kategorileri Güncelle
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz içerik yok</p>
        </div>
      ) : (
        documents.map((document, index) => {
          const worksheetDocument = isWorksheetType(document.type);
          const visibleDescription = worksheetDocument
            ? getWorksheetVisibleDescription(document)
            : document.description;

          return (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-4 sm:p-6 card-hover overflow-hidden"
            >
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${
                      ADMIN_DOCUMENT_TYPE_COLORS[document.type] ||
                      "from-slate-500 to-slate-600"
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex min-w-0 flex-col gap-2 mb-1 sm:flex-row sm:items-center sm:gap-3">
                      <h3 className="text-lg font-bold text-white truncate">
                        {document.title}
                      </h3>
                      <span
                        className={`px-3 py-1 bg-gradient-to-r ${
                          ADMIN_DOCUMENT_TYPE_COLORS[document.type] ||
                          "from-slate-500 to-slate-600"
                        } rounded-full text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {ADMIN_DOCUMENT_TYPE_LABELS[document.type] || document.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-1">
                      {visibleDescription}
                    </p>
                    {worksheetDocument && (
                      <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-100">
                        <FolderTree className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {getWorksheetOutcomeLabel(document)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(document.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {document.downloads || 0} indirme
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {document.views || 0} görüntülenme
                      </span>
                      {document.grade && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {Array.isArray(document.grade)
                            ? document.grade.join(", ")
                            : document.grade}
                          . Sınıf
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 sm:ml-4">
                  <button
                    onClick={() =>
                      onEdit(document, {
                        answer_key_text: document.answer_key_text ?? "",
                        description: visibleDescription ?? "",
                        file_url: document.file_url ?? "",
                        grades: document.grade ?? [],
                        learning_outcome: worksheetDocument
                          ? getWorksheetOutcomeLabel(document)
                          : "",
                        solution_url: document.solution_url ?? "",
                        title: document.title,
                        type: document.type,
                        video_url: document.video_url ?? "",
                      })
                    }
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(document.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
