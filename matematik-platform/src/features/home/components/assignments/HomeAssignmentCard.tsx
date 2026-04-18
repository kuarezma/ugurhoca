'use client';

import { Download, FileText, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { SharedDocumentAssignment } from '@/types';

type HomeAssignmentCardProps = {
  assignment: SharedDocumentAssignment;
  index: number;
  isLight: boolean;
  onDismiss: (assignment: SharedDocumentAssignment) => void;
};

export function HomeAssignmentCard({
  assignment,
  index,
  isLight,
  onDismiss,
}: HomeAssignmentCardProps) {
  const { showToast } = useToast();

  return (
    <div
      className={`animate-fade-up flex items-center gap-3 rounded-xl p-3 transition-colors group ${
        isLight
          ? 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
          : 'bg-slate-800/50 hover:bg-slate-800/70'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          if (assignment.file_url) {
            window.open(assignment.file_url, '_blank');
          } else if (assignment.message) {
            showToast('info', String(assignment.message));
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500/50 to-red-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-orange-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium truncate transition-colors ${
                isLight
                  ? 'text-slate-900 group-hover:text-amber-700'
                  : 'text-white group-hover:text-orange-300'
              }`}
            >
              {String(assignment.document_title || assignment.title || 'Ödev')}
            </h4>
            <p
              className={`text-xs truncate ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {String(
                assignment.message ||
                  assignment.content ||
                  'Materyali incele ve çöz',
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {assignment.file_url && (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-lg flex items-center gap-1">
            <Download className="w-3 h-3" />
            İndir
          </span>
        )}
        <span className="text-slate-500 text-xs">
          {new Date(assignment.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDismiss(assignment);
          }}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Kaldır"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
