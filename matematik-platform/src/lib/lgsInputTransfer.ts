import {
  createInitialLgsInputs,
  lgsSubjects,
  type LgsInputs,
} from './examCalculators';

export function serializeLgsInputs(inputs: LgsInputs): string {
  const params = new URLSearchParams();
  for (const { key } of lgsSubjects) {
    params.set(`${key}_d`, String(inputs[key].correct));
    params.set(`${key}_y`, String(inputs[key].wrong));
  }
  return params.toString();
}

export function parseLgsInputs(params: URLSearchParams): LgsInputs | null {
  const inputs = createInitialLgsInputs();
  for (const { key, questions } of lgsSubjects) {
    const correct = params.get(`${key}_d`);
    const wrong = params.get(`${key}_y`);
    if (
      correct === null ||
      wrong === null ||
      !/^\d+$/.test(correct) ||
      !/^\d+$/.test(wrong)
    )
      return null;
    const c = Number(correct);
    const w = Number(wrong);
    if (
      !Number.isSafeInteger(c) ||
      !Number.isSafeInteger(w) ||
      c + w > questions
    )
      return null;
    inputs[key] = { correct: c, wrong: w };
  }
  return inputs;
}
