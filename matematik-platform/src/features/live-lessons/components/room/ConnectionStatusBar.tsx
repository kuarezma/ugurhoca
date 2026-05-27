"use client";

import {
  useConnectionState,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionQuality, ConnectionState, RoomEvent, type Room } from "livekit-client";
import { useEffect, useState } from "react";

function qualityLabel(quality: ConnectionQuality) {
  if (quality === ConnectionQuality.Excellent) return "Çok iyi";
  if (quality === ConnectionQuality.Good) return "İyi";
  if (quality === ConnectionQuality.Poor) return "Zayıf";
  return "Ölçülüyor";
}

function stateLabel(state: ConnectionState) {
  if (state === ConnectionState.Connected) return "Bağlı";
  if (state === ConnectionState.Reconnecting) return "Yeniden bağlanıyor";
  if (state === ConnectionState.Connecting) return "Bağlanıyor";
  return "Bağlantı yok";
}

function toneClass(state: ConnectionState, quality: ConnectionQuality) {
  if (state === ConnectionState.Reconnecting || quality === ConnectionQuality.Poor) {
    return "border-amber-400/40 bg-amber-500/10 text-amber-200";
  }
  if (state === ConnectionState.Connected) {
    return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
  }
  return "border-border bg-foreground/5 text-foreground/70";
}

async function readRoundTripMs(room: Room) {
  const pcManager = (room.engine as unknown as {
    pcManager?: {
      publisher?: { getStats?: () => Promise<RTCStatsReport> };
      subscriber?: { getStats?: () => Promise<RTCStatsReport> };
    };
  }).pcManager;

  const reports = await Promise.allSettled([
    pcManager?.publisher?.getStats?.(),
    pcManager?.subscriber?.getStats?.(),
  ]);

  for (const report of reports) {
    if (report.status !== "fulfilled" || !report.value) continue;
    for (const stat of report.value.values()) {
      const candidate = stat as RTCIceCandidatePairStats;
      if (
        candidate.type === "candidate-pair" &&
        candidate.state === "succeeded" &&
        typeof candidate.currentRoundTripTime === "number"
      ) {
        return Math.round(candidate.currentRoundTripTime * 1000);
      }
    }
  }
  return null;
}

export function ConnectionStatusBar() {
  const room = useRoomContext();
  const state = useConnectionState(room);
  const { localParticipant } = useLocalParticipant();
  const [quality, setQuality] = useState(localParticipant.connectionQuality);
  const [rttMs, setRttMs] = useState<number | null>(null);

  useEffect(() => {
    const onQuality = (nextQuality: ConnectionQuality) => setQuality(nextQuality);
    room.on(RoomEvent.ConnectionQualityChanged, onQuality);
    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, onQuality);
    };
  }, [room]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const next = await readRoundTripMs(room).catch(() => null);
      if (!cancelled) setRttMs(next);
    };
    void tick();
    const interval = window.setInterval(() => void tick(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [room]);

  return (
    <div
      className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${toneClass(
        state,
        quality,
      )}`}
      title="Bağlantı kalitesi"
    >
      {stateLabel(state)} · {qualityLabel(quality)}
      {rttMs !== null ? ` · ${rttMs} ms` : ""}
    </div>
  );
}
