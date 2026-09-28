import { routing } from '@/i18n/routing';

/**
 * 페이지별 canonical·hreflang. 기본 언어(ko)는 접두사 없이, 나머지는 /en 처럼 접두사를 붙인다.
 * 상대 경로는 layout의 metadataBase(https://neander.co.kr) 기준으로 절대 URL이 된다.
 */
export function localePath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path === '/' ? '' : path}`;
}

export function localeAlternates(path: string, locale: string) {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, localePath(path, l)]),
  );
  languages['x-default'] = localePath(path, routing.defaultLocale);
  return { canonical: localePath(path, locale), languages };
}

/** 공유 미리보기 기본 이미지. 페이지가 openGraph를 따로 정하면 부모 값이 통째로 대체되므로 거기에도 넣는다 */
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'NEANDER',
};
