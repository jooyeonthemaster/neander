/* AI 퍼스널 컬러 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const PC_UNDERTONES = [
  { id: 'warm', label: '웜 (Warm)', from: 'from-amber-300', to: 'to-orange-400', desc: '혈관이 초록/올리브색으로 보여요' },
  { id: 'cool', label: '쿨 (Cool)', from: 'from-rose-300', to: 'to-blue-400', desc: '혈관이 파란/보라색으로 보여요' },
  { id: 'neutral', label: '뉴트럴 (Neutral)', from: 'from-amber-200', to: 'to-rose-300', desc: '두 가지가 골고루 섞여 보여요' },
] as const;

export const PC_COLOR_SWATCHES = [
  { id: 'darkBrown', hex: '#3E2723', label: '다크 브라운' },
  { id: 'black', hex: '#1A1A1A', label: '블랙' },
  { id: 'hazel', hex: '#8D6E63', label: '헤이즐' },
  { id: 'grayBrown', hex: '#78909C', label: '그레이 브라운' },
  { id: 'honey', hex: '#FFB74D', label: '허니' },
  { id: 'reddishBrown', hex: '#A1887F', label: '레디쉬 브라운' },
] as const;

export const PC_SEASON_PALETTES = [
  { id: 'spring', label: '봄 웜', colors: ['#FFD54F', '#FF8A80', '#FFAB91', '#FFE082', '#C5E1A5', '#FFF9C4'] },
  { id: 'summer', label: '여름 쿨', colors: ['#90CAF9', '#CE93D8', '#F48FB1', '#B2DFDB', '#E1BEE7', '#B3E5FC'] },
  { id: 'autumn', label: '가을 웜', colors: ['#8D6E63', '#FF8F00', '#BF360C', '#4E342E', '#827717', '#E65100'] },
  { id: 'winter', label: '겨울 쿨', colors: ['#E53935', '#1E88E5', '#000000', '#FFFFFF', '#7B1FA2', '#00897B'] },
] as const;

export const PC_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type PcSeason = (typeof PC_SEASONS)[number];

export interface PcColor {
  /** #RRGGBB */
  hex: string;
  name: string;
}

/** /api/demo-ai/personal-color 응답 */
export interface AiPersonalColor {
  season: PcSeason;
  /** 예: 봄 웜 브라이트 */
  name: string;
  /** 예: Spring Warm Bright */
  en: string;
  desc: string;
  colors: PcColor[];
  avoid: PcColor[];
  tips: string[];
}
