/* ─────────────────────────────────────────────────────────
   Experience Photos
   서비스 목록 카드 상단에 들어가는 실제 운영 현장 사진.
   해당 서비스를 실제로 운영한 행사 사진만 넣는다 — 다른 행사 사진으로
   채우면 방문자가 그 서비스의 사례로 오해하므로, 생성 이미지는
   experience-images.ts에서 별도 콘셉트 이미지로 관리한다.
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
  // 소원성취페스타: 한복을 입힌 AI 사주 부스 화면에서 소원을 고르는 방문객
  'ai-fortune-robot': {
    src: '/images/services/experiences/ai-fortune-robot.webp',
    eventKo: '소원성취페스타 2026',
    eventEn: 'Sowon Seongchwi Festa 2026',
    portfolioSlug: 'sowon-festa-saju-photobooth-2026',
  },
  // 은평구 AI 페스티벌: 'AI 퍼스널컬러 진단' 부스에서 키오스크로 진단받는 방문객
  'ai-personal-color': {
    src: '/images/services/experiences/ai-personal-color.webp',
    eventKo: '은평구 AI 페스티벌 2026',
    eventEn: 'Eunpyeong AI Festival 2026',
    portfolioSlug: 'eunpyeong-ai-festival-2026',
  },
  // 안산사이언스밸리 과학축제: AI 포토존 텐트에서 포토부스를 이용하는 가족
  'ai-timecapsule-photo': {
    src: '/images/services/experiences/ai-timecapsule-photo.webp',
    eventKo: '안산사이언스밸리 과학축제 2026',
    eventEn: 'Ansan Science Valley Science Festival 2026',
    portfolioSlug: 'ansan-science-festival-2026',
  },
  // K-WAVE DANCE FESTIVAL: 'IDOL! 오늘, 나도 K-POP 아이돌' 배너와 AI 포토부스
  'ai-idol-makeup-booth': {
    src: '/images/services/experiences/ai-idol-makeup-booth.webp',
    eventKo: 'K-WAVE DANCE FESTIVAL 2026',
    eventEn: 'K-WAVE DANCE FESTIVAL 2026',
    portfolioSlug: 'kwave-dance-festival-2026',
  },
  // 전북대 전공탐색 박람회: AI 체험존 화면(AI 미래직업 탐색 포함 3종)
  'ai-future-career': {
    src: '/images/services/experiences/ai-future-career.webp',
    eventKo: '전북대학교 전공탐색 박람회 2026',
    eventEn: 'JBNU Major Exploration Fair 2026',
    portfolioSlug: 'jbnu-major-fair-2026',
  },
};
