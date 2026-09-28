/* AI 포토부스(한복·웨딩·졸업·역사 여행) — 데모 화면과 생성 API가 함께 쓰는 선택지 ID·결과 타입.
   화면용 이름·색·설명은 각 데모 파일에, 이미지 프롬프트 문구는 서버 spec에 있다. */

export const HANBOK_STYLE_IDS = ['king', 'queen', 'scholar', 'modern'] as const;
export const HANBOK_BACKDROP_IDS = ['palace', 'village', 'garden'] as const;

export const WEDDING_THEME_IDS = ['fairytale', 'movie', 'period', 'travel'] as const;

export const GRADUATION_GOWN_IDS = ['black', 'navy', 'burgundy', 'green'] as const;
export const GRADUATION_PLACE_IDS = ['gate', 'library', 'hall'] as const;

export const HISTORY_ERA_IDS = ['samguk', 'goryeo', 'joseon', 'modern'] as const;
/** 시대마다 두 가지 인물(의상) — 0: 첫 번째, 1: 두 번째 (데모의 ERAS[era].outfits 순서) */
export const HISTORY_ROLE_INDEXES = [0, 1] as const;

/** 사진 변환 결과 — AI가 새로 그린 사진 (JPEG data URL) */
export interface AiBoothPhoto {
  image: string;
}

export interface AiGraduationPhoto extends AiBoothPhoto {
  /** 졸업 축하 한마디 (글 생성이 실패하면 없음) */
  message?: string;
}

export interface AiHistoryPhoto extends AiBoothPhoto {
  /** 사진 속 인물의 가상 이야기 (글 생성이 실패하면 없음) */
  story?: string;
}

export function isAiBoothPhoto(v: unknown): v is AiBoothPhoto {
  const o = v as AiBoothPhoto | null;
  return !!o && typeof o.image === 'string' && o.image.startsWith('data:image/');
}

/** 이미지 프롬프트 공통 규칙 (서버 spec 전용) — 얼굴·정체성·포즈·체형은 그대로, 옷·배경만 바꾼다 */
export const BOOTH_IDENTITY_RULES = `Rules:
- Keep every person's face, identity, facial features, skin tone, age, expression, head angle and pose exactly as in the photo. Do not beautify, slim, reshape or change anyone's body shape.
- Keep the same number of people and their relative positions. If there are several people, transform each of them.
- Only change the clothing, accessories, background and lighting as described.
- Keep a waist-up portrait framing, vertical 3:4, faces in the upper-middle of the frame with a little space above the head.
- The image must be clean: no text, letters, logos, watermarks, borders or frames.
- If the input is a drawing or illustration, still produce the result as described, keeping the character recognizable.`;
