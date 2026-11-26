/* ─────────────────────────────────────────────────────────
   포토부스 · 키오스크에 올릴 수 있는 프로그램 목록 (체험 서비스 목록과 두 상품 상세에서 쓴다)
   · 이름은 온라인 견적의 목록(photo-booth-templates · kiosk-experiences)과 같은 값
   · 어느 기기에서 도는지는 실제 프로그램 화면(onsite-flows)과 live-demos.ts 를 따른다
   · 목록 · 순서는 체험서비스 포트폴리오 PDF(2026-11-26, output/experience-portfolio-2026-11-site)와 같다 —
     포토부스 13 · 키오스크 19. 2026-11-26 사용자가 뺀 프로그램(뮤직비디오 메이커 · 추억 무비 · 팬 포토카드)은 없고, 관상은 포토부스에만 있다
   ───────────────────────────────────────────────────────── */
import { KIOSK_EXPERIENCES } from '@/lib/quote/kiosk-experiences';
import { PHOTO_BOOTH_TEMPLATES } from '@/lib/quote/photo-booth-templates';
import { experiences } from './experiences';
import { EXPERIENCE_PHOTOS } from './experience-photos';
import { ONSITE_FLOWS, type OnsiteDevice, type OnsiteFlow } from './onsite-flows';
import { PROGRAM_PREVIEWS } from './program-previews';

export interface LineProgram {
  slug: string;
  name: { ko: string; en: string };
  /** 공개된 상세 페이지가 있으면 그 주소 */
  href?: string;
  /** 실제 프로그램 화면 */
  flow?: OnsiteFlow;
  /** 실제 행사에서 운영한 프로그램 (운영 사진이 있는 것) */
  operated: boolean;
  /** 데모 첫 화면 — 영상판(길잡이 인물)이 있으면 영상판, 기본 화면 캡처가 없던 프로그램은 데모 첫 화면 (program-previews.ts) */
  screen?: string;
  /** screen 이 영상판 첫 화면인지 */
  video: boolean;
  /** 영상판 첫 화면을 녹화한 반복 영상 */
  clip?: string;
  /** 영상판 콘셉트 화면(제작 예정 화면 예시)인지 */
  concept: boolean;
}

const published = new Set(experiences.map((e) => e.slug));

const EXTRA_NAMES: Record<string, { ko: string; en: string }> = {
  'ai-timecapsule-photo': { ko: 'AI 타임캡슐 포토', en: 'AI Time Capsule Photo' },
  'ai-future-family': { ko: 'AI 미래 가족 상상', en: 'AI Future Family' },
};

function build(slug: string, name: { ko: string; en: string }, device: OnsiteDevice): LineProgram {
  const flow = ONSITE_FLOWS[slug];
  // 그 기기용 데모 화면만 쓴다 (예: FACE! 영상판은 포토부스라 키오스크 줄에서는 기본 화면)
  const preview = PROGRAM_PREVIEWS[slug]?.device === device ? PROGRAM_PREVIEWS[slug] : undefined;
  const usePreview = preview && (preview.video || !flow || flow.device !== device);
  return {
    slug,
    name,
    href: published.has(slug) ? `/services/${slug}` : undefined,
    flow: flow?.device === device ? flow : undefined,
    operated: slug in EXPERIENCE_PHOTOS,
    screen: usePreview ? preview.src : undefined,
    video: !!(usePreview && preview.video),
    clip: usePreview && preview.video ? preview.clip : undefined,
    concept: !!(usePreview && preview.concept),
  };
}

const kioskName = (slug: string) => KIOSK_EXPERIENCES.find((k) => k.slug === slug)?.name;
const boothNames = new Map<string, { ko: string; en: string }>([
  ...PHOTO_BOOTH_TEMPLATES.map((t) => [t.slug, t.name] as [string, { ko: string; en: string }]),
  ...Object.entries(EXTRA_NAMES),
  // 포토부스 데모가 있는 프로그램 (FACE! · SAJU! 영상판, MV!) — 이름은 견적 목록의 이름
  ...Object.entries(PROGRAM_PREVIEWS).filter(([, p]) => p.device === 'booth').flatMap(([slug]) => (kioskName(slug) ? [[slug, kioskName(slug)!] as [string, { ko: string; en: string }]] : [])),
]);

/** 포트폴리오 B-01 ~ B-13 순서 */
const BOOTH_ORDER = [
  'ai-timecapsule-photo', 'ai-fortune-robot', 'ai-face-reading', 'ai-idol-makeup-booth', 'ai-future-family', 'ai-fashion-timemachine', 'ai-hanbok-booth',
  'ai-runway-photobooth', 'ai-graduation-booth', 'ai-history-travel', 'ai-brand-avatar', 'ai-traditional-painter', 'ai-wedding-booth',
];
/** 포트폴리오 K-01 ~ K-19 순서 */
const KIOSK_ORDER = [
  'ai-personal-color', 'ai-future-career', 'ai-celeb-lookalike', 'ai-caricature-artist', 'ai-sommelier', 'ai-palm-reading', 'ai-skincare-analysis',
  'ai-style-profiler', 'ai-couple-chemistry', 'ai-nail-designer', 'ai-cocktail-creator', 'ai-barista-matching', 'ai-taste-dna', 'ai-coord-recommender',
  'ai-voice-lab', 'ai-aura-reading', 'ai-team-chemistry', 'ai-business-card', 'ai-travel-style',
];
const named = (slug: string, name: { ko: string; en: string } | undefined) => {
  if (!name) throw new Error(`프로그램 이름이 없다: ${slug}`);
  return name;
};

/** 포토부스에서 도는 프로그램 */
export const BOOTH_PROGRAMS: LineProgram[] = BOOTH_ORDER.map((slug) => build(slug, named(slug, boothNames.get(slug) ?? kioskName(slug)), 'booth'));

/** 키오스크에서 도는 프로그램 */
export const KIOSK_PROGRAMS: LineProgram[] = KIOSK_ORDER.map((slug) => build(slug, named(slug, kioskName(slug)), 'kiosk'));

/** 기기 그림 안에서 미리 볼 수 있는 프로그램 — 영상판 첫 화면이 있거나, 결과 화면까지 캡처된 것 */
export const stagePrograms = (list: LineProgram[]) => list.filter((p) => p.video || p.flow?.result);

/** 기기 화면에 띄울 첫 화면 · 결과 화면 (영상판은 결과도 영상판 장면에 머문다 — 기본 화면 결과와 섞지 않는다) */
export const screensOf = (p: LineProgram) => ({ start: p.screen ?? p.flow?.start, result: p.video ? p.screen : p.flow?.result });

/* 온라인 견적 2단계에서 고르는 목록 — 기존 사진 스타일 · 키오스크 체험 전부를 서비스 소개와 같은 순서로 (2026-11-21 사용자)
   목록에 없는 것(포토부스 전용 프로그램 등)은 뒤에 붙인다 */
const rankBy = (list: LineProgram[]) => {
  const order = list.map((p) => p.slug);
  return (slug: string) => order.indexOf(slug) + 1 || 99;
};
const boothRank = rankBy(BOOTH_PROGRAMS);
const kioskRank = rankBy(KIOSK_PROGRAMS);
export const QUOTE_BOOTH_TEMPLATES = [...PHOTO_BOOTH_TEMPLATES].sort((a, b) => boothRank(a.slug) - boothRank(b.slug));
export const QUOTE_KIOSK_EXPERIENCES = [...KIOSK_EXPERIENCES].sort((a, b) => kioskRank(a.slug) - kioskRank(b.slug));
