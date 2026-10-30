import { KIOSK } from './catalog';

/**
 * Existing kiosk choices: the experiences currently mapped to `rental` by
 * serviceForExperience (diagnosis, fortune, and creative, excluding scent).
 * Names match messages/{ko,en}.json → services.exp.
 * Keep the allowlist here independent of the engine and demo UI: the engine
 * imports these helpers, and importing it back would create a circular dependency.
 */
export interface KioskExperience {
  readonly slug: string;
  readonly name: { readonly ko: string; readonly en: string };
}

export const KIOSK_EXPERIENCES = [
  { slug: 'ai-personal-color', name: { ko: 'AI 퍼스널 컬러 진단', en: 'AI Personal Color Diagnosis' } },
  { slug: 'ai-skincare-analysis', name: { ko: 'AI 스킨케어 분석관', en: 'AI Skincare Analyzer' } },
  { slug: 'ai-nail-designer', name: { ko: 'AI 네일 디자이너', en: 'AI Nail Designer' } },
  { slug: 'ai-sommelier', name: { ko: 'AI 소믈리에', en: 'AI Sommelier' } },
  { slug: 'ai-cocktail-creator', name: { ko: 'AI 칵테일 크리에이터', en: 'AI Cocktail Creator' } },
  { slug: 'ai-barista-matching', name: { ko: 'AI 바리스타 매칭', en: 'AI Barista Matching' } },
  { slug: 'ai-taste-dna', name: { ko: 'AI 미각 DNA 프로파일', en: 'AI Taste DNA Profile' } },
  { slug: 'ai-style-profiler', name: { ko: 'AI 스타일 프로파일러', en: 'AI Style Profiler' } },
  { slug: 'ai-coord-recommender', name: { ko: 'AI 코디 추천 키오스크', en: 'AI Coord Recommender Kiosk' } },
  { slug: 'ai-musicvideo-maker', name: { ko: 'AI 뮤직비디오 메이커', en: 'AI Music Video Maker' } },
  { slug: 'ai-celeb-lookalike', name: { ko: 'AI 연예인 닮은꼴 진단', en: 'AI Celebrity Lookalike' } },
  { slug: 'ai-voice-lab', name: { ko: 'AI 보이스 체험관', en: 'AI Voice Lab' } },
  { slug: 'ai-future-career', name: { ko: 'AI 미래직업 진단', en: 'AI Future Career Diagnosis' } },
  { slug: 'ai-fortune-robot', name: { ko: 'AI 사주', en: 'AI Saju Reading' } },
  { slug: 'ai-face-reading', name: { ko: 'AI 관상 분석', en: 'AI Face Reading' } },
  { slug: 'ai-palm-reading', name: { ko: 'AI 손금 로봇', en: 'AI Palm Reading Robot' } },
  { slug: 'ai-caricature-artist', name: { ko: 'AI 캐리커처 아티스트', en: 'AI Caricature Artist' } },
  { slug: 'ai-aura-reading', name: { ko: 'AI 오라 리딩', en: 'AI Aura Reading' } },
  { slug: 'ai-team-chemistry', name: { ko: 'AI 팀 케미 분석', en: 'AI Team Chemistry Analysis' } },
  { slug: 'ai-business-card', name: { ko: 'AI 명함 디자이너', en: 'AI Business Card Designer' } },
  { slug: 'ai-traditional-painter', name: { ko: 'AI 전통 화가', en: 'AI Traditional Painter' } },
  { slug: 'ai-travel-style', name: { ko: 'AI 여행 성향 진단', en: 'AI Travel Style Diagnosis' } },
  { slug: 'ai-couple-chemistry', name: { ko: 'AI 커플 케미 진단', en: 'AI Couple Chemistry' } },
  { slug: 'ai-memory-movie', name: { ko: 'AI 추억 무비 메이커', en: 'AI Memory Movie Maker' } },
] as const satisfies readonly KioskExperience[];

const experienceBySlug = new Map<string, KioskExperience>(
  KIOSK_EXPERIENCES.map((experience) => [experience.slug, experience]),
);

export function getKioskExperience(slug: string): KioskExperience | undefined {
  return experienceBySlug.get(slug);
}

/** One slot per physical device; an empty string means its experience is undecided. */
export function normalizeKioskExperienceSlugs(raw: unknown, kiosks: number, legacySlug?: unknown): string[] {
  const count = Number.isFinite(kiosks)
    ? Math.min(KIOSK.maxKiosks, Math.max(1, Math.round(kiosks)))
    : 1;
  // Only a missing new field migrates the legacy choice. Explicit clearing,
  // malformed input, and null must never bring an old selection back.
  const selected = raw === undefined ? [legacySlug] : Array.isArray(raw) ? raw : [];
  return Array.from({ length: count }, (_, index) => {
    const slug: unknown = selected[index];
    return typeof slug === 'string' && experienceBySlug.has(slug) ? slug : '';
  });
}

