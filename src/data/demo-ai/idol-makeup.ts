/* AI 아이돌 메이크업 부스 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const IDOL_CONCEPT_IDS = ['girlcrush', 'lovely', 'fresh', 'dreamy', 'retro'] as const;
export type IdolConceptId = (typeof IDOL_CONCEPT_IDS)[number];

export const IDOL_STAGE_IDS = ['stage', 'studio', 'album', 'fansign'] as const;
export type IdolStageId = (typeof IDOL_STAGE_IDS)[number];

export const IDOL_POSITIONS = ['메인보컬', '리드보컬', '메인댄서', '리드래퍼', '센터', '비주얼', '리더', '막내'] as const;

/** 이미지 모델에 보내는 콘셉트 설명 (영문) */
export const IDOL_CONCEPT_PROMPTS: Record<IdolConceptId, { label: string; makeup: string; prompt: string }> = {
  girlcrush: {
    makeup: '스모키 아이, 플럼 립, 샤프 쉐딩, 레드 스테이지 조명',
    label: '걸크러시',
    prompt:
      'girl-crush concept: smoky dark eye makeup with sharp eyeliner, deep plum lips, subtle contour; sleek styled hair; black stage outfit with leather and silver chain details; dramatic red and violet stage lighting',
  },
  lovely: {
    makeup: '애교살 하이라이트, 복숭아 블러셔, 글로시 핑크 립, 핑크 스포트라이트',
    label: '러블리',
    prompt:
      'lovely concept: soft pink eyeshadow, highlighted aegyo-sal under the eyes, peach-pink blush, glossy pink lips; soft wavy hair with a small ribbon accessory; pastel pink outfit; soft pink spotlight',
  },
  fresh: {
    makeup: '아쿠아 펄 섀도, 코랄 워터 틴트, 물광 피부, 민트 백라이트',
    label: '청량',
    prompt:
      'fresh summer concept: aqua shimmer eyeshadow, coral water-tint lips, dewy glowing skin; airy light hair styling; white and mint summer outfit; bright mint and cyan backlight',
  },
  dreamy: {
    makeup: '라벤더 글리터, 로지 그라데이션 립, 홀로그램 하이라이터, 퍼플 헤이즈 조명',
    label: '몽환',
    prompt:
      'dreamy concept: lavender glitter eyeshadow, rosy gradient lips, holographic highlighter on the cheekbones; soft styled hair; sheer ethereal lavender outfit; purple haze lighting with soft sparkles',
  },
  retro: {
    makeup: '클래식 레드 립, 브라운 윙 섀도, 볼륨 웨이브 헤어, 앰버 무대 조명',
    label: '레트로',
    prompt:
      'retro concept: classic red lips, warm brown winged eyeshadow, voluminous retro hair waves; vintage 80s-inspired stage outfit; warm amber stage lighting with subtle film grain',
  },
};

export const IDOL_STAGE_PROMPTS: Record<IdolStageId, { label: string; prompt: string }> = {
  stage: { label: '무대', prompt: 'on a K-pop concert stage with bright spotlights and blurred light-stick bokeh behind' },
  studio: { label: '화보', prompt: 'a clean photobook studio shot on a seamless backdrop with soft beauty lighting' },
  album: { label: '앨범 재킷', prompt: 'an editorial mini-album cover shot on an artistic set using the concept colors' },
  fansign: { label: '팬사인회', prompt: 'at a cozy fansign event with warm indoor lighting and flowers softly blurred behind' },
};

/** /api/demo-ai/idol-makeup-booth 응답 */
export interface AiIdol {
  /** 변환된 포토카드 사진 (data:image/jpeg URL) */
  image: string;
  /** 영문 대문자 스테이지 네임 */
  stageName: string;
  positions: string[];
  /** 포토카드 팬사인 문구 */
  caption: string;
  /** 적용한 메이크업·스타일 포인트 */
  points: string[];
}

export function isAiIdol(v: unknown): v is AiIdol {
  const o = v as AiIdol | null;
  return (
    !!o &&
    typeof o.image === 'string' &&
    o.image.startsWith('data:image/') &&
    typeof o.stageName === 'string' &&
    /^[A-Z]{3,7}$/.test(o.stageName) &&
    Array.isArray(o.positions) &&
    o.positions.length === 2 &&
    o.positions.every((p) => typeof p === 'string') &&
    typeof o.caption === 'string' &&
    Array.isArray(o.points) &&
    o.points.length >= 3 &&
    o.points.every((p) => typeof p === 'string')
  );
}
