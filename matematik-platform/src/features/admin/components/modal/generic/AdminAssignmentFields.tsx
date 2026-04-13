import type {
  AdminFormState,
  AdminUser,
} from "@/features/admin/types";
import {
  PRIVATE_STUDENT_GRADES,
  type AdminFormUpdate,
} from "@/features/admin/components/modal/shared";

type AdminAssignmentFieldsProps = {
  formData: AdminFormState;
  onSelectedStudentChange: (studentId: string) => void;
  privateStudents: AdminUser[];
  selectedStudent: string;
  updateFormData: AdminFormUpdate;
};

export default function AdminAssignmentFields({
  formData,
  onSelectedStudentChange,
  privateStudents,
  selectedStudent,
  updateFormData,
}: AdminAssignmentFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Öğrenci (Özel)
        </label>
        <select
          value={selectedStudent}
          onChange={(event) => onSelectedStudentChange(event.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">İsteğe bağlı seçim</option>
          {privateStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name || student.email}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2 text-sm">
          Sınıf (Genel)
        </label>
        <select
          value={formData.grade || ""}
          onChange={(event) =>
            updateFormData({
              grade: event.target.value ? parseInt(event.target.value) : null,
            })
          }
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">Sınıf seçin</option>
          {PRIVATE_STUDENT_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}. Sınıf
            </option>
          ))}
          <option value="Mezun">Mezun</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-slate-300 mb-2 text-sm">
          Teslim Tarihi
        </label>
        <input
          type="datetime-local"
          value={formData.due_date || ""}
          onChange={(event) => updateFormData({ due_date: event.target.value })}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>
    </div>
  );
}
