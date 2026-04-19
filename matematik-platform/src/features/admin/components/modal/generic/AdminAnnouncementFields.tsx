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
          className="block text-slate-300 mb-2 text-sm"
        >
          Görsel Linkleri
        </label>
        <textarea
          id={imageUrlsId}
          rows={4}
          value={formData.image_urls || ""}
          onChange={(event) => updateFormData({ image_urls: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-pink-500 transition-colors resize-none"
          placeholder={`Her satıra bir Yandex görsel linki yapıştır\nhttps://.../foto1.jpg\nhttps://.../foto2.jpg`}
        />
        <p className="text-xs text-slate-500 mt-2">
          Her satıra 1 görsel linki gir. İlk görsel kapak olur.
        </p>
      </div>

      <div>
        <label
          htmlFor={linkUrlId}
          className="block text-slate-300 mb-2 text-sm"
        >
          Detay Linki
        </label>
        <input
          id={linkUrlId}
          type="url"
          value={formData.link_url || ""}
          onChange={(event) => updateFormData({ link_url: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-pink-500 transition-colors"
          placeholder="PDF ya da site linki"
        />
        <p className="text-xs text-slate-500 mt-2">
          PDF, site veya başka bir detay bağlantısı ekleyebilirsin.
        </p>
      </div>
    </>
  );
}
