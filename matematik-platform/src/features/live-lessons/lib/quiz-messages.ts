export type QuizRole = "teacher" | "student";

export type QuizMessage =
  | {
      kind: "question";
      questionId: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      fromIdentity: string;
    }
  | {
      kind: "answer";
      questionId: string;
      choiceIndex: number;
      fromIdentity: string;
      displayName: string;
    }
  | {
      kind: "clear_question";
      fromIdentity: string;
    };

export function encodeQuizMessage(msg: QuizMessage): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(msg));
}

export function isQuizMessage(value: unknown): value is QuizMessage {
  if (!value || typeof value !== "object" || !("kind" in value)) return false;
  const k = (value as { kind: unknown }).kind;
  if (k === "clear_question") {
    const o = value as unknown as { fromIdentity?: unknown };
    return typeof o.fromIdentity === "string";
  }
  if (k === "question") {
    const v = value as unknown as {
      questionId: unknown;
      prompt: unknown;
      options: unknown;
      correctIndex: unknown;
      fromIdentity: unknown;
    };
    if (
      typeof v.questionId !== "string" ||
      typeof v.prompt !== "string" ||
      typeof v.fromIdentity !== "string" ||
      typeof v.correctIndex !== "number" ||
      !Array.isArray(v.options)
    ) {
      return false;
    }
    return v.options.every((o) => typeof o === "string");
  }
  if (k === "answer") {
    const v = value as unknown as {
      questionId: unknown;
      choiceIndex: unknown;
      fromIdentity: unknown;
      displayName: unknown;
    };
    return (
      typeof v.questionId === "string" &&
      typeof v.choiceIndex === "number" &&
      typeof v.fromIdentity === "string" &&
      typeof v.displayName === "string"
    );
  }
  return false;
}

export function decodeQuizMessage(data: Uint8Array): QuizMessage | null {
  try {
    const raw = new TextDecoder().decode(data);
    const parsed: unknown = JSON.parse(raw);
    return isQuizMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