export function getKioskAssignments(options: {
  kiosks: number;
  experienceSlugs?: readonly string[];
  experienceSlug?: string;
}): string[] {
  return normalizeKioskExperienceSlugs(options.experienceSlugs, options.kiosks, options.experienceSlug);
}

/* ── 여러 대에 체험 나눠 담기 ─────────────────────────────── */

export interface KioskExperienceGroup {
  /** 체험 slug ('' = 상담 후 결정) */
  slug: string;
  /** 이 체험을 운영하는 기기 번호 (1부터) */
  kiosks: number[];
}

/** 기기별 체험 목록을 체험별로 묶는다 — 처음 나온 순서대로, 정하지 않은 기기는 맨 뒤 */
export function groupKioskAssignments(assignments: readonly string[]): KioskExperienceGroup[] {
  const groups = new Map<string, number[]>();
  assignments.forEach((slug, index) => groups.set(slug, [...(groups.get(slug) ?? []), index + 1]));
  const chosen = [...groups].filter(([slug]) => slug).map(([slug, kiosks]) => ({ slug, kiosks }));
  const undecided = groups.get('');
  return undecided ? [...chosen, { slug: '', kiosks: undecided }] : chosen;
}

/** 체험별 대수를 기기 순서대로 펼친다 — [A×2, B×2] → [A, A, B, B] */
function expand(counts: readonly { slug: string; count: number }[]): string[] {
  return counts.flatMap(({ slug, count }) => Array.from({ length: count }, () => slug));
}

/**
 * 고른 체험들로 키오스크를 고르게 나눈다. 나누어떨어지지 않으면 먼저 고른 체험이 한 대씩 더 갖는다.
 * 4대·2종 → 2·2, 4대·3종 → 2·1·1. 체험은 키오스크 수까지만 고를 수 있다. 하나도 없으면 모두 상담 후 결정.
 */
export function distributeKioskExperiences(slugs: readonly string[], kiosks: number): string[] {
  const chosen = [...new Set(slugs.filter(Boolean))].slice(0, kiosks);
  if (!chosen.length) return Array.from({ length: kiosks }, () => '');
  const base = Math.floor(kiosks / chosen.length);
  const extra = kiosks % chosen.length;
  return expand(chosen.map((slug, index) => ({ slug, count: base + (index < extra ? 1 : 0) })));
}

/**
 * 한 체험의 대수를 하나 늘리거나(+1) 줄인다(-1). 전체 대수는 그대로 두고 다른 체험과 주고받는다.
 * 늘릴 때는 정하지 않은 기기부터, 없으면 가장 많은 체험에서 한 대를 가져온다.
 * 줄일 때는 가장 적은 다른 체험에 넘긴다. 고른 체험은 모두 최소 1대를 지킨다.
 */
export function shiftKioskExperience(assignments: readonly string[], slug: string, delta: 1 | -1): string[] {
  const groups = groupKioskAssignments(assignments).map((group) => ({ slug: group.slug, count: group.kiosks.length }));
  const target = groups.find((group) => group.slug === slug);
  if (!target || !slug) return [...assignments];
  const others = groups.filter((group) => group !== target);
  if (delta > 0) {
    const undecided = others.find((group) => !group.slug);
    const donor = undecided ?? [...others].filter((group) => group.count > 1).sort((a, b) => b.count - a.count)[0];
    if (!donor) return [...assignments];
    donor.count -= 1;
    target.count += 1;
  } else {
    const receiver = [...others].filter((group) => group.slug).sort((a, b) => a.count - b.count)[0];
    if (target.count <= 1 || !receiver) return [...assignments];
    target.count -= 1;
    receiver.count += 1;
  }
  return expand(groups.filter((group) => group.count > 0));
}

/** 기기 번호 목록을 짧게 — [1,2,3] → '1–3번', [2] → '2번', [1,3] → '1·3번' */
export function formatKioskNumbers(numbers: readonly number[], lang: 'ko' | 'en'): string {
  const contiguous = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1);
  const text = numbers.length > 1 && contiguous ? `${numbers[0]}–${numbers[numbers.length - 1]}` : numbers.join(lang === 'ko' ? '·' : ', ');
  return lang === 'ko' ? `${text}번` : `Kiosk${numbers.length > 1 ? 's' : ''} ${text}`;
}
