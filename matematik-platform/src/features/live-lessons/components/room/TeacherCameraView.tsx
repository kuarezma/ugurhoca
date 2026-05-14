"use client";

import { VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function TeacherCameraView({
  cameraSize = "medium",
  role,
}: {
  cameraSize?: "small" | "medium" | "large";
  role: "teacher" | "student";
}) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }], {
    onlySubscribed: role === "student",
  });
  const trackRef =
    role === "teacher"
      ? tracks.find((ref) => ref.participant?.isLocal && ref.publication?.track)
      : tracks.find((ref) => !ref.participant?.isLocal && ref.publication?.track);

  const heightClass =
    cameraSize === "large" ? "min-h-[14rem]" : cameraSize === "small" ? "min-h-[6rem]" : "min-h-[9rem]";
  const maxHeightClass =
    cameraSize === "large" ? "max-h-72" : cameraSize === "small" ? "max-h-28" : "max-h-44";

  return (
    <div className={`${heightClass} overflow-hidden rounded-xl border border-border bg-black/90`}>
      {trackRef?.publication?.track ? (
        <VideoTrack trackRef={trackRef} className={`h-full ${maxHeightClass} w-full object-cover`} />
      ) : (
        <div className={`flex ${heightClass} items-center justify-center px-4 text-center text-xs text-white/70`}>
          Öğretmen kamerası açıldığında burada görünecek.
        </div>
      )}
    </div>
  );
}
