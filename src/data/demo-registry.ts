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
  'ai-skincare-analysis': () =>
    import('@/components/demo/demos/SkincareAnalysisDemo').then((m) => m.default),
  'ai-caricature-artist': () =>
    import('@/components/demo/demos/CaricatureArtistDemo').then((m) => m.default),
  'ai-sommelier': () =>
    import('@/components/demo/demos/SommelierDemo').then((m) => m.default),
  'ai-voice-lab': () =>
    import('@/components/demo/demos/VoiceLabDemo').then((m) => m.default),
  'ai-face-reading': () =>
    import('@/components/demo/demos/FaceReadingDemo').then((m) => m.default),
  'ai-fan-photocard': () =>
    import('@/components/demo/demos/FanPhotocardDemo').then((m) => m.default),
  'ai-virtual-makeup': () =>
    import('@/components/demo/demos/VirtualMakeupDemo').then((m) => m.default),
  'ai-taste-dna': () =>
    import('@/components/demo/demos/TasteDnaDemo').then((m) => m.default),
  'ai-palm-reading': () =>
    import('@/components/demo/demos/PalmReadingDemo').then((m) => m.default),
  'ai-scent-soulmate': () =>
    import('@/components/demo/demos/ScentSoulmateDemo').then((m) => m.default),
  'ai-aura-reading': () =>
    import('@/components/demo/demos/AuraReadingDemo').then((m) => m.default),
  'ai-musicvideo-maker': () =>
    import('@/components/demo/demos/MusicvideoMakerDemo').then((m) => m.default),
  'ai-hanbok-booth': () =>
    import('@/components/demo/demos/HanbokBoothDemo').then((m) => m.default),
  'ai-nail-designer': () =>
    import('@/components/demo/demos/NailDesignerDemo').then((m) => m.default),
  'ai-brand-avatar': () =>
    import('@/components/demo/demos/BrandAvatarDemo').then((m) => m.default),
  'ai-graduation-booth': () =>
    import('@/components/demo/demos/GraduationBoothDemo').then((m) => m.default),
  'ai-traditional-painter': () =>
    import('@/components/demo/demos/TraditionalPainterDemo').then((m) => m.default),
  'ai-runway-photobooth': () =>
    import('@/components/demo/demos/RunwayPhotoboothDemo').then((m) => m.default),
  'ai-product-experience': () =>
    import('@/components/demo/demos/ProductExperienceDemo').then((m) => m.default),
  'ai-science-kiosk': () =>
    import('@/components/demo/demos/ScienceKioskDemo').then((m) => m.default),
  'ai-fashion-timemachine': () =>
    import('@/components/demo/demos/FashionTimemachineDemo').then((m) => m.default),
  'ai-coord-recommender': () =>
    import('@/components/demo/demos/CoordRecommenderDemo').then((m) => m.default),
  'ai-heritage-timemachine': () =>
    import('@/components/demo/demos/HeritageTimemachineDemo').then((m) => m.default),
  'ai-vision-wall': () =>
    import('@/components/demo/demos/VisionWallDemo').then((m) => m.default),
  'ai-history-travel': () =>
    import('@/components/demo/demos/HistoryTravelDemo').then((m) => m.default),
  'ai-idol-makeup-booth': () =>
    import('@/components/demo/demos/IdolMakeupBoothDemo').then((m) => m.default),
  'ai-business-card': () =>
    import('@/components/demo/demos/BusinessCardDemo').then((m) => m.default),
  'ai-wedding-booth': () =>
    import('@/components/demo/demos/WeddingBoothDemo').then((m) => m.default),
  'ai-timecapsule-photo': () =>
    import('@/components/demo/demos/TimecapsulePhotoDemo').then((m) => m.default),
  'ai-barista-matching': () =>
    import('@/components/demo/demos/BaristaMatchingDemo').then((m) => m.default),
  'ai-future-family': () =>
    import('@/components/demo/demos/FutureFamilyDemo').then((m) => m.default),
  'ai-memory-movie': () =>
    import('@/components/demo/demos/MemoryMovieDemo').then((m) => m.default),
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
