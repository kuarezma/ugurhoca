"use client";

import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { AdminAssignment, AdminUser } from "@/features/admin/types";

type AdminPrivateStudentsTabProps = {
  assignments: AdminAssignment[];
  onCreateAssignment: (studentId: string) => void;
  onCreateStudent: () => void;
  onDeleteAssignment: (id: string) => void;
  students: AdminUser[];
};

export default function AdminPrivateStudentsTab({
  assignments,
  onCreateAssignment,
  onCreateStudent,
  onDeleteAssignment,
  students,
}: AdminPrivateStudentsTabProps) {
  return (
    <motion.div
      key="privateStudents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Özel Ders Öğrencilerim
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Bireysel öğrencilerinizi ve ödevlerini yönetin
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateStudent}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Yeni Öğrenci Ekle
        </motion.button>
      </div>

      {students.length === 0 ? (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400 mb-4">
            Henüz özel ders öğrenciniz yok
          </p>
          <p className="text-slate-500 text-sm">
            Öğrenci eklemek için profil sayfasından "Özel Ders Öğrencisi"
            seçeneğini kullanın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student, index) => {
            const studentAssignments = assignments.filter(
              (assignment) => assignment.student_id === student.id,
            );

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl overflow-hidden card-hover"
              >
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white">
                      {student.name?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {student.name || "İsimsiz"}
                      </h3>
                      <p className="text-slate-400 text-sm break-all">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Ödevler</span>
                      <span className="text-amber-400 font-semibold">
                        {studentAssignments.length} adet
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, studentAssignments.length * 20)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {studentAssignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
                      >
                        <span className="text-slate-300 text-sm truncate flex-1">
                          {assignment.title}
                        </span>
                        <button
                          onClick={() => onDeleteAssignment(assignment.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {studentAssignments.length > 3 && (
                      <p className="text-slate-500 text-xs text-center">
                        +{studentAssignments.length - 3} ödev daha
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCreateAssignment(student.id)}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-lg hover:from-amber-500/40 hover:to-orange-500/40 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ödev Ekle
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
