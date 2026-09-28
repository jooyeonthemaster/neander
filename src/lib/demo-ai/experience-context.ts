import { AsyncLocalStorage } from 'node:async_hooks';

// Per-request context: concurrent visitors must never share their preferences.
const experienceContext = new AsyncLocalStorage<string>();

export function withExperienceContext<T>(context: string, run: () => Promise<T>): Promise<T> {
  return experienceContext.run(context, run);
}

export function withExperiencePrompt(prompt: string): string {
  const context = experienceContext.getStore();
  return context ? `${prompt}\n\n--- EXPERIENCE BRIEF ---\n${context}` : prompt;
}
