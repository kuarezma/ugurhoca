'use client';

import {
  ClipboardList,
  Edit3,
  FileText,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import type {
  AdminAssignment,
  AdminSharedDocument,
} from '@/features/admin/types';
import { useAdminPagedRows } from '@/features/admin/hooks/useAdminPagedRows';

type AdminAssignmentsTabProps = {
  assignments: AdminAssignment[];
  onDeleteAssignment: (id: string) => void;
  onDeleteSharedDocument: (id: string) => void;
  onEditAssignment: (assignment: AdminAssignment) => Promise<void> | void;
  onEditSharedDocument: (document: AdminSharedDocument) => Promise<void> | void;
  onOpenAssignmentModal: () => void;
  onOpenSendDocumentModal: () => void;
  onOpenSubmissions: (assignment: AdminAssignment) => Promise<void> | void;
  sharedDocs: AdminSharedDocument[];
};

export default function AdminAssignmentsTab({
  assignments,
  onDeleteAssignment,
  onDeleteSharedDocument,
  onEditAssignment,
  onEditSharedDocument,
  onOpenAssignmentModal,
  onOpenSendDocumentModal,
  onOpenSubmissions,
  sharedDocs,
}: AdminAssignmentsTabProps) {
  const sent = useAdminPagedRows<AdminSharedDocument>('shared_documents', sharedDocs);
  const homework = useAdminPagedRows<AdminAssignment>('assignments', assignments);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Ödevlendirme</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Belge gönder veya ödev ver
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
          <button
            onClick={onOpenSendDocumentModal}
            className="btn-primary w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            Belge Gönder
          </button>
          <button
            onClick={onOpenAssignmentModal}
            className="btn-primary w-full sm:w-auto justify-center hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Ödev Ver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-rose-400" />
            Gönderilen Belgeler ({sent.total})
          </h3>
          {sent.error ? (
            <button className="btn-secondary" onClick={sent.retry} type="button">Belgeler yüklenemedi. Yeniden dene</button>
          ) : sent.loading ? (
            <p className="text-secondary" role="status">Belgeler yükleniyor...</p>
          ) : sent.rows.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Henüz belge gönderilmedi
            </p>
          ) : (
            <div className="space-y-3">
              {sent.rows.map((document) => (
                <div
                  key={document.id}
                  className="bg-surface-2 dark:bg-slate-800/50 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-primary font-medium break-words">
                        {document.document_title}
                      </p>
                      <p className="text-slate-400 text-sm break-all">
                        {document.student_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        document.is_read
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {document.is_read ? 'Görüldü' : 'Bekliyor'}
                    </span>
                    <button
                      onClick={() => onEditSharedDocument(document)}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSharedDocument(document.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!sent.error && !sent.loading && sent.total > sent.pageSize && (
            <nav aria-label="Gönderilen belge sayfaları" className="mt-4 flex items-center justify-center gap-3 text-sm text-secondary">
              <button className="btn-secondary" disabled={sent.page === 0} onClick={() => sent.setPage(sent.page - 1)} type="button">Önceki</button>
              <span>{sent.page + 1} / {Math.ceil(sent.total / sent.pageSize)}</span>
              <button className="btn-secondary" disabled={(sent.page + 1) * sent.pageSize >= sent.total} onClick={() => sent.setPage(sent.page + 1)} type="button">Sonraki</button>
            </nav>
          )}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" />
            Ödevler ({homework.total})
          </h3>
          {homework.error ? (
            <button className="btn-secondary" onClick={homework.retry} type="button">Ödevler yüklenemedi. Yeniden dene</button>
          ) : homework.loading ? (
            <p className="text-secondary" role="status">Ödevler yükleniyor...</p>
          ) : homework.rows.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Henüz ödev verilmedi
            </p>
          ) : (
            <div className="space-y-3">
              {homework.rows.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-surface-2 dark:bg-slate-800/50 rounded-lg p-4"
                >
                  <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-primary font-medium break-words">
                        {assignment.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {assignment.grade
                          ? `${assignment.grade}. Sınıf`
                          : 'Genel'}{' '}
                        • Son:{' '}
                        {assignment.due_date
                          ? new Date(assignment.due_date).toLocaleDateString(
                              'tr-TR',
                            )
                          : 'Belirtilmedi'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => onOpenSubmissions(assignment)}
                        className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded hover:bg-indigo-500/30 transition-colors"
                      >
                        Teslimatlar
                      </button>
                      <button
                        onClick={() => onEditAssignment(assignment)}
                        className="text-slate-400 hover:text-blue-400"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteAssignment(assignment.id)}
                        className="text-slate-400 hover:text-red-400"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {assignment.description}
                  </p>
                </div>
              ))}
            </div>
          )}
          {!homework.error && !homework.loading && homework.total > homework.pageSize && (
            <nav aria-label="Ödev sayfaları" className="mt-4 flex items-center justify-center gap-3 text-sm text-secondary">
              <button className="btn-secondary" disabled={homework.page === 0} onClick={() => homework.setPage(homework.page - 1)} type="button">Önceki</button>
              <span>{homework.page + 1} / {Math.ceil(homework.total / homework.pageSize)}</span>
              <button className="btn-secondary" disabled={(homework.page + 1) * homework.pageSize >= homework.total} onClick={() => homework.setPage(homework.page + 1)} type="button">Sonraki</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
