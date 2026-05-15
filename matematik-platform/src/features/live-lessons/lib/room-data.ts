import type { QuizMessage } from "@/features/live-lessons/lib/quiz-messages";
import { isQuizMessage } from "@/features/live-lessons/lib/quiz-messages";

export type LiveLessonDisplaySettings = {
  cameraPlacement: "side" | "overlay" | "hidden";
  cameraSize: "small" | "medium" | "large";
  panelWidth: "normal" | "wide";
  screenFit: "contain" | "cover";
};

export type RoomDataMessage =
  | {
      kind: "raise_hand";
      raised: boolean;
      fromIdentity: string;
      displayName: string;
    }
  | {
      kind: "lower_hand";
      forIdentity: string;
      fromIdentity: string;
    }
  | {
      kind: "join_request";
      fromIdentity: string;
      displayName: string;
    }
  | {
      kind: "join_approved";
      targetIdentity: string;
      fromIdentity: string;
    }
  | {
      kind: "microphone_permission";
      targetIdentity: string;
      allowed: boolean;
      fromIdentity: string;
    }
  | {
      kind: "microphone_request";
      fromIdentity: string;
      displayName: string;
    }
  | {
      kind: "display_settings";
      fromIdentity: string;
      settings: LiveLessonDisplaySettings;
    };

export type DecodedDataPayload =
  | { channel: "quiz"; message: QuizMessage }
  | { channel: "room"; message: RoomDataMessage };

function isRoomDataMessage(value: unknown): value is RoomDataMessage {
  if (!value || typeof value !== "object" || !("kind" in value)) return false;
  const k = (value as { kind: unknown }).kind;
  if (k === "raise_hand") {
    const v = value as Record<string, unknown>;
    return (
      typeof v.raised === "boolean" &&
      typeof v.fromIdentity === "string" &&
      typeof v.displayName === "string"
    );
  }
  if (k === "lower_hand") {
    const v = value as Record<string, unknown>;
    return typeof v.forIdentity === "string" && typeof v.fromIdentity === "string";
  }
  if (k === "join_request") {
    const v = value as Record<string, unknown>;
    return typeof v.fromIdentity === "string" && typeof v.displayName === "string";
  }
  if (k === "join_approved") {
    const v = value as Record<string, unknown>;
    return (
      typeof v.targetIdentity === "string" && typeof v.fromIdentity === "string"
    );
  }
  if (k === "microphone_permission") {
    const v = value as Record<string, unknown>;
    return (
      typeof v.targetIdentity === "string" &&
      typeof v.allowed === "boolean" &&
      typeof v.fromIdentity === "string"
    );
  }
  if (k === "microphone_request") {
    const v = value as Record<string, unknown>;
    return typeof v.fromIdentity === "string" && typeof v.displayName === "string";
  }
  if (k === "display_settings") {
    const v = value as Record<string, unknown>;
    const settings = v.settings as Record<string, unknown> | undefined;
    return (
      typeof v.fromIdentity === "string" &&
      !!settings &&
      (settings.cameraPlacement === "side" ||
        settings.cameraPlacement === "overlay" ||
        settings.cameraPlacement === "hidden") &&
      (settings.cameraSize === "small" ||
        settings.cameraSize === "medium" ||
        settings.cameraSize === "large") &&
      (settings.panelWidth === "normal" || settings.panelWidth === "wide") &&
      (settings.screenFit === "contain" || settings.screenFit === "cover")
    );
  }
  return false;
}

export function decodeDataPayload(data: Uint8Array): DecodedDataPayload | null {
  try {
    const raw = new TextDecoder().decode(data);
    const parsed: unknown = JSON.parse(raw);
    if (isQuizMessage(parsed)) {
      return { channel: "quiz", message: parsed };
    }
    if (isRoomDataMessage(parsed)) {
      return { channel: "room", message: parsed };
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeRoomDataMessage(msg: RoomDataMessage): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(msg));
}
