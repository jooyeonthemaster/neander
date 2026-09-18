import type { NavItem } from '@/types';

/* ─────────────────────────────────────────────────────────
   Site Identity
   ───────────────────────────────────────────────────────── */

export const SITE_NAME = 'NEANDERco.';
export const SITE_URL = 'https://neander.co.kr';
export const COMPANY_NAME_KO = '네안더 주식회사';
export const COMPANY_NAME_EN = 'NEANDERco.ltd';

/* ─────────────────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────────────────── */

export const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'nav.home' },
  { path: '/about', labelKey: 'nav.about' },
  { path: '/services', labelKey: 'nav.services' },
  { path: '/portfolio', labelKey: 'nav.portfolio' },
  { path: '/press', labelKey: 'nav.press' },
  { path: '/contact', labelKey: 'nav.contact' },
];

/**
 * 견적 계산 탭 주소. 문의하기와 견적 요청을 /contact 한 페이지의 두 탭으로 합쳤다.
 * (/quote 는 이 주소로 넘겨준다)
 */
export const QUOTE_HREF = { pathname: '/contact', query: { type: 'quote' } } as const;

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
  address: {
    ko: '서울특별시 마포구 와우산로 29라길 22',
    en: '22, Wausan-ro 29ra-gil, Mapo-gu, Seoul, South Korea',
  },
} as const;
