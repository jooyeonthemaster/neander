import { getDemoMockupLayout, type DemoMockupLayout } from './mockup-layouts';

/** The five approved mockups share their palette through every input and result. */
const themes = {
  editorial: {
    light: true, canvas: '#f5f2ed', paper: '#fbf9f5', ink: '#282521', muted: '#706a63',
    accent: '#a44d3c', accentInk: '#ffffff', secondary: '#c78e7e',
    headingFont: '"Nanum Myeongjo", serif',
  },
  centered: {
    light: false, canvas: '#202033', paper: '#29283e', ink: '#faf5eb', muted: '#bcb6cc',
    accent: '#c6adfa', accentInk: '#241b39', secondary: '#a091c9',
    headingFont: '"Pretendard", sans-serif',
  },
  'photo-choices': {
    light: true, canvas: '#f8faf7', paper: '#ffffff', ink: '#193b37', muted: '#627773',
    accent: '#245f56', accentInk: '#ffffff', secondary: '#8aac9d',
    headingFont: '"Pretendard", sans-serif',
  },
  'photo-studio': {
    light: false, canvas: '#191b1c', paper: '#252729', ink: '#fafaf7', muted: '#b7b9ba',
    accent: '#ebf18c', accentInk: '#20220f', secondary: '#bac27b',
    headingFont: '"Nanum Myeongjo", serif',
  },
  console: {
    light: true, canvas: '#f5f6f5', paper: '#ffffff', ink: '#112d42', muted: '#63717e',
    accent: '#c3531c', accentInk: '#ffffff', secondary: '#e7925e',
    headingFont: '"Pretendard", sans-serif',
  },
} satisfies Record<DemoMockupLayout, {
  light: boolean; canvas: string; paper: string; ink: string; muted: string;
  accent: string; accentInk: string; secondary: string; headingFont: string;
}>;

export function getDemoMockupTheme(slug: string) {
  return themes[getDemoMockupLayout(slug)];
}
