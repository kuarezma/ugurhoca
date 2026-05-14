"use client";

import { VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export function RemoteScreenShareView({
  role,
}: {
  role: "teacher" | "student";
}) {
  const remoteScreen = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: true },
  );

  const localScreen = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  const teacherRemote = remoteScreen.filter(
    (ref) => !ref.participant?.isLocal,
  );
  const teacherLocal = localScreen.filter(
    (ref) => ref.participant?.isLocal && ref.publication?.track,
  );

  if (role === "teacher") {
    const ref = teacherLocal[0] ?? teacherRemote[0];
    if (!ref?.publication?.track) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-white/70">
          Henüz ekran paylaşımı yok. Üstteki &quot;Ekranı paylaş&quot; ile
          başlatın; öğrenciler burayı görecek.
        </div>
      );
    }
    return (
      <div className="relative flex flex-1 items-center justify-center">
        <VideoTrack trackRef={ref} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  const ref = teacherRemote[0];
  if (!ref?.publication?.track) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-white/70">
        Öğretmen ekranını paylaştığında burada görünecek.
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center">
      <VideoTrack trackRef={ref} className="max-h-full max-w-full object-contain" />
    </div>
  );
}
