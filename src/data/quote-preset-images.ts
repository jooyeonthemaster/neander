import type { Lang } from '@/lib/quote/catalog';

interface QuotePresetImage {
  src: string;
  caption: Record<Lang, string>;
  objectPosition?: string;
}

/** 견적 템플릿 전용 사진. 생성한 장면은 실제 운영 사진과 구분해 표시한다. */
export const QUOTE_PRESET_IMAGES: Record<string, QuotePresetImage> = {
  'campus-festival': {
    src: '/images/quote/campus-festival-generated.webp',
    caption: { ko: 'AI 생성 · 대학 축제 연출 예시', en: 'AI-generated campus festival example' },
  },
  'brand-popup': {
    src: '/images/portfolio/archive/hurease-launch-2025-01.webp',
    caption: { ko: '운영 사례 · 휴리즈 브랜드 런칭', en: 'HUREASE brand launch' },
    objectPosition: 'center 65%',
  },
  'corporate-workshop': {
    src: '/images/services/experiences/ai-scent-soulmate.webp',
    caption: { ko: '운영 사례 · 코리아그랜드세일 2026', en: 'Korea Grand Sale 2026' },
  },
  'public-tourism': {
    src: '/images/services/experiences/ai-celeb-lookalike.webp',
    caption: { ko: '운영 사례 · 평택 AI 페스타 2026', en: 'Pyeongtaek AI Festa 2026' },
  },
};
