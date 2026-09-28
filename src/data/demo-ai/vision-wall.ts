/* AI 비전 월 — 데모 화면과 생성 API가 함께 쓰는 스타일 데이터 */

export type ArtStyle = 'flower' | 'constellation' | 'wave' | 'city';

export const STYLES: Record<ArtStyle, { label: string; emoji: string; desc: string; noun: string; swatch: string }> = {
  flower: {
    label: '꽃',
    emoji: '🌸',
    desc: '아이디어가 꽃처럼 피어나요',
    noun: '정원',
    swatch: 'radial-gradient(circle at 50% 60%, #f9a8d4, #c026d3 45%, #1a0b2e 80%)',
  },
  constellation: {
    label: '별자리',
    emoji: '✨',
    desc: '생각이 별처럼 이어져요',
    noun: '별자리',
    swatch: 'radial-gradient(circle at 30% 30%, #bae6fd 0 3%, transparent 4%), radial-gradient(circle at 70% 60%, #fde68a 0 3%, transparent 4%), linear-gradient(160deg, #0b1a3a, #020617)',
  },
  wave: {
    label: '파도',
    emoji: '🌊',
    desc: '에너지가 물결쳐 퍼져요',
    noun: '물결',
    swatch: 'linear-gradient(180deg, #03346e 0 45%, #0ea5e9 45% 60%, #22d3ee 60% 75%, #6366f1 75%)',
  },
  city: {
    label: '도시 불빛',
    emoji: '🌃',
    desc: '비전이 도시의 불빛이 돼요',
    noun: '야경',
    swatch: 'linear-gradient(180deg, #3b0764, #0f0a2a 60%), linear-gradient(90deg, #fbbf24, #f472b6)',
  },
};

export const STYLE_ORDER: ArtStyle[] = ['flower', 'constellation', 'wave', 'city'];

/** /api/demo-ai/vision-wall 응답 */
export interface AiVision {
  /** 작품 제목 (『』 없이) */
  title: string;
  /** 문장에서 읽어낸 키워드 3개 */
  keywords: string[];
  /** 문장의 감정 한 단어 */
  mood: string;
  /** 작품이 비전을 어떻게 표현했는지 한 문장 */
  caption: string;
  /** 생성된 1:1 작품 (JPEG data URL). 이미지 생성만 실패하면 null — 브라우저 그림으로 대신한다 */
  image: string | null;
  /** 이미지 생성에 걸린 시간 (초) */
  seconds: number;
}
