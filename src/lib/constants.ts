import type { NavItem } from '@/types';

/* ─────────────────────────────────────────────────────────
   Site Identity
   ───────────────────────────────────────────────────────── */

export const SITE_NAME = 'NEANDERco.';
export const SITE_URL = 'https://neanderco.com';
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
  { path: '/quote', labelKey: 'nav.quote' },
  { path: '/contact', labelKey: 'nav.contact' },
];

/* ─────────────────────────────────────────────────────────
   Social Links
   ───────────────────────────────────────────────────────── */

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/neanderco',
  youtube: 'https://youtube.com/@neanderco',
  linkedin: 'https://linkedin.com/company/neanderco',
  blog: 'https://blog.neanderco.com',
} as const;

/* ─────────────────────────────────────────────────────────
   Contact Information
   ───────────────────────────────────────────────────────── */

export const CONTACT = {
  email: 'hello@neanderco.com',
  phone: '+82-2-0000-0000',
  address: {
    ko: '서울특별시 강남구',
    en: 'Gangnam-gu, Seoul, South Korea',
  },
} as const;
