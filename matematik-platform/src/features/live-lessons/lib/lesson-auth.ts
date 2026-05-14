import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ROOM_ID_RE = /^[a-z0-9]{4,32}$/;
const IDENTITY_MAX = 128;

function getTeacherSecret(): string {
  const s = process.env.LESSON_TEACHER_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "LESSON_TEACHER_SECRET tanımlı değil veya çok kısa (≥16 karakter).",
    );
  }
  return s;
}

function getPersistSecret(): string {
  const s =
    process.env.LESSON_PERSIST_SIGNING_SECRET ??
    process.env.LESSON_TEACHER_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "LESSON_PERSIST_SIGNING_SECRET (veya LESSON_TEACHER_SECRET) tanımlı değil veya çok kısa.",
    );
  }
  return s;
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(
    str.replace(/-/g, "+").replace(/_/g, "/") + pad,
    "base64",
  );
}

function hmac(secret: string, data: string): Buffer {
  return createHmac("sha256", secret).update(data).digest();
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && ROOM_ID_RE.test(roomId);
}

export function signTeacherProof(roomId: string): string {
  if (!isValidRoomId(roomId)) throw new Error("Geçersiz roomId");
  return base64UrlEncode(hmac(getTeacherSecret(), `${roomId}|teacher`));
}

export function verifyTeacherProof(roomId: string, proof: unknown): boolean {
  if (!isValidRoomId(roomId)) return false;
  if (typeof proof !== "string" || proof.length === 0 || proof.length > 128) {
    return false;
  }
  let provided: Buffer;
  try {
    provided = base64UrlDecode(proof);
  } catch {
    return false;
  }
  const expected = hmac(getTeacherSecret(), `${roomId}|teacher`);
  return safeEqual(provided, expected);
}

export type PersistTokenPayload = {
  roomId: string;
  identity: string;
  role: "teacher" | "student";
  iat: number;
  exp: number;
};

const PERSIST_TTL_SECONDS = 8 * 60 * 60;

export function signPersistToken(input: {
  roomId: string;
  identity: string;
  role: "teacher" | "student";
}): string {
  if (!isValidRoomId(input.roomId)) throw new Error("Geçersiz roomId");
  if (!input.identity || input.identity.length > IDENTITY_MAX) {
    throw new Error("Geçersiz identity");
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: PersistTokenPayload = {
    roomId: input.roomId,
    identity: input.identity,
    role: input.role,
    iat: now,
    exp: now + PERSIST_TTL_SECONDS,
  };
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const sig = base64UrlEncode(hmac(getPersistSecret(), payloadB64));
  return `${payloadB64}.${sig}`;
}

export function verifyPersistToken(token: unknown): PersistTokenPayload | null {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return null;
  }
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  let providedSig: Buffer;
  try {
    providedSig = base64UrlDecode(sigB64);
  } catch {
    return null;
  }
  const expectedSig = hmac(getPersistSecret(), payloadB64);
  if (!safeEqual(providedSig, expectedSig)) return null;

  let payload: PersistTokenPayload;
  try {
    const decoded = base64UrlDecode(payloadB64).toString("utf8");
    payload = JSON.parse(decoded) as PersistTokenPayload;
  } catch {
    return null;
  }
  if (
    !isValidRoomId(payload.roomId) ||
    typeof payload.identity !== "string" ||
    payload.identity.length === 0 ||
    payload.identity.length > IDENTITY_MAX ||
    (payload.role !== "teacher" && payload.role !== "student") ||
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number"
  ) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (payload.iat - 60 > now) return null;
  return payload;
}

export function isInsecureTeacherBypassAllowed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_INSECURE_TEACHER === "true"
  );
}

export function readBearerToken(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const m = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  return m ? m[1].trim() : null;
}

export function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const buf = randomBytes(8);
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += chars[buf[i] % chars.length];
  }
  return out;
}
