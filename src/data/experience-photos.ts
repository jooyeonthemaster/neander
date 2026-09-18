/* ─────────────────────────────────────────────────────────
   Experience Photos
   서비스 목록 카드 상단에 들어가는 실제 운영 현장 사진.
   해당 서비스를 실제로 운영한 행사 사진만 넣는다 — 다른 행사 사진으로
   채우면 방문자가 그 서비스의 사례로 오해하므로, 사진이 없는 서비스는 비워 둔다.
   이미지는 포트폴리오 원본(public/images/portfolio)에서 서비스 부분만 잘라 만들었다.
   ───────────────────────────────────────────────────────── */

export interface ExperiencePhoto {
  src: string;
  /** 사진을 찍은 행사 (카드에 '운영 사례 · 행사명'으로 표시) */
  eventKo: string;
  eventEn: string;
  /** 원본이 있는 포트폴리오 프로젝트 slug */
  portfolioSlug: string;
}

export const EXPERIENCE_PHOTOS: Partial<Record<string, ExperiencePhoto>> = {
  // 코리아그랜드세일 'AI 맞춤형 향수 만들기' 조향 체험
  'ai-scent-soulmate': {
    src: '/images/services/experiences/ai-scent-soulmate.webp',
    eventKo: '코리아그랜드세일 2026',
    eventEn: 'Korea Grand Sale 2026',
    portfolioSlug: 'korea-grand-sale-2026',
  },
  // 평택 AI 페스타: 'AI 뮤직비디오 메이커' 배너
  'ai-musicvideo-maker': {
    src: '/images/services/experiences/ai-musicvideo-maker.webp',
    eventKo: '평택 AI 페스타 2026',
    eventEn: 'Pyeongtaek AI Festa 2026',
    portfolioSlug: 'pyeongtaek-ai-festa-2026',
  },
  // 평택 AI 페스타: 'AI 포토부스(닮은 연예인)' 배너와 포토부스 키오스크
  'ai-celeb-lookalike': {
    src: '/images/services/experiences/ai-celeb-lookalike.webp',
    eventKo: '평택 AI 페스타 2026',
    eventEn: 'Pyeongtaek AI Festa 2026',
    portfolioSlug: 'pyeongtaek-ai-festa-2026',
  },
  // 평택 AI 페스타: 'AI 미래가족 상상' 키오스크 대기 줄
  'ai-future-family': {
    src: '/images/services/experiences/ai-future-family.webp',
    eventKo: '평택 AI 페스타 2026',
    eventEn: 'Pyeongtaek AI Festa 2026',
    portfolioSlug: 'pyeongtaek-ai-festa-2026',
  },
};
