"use client";

import { useLocalParticipant } from "@livekit/components-react";
import { useCallback, useState } from "react";
import { BarChart2 } from "lucide-react";
import { TeacherQuestionPoolModal } from "@/features/live-lessons/components/TeacherQuestionPoolModal";
import { encodeQuizMessage } from "@/features/live-lessons/lib/quiz-messages";
import { useToast } from "@/components/Toast";

type TeacherToolbarProps = {
  onOpenModeration?: () => void;
};

export function TeacherToolbar({ onOpenModeration }: TeacherToolbarProps = {}) {
  const { showToast } = useToast();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const [cameraBusy, setCameraBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);
  const [micBusy, setMicBusy] = useState(false);
  const [pollBusy, setPollBusy] = useState(false);
  const [isPoolOpen, setIsPoolOpen] = useState(false);

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

  const handleLaunchQuickPoll = useCallback(async () => {
    setPollBusy(true);
    try {
      const quickPoll = {
        kind: "question" as const,
        questionId: `quick_poll_${Date.now()}`,
        prompt: "Hızlı Soru: Doğru seçeneği işaretleyin",
        options: ["A", "B", "C", "D"],
        correctIndex: -1,
        fromIdentity: localParticipant.identity,
      };
      await localParticipant.publishData(encodeQuizMessage(quickPoll), {
        reliable: true,
      });
      showToast("success", "Hızlı anket öğrencilerin ekranına gönderildi.");
    } catch {
      showToast("error", "Anket gönderilemedi.");
    } finally {
      setPollBusy(false);
    }
  }, [localParticipant, showToast]);

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
      <button
        type="button"
        onClick={() => void handleLaunchQuickPoll()}
        disabled={pollBusy}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 transition flex items-center gap-1.5 disabled:opacity-50"
        title="Öğrencilerin ekranına anlık A-B-C-D anketi gönder"
      >
        <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
        <span>{pollBusy ? "Gönderiliyor..." : "Hızlı Anket (A-B-C-D)"}</span>
      </button>
      <button
        type="button"
        onClick={() => setIsPoolOpen(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1"
        title="Öğrencilerin gönderdiği soruları aç"
      >
        <span>Öğrenci Soruları</span>
      </button>

      {onOpenModeration && (
        <button
          type="button"
          onClick={onOpenModeration}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition flex items-center gap-1"
          title="Katılımcılar ve el kaldıranlar listesini aç"
        >
          <span>✋ Söz / Katılımcılar</span>
        </button>
      )}

      <TeacherQuestionPoolModal
        isOpen={isPoolOpen}
        onClose={() => setIsPoolOpen(false)}
      />
    </div>
  );
}
