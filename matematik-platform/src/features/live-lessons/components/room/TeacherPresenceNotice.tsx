"use client";

import { useRemoteParticipants } from "@livekit/components-react";

export function TeacherPresenceNotice() {
  const remotes = useRemoteParticipants();
  const teacherOnline = remotes.some((participant) =>
    participant.identity.startsWith("teacher_"),
  );

  if (teacherOnline) return null;

  return (
    <div
      className="border-t border-amber-400/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-200"
      role="status"
    >
      Öğretmen bağlantısı bekleniyor. Bağlantı dönünce ders otomatik devam eder.
    </div>
  );
}
