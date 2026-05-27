"use client";

import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  decodeDataPayload,
  encodeRoomDataMessage,
  type WhiteboardPoint,
  type WhiteboardStroke,
} from "@/features/live-lessons/lib/room-data";

type Props = {
  identity: string;
  role: "teacher" | "student";
};

const boardWidth = 1600;
const boardHeight = 900;
const colorOptions = ["#111827", "#dc2626", "#2563eb", "#059669"];

function drawStroke(ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) {
  if (stroke.points.length === 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = stroke.mode === "erase" ? "#ffffff" : stroke.color;
  ctx.beginPath();
  const first = stroke.points[0];
  ctx.moveTo(first.x * boardWidth, first.y * boardHeight);
  for (const point of stroke.points.slice(1)) {
    ctx.lineTo(point.x * boardWidth, point.y * boardHeight);
  }
  ctx.stroke();
  ctx.restore();
}

function redraw(canvas: HTMLCanvasElement, strokes: WhiteboardStroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, boardWidth, boardHeight);
  for (const stroke of strokes) drawStroke(ctx, stroke);
}

function pointFromEvent(
  event: React.PointerEvent<HTMLCanvasElement>,
): WhiteboardPoint {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

function mergeStroke(strokes: WhiteboardStroke[], incoming: WhiteboardStroke) {
  const index = strokes.findIndex((stroke) => stroke.strokeId === incoming.strokeId);
  if (index === -1) return [...strokes, incoming];

  const next = [...strokes];
  next[index] = {
    ...next[index],
    points: [...next[index].points, ...incoming.points],
  };
  return next;
}

export function WhiteboardCanvas({ identity, role }: Props) {
  const room = useRoomContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<WhiteboardStroke[]>([]);
  const activeStrokeRef = useRef<WhiteboardStroke | null>(null);
  const lastPublishAtRef = useRef(0);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [color, setColor] = useState(colorOptions[0]);
  const [width, setWidth] = useState(4);
  const [mode, setMode] = useState<"draw" | "erase">("draw");

  const publish = useCallback(
    async (message: Parameters<typeof encodeRoomDataMessage>[0], reliable = true) => {
      await room.localParticipant.publishData(encodeRoomDataMessage(message), {
        reliable,
      });
    },
    [room.localParticipant],
  );

  const commitStrokes = useCallback((next: WhiteboardStroke[]) => {
    strokesRef.current = next;
    setStrokes(next);
    const canvas = canvasRef.current;
    if (canvas) redraw(canvas, next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) redraw(canvas, strokes);
  }, [strokes]);

  useEffect(() => {
    const onData = (payload: Uint8Array, participant?: Participant) => {
      const decoded = decodeDataPayload(payload);
      if (!decoded || decoded.channel !== "room") return;
      const message = decoded.message;

      if (message.kind === "whiteboard_snapshot_request") {
        if (role !== "teacher") return;
        if (!participant || participant.isLocal) return;
        void publish(
          {
            fromIdentity: identity,
            kind: "whiteboard_snapshot",
            strokes: strokesRef.current,
          },
          true,
        );
        return;
      }

      if (
        message.kind !== "whiteboard_stroke" &&
        message.kind !== "whiteboard_undo" &&
        message.kind !== "whiteboard_clear" &&
        message.kind !== "whiteboard_snapshot"
      ) {
        return;
      }

      if (role === "teacher") return;
      if (!participant || participant.isLocal || !participant.identity.startsWith("teacher_")) {
        return;
      }

      if (message.kind === "whiteboard_stroke") {
        commitStrokes(mergeStroke(strokesRef.current, message.stroke));
      }
      if (message.kind === "whiteboard_undo") {
        commitStrokes(
          strokesRef.current.filter((stroke) => stroke.strokeId !== message.strokeId),
        );
      }
      if (message.kind === "whiteboard_clear") {
        commitStrokes([]);
      }
      if (message.kind === "whiteboard_snapshot") {
        commitStrokes(message.strokes);
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [commitStrokes, identity, publish, role, room]);

  useEffect(() => {
    if (role !== "student") return;
    void publish(
      {
        fromIdentity: identity,
        kind: "whiteboard_snapshot_request",
      },
      true,
    );
  }, [identity, publish, role]);

  const publishStrokeChunk = useCallback(
    async (stroke: WhiteboardStroke, reliable = true) => {
      await publish(
        {
          fromIdentity: identity,
          kind: "whiteboard_stroke",
          stroke,
        },
        reliable,
      );
    },
    [identity, publish],
  );

  const startStroke = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (role !== "teacher") return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = pointFromEvent(event);
      const stroke: WhiteboardStroke = {
        color,
        mode,
        points: [point],
        strokeId:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `stroke_${Date.now()}`,
        width: mode === "erase" ? width * 3 : width,
      };
      activeStrokeRef.current = stroke;
      commitStrokes([...strokesRef.current, stroke]);
      void publishStrokeChunk(stroke, true);
    },
    [color, commitStrokes, mode, publishStrokeChunk, role, width],
  );

  const moveStroke = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const active = activeStrokeRef.current;
      if (role !== "teacher" || !active) return;
      const point = pointFromEvent(event);
      const last = active.points[active.points.length - 1];
      const distance = Math.hypot(point.x - last.x, point.y - last.y);
      if (distance < 0.002) return;
      active.points.push(point);
      commitStrokes(
        strokesRef.current.map((stroke) =>
          stroke.strokeId === active.strokeId ? { ...active } : stroke,
        ),
      );

      const now = performance.now();
      if (now - lastPublishAtRef.current > 24) {
        lastPublishAtRef.current = now;
        void publishStrokeChunk({ ...active, points: [point] }, true);
      }
    },
    [commitStrokes, publishStrokeChunk, role],
  );

  const endStroke = useCallback(() => {
    const active = activeStrokeRef.current;
    if (!active) return;
    activeStrokeRef.current = null;
    void publishStrokeChunk({ ...active, points: [] }, true);
  }, [publishStrokeChunk]);

  const undo = useCallback(async () => {
    const last = strokesRef.current[strokesRef.current.length - 1];
    if (!last) return;
    commitStrokes(strokesRef.current.slice(0, -1));
    await publish({ fromIdentity: identity, kind: "whiteboard_undo", strokeId: last.strokeId });
  }, [commitStrokes, identity, publish]);

  const clear = useCallback(async () => {
    commitStrokes([]);
    await publish({ fromIdentity: identity, kind: "whiteboard_clear" });
  }, [commitStrokes, identity, publish]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-slate-100">
      {role === "teacher" ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          <div className="flex items-center gap-1">
            {colorOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-label="Kalem rengi"
                onClick={() => {
                  setColor(option);
                  setMode("draw");
                }}
                className={`h-7 w-7 rounded-full border ${
                  color === option && mode === "draw" ? "ring-2 ring-slate-900" : ""
                }`}
                style={{ backgroundColor: option }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2">
            Kalınlık
            <input
              type="range"
              min={2}
              max={14}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={() => setMode((current) => (current === "erase" ? "draw" : "erase"))}
            className={`rounded-lg border px-3 py-1.5 font-semibold ${
              mode === "erase" ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200"
            }`}
          >
            Silgi
          </button>
          <button
            type="button"
            onClick={() => void undo()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold"
          >
            Geri al
          </button>
          <button
            type="button"
            onClick={() => void clear()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold"
          >
            Temizle
          </button>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2">
        <canvas
          ref={canvasRef}
          width={boardWidth}
          height={boardHeight}
          onPointerDown={startStroke}
          onPointerMove={moveStroke}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className={`aspect-video max-h-full max-w-full rounded-lg bg-white shadow-sm ${
            role === "teacher" ? "touch-none cursor-crosshair" : ""
          }`}
        />
      </div>
    </div>
  );
}
