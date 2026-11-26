/* 체험서비스 포트폴리오 PDF (2026-11) — 사이트에서 받는 파일
   만드는 곳: output/experience-portfolio-2026-11-site (`LIGHT=1 node build.mjs` 가 메일용을 public/downloads 로 복사)
   전체본은 /portfolio#download(예전 /brochure) 에서 이름 · 이메일을 받고 내려 주고(/api/brochure), 서비스별 낱권은 각 서비스 화면에서 바로 받는다. */

export type PortfolioDoc = 'perfume' | 'photoBooth' | 'kiosk';

export const PORTFOLIO_FULL = {
  url: '/downloads/neander-experience-portfolio-2026.pdf',
  pages: 80,
  mb: 14.3,
} as const;

/** 회사소개서 — 포트폴리오에서 쪽을 골라 같은 빌드로 만든다(?doc=profile, 2026-11-26). 주소는 예전 회사소개서와 같다 */
export const COMPANY_PROFILE = {
  url: '/downloads/neander-company-profile.pdf',
  pages: 16,
  mb: 5.4,
} as const;

export const PORTFOLIO_PARTS: Record<PortfolioDoc, { url: string; pages: number; mb: number; ko: string; en: string }> = {
  perfume: { url: '/downloads/neander-portfolio-ai-perfumer.pdf', pages: 6, mb: 1.9, ko: 'AI 조향 소개서', en: 'AI Perfumer deck' },
  photoBooth: { url: '/downloads/neander-portfolio-ai-photo-booth.pdf', pages: 18, mb: 4.5, ko: 'AI 포토부스 소개서', en: 'AI Photo Booth deck' },
  kiosk: { url: '/downloads/neander-portfolio-ai-kiosk.pdf', pages: 24, mb: 5, ko: 'AI 키오스크 소개서', en: 'AI Kiosk deck' },
};

/** 체험 서비스 목록 · 상품 화면의 서비스 키 → 낱권 */
export const PORTFOLIO_BY_SERVICE: Record<string, PortfolioDoc> = {
  acscent: 'perfume',
  photoBooth: 'photoBooth',
  rental: 'kiosk',
};
