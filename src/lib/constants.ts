import type { NavItem } from '@/types';

/* ─────────────────────────────────────────────────────────
   Site Identity
   ───────────────────────────────────────────────────────── */

export const SITE_NAME = 'NEANDERco.';
export const SITE_URL = 'https://neander.co.kr';
export const COMPANY_NAME_KO = '(주)네안데르';
export const COMPANY_NAME_EN = 'NEANDERco.ltd';

/* ─────────────────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────────────────── */

export const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/about', labelKey: 'nav.about' },
  { path: '/services', labelKey: 'nav.services' },
  { path: '/quote', labelKey: 'nav.quote' },
  { path: '/portfolio', labelKey: 'nav.portfolio' },
  { path: '/press', labelKey: 'nav.press' },
  { path: '/contact', labelKey: 'nav.contact' },
];

/** 온라인 견적 페이지 (/quote). 예전 주소 /contact?type=quote 는 이 페이지로 넘겨준다. */
export const QUOTE_HREF = '/quote' as const;

/** 체험에서 문의·견적으로 갈 때 어떤 체험에서 왔는지 함께 넘긴다 */
export function getServiceContactHref(slug: string, quote = true) {
  return quote
    ? { pathname: '/quote' as const, query: { service: slug } }
    : { pathname: '/contact' as const, query: { service: slug } };
}

/* ─────────────────────────────────────────────────────────
   Social Links
   ───────────────────────────────────────────────────────── */

export type SocialPlatform = 'instagram' | 'youtube' | 'linkedin' | 'blog';

/**
 * 실제로 운영 중인 계정만 넣는다. 비워 두면 해당 아이콘은 화면에 표시되지 않는다.
 *
 * 2026-09-18 확인:
 *   - instagram @neander_lab        → 회사 공식 계정 (AI + FRAGRANCE)
 *   - youtube.com/@neanderco        → 404, 채널 없음
 *   - linkedin.com/company/neanderco → 404, 페이지 없음
 *   - blog.neanderco.com            → 도메인 미연결
 * 유튜브·링크드인·블로그는 계정이 생기면 아래 주석을 풀고 주소를 넣으면 된다.
 */
export const SOCIAL_LINKS: Partial<Record<SocialPlatform, string>> = {
  instagram: 'https://www.instagram.com/neander_lab/',
  // youtube: 'https://youtube.com/@<실제 채널>',
  // linkedin: 'https://linkedin.com/company/<실제 페이지>',
  // blog: 'https://<실제 블로그 주소>',
};

/* ─────────────────────────────────────────────────────────
   Contact Information
   ───────────────────────────────────────────────────────── */

export const CONTACT = {
  email: 'ok@neander.co.kr',
  phone: '02-336-3368',
  phoneInternational: '+82-2-336-3368',
  mobile: '010-8507-5121',
  mobileInternational: '+82-10-8507-5121',
  address: {
    ko: '서울특별시 마포구 와우산로 29라길 22',
    en: '22, Wausan-ro 29ra-gil, Mapo-gu, Seoul, South Korea',
  },
  /** 사업장(사무실) 주소 — 푸터 사업자 정보·검색엔진 회사 정보용. 위 address는 매장(방문) 주소 */
  officeAddress: {
    ko: '서울특별시 마포구 독막로36길 10-6 1층',
    en: '1F, 10-6, Dongmak-ro 36-gil, Mapo-gu, Seoul, South Korea',
  },
} as const;
