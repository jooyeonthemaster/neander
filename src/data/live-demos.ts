/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Live demo links
   서비스 slug → 매장 기기에서 실제로 도는 프로그램(acscent 사이트의 운영 모드 id).
   여기 있는 서비스는 "데모 체험하기"를 누르면 웹용 모의 데모 대신 실제 프로그램을 새 탭으로 연다.
   데모로 연 화면에는 NEANDER 워터마크가 깔리고 매장 기기 설정·통계는 건드리지 않는다(demo=1).
   여기 없는 서비스는 모의 데모 그대로.
   ───────────────────────────────────────────────────────── */

import { ACSCENT_URL } from '@/lib/constants';

/** 세로형 키오스크 /kiosk — 모드 id 는 acscent src/lib/kiosk/demo.ts(KIOSK_DEMOS)와 맞춘다 */
const KIOSK_MODE_BY_SLUG: Record<string, string> = {
  'ai-personal-color': 'ai-color',
  'ai-skincare-analysis': 'studio-skin',
  'ai-virtual-makeup': 'studio-makeup',
  'ai-scent-soulmate': 'studio-scent',
  'ai-nail-designer': 'studio-nail',
  'ai-sommelier': 'studio-sommelier',
  'ai-cocktail-creator': 'studio-cocktail',
  'ai-barista-matching': 'studio-barista',
  'ai-taste-dna': 'studio-taste-dna',
  'ai-style-profiler': 'studio-style-profiler',
  'ai-coord-recommender': 'studio-coord',
  'ai-celeb-lookalike': 'studio-lookalike',
  'ai-voice-lab': 'studio-voice',
  'ai-future-career': 'studio-career',
  'ai-science-kiosk': 'studio-science',
  'ai-face-reading': 'studio-face',
  'ai-palm-reading': 'studio-palm',
  'ai-caricature-artist': 'studio-draw',
  'ai-aura-reading': 'studio-aura',
  'ai-product-experience': 'studio-product',
  'ai-team-chemistry': 'studio-team',
  'ai-vision-wall': 'studio-vision-wall',
  'ai-business-card': 'studio-card',
  'ai-heritage-timemachine': 'studio-heritage',
  'ai-travel-style': 'studio-travel',
  'ai-couple-chemistry': 'studio-couple',
};

/** 포토부스 /booth — 프로그램 id 는 acscent src/lib/booth/programs/catalog.ts(PROGRAMS)와 맞춘다 */
const BOOTH_MODE_BY_SLUG: Record<string, string> = {
  'ai-runway-photobooth': 'runway',
  'ai-fashion-timemachine': 'fashion-time',
  'ai-idol-makeup-booth': 'idol-makeup',
  'ai-fan-photocard': 'fan-card',
  'ai-graduation-booth': 'graduation',
  'ai-history-travel': 'history',
  'ai-timecapsule-photo': 'timecapsule',
  'ai-brand-avatar': 'brand-avatar',
  'ai-hanbok-booth': 'hanbok',
  'ai-traditional-painter': 'traditional',
  'ai-wedding-booth': 'wedding',
  'ai-future-family': 'future-family',
  'ai-musicvideo-maker': 'music-video',
  'ai-memory-movie': 'memory-movie',
};

function demoHref(path: '/kiosk' | '/booth', mode: string) {
  const url = new URL(path, ACSCENT_URL);
  url.searchParams.set('mode', mode);
  url.searchParams.set('demo', '1');
  return url.toString();
}

/** 그 서비스의 실제 프로그램 데모 주소 — 없으면 undefined */
export function getLiveDemoHref(slug: string): string | undefined {
  const kiosk = KIOSK_MODE_BY_SLUG[slug];
  if (kiosk) return demoHref('/kiosk', kiosk);
  const booth = BOOTH_MODE_BY_SLUG[slug];
  if (booth) return demoHref('/booth', booth);
  return undefined;
}
