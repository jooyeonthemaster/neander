import { beautyFnbArtDirections } from './art-beauty-fnb';
import { photoCultureArtDirections } from './art-photo-culture';
import { learningEventArtDirections } from './art-learning-events';
import type { ProgramArtDirection, ProgramFont } from './art-types';

export const PROGRAM_ART_DIRECTIONS: Record<string, ProgramArtDirection> = {
  ...beautyFnbArtDirections,
  ...photoCultureArtDirections,
  ...learningEventArtDirections,
};

const FONT_FAMILIES: Record<ProgramFont, string> = {
  pretendard: '"Pretendard", sans-serif',
  'gowun-batang': '"Gowun Batang", serif',
  'gowun-dodum': '"Gowun Dodum", sans-serif',
  jua: '"Jua", sans-serif',
  'do-hyeon': '"Do Hyeon", sans-serif',
  'black-han': '"Black Han Sans", sans-serif',
  gugi: '"Gugi", sans-serif',
  'song-myung': '"Song Myung", serif',
  gaegu: '"Gaegu", cursive',
  sunflower: '"Sunflower", sans-serif',
  'nanum-myeongjo': '"Nanum Myeongjo", serif',
  'ibm-plex': '"IBM Plex Sans KR", sans-serif',
  hahmlet: '"Hahmlet", serif',
};

export function getProgramArtDirection(slug: string): ProgramArtDirection | undefined {
  return PROGRAM_ART_DIRECTIONS[slug];
}

export function programFontFamily(font: ProgramFont): string {
  return FONT_FAMILIES[font];
}
