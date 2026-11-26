/* ─────────────────────────────────────────────────────────
   행사별 안내 — 인사이트의 서비스 안내 페이지(kind: 'landing')를
   체험서비스 소개(/services)와 서비스 상세에서 보여 주기 위한 묶음.
   주소는 검색엔진에 제출한 /insights/<slug> 그대로 둔다 (2026-11-21 사용자 결정: 슬러그 유지).
   ───────────────────────────────────────────────────────── */

import { serviceForExperience } from '@/lib/quote/engine';

export interface GuideGroup {
  id: string;
  title: { ko: string; en: string };
  slugs: string[];
}

export const GUIDE_GROUPS: GuideGroup[] = [
  {
    id: 'perfume',
    title: { ko: 'AI 조향사', en: 'AI perfume' },
    slugs: ['event-ai-perfume-experience', 'event-perfume-gift', 'brand-scent-kiosk'],
  },
  {
    id: 'booth-kiosk',
    title: { ko: '포토부스 · 키오스크', en: 'Photo booths & kiosks' },
    slugs: ['ai-photo-booth-rental', 'ai-fortune-kiosk-rental', 'ai-personal-color-booth'],
  },
  {
    id: 'by-event',
    title: { ko: '행사 종류별', en: 'By event type' },
    slugs: ['corporate-year-end-event-ai-booth', 'festival-experience-booth', 'school-library-ai-experience'],
  },
];

/** 서비스 상세 아래에 붙일 안내 3개 — 체험이 속한 견적 서비스와 묶음으로 고른다 */
export function guidesForExperience(slug: string, pillar: string): string[] {
  const service = serviceForExperience(slug, pillar);
  if (service === 'acscent') return ['event-ai-perfume-experience', 'event-perfume-gift', 'brand-scent-kiosk'];
  if (service === 'photoBooth') return ['ai-photo-booth-rental', 'festival-experience-booth', 'corporate-year-end-event-ai-booth'];
  if (slug === 'ai-personal-color') return ['ai-personal-color-booth', 'school-library-ai-experience', 'festival-experience-booth'];
  if (pillar === 'ai-fortune') return ['ai-fortune-kiosk-rental', 'corporate-year-end-event-ai-booth', 'festival-experience-booth'];
  return ['school-library-ai-experience', 'festival-experience-booth', 'corporate-year-end-event-ai-booth'];
}

/** 제목 「 — 」 앞을 큰 제목, 뒤를 부제로 */
export function splitGuideTitle(title: string): [string, string | null] {
  const i = title.indexOf(' — ');
  return i < 0 ? [title, null] : [title.slice(0, i), title.slice(i + 3)];
}
