import { useId, useState, startTransition } from 'react';
import { AlertCircle, FunctionSquare } from 'lucide-react';
import type { AdminFormState } from '@/features/admin/types';
import {
  OPTION_LETTERS,
  type AdminFormUpdate,
} from '@/features/admin/components/modal/shared';
import dynamic from 'next/dynamic';

const AdminLatexHelperModal = dynamic(() =>
  import('@/features/admin/components/modal/AdminLatexHelperModal').then(
    (module) => module.AdminLatexHelperModal,
  ),
);

type AdminQuestionFieldsProps = {
  formData: AdminFormState;
  updateFormData: AdminFormUpdate;
};

export default function AdminQuestionFields({
  formData,
  updateFormData,
}: AdminQuestionFieldsProps) {
  const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
  const [hasOpenedLatexModal, setHasOpenedLatexModal] = useState(false);
  const baseId = useId();
  const questionId = `${baseId}-question`;
  const typeGroupLabelId = `${baseId}-type-label`;
  const optionsGroupLabelId = `${baseId}-options-label`;
  const shortAnswerId = `${baseId}-short-answer`;
  const rubricId = `${baseId}-rubric`;
  const openSampleId = `${baseId}-open-sample`;
  const explanationId = `${baseId}-explanation`;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={questionId}
            className="block text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-xs"
          >
            Soru Metni
          </label>
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                setHasOpenedLatexModal(true);
                setIsLatexModalOpen(true);
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 hover:text-violet-900 dark:hover:text-white transition"
          >
            <FunctionSquare className="w-3.5 h-3.5" />
            Formül / LaTeX Asistanı
          </button>
        </div>
        <textarea
          id={questionId}
          required
          rows={3}
          value={formData.question || ''}
          onChange={(event) => updateFormData({ question: event.target.value })}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-2xl px-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none shadow-xs"
          placeholder="Soruyu buraya yazın..."
        />
      </div>

      {/* İlk açılıştan sonra formül taslağını korumak için modal bağlı kalır. */}
      {hasOpenedLatexModal && (
        <AdminLatexHelperModal
          isOpen={isLatexModalOpen}
          onClose={() => setIsLatexModalOpen(false)}
          onInsertFormula={(formula) => {
            const current = formData.question || '';
            updateFormData({
              question: current ? `${current} ${formula}` : formula,
            });
          }}
        />
      )}

      {/* Soru Tipi Seçici */}
      <div role="group" aria-labelledby={typeGroupLabelId}>
        <span
          id={typeGroupLabelId}
          className="block text-slate-700 dark:text-slate-200 mb-2 font-bold uppercase tracking-wider text-xs"
        >
          Soru Tipi (MEB Maarif Modeli)
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'multiple_choice', label: 'Çoktan Seçmeli' },
            { id: 'short_answer', label: 'Kısa Cevaplı' },
            { id: 'open_ended', label: 'Açık Uçlu (MEB)' },
          ].map((typeOption) => {
            const currentType =
              (formData as Record<string, unknown>).question_type ||
              'multiple_choice';
            const isSelected = currentType === typeOption.id;
            return (
              <button
                key={typeOption.id}
                type="button"
                onClick={() =>
                  updateFormData({
                    question_type: typeOption.id,
                  } as unknown as Partial<AdminFormState>)
                }
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {typeOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Çoktan Seçmeli Şıklar */}
      {((formData as Record<string, unknown>).question_type ||
        'multiple_choice') === 'multiple_choice' && (
        <div role="group" aria-labelledby={optionsGroupLabelId}>
          <span
            id={optionsGroupLabelId}
            className="block text-slate-700 dark:text-slate-200 mb-3 font-bold uppercase tracking-wider text-xs"
          >
            Şıklar ve Doğru Cevap
          </span>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => {
              const isCorrect = formData.correct_index === index;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-xs' : 'border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40'}`}
                >
                  <div className="pl-3 pr-1">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={isCorrect}
                      onChange={() => updateFormData({ correct_index: index })}
                      className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      required
                    />
                  </div>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                  >
                    {OPTION_LETTERS[index]}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.options?.[index] || ''}
                    onChange={(event) => {
                      const nextOptions = [
                        ...(formData.options || ['', '', '', '']),
                      ];
                      nextOptions[index] = event.target.value;
                      updateFormData({ options: nextOptions });
                    }}
                    className="flex-1 bg-transparent border-none text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm py-2"
                    placeholder={`${OPTION_LETTERS[index]} Şıkkını girin...`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kısa Cevaplı Soru Alanı */}
      {(formData as Record<string, unknown>).question_type ===
        'short_answer' && (
        <div>
          <label
            htmlFor={shortAnswerId}
            className="block text-slate-700 dark:text-slate-200 mb-2 font-bold uppercase tracking-wider text-xs"
          >
            Beklenen Doğru Cevap (Alternatifleri | ile ayırın)
          </label>
          <input
            id={shortAnswerId}
            type="text"
            required
            value={
              ((formData as Record<string, unknown>)
                .expected_answer as string) || ''
            }
            onChange={(e) =>
              updateFormData({
                expected_answer: e.target.value,
              } as unknown as Partial<AdminFormState>)
            }
            className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm shadow-xs font-mono"
            placeholder="Örn: 1/2|0,5|0.5 veya 36"
          />
        </div>
      )}

      {/* Açık Uçlu Soru ve Rubrik Alanı */}
      {(formData as Record<string, unknown>).question_type === 'open_ended' && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={rubricId}
              className="block text-slate-700 dark:text-slate-200 mb-2 font-bold uppercase tracking-wider text-xs"
            >
              MEB Puanlama Anahtarı (Rubrik - Her satıra bir adım yazın)
            </label>
            <textarea
              id={rubricId}
              rows={3}
              value={
                Array.isArray((formData as Record<string, unknown>).rubric)
                  ? (
                      (formData as Record<string, unknown>).rubric as string[]
                    ).join('\n')
                  : ((formData as Record<string, unknown>).rubric as string) ||
                    ''
              }
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(Boolean);
                updateFormData({
                  rubric: lines,
                } as unknown as Partial<AdminFormState>);
              }}
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm shadow-xs resize-y"
              placeholder="1. Adım: Ortak çarpanları bulma (40 puan)&#10;2. Adım: EBOB değerini 36 olarak hesaplama (60 puan)"
            />
          </div>
          <div>
            <label
              htmlFor={openSampleId}
              className="block text-slate-700 dark:text-slate-200 mb-1 font-bold uppercase tracking-wider text-xs"
            >
              Örnek Kısa Sonuç (Opsiyonel)
            </label>
            <input
              id={openSampleId}
              type="text"
              value={
                ((formData as Record<string, unknown>)
                  .expected_answer as string) || ''
              }
              onChange={(e) =>
                updateFormData({
                  expected_answer: e.target.value,
                } as unknown as Partial<AdminFormState>)
              }
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm shadow-xs font-mono"
              placeholder="Örn: 36 cm"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor={explanationId}
          className="block text-amber-600 dark:text-amber-400 mb-2 font-bold uppercase tracking-wider text-xs flex items-center gap-1 mt-4"
        >
          <AlertCircle className="w-3.5 h-3.5" /> Çözüm / Açıklama (Opsiyonel)
        </label>
        <textarea
          id={explanationId}
          rows={2}
          value={formData.explanation || ''}
          onChange={(event) =>
            updateFormData({ explanation: event.target.value })
          }
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none shadow-xs"
          placeholder="Öğrenci soruyu yanlış yaptığında göreceği açıklama..."
        />
      </div>
    </>
  );
}
