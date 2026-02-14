/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Experiential AI Content Data
   42 unique AI experience concepts across 9 industries
   ───────────────────────────────────────────────────────── */

export type PillarId = 'ai-photo' | 'ai-diagnosis' | 'ai-fortune' | 'ai-creative' | 'ai-immersive';
export type IndustryId = 'beauty' | 'fnb' | 'fashion' | 'entertainment' | 'education' | 'festival' | 'corporate' | 'tourism' | 'wedding';

export interface Pillar {
  id: PillarId;
  nameKey: string;
  taglineKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface Experience {
  id: string;
  slug: string;
  pillar: PillarId;
  industry: IndustryId;
  nameKey: string;
  oneLinerKey: string;
  descriptionKey: string;
  featuresKey: string;
  featureCount: number;
  processStepCount: number;
  processStepsKey: string;
  highlightCount: number;
  highlightsKey: string;
  useCaseCount: number;
  useCasesKey: string;
}

export interface Industry {
  id: IndustryId;
  nameKey: string;
  icon: string;
  experiences: string[]; // experience ids
}

/* ── Pillars ──────────────────────────────────────────── */

export const pillars: Pillar[] = [
  {
    id: 'ai-photo',
    nameKey: 'pillars.aiPhoto.name',
    taglineKey: 'pillars.aiPhoto.tagline',
    descriptionKey: 'pillars.aiPhoto.description',
    icon: 'camera',
    color: '#F43F5E',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'ai-diagnosis',
    nameKey: 'pillars.aiDiagnosis.name',
    taglineKey: 'pillars.aiDiagnosis.tagline',
    descriptionKey: 'pillars.aiDiagnosis.description',
    icon: 'scan',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'ai-fortune',
    nameKey: 'pillars.aiFortune.name',
    taglineKey: 'pillars.aiFortune.tagline',
    descriptionKey: 'pillars.aiFortune.description',
    icon: 'sparkles',
    color: '#A855F7',
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'ai-creative',
    nameKey: 'pillars.aiCreative.name',
    taglineKey: 'pillars.aiCreative.tagline',
    descriptionKey: 'pillars.aiCreative.description',
    icon: 'palette',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'ai-immersive',
    nameKey: 'pillars.aiImmersive.name',
    taglineKey: 'pillars.aiImmersive.tagline',
    descriptionKey: 'pillars.aiImmersive.description',
    icon: 'layers',
    color: '#0D9488',
    gradient: 'from-teal-500 to-emerald-600',
  },
];

/* ── Industries ───────────────────────────────────────── */

export const industries: Industry[] = [
  {
    id: 'beauty',
    nameKey: 'industries.beauty',
    icon: 'sparkles',
    experiences: ['beauty-01', 'beauty-02', 'beauty-03', 'beauty-04', 'beauty-05'],
  },
  {
    id: 'fnb',
    nameKey: 'industries.fnb',
    icon: 'wine',
    experiences: ['fnb-01', 'fnb-02', 'fnb-03', 'fnb-04'],
  },
  {
    id: 'fashion',
    nameKey: 'industries.fashion',
    icon: 'shirt',
    experiences: ['fashion-01', 'fashion-02', 'fashion-03', 'fashion-04'],
  },
  {
    id: 'entertainment',
    nameKey: 'industries.entertainment',
    icon: 'music',
    experiences: ['ent-01', 'ent-02', 'ent-03', 'ent-04', 'ent-05'],
  },
  {
    id: 'education',
    nameKey: 'industries.education',
    icon: 'graduationCap',
    experiences: ['edu-01', 'edu-02', 'edu-03', 'edu-04', 'edu-05'],
  },
  {
    id: 'festival',
    nameKey: 'industries.festival',
    icon: 'party',
    experiences: ['fest-01', 'fest-02', 'fest-03', 'fest-04', 'fest-05'],
  },
  {
    id: 'corporate',
    nameKey: 'industries.corporate',
    icon: 'building',
    experiences: ['corp-01', 'corp-02', 'corp-03', 'corp-04', 'corp-05'],
  },
  {
    id: 'tourism',
    nameKey: 'industries.tourism',
    icon: 'landmark',
    experiences: ['tour-01', 'tour-02', 'tour-03', 'tour-04'],
  },
  {
    id: 'wedding',
    nameKey: 'industries.wedding',
    icon: 'heart',
    experiences: ['wed-01', 'wed-02', 'wed-03', 'wed-04'],
  },
];

/* ── Experiences ──────────────────────────────────────── */

export const experiences: Experience[] = [
  // ── Beauty ──
  { id: 'beauty-01', slug: 'ai-personal-color', pillar: 'ai-diagnosis', industry: 'beauty', nameKey: 'exp.beauty01.name', oneLinerKey: 'exp.beauty01.oneLiner', descriptionKey: 'exp.beauty01.description', featuresKey: 'exp.beauty01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.beauty01.processSteps', highlightCount: 3, highlightsKey: 'exp.beauty01.highlights', useCaseCount: 3, useCasesKey: 'exp.beauty01.useCases' },
  { id: 'beauty-02', slug: 'ai-skincare-analysis', pillar: 'ai-diagnosis', industry: 'beauty', nameKey: 'exp.beauty02.name', oneLinerKey: 'exp.beauty02.oneLiner', descriptionKey: 'exp.beauty02.description', featuresKey: 'exp.beauty02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.beauty02.processSteps', highlightCount: 3, highlightsKey: 'exp.beauty02.highlights', useCaseCount: 3, useCasesKey: 'exp.beauty02.useCases' },
  { id: 'beauty-03', slug: 'ai-virtual-makeup', pillar: 'ai-photo', industry: 'beauty', nameKey: 'exp.beauty03.name', oneLinerKey: 'exp.beauty03.oneLiner', descriptionKey: 'exp.beauty03.description', featuresKey: 'exp.beauty03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.beauty03.processSteps', highlightCount: 3, highlightsKey: 'exp.beauty03.highlights', useCaseCount: 3, useCasesKey: 'exp.beauty03.useCases' },
  { id: 'beauty-04', slug: 'ai-scent-soulmate', pillar: 'ai-creative', industry: 'beauty', nameKey: 'exp.beauty04.name', oneLinerKey: 'exp.beauty04.oneLiner', descriptionKey: 'exp.beauty04.description', featuresKey: 'exp.beauty04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.beauty04.processSteps', highlightCount: 3, highlightsKey: 'exp.beauty04.highlights', useCaseCount: 3, useCasesKey: 'exp.beauty04.useCases' },
  { id: 'beauty-05', slug: 'ai-nail-designer', pillar: 'ai-creative', industry: 'beauty', nameKey: 'exp.beauty05.name', oneLinerKey: 'exp.beauty05.oneLiner', descriptionKey: 'exp.beauty05.description', featuresKey: 'exp.beauty05.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.beauty05.processSteps', highlightCount: 3, highlightsKey: 'exp.beauty05.highlights', useCaseCount: 3, useCasesKey: 'exp.beauty05.useCases' },

  // ── F&B ──
  { id: 'fnb-01', slug: 'ai-sommelier', pillar: 'ai-diagnosis', industry: 'fnb', nameKey: 'exp.fnb01.name', oneLinerKey: 'exp.fnb01.oneLiner', descriptionKey: 'exp.fnb01.description', featuresKey: 'exp.fnb01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fnb01.processSteps', highlightCount: 3, highlightsKey: 'exp.fnb01.highlights', useCaseCount: 3, useCasesKey: 'exp.fnb01.useCases' },
  { id: 'fnb-02', slug: 'ai-cocktail-creator', pillar: 'ai-creative', industry: 'fnb', nameKey: 'exp.fnb02.name', oneLinerKey: 'exp.fnb02.oneLiner', descriptionKey: 'exp.fnb02.description', featuresKey: 'exp.fnb02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fnb02.processSteps', highlightCount: 3, highlightsKey: 'exp.fnb02.highlights', useCaseCount: 3, useCasesKey: 'exp.fnb02.useCases' },
  { id: 'fnb-03', slug: 'ai-barista-matching', pillar: 'ai-diagnosis', industry: 'fnb', nameKey: 'exp.fnb03.name', oneLinerKey: 'exp.fnb03.oneLiner', descriptionKey: 'exp.fnb03.description', featuresKey: 'exp.fnb03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fnb03.processSteps', highlightCount: 3, highlightsKey: 'exp.fnb03.highlights', useCaseCount: 3, useCasesKey: 'exp.fnb03.useCases' },
  { id: 'fnb-04', slug: 'ai-taste-dna', pillar: 'ai-diagnosis', industry: 'fnb', nameKey: 'exp.fnb04.name', oneLinerKey: 'exp.fnb04.oneLiner', descriptionKey: 'exp.fnb04.description', featuresKey: 'exp.fnb04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fnb04.processSteps', highlightCount: 3, highlightsKey: 'exp.fnb04.highlights', useCaseCount: 3, useCasesKey: 'exp.fnb04.useCases' },

  // ── Fashion ──
  { id: 'fashion-01', slug: 'ai-style-profiler', pillar: 'ai-diagnosis', industry: 'fashion', nameKey: 'exp.fashion01.name', oneLinerKey: 'exp.fashion01.oneLiner', descriptionKey: 'exp.fashion01.description', featuresKey: 'exp.fashion01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fashion01.processSteps', highlightCount: 3, highlightsKey: 'exp.fashion01.highlights', useCaseCount: 3, useCasesKey: 'exp.fashion01.useCases' },
  { id: 'fashion-02', slug: 'ai-runway-photobooth', pillar: 'ai-photo', industry: 'fashion', nameKey: 'exp.fashion02.name', oneLinerKey: 'exp.fashion02.oneLiner', descriptionKey: 'exp.fashion02.description', featuresKey: 'exp.fashion02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fashion02.processSteps', highlightCount: 3, highlightsKey: 'exp.fashion02.highlights', useCaseCount: 3, useCasesKey: 'exp.fashion02.useCases' },
  { id: 'fashion-03', slug: 'ai-fashion-timemachine', pillar: 'ai-photo', industry: 'fashion', nameKey: 'exp.fashion03.name', oneLinerKey: 'exp.fashion03.oneLiner', descriptionKey: 'exp.fashion03.description', featuresKey: 'exp.fashion03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fashion03.processSteps', highlightCount: 3, highlightsKey: 'exp.fashion03.highlights', useCaseCount: 3, useCasesKey: 'exp.fashion03.useCases' },
  { id: 'fashion-04', slug: 'ai-coord-recommender', pillar: 'ai-creative', industry: 'fashion', nameKey: 'exp.fashion04.name', oneLinerKey: 'exp.fashion04.oneLiner', descriptionKey: 'exp.fashion04.description', featuresKey: 'exp.fashion04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fashion04.processSteps', highlightCount: 3, highlightsKey: 'exp.fashion04.highlights', useCaseCount: 3, useCasesKey: 'exp.fashion04.useCases' },

  // ── Entertainment / K-POP ──
  { id: 'ent-01', slug: 'ai-idol-makeup-booth', pillar: 'ai-photo', industry: 'entertainment', nameKey: 'exp.ent01.name', oneLinerKey: 'exp.ent01.oneLiner', descriptionKey: 'exp.ent01.description', featuresKey: 'exp.ent01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.ent01.processSteps', highlightCount: 3, highlightsKey: 'exp.ent01.highlights', useCaseCount: 3, useCasesKey: 'exp.ent01.useCases' },
  { id: 'ent-02', slug: 'ai-fan-photocard', pillar: 'ai-photo', industry: 'entertainment', nameKey: 'exp.ent02.name', oneLinerKey: 'exp.ent02.oneLiner', descriptionKey: 'exp.ent02.description', featuresKey: 'exp.ent02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.ent02.processSteps', highlightCount: 3, highlightsKey: 'exp.ent02.highlights', useCaseCount: 3, useCasesKey: 'exp.ent02.useCases' },
  { id: 'ent-03', slug: 'ai-musicvideo-maker', pillar: 'ai-creative', industry: 'entertainment', nameKey: 'exp.ent03.name', oneLinerKey: 'exp.ent03.oneLiner', descriptionKey: 'exp.ent03.description', featuresKey: 'exp.ent03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.ent03.processSteps', highlightCount: 3, highlightsKey: 'exp.ent03.highlights', useCaseCount: 3, useCasesKey: 'exp.ent03.useCases' },
  { id: 'ent-04', slug: 'ai-celeb-lookalike', pillar: 'ai-diagnosis', industry: 'entertainment', nameKey: 'exp.ent04.name', oneLinerKey: 'exp.ent04.oneLiner', descriptionKey: 'exp.ent04.description', featuresKey: 'exp.ent04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.ent04.processSteps', highlightCount: 3, highlightsKey: 'exp.ent04.highlights', useCaseCount: 3, useCasesKey: 'exp.ent04.useCases' },
  { id: 'ent-05', slug: 'ai-voice-lab', pillar: 'ai-creative', industry: 'entertainment', nameKey: 'exp.ent05.name', oneLinerKey: 'exp.ent05.oneLiner', descriptionKey: 'exp.ent05.description', featuresKey: 'exp.ent05.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.ent05.processSteps', highlightCount: 3, highlightsKey: 'exp.ent05.highlights', useCaseCount: 3, useCasesKey: 'exp.ent05.useCases' },

  // ── Education ──
  { id: 'edu-01', slug: 'ai-graduation-booth', pillar: 'ai-photo', industry: 'education', nameKey: 'exp.edu01.name', oneLinerKey: 'exp.edu01.oneLiner', descriptionKey: 'exp.edu01.description', featuresKey: 'exp.edu01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.edu01.processSteps', highlightCount: 3, highlightsKey: 'exp.edu01.highlights', useCaseCount: 3, useCasesKey: 'exp.edu01.useCases' },
  { id: 'edu-02', slug: 'ai-future-career', pillar: 'ai-diagnosis', industry: 'education', nameKey: 'exp.edu02.name', oneLinerKey: 'exp.edu02.oneLiner', descriptionKey: 'exp.edu02.description', featuresKey: 'exp.edu02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.edu02.processSteps', highlightCount: 3, highlightsKey: 'exp.edu02.highlights', useCaseCount: 3, useCasesKey: 'exp.edu02.useCases' },
  { id: 'edu-03', slug: 'ai-science-kiosk', pillar: 'ai-immersive', industry: 'education', nameKey: 'exp.edu03.name', oneLinerKey: 'exp.edu03.oneLiner', descriptionKey: 'exp.edu03.description', featuresKey: 'exp.edu03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.edu03.processSteps', highlightCount: 3, highlightsKey: 'exp.edu03.highlights', useCaseCount: 3, useCasesKey: 'exp.edu03.useCases' },
  { id: 'edu-04', slug: 'ai-history-travel', pillar: 'ai-photo', industry: 'education', nameKey: 'exp.edu04.name', oneLinerKey: 'exp.edu04.oneLiner', descriptionKey: 'exp.edu04.description', featuresKey: 'exp.edu04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.edu04.processSteps', highlightCount: 3, highlightsKey: 'exp.edu04.highlights', useCaseCount: 3, useCasesKey: 'exp.edu04.useCases' },
  { id: 'edu-05', slug: 'ai-timecapsule-photo', pillar: 'ai-photo', industry: 'education', nameKey: 'exp.edu05.name', oneLinerKey: 'exp.edu05.oneLiner', descriptionKey: 'exp.edu05.description', featuresKey: 'exp.edu05.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.edu05.processSteps', highlightCount: 3, highlightsKey: 'exp.edu05.highlights', useCaseCount: 3, useCasesKey: 'exp.edu05.useCases' },

  // ── Festival ──
  { id: 'fest-01', slug: 'ai-fortune-robot', pillar: 'ai-fortune', industry: 'festival', nameKey: 'exp.fest01.name', oneLinerKey: 'exp.fest01.oneLiner', descriptionKey: 'exp.fest01.description', featuresKey: 'exp.fest01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fest01.processSteps', highlightCount: 3, highlightsKey: 'exp.fest01.highlights', useCaseCount: 3, useCasesKey: 'exp.fest01.useCases' },
  { id: 'fest-02', slug: 'ai-face-reading', pillar: 'ai-fortune', industry: 'festival', nameKey: 'exp.fest02.name', oneLinerKey: 'exp.fest02.oneLiner', descriptionKey: 'exp.fest02.description', featuresKey: 'exp.fest02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fest02.processSteps', highlightCount: 3, highlightsKey: 'exp.fest02.highlights', useCaseCount: 3, useCasesKey: 'exp.fest02.useCases' },
  { id: 'fest-03', slug: 'ai-palm-reading', pillar: 'ai-fortune', industry: 'festival', nameKey: 'exp.fest03.name', oneLinerKey: 'exp.fest03.oneLiner', descriptionKey: 'exp.fest03.description', featuresKey: 'exp.fest03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fest03.processSteps', highlightCount: 3, highlightsKey: 'exp.fest03.highlights', useCaseCount: 3, useCasesKey: 'exp.fest03.useCases' },
  { id: 'fest-04', slug: 'ai-caricature-artist', pillar: 'ai-creative', industry: 'festival', nameKey: 'exp.fest04.name', oneLinerKey: 'exp.fest04.oneLiner', descriptionKey: 'exp.fest04.description', featuresKey: 'exp.fest04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fest04.processSteps', highlightCount: 3, highlightsKey: 'exp.fest04.highlights', useCaseCount: 3, useCasesKey: 'exp.fest04.useCases' },
  { id: 'fest-05', slug: 'ai-aura-reading', pillar: 'ai-fortune', industry: 'festival', nameKey: 'exp.fest05.name', oneLinerKey: 'exp.fest05.oneLiner', descriptionKey: 'exp.fest05.description', featuresKey: 'exp.fest05.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.fest05.processSteps', highlightCount: 3, highlightsKey: 'exp.fest05.highlights', useCaseCount: 3, useCasesKey: 'exp.fest05.useCases' },

  // ── Corporate ──
  { id: 'corp-01', slug: 'ai-brand-avatar', pillar: 'ai-photo', industry: 'corporate', nameKey: 'exp.corp01.name', oneLinerKey: 'exp.corp01.oneLiner', descriptionKey: 'exp.corp01.description', featuresKey: 'exp.corp01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.corp01.processSteps', highlightCount: 3, highlightsKey: 'exp.corp01.highlights', useCaseCount: 3, useCasesKey: 'exp.corp01.useCases' },
  { id: 'corp-02', slug: 'ai-product-experience', pillar: 'ai-immersive', industry: 'corporate', nameKey: 'exp.corp02.name', oneLinerKey: 'exp.corp02.oneLiner', descriptionKey: 'exp.corp02.description', featuresKey: 'exp.corp02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.corp02.processSteps', highlightCount: 3, highlightsKey: 'exp.corp02.highlights', useCaseCount: 3, useCasesKey: 'exp.corp02.useCases' },
  { id: 'corp-03', slug: 'ai-team-chemistry', pillar: 'ai-diagnosis', industry: 'corporate', nameKey: 'exp.corp03.name', oneLinerKey: 'exp.corp03.oneLiner', descriptionKey: 'exp.corp03.description', featuresKey: 'exp.corp03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.corp03.processSteps', highlightCount: 3, highlightsKey: 'exp.corp03.highlights', useCaseCount: 3, useCasesKey: 'exp.corp03.useCases' },
  { id: 'corp-04', slug: 'ai-vision-wall', pillar: 'ai-immersive', industry: 'corporate', nameKey: 'exp.corp04.name', oneLinerKey: 'exp.corp04.oneLiner', descriptionKey: 'exp.corp04.description', featuresKey: 'exp.corp04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.corp04.processSteps', highlightCount: 3, highlightsKey: 'exp.corp04.highlights', useCaseCount: 3, useCasesKey: 'exp.corp04.useCases' },
  { id: 'corp-05', slug: 'ai-business-card', pillar: 'ai-creative', industry: 'corporate', nameKey: 'exp.corp05.name', oneLinerKey: 'exp.corp05.oneLiner', descriptionKey: 'exp.corp05.description', featuresKey: 'exp.corp05.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.corp05.processSteps', highlightCount: 3, highlightsKey: 'exp.corp05.highlights', useCaseCount: 3, useCasesKey: 'exp.corp05.useCases' },

  // ── Tourism ──
  { id: 'tour-01', slug: 'ai-hanbok-booth', pillar: 'ai-photo', industry: 'tourism', nameKey: 'exp.tour01.name', oneLinerKey: 'exp.tour01.oneLiner', descriptionKey: 'exp.tour01.description', featuresKey: 'exp.tour01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.tour01.processSteps', highlightCount: 3, highlightsKey: 'exp.tour01.highlights', useCaseCount: 3, useCasesKey: 'exp.tour01.useCases' },
  { id: 'tour-02', slug: 'ai-traditional-painter', pillar: 'ai-creative', industry: 'tourism', nameKey: 'exp.tour02.name', oneLinerKey: 'exp.tour02.oneLiner', descriptionKey: 'exp.tour02.description', featuresKey: 'exp.tour02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.tour02.processSteps', highlightCount: 3, highlightsKey: 'exp.tour02.highlights', useCaseCount: 3, useCasesKey: 'exp.tour02.useCases' },
  { id: 'tour-03', slug: 'ai-heritage-timemachine', pillar: 'ai-immersive', industry: 'tourism', nameKey: 'exp.tour03.name', oneLinerKey: 'exp.tour03.oneLiner', descriptionKey: 'exp.tour03.description', featuresKey: 'exp.tour03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.tour03.processSteps', highlightCount: 3, highlightsKey: 'exp.tour03.highlights', useCaseCount: 3, useCasesKey: 'exp.tour03.useCases' },
  { id: 'tour-04', slug: 'ai-travel-style', pillar: 'ai-diagnosis', industry: 'tourism', nameKey: 'exp.tour04.name', oneLinerKey: 'exp.tour04.oneLiner', descriptionKey: 'exp.tour04.description', featuresKey: 'exp.tour04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.tour04.processSteps', highlightCount: 3, highlightsKey: 'exp.tour04.highlights', useCaseCount: 3, useCasesKey: 'exp.tour04.useCases' },

  // ── Wedding ──
  { id: 'wed-01', slug: 'ai-wedding-booth', pillar: 'ai-photo', industry: 'wedding', nameKey: 'exp.wed01.name', oneLinerKey: 'exp.wed01.oneLiner', descriptionKey: 'exp.wed01.description', featuresKey: 'exp.wed01.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.wed01.processSteps', highlightCount: 3, highlightsKey: 'exp.wed01.highlights', useCaseCount: 3, useCasesKey: 'exp.wed01.useCases' },
  { id: 'wed-02', slug: 'ai-couple-chemistry', pillar: 'ai-fortune', industry: 'wedding', nameKey: 'exp.wed02.name', oneLinerKey: 'exp.wed02.oneLiner', descriptionKey: 'exp.wed02.description', featuresKey: 'exp.wed02.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.wed02.processSteps', highlightCount: 3, highlightsKey: 'exp.wed02.highlights', useCaseCount: 3, useCasesKey: 'exp.wed02.useCases' },
  { id: 'wed-03', slug: 'ai-future-family', pillar: 'ai-photo', industry: 'wedding', nameKey: 'exp.wed03.name', oneLinerKey: 'exp.wed03.oneLiner', descriptionKey: 'exp.wed03.description', featuresKey: 'exp.wed03.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.wed03.processSteps', highlightCount: 3, highlightsKey: 'exp.wed03.highlights', useCaseCount: 3, useCasesKey: 'exp.wed03.useCases' },
  { id: 'wed-04', slug: 'ai-memory-movie', pillar: 'ai-creative', industry: 'wedding', nameKey: 'exp.wed04.name', oneLinerKey: 'exp.wed04.oneLiner', descriptionKey: 'exp.wed04.description', featuresKey: 'exp.wed04.features', featureCount: 5, processStepCount: 3, processStepsKey: 'exp.wed04.processSteps', highlightCount: 3, highlightsKey: 'exp.wed04.highlights', useCaseCount: 3, useCasesKey: 'exp.wed04.useCases' },
];

/* ── Helper functions ─────────────────────────────────── */

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

export function getExperiencesByIndustry(industryId: IndustryId): Experience[] {
  return experiences.filter((e) => e.industry === industryId);
}

export function getExperiencesByPillar(pillarId: PillarId): Experience[] {
  return experiences.filter((e) => e.pillar === pillarId);
}

export function getPillarById(id: PillarId): Pillar | undefined {
  return pillars.find((p) => p.id === id);
}

export function getIndustryById(id: IndustryId): Industry | undefined {
  return industries.find((i) => i.id === id);
}

export function getAllSlugs(): string[] {
  return experiences.map((e) => e.slug);
}
