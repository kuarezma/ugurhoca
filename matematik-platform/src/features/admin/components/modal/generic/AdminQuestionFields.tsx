import { useId } from "react";
import { AlertCircle } from "lucide-react";
import type { AdminFormState } from "@/features/admin/types";
import {
  OPTION_LETTERS,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";

type AdminQuestionFieldsProps = {
  formData: AdminFormState;
  updateFormData: AdminFormUpdate;
};

export default function AdminQuestionFields({
  formData,
  updateFormData,
}: AdminQuestionFieldsProps) {
  const baseId = useId();
  const questionId = `${baseId}-question`;
  const optionsGroupLabelId = `${baseId}-options-label`;
  const explanationId = `${baseId}-explanation`;

  return (
    <>
      <div>
        <label
          htmlFor={questionId}
          className="block text-slate-300 mb-2 font-bold uppercase tracking-wider text-xs"
        >
          Soru Metni
        </label>
        <textarea
          id={questionId}
          required
          rows={3}
          value={formData.question || ""}
          onChange={(event) => updateFormData({ question: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-4 text-white
                   focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none shadow-inner"
          placeholder="Soruyu buraya yazın..."
        />
      </div>

      <div role="group" aria-labelledby={optionsGroupLabelId}>
        <span
          id={optionsGroupLabelId}
          className="block text-slate-300 mb-3 font-bold uppercase tracking-wider text-xs"
        >
          Şıklar ve Doğru Cevap
        </span>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((index) => {
            const isCorrect = formData.correct_index === index;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "border-slate-700/50 bg-slate-800/30"}`}
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
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-700 text-slate-300"}`}
                >
                  {OPTION_LETTERS[index]}
                </div>
                <input
                  type="text"
                  required
                  value={formData.options?.[index] || ""}
                  onChange={(event) => {
                    const nextOptions = [...(formData.options || ["", "", "", ""])];
                    nextOptions[index] = event.target.value;
                    updateFormData({ options: nextOptions });
                  }}
                  className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 text-sm py-2"
                  placeholder={`${OPTION_LETTERS[index]} Şıkkını girin...`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor={explanationId}
          className="block text-amber-500 mb-2 font-bold uppercase tracking-wider text-xs flex items-center gap-1 mt-4"
        >
          <AlertCircle className="w-3.5 h-3.5" /> Çözüm / Açıklama
          (Opsiyonel)
        </label>
        <textarea
          id={explanationId}
          rows={2}
          value={formData.explanation || ""}
          onChange={(event) =>
            updateFormData({ explanation: event.target.value })
          }
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-white
                   focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
          placeholder="Öğrenci soruyu yanlış yaptığında göreceği açıklama..."
        />
      </div>
    </>
  );
}
