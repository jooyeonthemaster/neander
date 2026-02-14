export interface QuizStep {
  id: string;
  type: 'mood' | 'color' | 'memory' | 'intensity';
  titleKey: string;
  subtitleKey: string;
  options?: QuizOption[];
  maxSelect?: number;
}

export interface QuizOption {
  id: string;
  labelKey: string;
  value: string;
  emoji?: string;
  color?: string;
  image?: string;
}

export interface ScentProfile {
  name: string;
  nameKey: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  description: string;
  descriptionKey: string;
  scores: {
    floral: number;
    citrus: number;
    woody: number;
    oriental: number;
    fresh: number;
    sweet: number;
  };
}

export const quizSteps: QuizStep[] = [
  {
    id: 'mood',
    type: 'mood',
    titleKey: 'moodTitle',
    subtitleKey: 'moodSubtitle',
    maxSelect: 1,
    options: [
      {
        id: 'calm',
        labelKey: 'moodCalm',
        value: 'calm',
        emoji: '🌊',
        image: '/images/demo/scent-moods/calm.webp',
      },
      {
        id: 'energetic',
        labelKey: 'moodEnergetic',
        value: 'energetic',
        emoji: '⚡',
        image: '/images/demo/scent-moods/energetic.webp',
      },
      {
        id: 'romantic',
        labelKey: 'moodRomantic',
        value: 'romantic',
        emoji: '🌹',
        image: '/images/demo/scent-moods/romantic.webp',
      },
      {
        id: 'mysterious',
        labelKey: 'moodMysterious',
        value: 'mysterious',
        emoji: '🌙',
        image: '/images/demo/scent-moods/mysterious.webp',
      },
    ],
  },
  {
    id: 'color',
    type: 'color',
    titleKey: 'colorTitle',
    subtitleKey: 'colorSubtitle',
    maxSelect: 3,
    options: [
      { id: 'rose', labelKey: 'colorRose', value: 'rose', color: '#F43F5E' },
      { id: 'amber', labelKey: 'colorAmber', value: 'amber', color: '#F59E0B' },
      { id: 'teal', labelKey: 'colorTeal', value: 'teal', color: '#14B8A6' },
      { id: 'violet', labelKey: 'colorViolet', value: 'violet', color: '#8B5CF6' },
      { id: 'sky', labelKey: 'colorSky', value: 'sky', color: '#0EA5E9' },
      { id: 'lime', labelKey: 'colorLime', value: 'lime', color: '#84CC16' },
      { id: 'slate', labelKey: 'colorSlate', value: 'slate', color: '#475569' },
      { id: 'cream', labelKey: 'colorCream', value: 'cream', color: '#FEF3C7' },
    ],
  },
  {
    id: 'memory',
    type: 'memory',
    titleKey: 'memoryTitle',
    subtitleKey: 'memorySubtitle',
    maxSelect: 2,
    options: [
      { id: 'beachMorning', labelKey: 'memBeach', value: 'beachMorning', emoji: '🏖️' },
      { id: 'forestRain', labelKey: 'memForest', value: 'forestRain', emoji: '🌲' },
      { id: 'oldLibrary', labelKey: 'memLibrary', value: 'oldLibrary', emoji: '📚' },
      { id: 'nightCity', labelKey: 'memCity', value: 'nightCity', emoji: '🌃' },
      { id: 'warmCafe', labelKey: 'memCafe', value: 'warmCafe', emoji: '☕' },
      { id: 'springGarden', labelKey: 'memGarden', value: 'springGarden', emoji: '🌸' },
    ],
  },
  {
    id: 'intensity',
    type: 'intensity',
    titleKey: 'intensityTitle',
    subtitleKey: 'intensitySubtitle',
  },
];

export const scentProfiles: ScentProfile[] = [
  {
    name: 'Aurora Mist',
    nameKey: 'auroraMist',
    topNotes: ['Bergamot', 'Pink Pepper'],
    middleNotes: ['Iris', 'Violet Leaf'],
    baseNotes: ['White Musk', 'Cedarwood'],
    description: 'A gentle whisper of morning light on dewy petals',
    descriptionKey: 'auroraMistDesc',
    scores: { floral: 7, citrus: 5, woody: 3, oriental: 2, fresh: 8, sweet: 4 },
  },
  {
    name: 'Midnight Ember',
    nameKey: 'midnightEmber',
    topNotes: ['Black Pepper', 'Cardamom'],
    middleNotes: ['Oud', 'Rose Absolute'],
    baseNotes: ['Amber', 'Sandalwood'],
    description: 'Deep and magnetic, like candlelight in a velvet room',
    descriptionKey: 'midnightEmberDesc',
    scores: { floral: 3, citrus: 1, woody: 7, oriental: 9, fresh: 2, sweet: 5 },
  },
  {
    name: 'Citrus Wave',
    nameKey: 'citrusWave',
    topNotes: ['Yuzu', 'Grapefruit'],
    middleNotes: ['Neroli', 'Green Tea'],
    baseNotes: ['White Cedar', 'Sea Salt'],
    description: 'An invigorating splash of sun-kissed coastal energy',
    descriptionKey: 'citrusWaveDesc',
    scores: { floral: 2, citrus: 9, woody: 2, oriental: 1, fresh: 9, sweet: 3 },
  },
  {
    name: 'Velvet Bloom',
    nameKey: 'velvetBloom',
    topNotes: ['Peony', 'Lychee'],
    middleNotes: ['Turkish Rose', 'Jasmine Sambac'],
    baseNotes: ['Vanilla', 'Cashmere Musk'],
    description: 'Lush, romantic, like walking through a midnight garden',
    descriptionKey: 'velvetBloomDesc',
    scores: { floral: 10, citrus: 2, woody: 1, oriental: 4, fresh: 3, sweet: 8 },
  },
  {
    name: 'Terra Noir',
    nameKey: 'terraNoir',
    topNotes: ['Saffron', 'Juniper Berry'],
    middleNotes: ['Vetiver', 'Patchouli'],
    baseNotes: ['Dark Amber', 'Tobacco Leaf'],
    description: 'Earth-rooted sophistication with smoky depth',
    descriptionKey: 'terraNoirDesc',
    scores: { floral: 1, citrus: 2, woody: 9, oriental: 7, fresh: 3, sweet: 2 },
  },
  {
    name: 'Crystal Garden',
    nameKey: 'crystalGarden',
    topNotes: ['White Peach', 'Freesia'],
    middleNotes: ['Lily of the Valley', 'Magnolia'],
    baseNotes: ['Sheer Musk', 'Blonde Wood'],
    description: 'Pure and luminous, like sunlight through crystal',
    descriptionKey: 'crystalGardenDesc',
    scores: { floral: 8, citrus: 4, woody: 2, oriental: 1, fresh: 7, sweet: 6 },
  },
];
