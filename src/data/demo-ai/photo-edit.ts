/* 사진 변환 데모(아이돌 메이크업·가상 메이크업·네일·타임캡슐·패션 타임머신)가 함께 쓰는 이미지 편집 규칙 (서버 프롬프트용) */

/** 얼굴 사진 편집 공통 규칙 — 같은 사람으로 보이게 하고, 글자는 그리지 않는다 */
export const KEEP_IDENTITY = `Edit the attached photo. It must stay clearly recognizable as the exact same person:
keep the same face shape, facial proportions, eyes, nose, mouth, skin tone, the original facial expression, head pose, camera angle and framing.
Do not slim or reshape the face or body, do not beautify beyond what is asked, do not add or remove facial hair, and keep glasses or other accessories the person wears unless told otherwise.
Keep it photorealistic with natural skin texture.
Never add any text, letters, numbers, logos, captions or watermarks anywhere in the image.`;
