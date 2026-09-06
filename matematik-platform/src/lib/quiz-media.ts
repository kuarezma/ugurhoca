type QuizMediaPayload = {
  option_image_urls?: string[];
  question_image_url?: string | null;
  distractor_explanations?: Record<number, string> | null;
};

const MEDIA_PREFIX = '[[UGURHOCA_MEDIA]]';

export const encodeQuizMediaExplanation = (
  explanation: string | null | undefined,
  media: QuizMediaPayload,
) => {
  const filteredOptions = media.option_image_urls
    ?.map((item) => item.trim())
    .filter(Boolean);

  const normalizedMedia: QuizMediaPayload = {
    ...(filteredOptions && filteredOptions.length > 0 ? { option_image_urls: filteredOptions } : {}),
    ...(media.question_image_url?.trim() ? { question_image_url: media.question_image_url.trim() } : {}),
    ...(media.distractor_explanations ? { distractor_explanations: media.distractor_explanations } : {}),
  };

  if (
    !normalizedMedia.question_image_url &&
    !normalizedMedia.option_image_urls &&
    !normalizedMedia.distractor_explanations
  ) {
    return explanation?.trim() || null;
  }

  const body = explanation?.trim() || '';
  return `${MEDIA_PREFIX}${JSON.stringify(normalizedMedia)}\n${body}`.trim();
};

export const decodeQuizMediaExplanation = (
  explanation: string | null | undefined,
) => {
  if (!explanation?.startsWith(MEDIA_PREFIX)) {
    return {
      explanation: explanation || null,
      option_image_urls: null as string[] | null,
      question_image_url: null as string | null,
      distractor_explanations: null as Record<number, string> | null,
    };
  }

  const newlineIndex = explanation.indexOf('\n');
  const rawPayload =
    newlineIndex === -1
      ? explanation.slice(MEDIA_PREFIX.length)
      : explanation.slice(MEDIA_PREFIX.length, newlineIndex);

  try {
    const parsed = JSON.parse(rawPayload) as QuizMediaPayload;
    const cleanOptions = parsed.option_image_urls
      ?.map((item) => item.trim())
      .filter(Boolean);

    return {
      explanation:
        newlineIndex === -1 ? null : explanation.slice(newlineIndex + 1).trim() || null,
      option_image_urls: cleanOptions && cleanOptions.length > 0 ? cleanOptions : null,
      question_image_url: parsed.question_image_url?.trim() || null,
      distractor_explanations: parsed.distractor_explanations || null,
    };
  } catch {
    return {
      explanation,
      option_image_urls: null as string[] | null,
      question_image_url: null as string | null,
      distractor_explanations: null as Record<number, string> | null,
    };
  }
};

