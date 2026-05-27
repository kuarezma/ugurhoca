import type { QuizMessage } from "@/features/live-lessons/lib/quiz-messages";
import { isQuizMessage } from "@/features/live-lessons/lib/quiz-messages";

export type LiveLessonDisplaySettings = {
  cameraPlacement: "side" | "overlay" | "hidden";
  cameraSize: "small" | "medium" | "large";
  mainView: "screen" | "whiteboard";
  panelWidth: "normal" | "wide";
  screenFit: "contain" | "cover";
};

export type WhiteboardPoint = {
  x: number;
  y: number;
};

export type WhiteboardStroke = {
  color: string;
  mode: "draw" | "erase";
  points: WhiteboardPoint[];
  strokeId: string;
  width: number;
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
    }
  | {
      kind: "whiteboard_stroke";
      fromIdentity: string;
      stroke: WhiteboardStroke;
    }
  | {
      kind: "whiteboard_undo";
      fromIdentity: string;
      strokeId: string;
    }
  | {
      kind: "whiteboard_clear";
      fromIdentity: string;
    }
  | {
      kind: "whiteboard_snapshot_request";
      fromIdentity: string;
    }
  | {
      kind: "whiteboard_snapshot";
      fromIdentity: string;
      strokes: WhiteboardStroke[];
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
      (settings.mainView === "screen" || settings.mainView === "whiteboard") &&
      (settings.panelWidth === "normal" || settings.panelWidth === "wide") &&
      (settings.screenFit === "contain" || settings.screenFit === "cover")
    );
  }
  if (k === "whiteboard_stroke") {
    const v = value as Record<string, unknown>;
    return typeof v.fromIdentity === "string" && isWhiteboardStroke(v.stroke);
  }
  if (k === "whiteboard_undo") {
    const v = value as Record<string, unknown>;
    return typeof v.fromIdentity === "string" && typeof v.strokeId === "string";
  }
  if (k === "whiteboard_clear" || k === "whiteboard_snapshot_request") {
    const v = value as Record<string, unknown>;
    return typeof v.fromIdentity === "string";
  }
  if (k === "whiteboard_snapshot") {
    const v = value as Record<string, unknown>;
    return (
      typeof v.fromIdentity === "string" &&
      Array.isArray(v.strokes) &&
      v.strokes.every(isWhiteboardStroke)
    );
  }
  return false;
}

function isWhiteboardStroke(value: unknown): value is WhiteboardStroke {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.strokeId === "string" &&
    typeof v.color === "string" &&
    typeof v.width === "number" &&
    (v.mode === "draw" || v.mode === "erase") &&
    Array.isArray(v.points) &&
    v.points.length <= 2048 &&
    v.points.every(
      (point) =>
        !!point &&
        typeof point === "object" &&
        typeof (point as WhiteboardPoint).x === "number" &&
        typeof (point as WhiteboardPoint).y === "number",
    )
  );
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
