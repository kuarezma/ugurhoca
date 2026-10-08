import { useId } from "react";
import type { AdminFormState } from "@/features/admin/types";
import { type AdminFormUpdate } from "@/features/admin/components/modal/shared";

type AdminAnnouncementFieldsProps = {
  formData: AdminFormState;
  updateFormData: AdminFormUpdate;
};

export default function AdminAnnouncementFields({
  formData,
  updateFormData,
}: AdminAnnouncementFieldsProps) {
  const baseId = useId();
  const imageUrlsId = `${baseId}-image-urls`;
  const linkUrlId = `${baseId}-link-url`;

  return (
    <>
      <div>
        <label
          htmlFor={imageUrlsId}
          className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm"
        >
          Görsel Linkleri
        </label>
        <textarea
          id={imageUrlsId}
          rows={4}
          value={formData.image_urls || ""}
          onChange={(event) => updateFormData({ image_urls: event.target.value })}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs resize-none"
          placeholder={`Her satıra bir Yandex görsel linki yapıştır\nhttps://.../foto1.jpg\nhttps://.../foto2.jpg`}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Her satıra 1 görsel linki gir. İlk görsel kapak olur.
        </p>
      </div>

      <div>
        <label
          htmlFor={linkUrlId}
          className="block text-slate-700 dark:text-slate-200 font-semibold mb-2 text-sm"
        >
          Detay Linki
        </label>
        <input
          id={linkUrlId}
          type="url"
          value={formData.link_url || ""}
          onChange={(event) => updateFormData({ link_url: event.target.value })}
          className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
          placeholder="PDF ya da site linki"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          PDF, site veya başka bir detay bağlantısı ekleyebilirsin.
        </p>
      </div>
    </>
  );
}
