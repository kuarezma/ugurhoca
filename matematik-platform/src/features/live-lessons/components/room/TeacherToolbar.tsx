"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { useCallback, useState } from "react";

export function TeacherToolbar() {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const [cameraBusy, setCameraBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);
  const [micBusy, setMicBusy] = useState(false);

  const toggleScreen = useCallback(async () => {
    setScreenBusy(true);
    try {
      const on = localParticipant.isScreenShareEnabled;
      await localParticipant.setScreenShareEnabled(!on);
    } catch {
      /* kullanıcı iptal edebilir */
    } finally {
      setScreenBusy(false);
    }
  }, [localParticipant]);

  const toggleMic = useCallback(async () => {
    setMicBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      /* izin reddi vb. */
    } finally {
      setMicBusy(false);
    }
  }, [isMicrophoneEnabled, localParticipant]);

  const toggleCamera = useCallback(async () => {
    setCameraBusy(true);
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      /* izin reddi vb. */
    } finally {
      setCameraBusy(false);
    }
  }, [isCameraEnabled, localParticipant]);

  const screenOn = localParticipant.isScreenShareEnabled;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => void toggleMic()}
        disabled={micBusy}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          isMicrophoneEnabled
            ? "bg-sky-600 text-white hover:bg-sky-500"
            : "border border-border bg-card hover:bg-foreground/5"
        }`}
      >
        {micBusy ? "…" : isMicrophoneEnabled ? "Mikrofonu kapat" : "Mikrofonu aç"}
      </button>
      <button
        type="button"
        onClick={() => void toggleCamera()}
        disabled={cameraBusy}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          isCameraEnabled
            ? "bg-violet-600 text-white hover:bg-violet-500"
            : "border border-border bg-card hover:bg-foreground/5"
        }`}
      >
        {cameraBusy ? "…" : isCameraEnabled ? "Kamerayı kapat" : "Kamerayı aç"}
      </button>
      <button
        type="button"
        onClick={() => void toggleScreen()}
        disabled={screenBusy}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
          screenOn
            ? "bg-red-600 text-white hover:bg-red-500"
            : "bg-emerald-600 text-white hover:bg-emerald-500"
        }`}
      >
        {screenBusy ? "…" : screenOn ? "Paylaşımı durdur" : "Ekranı paylaş"}
      </button>
    </div>
  );
}
