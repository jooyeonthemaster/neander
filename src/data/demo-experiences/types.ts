export type ExperienceLayout = 'studio' | 'counter' | 'atelier' | 'observatory' | 'gallery' | 'lounge' | 'lab';

export interface ExperienceOption {
  id: string;
  label: string;
  detail: string;
  color?: string;
  /** Concrete guidance shown in the result and supplied to the AI. */
  outcome: string;
}

export interface ExperienceQuestion {
  id: string;
  label: string;
  why: string;
  control: 'cards' | 'swatches' | 'scale' | 'chips';
  options: ExperienceOption[];
}

export interface DemoExperienceDesign {
  venue: string;
  eyebrow: string;
  headline: string;
  invitation: string;
  accent: string;
  secondary: string;
  background: string;
  layout: ExperienceLayout;
  /** Short name of the physical output / artifact for this experience. */
  artifact: string;
  duration: string;
  preparation: string[];
  questions: ExperienceQuestion[];
  processing: string[];
  /** Short factual scope note where needed (e.g. entertainment, not prediction). */
  scope?: string;
}

export type ExperienceProfile = Record<string, string>;
