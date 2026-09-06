'use client';

import { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Check, ArrowRight } from 'lucide-react';
import { EXIT_TICKET_TEMPLATES } from '../lib/exitTicketTemplates';
import { createExitTicketSession } from '../lib/exitTicketStorage';
import type { ExitTicketSession } from '../types';

export interface ExitTicketCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: ExitTicketSession) => void;
}

export function ExitTicketCreateModal({
  isOpen,
  onClose,
  onSessionCreated,
}: ExitTicketCreateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    EXIT_TICKET_TEMPLATES[0].id,
  );

  if (!isOpen) return null;

  const selectedTemplate =
    EXIT_TICKET_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    EXIT_TICKET_TEMPLATES[0];

  const handleLaunch = () => {
    const session = createExitTicketSession(
      selectedTemplate.title,
      selectedTemplate.grade,
      selectedTemplate.questions,
    );
    onSessionCreated(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Başlık */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Yeni Çıkış Bileti Oturumu Başlat
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Ders sonu 3 dakikalık hızlı teşhis oturumu açın ve tahtaya yansıtın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Gövde - Şablon Seçimi */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hazır Pedagojik Teşhis Şablonu Seçin
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {EXIT_TICKET_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/15 ring-2 ring-violet-500/40'
                      : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {tmpl.grade}. Sınıf
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {tmpl.subject} • {tmpl.questions.length} Soru
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                    Çeldiricilere özel kavram yanılgısı açıklamaları hazır
                  </div>
                </button>
              );
            })}
          </div>

          {/* Seçilen Şablon Soruları Önizleme */}
          <div className="mt-4 rounded-2xl bg-slate-950/60 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Oturum İçeriği ({selectedTemplate.questions.length} Soru)</span>
            </div>
            <div className="space-y-2">
              {selectedTemplate.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="text-xs p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2 text-slate-300"
                >
                  <span className="font-bold text-amber-400 flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="truncate">{q.prompt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Alt Panel */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition flex items-center gap-2 shadow-lg shadow-violet-600/30 active:scale-[0.98]"
          >
            <span>Oturumu Başlat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
