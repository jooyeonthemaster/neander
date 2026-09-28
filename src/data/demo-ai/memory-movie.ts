/* AI 추억 무비 메이커 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const MOVIE_MIN_PHOTOS = 3;
export const MOVIE_MAX_PHOTOS = 6;

/** 무드 — 색감·BGM 프리셋은 데모 화면(MOODS)에 있고, 여기엔 AI에게 알려줄 이름과 기본 템포만 둔다 */
export const MOVIE_MOODS = [
  { id: 'flutter', label: '설렘', genre: '어쿠스틱 팝', bpm: 112 },
  { id: 'calm', label: '잔잔함', genre: '피아노 솔로', bpm: 72 },
  { id: 'joyful', label: '유쾌함', genre: '우쿨렐레 스윙', bpm: 128 },
  { id: 'cinematic', label: '시네마틱', genre: '오케스트라 스트링', bpm: 90 },
] as const;
export type MovieMoodId = (typeof MOVIE_MOODS)[number]['id'];

/** 플레이어가 지원하는 카메라 무빙 (켄 번즈) — 데모 화면 PANS와 같은 순서 */
export const MOVIE_MOTIONS = ['zoom-in', 'zoom-out', 'push-in', 'drift'] as const;
export type MovieMotion = (typeof MOVIE_MOTIONS)[number];

/** 선택 화면과 결과의 템포를 동일하게 유지한다. */
export const MOVIE_BPM_RANGE = 0;
/** AI가 고를 수 있는 조옮김 (반음) */
export const MOVIE_KEY_MIN = -3;
export const MOVIE_KEY_MAX = 3;

/** /api/demo-ai/memory-movie 응답 */
export interface AiMemoryMovie {
  /** 무비 제목 (방문객이 직접 쓴 제목이 있으면 화면은 그것을 쓴다) */
  title: string;
  /** 한 줄 소개 */
  logline: string;
  /** 사진마다 — 보낸 순서(photo 번호) 그대로. 장면 순서는 order */
  photos: { note: string; caption: string; motion: MovieMotion }[];
  /** 상영 순서 — 사진 번호(0부터)의 순열 */
  order: number[];
  /** 엔딩 크레딧 문장 (방문객이 마지막 자막을 쓰지 않았을 때) */
  closing: string;
  music: { track: string; bpm: number; key: number };
}
