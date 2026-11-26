/* 머리글 · 휴대폰 메뉴 · 바닥글이 함께 쓰는 메뉴 목록.
   순서는 2026-11-22 사용자가 정했다: 회사 → 체험 → 개발·AX → 포트폴리오 → 언론 → 문의.
   (그 전에는 2026-09~11 방문 도달 순서였다: 체험 서비스 37% · 포트폴리오 28~36% · 프로그램 개발 16% · 회사 소개 15% · 문의 13% · 언론 7%)
   큰 글자는 영어(화면에서는 CSS 로 대문자), 그 아래 작은 글자는 messages 의 nav.* (한국어판에서만 보인다).
   한국어판에서는 영어 글자가 꾸밈이라 화면 낭독기에는 한국어 이름만 읽힌다. */
export interface SiteNavItem {
  path: '/services' | '/portfolio' | '/development' | '/about' | '/press' | '/contact';
  en: string;
  /** messages nav.<key> */
  key: 'services' | 'portfolio' | 'development' | 'about' | 'press' | 'contact';
}

export const SITE_NAV: SiteNavItem[] = [
  // 2026-11-22 사용자: SERVICES → EXPERIENCES (업계에서 SERVICES 는 SI·개발 용역으로 읽힌다),
  // DEVELOPMENT → AX ('발전'으로 읽혀 어색함 · 국내 SI 는 SK AX · LG CNS 처럼 AX 를 그대로 쓴다)
  { path: '/about', en: 'About', key: 'about' },
  { path: '/services', en: 'Experiences', key: 'services' },
  { path: '/development', en: 'AX', key: 'development' },
  { path: '/portfolio', en: 'Portfolio', key: 'portfolio' },
  { path: '/press', en: 'Press', key: 'press' },
  { path: '/contact', en: 'Contact', key: 'contact' },
];
