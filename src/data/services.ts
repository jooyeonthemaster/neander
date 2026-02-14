/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Service Data (Legacy compatibility + new structure)
   ───────────────────────────────────────────────────────── */

// Re-export new experience system as the primary data source
export {
  pillars,
  industries,
  experiences,
  getExperienceBySlug,
  getExperiencesByIndustry,
  getExperiencesByPillar,
  getPillarById,
  getIndustryById,
  getAllSlugs,
} from './experiences';

export type {
  Pillar,
  PillarId,
  Industry,
  IndustryId,
  Experience,
} from './experiences';

/* ── Legacy ServiceData (kept for quote page compatibility) ── */

export interface ServiceData {
  id: string;
  key: string;
  icon: string;
  color: string;
  colorClass: string;
  basePriceKRW: number;
  features: string[];
  image: string;
}

export const services: ServiceData[] = [
  {
    id: 'acscent',
    key: 'acscent',
    icon: '🧪',
    color: '#F59E0B',
    colorClass: 'text-amber-500',
    basePriceKRW: 3000000,
    features: ['aiAnalysis', 'customScent', 'packaging', 'spaceDesign'],
    image: '/images/services/acscent.webp',
  },
  {
    id: 'photoBooth',
    key: 'photoBooth',
    icon: '📸',
    color: '#F43F5E',
    colorClass: 'text-rose-500',
    basePriceKRW: 2000000,
    features: ['aiTransform', 'brandCustom', 'printOption', 'qrShare'],
    image: '/images/services/photo-booth.webp',
  },
  {
    id: 'mediaArt',
    key: 'mediaArt',
    icon: '🎨',
    color: '#3B82F6',
    colorClass: 'text-blue-500',
    basePriceKRW: 5000000,
    features: ['interactive', 'realtime', 'motionSensor', 'projection'],
    image: '/images/services/media-art.webp',
  },
  {
    id: 'custom',
    key: 'custom',
    icon: '⚡',
    color: '#0D9488',
    colorClass: 'text-teal-600',
    basePriceKRW: 5000000,
    features: ['consultation', 'development', 'integration', 'maintenance'],
    image: '/images/services/custom-content.webp',
  },
];

/* ── Process steps (replaces standalone spatial/rental services) ── */

export interface ProcessStep {
  id: string;
  step: number;
  nameKey: string;
  descriptionKey: string;
  icon: string;
}

export const processSteps: ProcessStep[] = [
  { id: 'planning', step: 1, nameKey: 'process.step1.name', descriptionKey: 'process.step1.description', icon: 'lightbulb' },
  { id: 'development', step: 2, nameKey: 'process.step2.name', descriptionKey: 'process.step2.description', icon: 'code' },
  { id: 'installation', step: 3, nameKey: 'process.step3.name', descriptionKey: 'process.step3.description', icon: 'wrench' },
  { id: 'operation', step: 4, nameKey: 'process.step4.name', descriptionKey: 'process.step4.description', icon: 'play' },
];
