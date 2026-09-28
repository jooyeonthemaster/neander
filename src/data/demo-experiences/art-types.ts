export type ProgramFont = 'pretendard' | 'gowun-batang' | 'gowun-dodum' | 'jua' | 'do-hyeon' | 'black-han' | 'gugi' | 'song-myung' | 'gaegu' | 'sunflower' | 'nanum-myeongjo' | 'ibm-plex' | 'hahmlet';

export type ProgramComposition = 'editorial' | 'immersive' | 'poster' | 'window' | 'split' | 'salon' | 'ticket' | 'journal' | 'console' | 'gallery';

/** A service's visual identity, independent of its questionnaire and AI behavior. */
export interface ProgramArtDirection {
  name: string;
  concept: string;
  composition: ProgramComposition;
  light: boolean;
  headingFont: ProgramFont;
  bodyFont: ProgramFont;
  titleWeight: number;
  titleTracking: string;
  canvas: string;
  paper: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  secondary: string;
  imagePosition: string;
  backdropOpacity: number;
  /** Which edge carries the background photograph and which stays calm for text. */
  backdropPosition: string;
  motif: string;
  radius: string;
}
