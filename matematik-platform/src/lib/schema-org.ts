import { SITE_NAME, SITE_URL } from './site-metadata';

export type ToolJsonLdOptions = {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
  operatingSystem?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HowToStepItem = {
  name: string;
  text: string;
};

export function buildToolJsonLd({
  name,
  description,
  path,
  applicationCategory = 'EducationalApplication',
  operatingSystem = 'All',
}: ToolJsonLdOptions) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
    },
    author: {
      '@type': 'Person',
      name: 'Uğur Hoca',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildFaqJsonLd(faqItems: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildHowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStepItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export type EduQuestionAnswer = {
  text: string;
  isCorrect: boolean;
  comment?: string;
};

export type EduQuestionItem = {
  name: string;
  text: string;
  answers: EduQuestionAnswer[];
};

export type EduQuizOptions = {
  name: string;
  description: string;
  path: string;
  educationalLevel?: string;
  mebOutcomeCode?: string;
  mebOutcomeName?: string;
  questions?: EduQuestionItem[];
};

export function buildEduQuizJsonLd({
  name,
  description,
  path,
  educationalLevel = '8. Sınıf LGS',
  mebOutcomeCode,
  mebOutcomeName,
  questions = [],
}: EduQuizOptions) {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const resourceId = `${url}#resource`;
  const quizId = `${url}#quiz`;

  const learningResource: Record<string, unknown> = {
    '@type': 'LearningResource',
    '@id': resourceId,
    name,
    description,
    learningResourceType: 'Interactive resource',
    educationalLevel,
    inLanguage: 'tr-TR',
    isAccessibleForFree: true,
  };

  if (mebOutcomeCode || mebOutcomeName) {
    learningResource.educationalAlignment = [
      {
        '@type': 'AlignmentObject',
        alignmentType: 'educationalSubject',
        educationalFramework: 'MEB Matematik Müfredatı',
        targetName: [mebOutcomeCode, mebOutcomeName].filter(Boolean).join(' - '),
      },
    ];
  }

  const quiz: Record<string, unknown> = {
    '@type': 'Quiz',
    '@id': quizId,
    name,
    educationalLevel,
    isPartOf: {
      '@id': resourceId,
    },
  };

  if (questions.length > 0) {
    quiz.hasPart = questions.map((q) => {
      const accepted = q.answers.find((a) => a.isCorrect);
      const suggested = q.answers.filter((a) => !a.isCorrect);

      return {
        '@type': 'Question',
        eduQuestionType: 'Multiple choice',
        name: q.name,
        text: q.text,
        suggestedAnswer: suggested.map((s) => ({
          '@type': 'Answer',
          text: s.text,
          ...(s.comment ? { comment: { '@type': 'Comment', text: s.comment } } : {}),
        })),
        ...(accepted
          ? {
              acceptedAnswer: {
                '@type': 'Answer',
                text: accepted.text,
                ...(accepted.comment
                  ? { comment: { '@type': 'Comment', text: accepted.comment } }
                  : {}),
              },
            }
          : {}),
      };
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [learningResource, quiz],
  };
}

