/** The five approved demo mockups, assigned deliberately to every experience. */
export type DemoMockupLayout = 'editorial' | 'centered' | 'photo-choices' | 'photo-studio' | 'console';

export const DEMO_MOCKUP_LAYOUTS: Record<string, DemoMockupLayout> = {
  'ai-personal-color': 'editorial',
  'ai-skincare-analysis': 'editorial',
  'ai-virtual-makeup': 'photo-studio',
  'ai-scent-soulmate': 'photo-choices',
  'ai-nail-designer': 'editorial',
  'ai-sommelier': 'photo-choices',
  'ai-cocktail-creator': 'photo-choices',
  'ai-barista-matching': 'photo-choices',
  'ai-taste-dna': 'photo-choices',
  'ai-style-profiler': 'editorial',
  'ai-runway-photobooth': 'photo-studio',
  'ai-fashion-timemachine': 'photo-studio',
  'ai-coord-recommender': 'editorial',
  'ai-idol-makeup-booth': 'photo-studio',
  'ai-fan-photocard': 'photo-studio',
  'ai-musicvideo-maker': 'console',
  'ai-celeb-lookalike': 'photo-studio',
  'ai-voice-lab': 'console',
  'ai-graduation-booth': 'photo-studio',
  'ai-future-career': 'editorial',
  'ai-science-kiosk': 'console',
  'ai-history-travel': 'photo-studio',
  'ai-timecapsule-photo': 'photo-studio',
  'ai-fortune-robot': 'centered',
  'ai-face-reading': 'centered',
  'ai-palm-reading': 'centered',
  'ai-caricature-artist': 'photo-studio',
  'ai-aura-reading': 'centered',
  'ai-brand-avatar': 'photo-studio',
  'ai-product-experience': 'console',
  'ai-team-chemistry': 'centered',
  'ai-vision-wall': 'console',
  'ai-business-card': 'editorial',
  'ai-hanbok-booth': 'photo-studio',
  'ai-traditional-painter': 'photo-studio',
  'ai-heritage-timemachine': 'console',
  'ai-travel-style': 'photo-choices',
  'ai-wedding-booth': 'photo-studio',
  'ai-couple-chemistry': 'centered',
  'ai-future-family': 'photo-studio',
  'ai-memory-movie': 'console',
};

export function getDemoMockupLayout(slug: string): DemoMockupLayout {
  return DEMO_MOCKUP_LAYOUTS[slug] ?? 'editorial';
}

interface ChoicePhoto { src: string; position?: string }
const concept = (name: string, position?: string): ChoicePhoto => ({ src: `/images/services/concepts/ai-${name}.webp`, position });

/** Mood references illustrate the choices; they are not claims about a venue or result. */
const CHOICE_PHOTOS: Record<string, Record<string, ChoicePhoto>> = {
  'ai-scent-soulmate': {
    shared: concept('business-card'), outdoor: concept('travel-style'), evening: concept('sommelier'),
    close: { src: '/images/services/acscent.webp' }, personal: concept('couple-chemistry'), statement: concept('cocktail-creator'),
    none: { src: '/images/services/experiences/ai-scent-soulmate.webp' }, sweet: concept('taste-dna', '70% center'), floral: { src: '/images/services/custom-content-book-perfume.webp' }, smoky: concept('sommelier', '30% center'),
  },
  'ai-sommelier': {
    soft: concept('sommelier', '70% center'), medium: concept('sommelier', 'center'), firm: concept('sommelier', '15% center'),
    light: concept('taste-dna', '80% center'), rich: concept('sommelier', 'center bottom'), spicy: concept('taste-dna', '20% center'), sweet: concept('cocktail-creator', '30% center'),
  },
  'ai-cocktail-creator': {
    sparkling: concept('cocktail-creator', '40% center'), silky: concept('cocktail-creator', '75% center'), stirred: concept('sommelier', 'center'),
    citrus: concept('cocktail-creator', '5% center'), herb: concept('cocktail-creator', '40% top'), fruit: concept('taste-dna'), minimal: concept('sommelier'),
  },
  'ai-barista-matching': {
    dripper: concept('barista-matching', '15% center'), espresso: concept('barista-matching', '75% center'), immersion: concept('barista-matching', '50% center'), cafe: concept('barista-matching', 'right center'),
    hot: concept('barista-matching', '25% center'), iced: concept('barista-matching', '75% center'), both: concept('barista-matching'),
  },
  'ai-taste-dna': {
    lunch: concept('taste-dna', '20% center'), snack: concept('barista-matching', '60% center'), dinner: concept('sommelier'),
    all: concept('taste-dna'), plant: concept('taste-dna', 'right center'), familiar: concept('taste-dna', 'left center'),
  },
  'ai-travel-style': {
    day: concept('travel-style', 'left center'), weekend: concept('travel-style'), long: concept('heritage-timemachine'),
    standard: concept('travel-style'), short: concept('travel-style', 'left center'), stepfree: concept('travel-style', 'right center'), quiet: concept('hanbok-booth'),
  },
};

export function getDemoChoicePhoto(slug: string, optionId: string): ChoicePhoto | undefined {
  return CHOICE_PHOTOS[slug]?.[optionId];
}
