"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { HelpCircle, X, ChevronDown, ChevronUp, CheckCircle2, BarChart2 } from "lucide-react";
import {
  encodeQuizMessage,
  type QuizMessage,
} from "@/features/live-lessons/lib/quiz-messages";
import { decodeDataPayload } from "@/features/live-lessons/lib/room-data";

type ActiveQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

type AnswerRow = {
  choiceIndex: number;
  displayName: string;
};

type LivePollStudentOverlayProps = {
  identity: string;
  displayName: string;
  roomId: string;
  isTeacher?: boolean;
  persistToken?: string | null;
  interactionLocked?: boolean;
};

export function LivePollStudentOverlay({
  identity,
  displayName,
  roomId,
  isTeacher = false,
  persistToken = null,
  interactionLocked = false,
}: LivePollStudentOverlayProps) {
  const room = useRoomContext();
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>({});
  const [myChoice, setMyChoice] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const persistEvent = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      if (!persistToken) return;
      void fetch("/api/lessons/persist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${persistToken}`,
        },
        body: JSON.stringify({ roomId, event, payload }),
      });
    },
    [persistToken, roomId],
  );

  const onData = useCallback(
    (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "quiz") return;
      const msg = decoded.message as QuizMessage;

      if (msg.kind === "question") {
        setActiveQuestion({
          id: msg.questionId,
          prompt: msg.prompt,
          options: msg.options,
          correctIndex: msg.correctIndex,
        });
        setAnswers({});
        setMyChoice(null);
        setIsMinimized(false);
        setIsDismissed(false);
      } else if (msg.kind === "clear_question") {
        setActiveQuestion(null);
        setAnswers({});
        setMyChoice(null);
      } else if (msg.kind === "answer") {
        const fromId = participant?.identity || msg.fromIdentity;
        setAnswers((prev) => ({
          ...prev,
          [fromId]: {
            choiceIndex: msg.choiceIndex,
            displayName: msg.displayName || participant?.name || "Öğrenci",
          },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [onData, room]);

  const handleSelectChoice = async (choiceIndex: number) => {
    if (!activeQuestion || myChoice !== null || interactionLocked) return;

    setMyChoice(choiceIndex);
    const msg: QuizMessage = {
      kind: "answer",
      questionId: activeQuestion.id,
      choiceIndex,
      fromIdentity: identity,
      displayName,
    };

    try {
      await room.localParticipant.publishData(encodeQuizMessage(msg), {
        reliable: true,
      });
      persistEvent("answer", {
        questionId: activeQuestion.id,
        choiceIndex,
      });
    } catch {
      // ignore
    }
  };

  const handleClearPoll = async () => {
    try {
      const clearMsg: QuizMessage = { kind: 'clear_question', fromIdentity: identity };
      await room.localParticipant.publishData(encodeQuizMessage(clearMsg), {
        reliable: true,
      });
      setActiveQuestion(null);
      setAnswers({});
      setMyChoice(null);
    } catch {
      // ignore
    }
  };

  const totalVotes = Object.keys(answers).length;

  const stats = useMemo(() => {
    if (!activeQuestion) return [];
    const total = Object.keys(answers).length;
    return activeQuestion.options.map((option, idx) => {
      const count = Object.values(answers).filter(
        (a) => a.choiceIndex === idx,
      ).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { option, count, percent };
    });
  }, [activeQuestion, answers]);

  if (!activeQuestion || isDismissed) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[130] w-full max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-violet-500/40 bg-slate-900/95 p-4 text-white shadow-2xl shadow-violet-950/60 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
              <HelpCircle className="h-4 w-4" />
              <span>{isTeacher ? 'Canlı Anket Yönetimi' : 'Canlı Soru / Anket'}</span>
            </div>
            {isTeacher && (
              <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                Öğretmen
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isTeacher && (
              <button
                type="button"
                onClick={() => void handleClearPoll()}
                className="mr-1 rounded-lg bg-rose-500/20 px-2 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 transition-colors"
                title="Anketi tüm öğrencilerin ekranından kaldır"
              >
                Anketi Bitir
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? 'Genişlet' : 'Küçült'}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Kapat"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <div className="mt-3 space-y-3">
            <p className="text-sm font-semibold text-slate-100 leading-snug">
              {activeQuestion.prompt}
            </p>

            {/* Total Votes summary bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1 text-[11px] font-medium text-violet-300">
                <BarChart2 className="h-3.5 w-3.5" />
                Katılım: {totalVotes} Öğrenci
              </span>
              {isTeacher && (
                <span className="text-[11px] text-slate-400">
                  Sonuçlar canlı akıyor
                </span>
              )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = myChoice === idx;
                const stat = stats[idx];
                const showStats = isTeacher || myChoice !== null;

                return (
                  <button
                    key={opt + idx}
                    type="button"
                    disabled={isTeacher || myChoice !== null || interactionLocked}
                    onClick={() => void handleSelectChoice(idx)}
                    className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all text-xs font-semibold ${
                      isSelected
                        ? 'border-violet-400 bg-violet-600/30 text-white shadow-md shadow-violet-500/20'
                        : showStats
                          ? 'border-white/10 bg-slate-800/60 text-slate-200'
                          : 'border-white/10 bg-slate-800/80 hover:border-violet-500/40 hover:bg-slate-700/80 text-white active:scale-98'
                    }`}
                  >
                    {/* Live Percent Progress Bar */}
                    {showStats && stat && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                          isSelected ? 'bg-violet-500/30' : 'bg-violet-500/15'
                        }`}
                        style={{ width: `${stat.percent}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="truncate">{opt}</span>
                      {showStats && stat && (
                        <span className="text-[11px] font-bold text-violet-300 ml-1">
                          %{stat.percent} ({stat.count})
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer status notification for student */}
            {!isTeacher && myChoice !== null && (
              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cevabınız iletildi
                </span>
                <span className="text-[11px] text-slate-500">
                  Toplam {totalVotes} Yanıt
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
