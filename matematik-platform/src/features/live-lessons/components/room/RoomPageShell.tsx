"use client";

import dynamic from "next/dynamic";
import type { LiveLesson, LiveLessonRole } from "@/features/live-lessons/types";

const RoomExperience = dynamic(() => import("@/features/live-lessons/components/room/RoomExperience"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-foreground/70">
      Oda yükleniyor…
    </div>
  ),
});

type Props = {
  displayName: string;
  lesson: LiveLesson;
  role: LiveLessonRole;
  teacherProof?: string | null;
  userId: string;
};

export function RoomPageShell(props: Props) {
  return <RoomExperience {...props} />;
}
