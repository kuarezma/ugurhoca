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
