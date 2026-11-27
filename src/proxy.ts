import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/** AI 답변 속 링크는 마크다운 괄호·따옴표가 주소 끝에 붙어 들어온다 (2026-11-25: /services( 로 두 번 404).
 *  끝에 붙은 괄호·따옴표·구두점을 떼고 같은 주소로 보낸다. (점이 든 주소는 아래 matcher 에서 이미 빠진다) */
const TRAILING_JUNK = /(?:[()[\]{}<>"'`,;:!*]|%28|%29|%5B|%5D|%7B|%7D|%3C|%3E|%22|%27|%60)+$/i;

/** 기본 언어(ko)는 주소에 접두어가 없다. 예전 /ko/… 주소는 영구 이동(308)으로 접두어를 뗀다.
 *  next-intl 이 같은 일을 307(임시)로 해서 검색엔진에 「리디렉션이 포함된 페이지」로 남았다 (2026-11-27 서치 콘솔 점검).
 *  브라우저 언어에 따른 /en 자동 이동은 routing.ts 의 localeDetection: false 로 꺼져 있다 (2026-11-27, a5e72cd). */
const KO_PREFIX = /^\/ko(?=\/|$)/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleaned = pathname.replace(TRAILING_JUNK, '');
  if (cleaned !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = cleaned || '/';
    return NextResponse.redirect(url, 308);
  }
  if (KO_PREFIX.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(KO_PREFIX, '') || '/';
    return NextResponse.redirect(url, 308);
  }
  return intl(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next (Next.js internals)
     * - _vercel (Vercel internals)
     * - Static files with extensions (e.g. .ico, .png, .svg, .woff2)
     */
    '/((?!api|admin|_next|_vercel|.*\\..*).*)',
  ],
};
