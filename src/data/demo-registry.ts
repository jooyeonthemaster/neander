/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Registry
   Maps experience slugs to their lazy-loaded demo modules
   ───────────────────────────────────────────────────────── */

import type { DemoModule } from '@/types/demo';

type DemoLoader = () => Promise<DemoModule>;

const DEMO_REGISTRY: Record<string, DemoLoader> = {
  'ai-personal-color': () =>
    import('@/components/demo/demos/PersonalColorDemo').then((m) => m.default),
  'ai-cocktail-creator': () =>
    import('@/components/demo/demos/CocktailCreatorDemo').then((m) => m.default),
  'ai-style-profiler': () =>
    import('@/components/demo/demos/StyleProfilerDemo').then((m) => m.default),
  'ai-celeb-lookalike': () =>
    import('@/components/demo/demos/CelebLookalikeDemo').then((m) => m.default),
  'ai-future-career': () =>
    import('@/components/demo/demos/FutureCareerDemo').then((m) => m.default),
  'ai-fortune-robot': () =>
    import('@/components/demo/demos/FortuneRobotDemo').then((m) => m.default),
  'ai-team-chemistry': () =>
    import('@/components/demo/demos/TeamChemistryDemo').then((m) => m.default),
  'ai-travel-style': () =>
    import('@/components/demo/demos/TravelStyleDemo').then((m) => m.default),
  'ai-couple-chemistry': () =>
    import('@/components/demo/demos/CoupleChemistryDemo').then((m) => m.default),
};

/** Check if a demo exists for this experience slug (server-safe) */
export function hasDemoForSlug(slug: string): boolean {
  return slug in DEMO_REGISTRY;
}

/** Lazy-load a demo module by slug (client-side only) */
export function loadDemoModule(slug: string): DemoLoader | undefined {
  return DEMO_REGISTRY[slug];
}

/** All slugs that have interactive demos */
export const DEMO_SLUGS = Object.keys(DEMO_REGISTRY);
