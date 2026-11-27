import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'] as const,
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
  // 브라우저 언어로 /en 에 보내지 않는다 (2026-11-27 사용자): ChatGPT 가 답하며 페이지를 열 때 영어 언어 헤더를 보내
  // 한국어 질문에도 영문판(내용이 짧다)을 읽고 있었다 — 1주에 홈 48번이 모두 /en 으로 넘어갔다.
  // / 는 늘 한국어, 영어는 /en 주소나 언어 버튼으로만.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
