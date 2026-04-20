type QuizMediaPayload = {
  option_image_urls?: string[];
  question_image_url?: string | null;
};

const MEDIA_PREFIX = '[[UGURHOCA_MEDIA]]';

export const encodeQuizMediaExplanation = (
  explanation: string | null | undefined,
  media: QuizMediaPayload,
) => {
  const normalizedMedia = {
    option_image_urls:
      media.option_image_urls?.map((item) => item.trim()).filter(Boolean) || [],
    question_image_url: media.question_image_url?.trim() || '',
  };

  if (
    !normalizedMedia.question_image_url &&
    normalizedMedia.option_image_urls.length === 0
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
    };
  }

  const newlineIndex = explanation.indexOf('\n');
  const rawPayload =
    newlineIndex === -1
      ? explanation.slice(MEDIA_PREFIX.length)
      : explanation.slice(MEDIA_PREFIX.length, newlineIndex);

  try {
    const parsed = JSON.parse(rawPayload) as QuizMediaPayload;
    return {
      explanation:
        newlineIndex === -1 ? null : explanation.slice(newlineIndex + 1).trim() || null,
      option_image_urls:
        parsed.option_image_urls?.map((item) => item.trim()).filter(Boolean) || null,
      question_image_url: parsed.question_image_url?.trim() || null,
    };
  } catch {
    return {
      explanation,
      option_image_urls: null as string[] | null,
      question_image_url: null as string | null,
    };
  }
};

