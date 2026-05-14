"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function csvCell(value: string): string {
  const v = value.replace(/\r\n/g, "\n");
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function QuizPanel({
  roomId,
  role,
  displayName,
  identity,
  persistToken,
  interactionLocked = false,
}: {
  roomId: string;
  role: "teacher" | "student";
  displayName: string;
  identity: string;
  persistToken: string | null;
  interactionLocked?: boolean;
}) {
  const room = useRoomContext();
  const [active, setActive] = useState<ActiveQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>({});
  const [myChoice, setMyChoice] = useState<number | null>(null);

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
      }).catch(() => {});
    },
    [persistToken, roomId],
  );

  const [draftPrompt, setDraftPrompt] = useState("2 + 2 kaçtır?");
  const [draftOptions, setDraftOptions] = useState(["2", "3", "4", "5"]);
  const [draftCorrect, setDraftCorrect] = useState(2);

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "quiz") return;
      const msg = decoded.message;

      if (msg.kind === "question") {
        setActive({
          id: msg.questionId,
          prompt: msg.prompt,
          options: msg.options,
          correctIndex: msg.correctIndex,
        });
        setAnswers({});
        setMyChoice(null);
        return;
      }

      if (msg.kind === "clear_question") {
        setActive(null);
        setAnswers({});
        setMyChoice(null);
        return;
      }

      if (msg.kind === "answer") {
        if (role !== "teacher") return;
        if (
          participant?.identity &&
          participant.identity !== msg.fromIdentity
        ) {
          return;
        }
        setAnswers((prev) => ({
          ...prev,
          [msg.fromIdentity]: {
            choiceIndex: msg.choiceIndex,
            displayName: msg.displayName,
          },
        }));

        persistEvent("answer", {
          questionId: msg.questionId,
          participantIdentity: msg.fromIdentity,
          displayName: msg.displayName,
          choiceIndex: msg.choiceIndex,
        });
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, role, persistEvent]);

  const publish = useCallback(
    async (msg: QuizMessage) => {
      await room.localParticipant.publishData(encodeQuizMessage(msg), {
        reliable: true,
      });
    },
    [room],
  );

  const sendQuestion = useCallback(async () => {
    const opts = draftOptions.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) return;
    const questionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `q_${Date.now()}`;
    const correct = Math.min(Math.max(0, draftCorrect), opts.length - 1);
    const q: ActiveQuestion = {
      id: questionId,
      prompt: draftPrompt.trim() || "Soru",
      options: opts,
      correctIndex: correct,
    };
    setActive(q);
    setAnswers({});
    setMyChoice(null);
    const msg: QuizMessage = {
      kind: "question",
      questionId,
      prompt: q.prompt,
      options: q.options,
      correctIndex: correct,
      fromIdentity: identity,
    };
    await publish(msg);
    persistEvent("question", {
      questionId,
      prompt: q.prompt,
      options: q.options,
      correctIndex: correct,
    });
  }, [draftCorrect, draftOptions, draftPrompt, identity, persistEvent, publish]);

  const clearQuestion = useCallback(async () => {
    setActive(null);
    setAnswers({});
    setMyChoice(null);
    await publish({ kind: "clear_question", fromIdentity: identity });
    persistEvent("clear_question", {});
  }, [identity, persistEvent, publish]);

  const sendAnswer = useCallback(
    async (choiceIndex: number) => {
      if (!active) return;
      setMyChoice(choiceIndex);
      const msg: QuizMessage = {
        kind: "answer",
        questionId: active.id,
        choiceIndex,
        fromIdentity: identity,
        displayName,
      };
      await publish(msg);
    },
    [active, displayName, identity, publish],
  );

  const summary = useMemo(() => {
    const rows = Object.entries(answers);
    const counts: Record<number, number> = {};
    for (const [, v] of rows) {
      counts[v.choiceIndex] = (counts[v.choiceIndex] ?? 0) + 1;
    }
    return { rows, counts };
  }, [answers]);

  const buildQuestionCsv = useCallback(() => {
    if (!active) return "";
    const lines: string[] = [
      "soru",
      csvCell(active.prompt),
      "dogru_sik",
      String(active.correctIndex + 1),
      "",
      "katilimci,sik_index,sik_metni,dogru",
    ];
    for (const [, row] of summary.rows) {
      const optText = active.options[row.choiceIndex] ?? "";
      lines.push(
        [
          csvCell(row.displayName),
          String(row.choiceIndex + 1),
          csvCell(optText),
          row.choiceIndex === active.correctIndex ? "evet" : "hayir",
        ].join(","),
      );
    }
    return lines.join("\n");
  }, [active, summary.rows]);

  const [exportHint, setExportHint] = useState<string | null>(null);
  const exportHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashExportHint = useCallback((text: string) => {
    if (exportHintTimer.current) clearTimeout(exportHintTimer.current);
    setExportHint(text);
    exportHintTimer.current = setTimeout(() => {
      exportHintTimer.current = null;
      setExportHint(null);
    }, 2200);
  }, []);

  useEffect(
    () => () => {
      if (exportHintTimer.current) clearTimeout(exportHintTimer.current);
    },
    [],
  );

  const copyCsv = useCallback(async () => {
    const text = buildQuestionCsv();
    if (!text) {
      flashExportHint("Önce bir soru gönderin.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      flashExportHint("CSV panoya kopyalandı.");
    } catch {
      flashExportHint("Panoya kopyalanamadı.");
    }
  }, [buildQuestionCsv, flashExportHint]);

  const downloadCsv = useCallback(() => {
    const text = buildQuestionCsv();
    if (!text || !active) {
      flashExportHint("Önce bir soru gönderin.");
      return;
    }
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soru-${active.id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flashExportHint("CSV indirildi.");
  }, [active, buildQuestionCsv, flashExportHint]);

  if (role === "student" && interactionLocked) {
    return (
      <aside className="flex w-full shrink-0 flex-col gap-2 rounded-xl border border-border bg-card p-4 md:w-80">
        <h2 className="text-sm font-semibold">Soru</h2>
        <p className="text-sm text-foreground/70">
          Öğretmen onayından sonra canlı sorulara katılabilirsiniz.
        </p>
      </aside>
    );
  }

  if (role === "teacher") {
    return (
      <aside className="flex max-h-[min(70vh,42rem)] w-full shrink-0 flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-card p-4 md:w-80">
        <h2 className="text-sm font-semibold">Canlı soru</h2>

        <label className="block space-y-1">
          <span className="text-xs text-foreground/70">Soru metni</span>
          <textarea
            className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs text-foreground/70">Şıklar</span>
          {draftOptions.map((opt, i) => (
            <input
              key={i}
              className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent focus:ring-2"
              value={opt}
              onChange={(e) => {
                const next = [...draftOptions];
                next[i] = e.target.value;
                setDraftOptions(next);
              }}
              placeholder={`Şık ${i + 1}`}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-foreground/70">Doğru şık</span>
          <select
            className="rounded-lg border border-border bg-background px-2 py-1"
            value={draftCorrect}
            onChange={(e) => setDraftCorrect(Number(e.target.value))}
          >
            {draftOptions.map((_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void sendQuestion()}
            className="touch-target flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent-muted"
          >
            Soruyu gönder
          </button>
          <button
            type="button"
            onClick={() => void clearQuestion()}
            className="touch-target rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-foreground/5"
          >
            Temizle
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => void copyCsv()}
            className="touch-target rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-foreground/5"
          >
            CSV panoya
          </button>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            className="touch-target rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-foreground/5"
          >
            CSV indir
          </button>
        </div>
        {exportHint && (
          <p className="text-xs text-foreground/70">{exportHint}</p>
        )}

        {active && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground/70">Özet</p>
            <p className="text-sm font-medium">{active.prompt}</p>
            <ul className="text-xs text-foreground/80">
              {active.options.map((o, i) => (
                <li key={i}>
                  {o}:{" "}
                  <strong>{summary.counts[i] ?? 0}</strong> oy
                  {i === active.correctIndex ? " (doğru)" : ""}
                </li>
              ))}
            </ul>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
              {summary.rows.map(([id, row]) => (
                <li
                  key={id}
                  className={
                    row.choiceIndex === active.correctIndex
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground/80"
                  }
                >
                  {row.displayName}: şık {row.choiceIndex + 1}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 md:w-80">
      <h2 className="text-sm font-semibold">Soru</h2>
      {!active && (
        <p className="text-sm text-foreground/60">
          Öğretmen soru gönderdiğinde burada görünecek.
        </p>
      )}
      {active && (
        <>
          <p className="text-base font-medium leading-snug">{active.prompt}</p>
          <div className="flex flex-col gap-2">
            {active.options.map((label, i) => {
              const selected = myChoice === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={myChoice !== null}
                  onClick={() => void sendAnswer(i)}
                  className={`touch-target w-full rounded-xl border px-4 py-3 text-left text-base font-medium transition ${
                    selected
                      ? "border-accent bg-accent/15 ring-2 ring-accent"
                      : "border-border hover:bg-foreground/5"
                  } disabled:opacity-70`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {myChoice !== null && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Cevabınız gönderildi.
            </p>
          )}
        </>
      )}
    </aside>
  );
}
