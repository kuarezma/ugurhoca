const NAME_MIN = 2;
const NAME_MAX = 64;

function parseBlocklist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function getBlocklist(): string[] {
  return parseBlocklist(process.env.LESSON_STUDENT_NAME_BLOCKLIST);
}

export function validateDisplayName(name: string): { ok: true } | { ok: false; error: string } {
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN) {
    return { ok: false, error: `Ad en az ${NAME_MIN} karakter olmalı.` };
  }
  if (trimmed.length > NAME_MAX) {
    return { ok: false, error: `Ad en fazla ${NAME_MAX} karakter olabilir.` };
  }
  const lower = trimmed.toLowerCase();
  for (const blocked of getBlocklist()) {
    if (blocked && lower.includes(blocked)) {
      return { ok: false, error: "Bu ad kullanılamaz." };
    }
  }
  return { ok: true };
}
