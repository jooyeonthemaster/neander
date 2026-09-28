import { z } from 'zod';

/** 데모 하나의 서버 측 AI 생성 정의 — src/lib/demo-ai/specs/<config.id>.ts 가 default export 한다 */
export interface DemoAiSpec<I = unknown> {
  /** 요청 본문 검증 — 브라우저에서 오는 값이므로 선택지는 enum, 문자열은 길이 제한 */
  input: z.ZodType<I>;
  /** 호출 제한 버킷 — 이미지 생성을 쓰면 'image' (비싸서 더 엄격하게 제한) */
  bucket: 'text' | 'image';
  /** 결과 JSON을 만든다. 반환 전에 zod로 검증할 것 (실패하면 throw → 클라이언트는 고정 결과로 넘어간다) */
  run: (input: I) => Promise<unknown>;
}

export function defineSpec<I>(spec: DemoAiSpec<I>): DemoAiSpec<I> {
  return spec;
}

/** 브라우저 카메라 캡처 (3:4 JPEG data URL, 약 50~150KB) */
export const captureImage = z
  .string()
  .max(2_000_000)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/);

/** 자유 입력 텍스트 */
export const freeText = (max = 200) => z.string().trim().max(max);
