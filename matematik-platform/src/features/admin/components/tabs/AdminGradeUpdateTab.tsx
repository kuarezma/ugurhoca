'use client';

import { AlertCircle, GraduationCap, RefreshCw } from 'lucide-react';
import { ADMIN_EMAIL } from '@/lib/admin';
import type { AdminUser } from '@/features/admin/types';

type AdminGradeUpdateTabProps = {
  isSubmitting: boolean;
  lastGradeUpdate: string | null;
  onUpdateGrades: () => Promise<void> | void;
  users: AdminUser[];
};

export default function AdminGradeUpdateTab({
  isSubmitting,
  lastGradeUpdate,
  onUpdateGrades,
  users,
}: AdminGradeUpdateTabProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="glass rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Sınıf Güncelleme</h2>
            <p className="text-slate-400">
              Tüm öğrencilerin sınıfını bir üst seviyeye taşı
            </p>
          </div>
        </div>

        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-teal-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-teal-300 font-medium mb-1">
                Bu işlem ne yapar?
              </p>
              <p className="text-slate-400">
                Tüm öğrencilerin sınıfı otomatik olarak +1 artırılır. Örneğin:
                5. sınıf → 6. sınıf, 12. sınıf → 12. sınıf (sabit kalır)
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 mb-3">Mevcut durum:</p>
          <div className="grid grid-cols-4 gap-3">
            {[5, 6, 7, 8, 9, 10, 11, 12, 'Mezun'].map((grade) => {
              const count = users.filter(
                (user) => user.grade === grade && user.email !== ADMIN_EMAIL,
              ).length;

              return (
                <div
                  key={grade}
                  className="bg-slate-800/50 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-xs text-slate-400">
                    {grade === 'Mezun' ? 'Mezun' : `${grade}. Sınıf`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-slate-500 text-sm mb-6">
          Son güncelleme:{' '}
          <span className="text-slate-300 font-medium">
            {lastGradeUpdate || 'Henüz yapılmadı'}
          </span>
        </div>

        <button
          onClick={onUpdateGrades}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Sınıfları Güncelle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
