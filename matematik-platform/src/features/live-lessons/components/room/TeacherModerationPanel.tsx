"use client";

import {
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  decodeDataPayload,
  encodeRoomDataMessage,
  type RoomDataMessage,
} from "@/features/live-lessons/lib/room-data";

type Props = {
  lessonId: string;
  teacherIdentity: string;
  requireStudentApproval: boolean;
};

function displayLabel(p: { name?: string; identity: string }): string {
  const n = p.name?.trim();
  return n || p.identity.slice(0, 8);
}

export function TeacherModerationPanel({
  lessonId,
  teacherIdentity,
  requireStudentApproval,
}: Props) {
  const room = useRoomContext();
  const remotes = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();

  const [pendingJoins, setPendingJoins] = useState<
    Record<string, { displayName: string }>
  >({});
  const [raisedHands, setRaisedHands] = useState<
    Record<string, { displayName: string }>
  >({});
  const [micRequests, setMicRequests] = useState<
    Record<string, { displayName: string }>
  >({});
  const [micPermissions, setMicPermissions] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const publishRoom = useCallback(
    async (msg: RoomDataMessage, destinationIdentities?: string[]) => {
      await localParticipant.publishData(encodeRoomDataMessage(msg), {
        reliable: true,
        destinationIdentities,
      });
    },
    [localParticipant],
  );

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      const msg = decoded.message;
      const sender = participant?.identity;

      if (msg.kind === "join_request") {
        if (!requireStudentApproval) return;
        if (!sender || sender !== msg.fromIdentity) return;
        setPendingJoins((prev) => ({
          ...prev,
          [msg.fromIdentity]: { displayName: msg.displayName },
        }));
        return;
      }

      if (msg.kind === "raise_hand") {
        if (!sender || sender !== msg.fromIdentity) return;
        setRaisedHands((prev) => {
          const next = { ...prev };
          if (msg.raised) {
            next[msg.fromIdentity] = { displayName: msg.displayName };
          } else {
            delete next[msg.fromIdentity];
          }
          return next;
        });
        return;
      }

      if (msg.kind === "microphone_request") {
        if (!sender || sender !== msg.fromIdentity) return;
        setMicRequests((prev) => ({
          ...prev,
          [msg.fromIdentity]: { displayName: msg.displayName },
        }));
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [requireStudentApproval, room]);

  const approveJoin = useCallback(
    async (targetIdentity: string) => {
      setError(null);
      const response = await fetch(`/api/live-lessons/${lessonId}/approval`, {
        body: JSON.stringify({ targetIdentity }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Öğrenci onaylanamadı.");
        return;
      }
      setPendingJoins((prev) => {
        const next = { ...prev };
        delete next[targetIdentity];
        return next;
      });
      await publishRoom(
        {
          kind: "join_approved",
          targetIdentity,
          fromIdentity: teacherIdentity,
        },
      );
    },
    [lessonId, publishRoom, teacherIdentity],
  );

  const lowerHand = useCallback(
    async (forIdentity: string) => {
      setRaisedHands((prev) => {
        const next = { ...prev };
        delete next[forIdentity];
        return next;
      });
      await publishRoom(
        {
          kind: "lower_hand",
          forIdentity,
          fromIdentity: teacherIdentity,
        },
        [forIdentity],
      );
    },
    [publishRoom, teacherIdentity],
  );

  const setMicrophonePermission = useCallback(
    async (targetIdentity: string, allowed: boolean) => {
      setMicPermissions((prev) => ({ ...prev, [targetIdentity]: allowed }));
      setMicRequests((prev) => {
        const next = { ...prev };
        delete next[targetIdentity];
        return next;
      });
      await publishRoom(
        {
          allowed,
          fromIdentity: teacherIdentity,
          kind: "microphone_permission",
          targetIdentity,
        },
        [targetIdentity],
      );
    },
    [publishRoom, teacherIdentity],
  );

  const rows = useMemo(() => {
    const out: {
      identity: string;
      label: string;
      self: boolean;
    }[] = [
      {
        identity: localParticipant.identity,
        label: `${displayLabel(localParticipant)} (siz)`,
        self: true,
      },
    ];
    for (const p of remotes) {
      out.push({
        identity: p.identity,
        label: displayLabel(p),
        self: false,
      });
    }
    return out.sort((a, b) => a.label.localeCompare(b.label, "tr"));
  }, [localParticipant, remotes]);

  const pendingEntries = useMemo(
    () => Object.entries(pendingJoins),
    [pendingJoins],
  );
  const raisedEntries = useMemo(
    () => Object.entries(raisedHands),
    [raisedHands],
  );
  const micRequestEntries = useMemo(
    () => Object.entries(micRequests),
    [micRequests],
  );

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 md:max-h-[38vh] md:overflow-y-auto md:w-80">
      <h2 className="text-sm font-semibold">Katılımcılar</h2>
      {error ? (
        <p className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <ul className="space-y-1 text-xs text-foreground/85">
        {rows.map((r) => (
          <li key={r.identity} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate">{r.label}</span>
            {r.self ? (
              <span className="shrink-0 text-foreground/50">öğretmen</span>
            ) : (
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => void setMicrophonePermission(r.identity, true)}
                  className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-500"
                >
                  {micPermissions[r.identity] ? "Ses açık" : "Ses ver"}
                </button>
                <button
                  type="button"
                  onClick={() => void setMicrophonePermission(r.identity, false)}
                  className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold hover:bg-foreground/5"
                >
                  Sustur
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>

      {requireStudentApproval && pendingEntries.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-foreground/70">
            Onay bekleyenler
          </p>
          <ul className="space-y-2">
            {pendingEntries.map(([id, v]) => (
              <li
                key={id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="min-w-0 truncate">{v.displayName}</span>
                <button
                  type="button"
                  onClick={() => void approveJoin(id)}
                  className="shrink-0 rounded-lg bg-accent px-2 py-1 text-[11px] font-medium text-white hover:bg-accent-muted"
                >
                  Onayla
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {micRequestEntries.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-foreground/70">
            Mikrofon izni isteyenler
          </p>
          <ul className="space-y-2">
            {micRequestEntries.map(([id, v]) => (
              <li
                key={id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="min-w-0 truncate">{v.displayName}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void setMicrophonePermission(id, true)}
                    className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-500"
                  >
                    Ses ver
                  </button>
                  <button
                    type="button"
                    onClick={() => void setMicrophonePermission(id, false)}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium hover:bg-foreground/5"
                  >
                    Reddet
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {raisedEntries.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-foreground/70">
            El kaldıranlar
          </p>
          <ul className="space-y-2">
            {raisedEntries.map(([id, v]) => (
              <li
                key={id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="min-w-0 truncate">{v.displayName}</span>
                <button
                  type="button"
                  onClick={() => void lowerHand(id)}
                  className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] font-medium hover:bg-foreground/5"
                >
                  İndir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
