/* AI 뮤직비디오 메이커 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const MV_EFFECTS = [
  { id: 'cyber', label: '사이버펑크', desc: '네온 조명 & 글리치' },
  { id: 'vhs', label: '레트로 VHS', desc: '90년대 비디오테이프 감성' },
  { id: 'fantasy', label: '판타지', desc: '몽환적인 빛 입자' },
  { id: 'noir', label: '흑백 누아르', desc: '고전 영화의 강렬한 명암' },
] as const;
export type MvEffectId = (typeof MV_EFFECTS)[number]['id'];

export const MV_GENRES = [
  { id: 'kpop', label: 'K-POP 댄스', bpm: 124 },
  { id: 'citypop', label: '시티팝', bpm: 108 },
  { id: 'lofi', label: '로파이 힙합', bpm: 82 },
  { id: 'rock', label: '록', bpm: 140 },
  { id: 'ballad', label: '발라드', bpm: 72 },
  { id: 'edm', label: 'EDM', bpm: 128 },
] as const;
export type MvGenreId = (typeof MV_GENRES)[number]['id'];

/** 비트 신스가 지원하는 킥 패턴 (8분음표 8칸 중 킥 위치) */
export const MV_GROOVES = {
  'four-on-floor': [0, 2, 4, 6],
  rock: [0, 3, 4],
  'half-time': [0, 5],
  syncopated: [0, 3, 6],
} as const;
export type MvGroove = keyof typeof MV_GROOVES;
export const MV_GROOVE_IDS = Object.keys(MV_GROOVES) as MvGroove[];

/** 선택 화면과 결과의 템포를 동일하게 유지한다. */
export const MV_BPM_RANGE = 0;
/** AI가 고를 수 있는 베이스 조옮김 (반음) */
export const MV_KEY_MIN = -3;
export const MV_KEY_MAX = 3;

/** /api/demo-ai/musicvideo-maker 응답 */
export interface AiMusicvideo {
  /** 곡 제목 (영어) */
  title: string;
  /** 컷 4개에 한 줄씩 띄우는 가사 */
  lyrics: string[];
  /** AI가 새로 만든 컷 (0~2장) — 벌스·코러스 자리에 들어간다 */
  scenes: { name: string; image: string }[];
  beat: { bpm: number; groove: MvGroove; key: number };
}
