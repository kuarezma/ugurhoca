import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { AdminModalType } from "@/features/admin/types";

type AdminModalSuccessStateProps = {
  modalType: AdminModalType;
};

export default function AdminModalSuccessState({
  modalType,
}: AdminModalSuccessStateProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Başarılı!</h3>
      <p className="text-slate-400">
        {modalType === "editUser" ? "Kullanıcı güncellendi" : "İçeriğiniz eklendi"}
      </p>
    </motion.div>
  );
}
