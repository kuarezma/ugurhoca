const STORAGE_PREFIX = "yapay_teacher_proof:";

export function teacherProofKey(roomId: string): string {
  return `${STORAGE_PREFIX}${roomId}`;
}

export function saveTeacherProof(roomId: string, proof: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(teacherProofKey(roomId), proof);
  } catch {
    /* sessionStorage erişimi engellenmiş olabilir */
  }
}

export function readTeacherProof(roomId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(teacherProofKey(roomId));
  } catch {
    return null;
  }
}

export function clearTeacherProof(roomId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(teacherProofKey(roomId));
  } catch {
    /* ignore */
  }
}
