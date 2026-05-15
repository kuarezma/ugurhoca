"use client";

import { VideoTrack, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

export function RemoteScreenShareView({
  fit = "contain",
  role,
}: {
  fit?: "contain" | "cover";
  role: "teacher" | "student";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fitClass = fit === "cover" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain";
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

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
        return;
      }
      await element.requestFullscreen();
    } catch {
      // Bazı mobil tarayıcılar tam ekranı yalnızca kullanıcı etkileşimiyle açar.
    }
  }, []);

  const fullscreenButton = (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      className="absolute right-3 top-3 z-10 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-black/85"
    >
      {isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
    </button>
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
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center bg-black"
      >
        <VideoTrack trackRef={ref} className={fitClass} />
        {fullscreenButton}
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
    <div
      ref={containerRef}
      className="relative flex flex-1 items-center justify-center bg-black"
    >
      <VideoTrack trackRef={ref} className={fitClass} />
      {fullscreenButton}
    </div>
  );
}
