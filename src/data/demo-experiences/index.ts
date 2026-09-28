import { beautyFnbExperiences } from './beauty-fnb';
import { photoCultureExperiences } from './photo-culture';
import { learningEventExperiences } from './learning-events';
import type { DemoExperienceDesign, ExperienceProfile } from './types';

export const DEMO_EXPERIENCES: Record<string, DemoExperienceDesign> = {
  ...beautyFnbExperiences,
  ...photoCultureExperiences,
  ...learningEventExperiences,
};

export function getExperienceDesign(slug: string): DemoExperienceDesign | undefined {
  return DEMO_EXPERIENCES[slug];
}

/** Only configured option IDs survive; free text and extra fields are ignored. */
export function readExperienceProfile(design: DemoExperienceDesign, value: unknown): ExperienceProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const candidate = value as Record<string, unknown>;
  return Object.fromEntries(design.questions.flatMap((question) => {
    const selected = question.options.find((option) => option.id === candidate[question.id]);
    return selected ? [[question.id, selected.id]] : [];
  }));
}

export function experienceDecisions(design: DemoExperienceDesign, value: unknown) {
  const profile = readExperienceProfile(design, value);
  return design.questions.flatMap((question) => {
    const option = question.options.find((item) => item.id === profile[question.id]);
    return option ? [{ question: question.label, ...option }] : [];
  });
}

export function experienceProfileComplete(design: DemoExperienceDesign, value: unknown): boolean {
  return Object.keys(readExperienceProfile(design, value)).length === design.questions.length;
}

/** Reconstruct the model brief from trusted config, never from client-written instructions. */
export function experiencePromptContext(demoId: string, value: unknown): string {
  const design = getExperienceDesign(`ai-${demoId}`);
  if (!design) return '';
  const decisions = experienceDecisions(design, value);
  if (!decisions.length) return '';
  return [
    `Visitor's selected experience brief for ${design.venue}:`,
    ...decisions.map((item) => `${item.question}: ${item.label}. Apply this direction: ${item.outcome}`),
    design.scope ? `Scope: ${design.scope}` : '',
    'Use these choices when creating recommendations and creative outputs. They are self-reported preferences, not measured or inferred traits. Preserve the required output schema, photo identity rules and the explicitly chosen style. Do not invent clinical measurements, confidence percentages or verified predictions.',
  ].filter(Boolean).join('\n');
}
