"use client";

import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";
import { useEffect, useRef } from "react";
import {
  decodeDataPayload,
  encodeRoomDataMessage,
  type LiveLessonDisplaySettings,
} from "@/features/live-lessons/lib/room-data";

type Props = {
  identity: string;
  role: "teacher" | "student";
  settings: LiveLessonDisplaySettings;
  onSettingsChange: (settings: LiveLessonDisplaySettings) => void;
};

export function DisplaySettingsBridge({
  identity,
  onSettingsChange,
  role,
  settings,
}: Props) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const lastPublishedRef = useRef("");

  useEffect(() => {
    if (role !== "teacher") return;
    const serialized = JSON.stringify(settings);
    if (lastPublishedRef.current === serialized) return;
    lastPublishedRef.current = serialized;
    void localParticipant.publishData(
      encodeRoomDataMessage({
        fromIdentity: identity,
        kind: "display_settings",
        settings,
      }),
      { reliable: true },
    );
  }, [identity, localParticipant, role, settings]);

  useEffect(() => {
    if (role !== "student") return;
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      if (decoded.message.kind !== "display_settings") return;
      if (!participant || participant.isLocal) return;
      if (decoded.message.fromIdentity !== participant.identity) return;
      onSettingsChange(decoded.message.settings);
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [onSettingsChange, role, room]);

  return null;
}
