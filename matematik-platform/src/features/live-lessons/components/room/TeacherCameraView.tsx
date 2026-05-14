"use client";

import { VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function TeacherCameraView({ role }: { role: "teacher" | "student" }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }], {
    onlySubscribed: role === "student",
  });
  const trackRef =
    role === "teacher"
      ? tracks.find((ref) => ref.participant?.isLocal && ref.publication?.track)
      : tracks.find((ref) => !ref.participant?.isLocal && ref.publication?.track);

  return (
    <div className="min-h-[7rem] overflow-hidden rounded-xl border border-border bg-black/90">
      {trackRef?.publication?.track ? (
        <VideoTrack trackRef={trackRef} className="h-full max-h-44 w-full object-cover" />
      ) : (
        <div className="flex min-h-[7rem] items-center justify-center px-4 text-center text-xs text-white/70">
          Öğretmen kamerası açıldığında burada görünecek.
        </div>
      )}
    </div>
  );
}
