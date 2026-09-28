// 데모 체험의 AI 결과 생성 — OpenRouter(Gemini 등)를 서버에서만 호출한다. (API 라우트·specs에서만 import할 것)
// 키(OPENROUTER_API_KEY)는 브라우저에 절대 내려가지 않는다. 비용 상한은 OpenRouter 키의 Credit limit이 최종 방어선이다.

import { withExperiencePrompt } from './experience-context';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

/** 글·사진 분석 기본 모델 — 품질·비용 비교 테스트(2026-09)에서 선택. 글 1회 약 2원/4초, 사진 분석 약 4.5원/8초 */
export const TEXT_MODEL = 'google/gemini-3.8-flash';
/** 사진 변환(이미지 생성) 모델 — 1K 이미지 1장 약 94원, 10~20초 */
export const IMAGE_MODEL = 'google/gemini-3.1-flash-image';

export class DemoAiError extends Error {}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'input_audio'; input_audio: { data: string; format: string } };

async function callOpenRouter(body: Record<string, unknown>, timeoutMs: number) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new DemoAiError('OPENROUTER_API_KEY is not set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://neander.co.kr',
      'X-Title': 'neander demo',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) {
    throw new DemoAiError(json?.error?.message ?? `OpenRouter HTTP ${res.status}`);
  }
  return json;
}

/** 한 번 실패하면 한 번 더 — Gemini 3.8 Flash는 테스트에서 약 6% 확률로 JSON이 중간에 끊겼다 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

export interface GenerateJsonOptions {
  /** json_schema 이름 (영문·밑줄) */
  name: string;
  system: string;
  prompt: string;
  /** OpenAI 호환 JSON Schema — strict 모드라 모든 object에 additionalProperties:false와 전체 required가 필요하다 */
  schema: Record<string, unknown>;
  /** 함께 보낼 사진 (data:image/...;base64 URL) */
  images?: string[];
  /** 함께 보낼 녹음 (base64, 형식은 wav·mp3 등) */
  audio?: { data: string; format: string };
  model?: string;
  maxTokens?: number;
}

/** JSON 스키마에 맞춘 결과를 받는다. 끊김·일시 오류는 한 번 다시 시도한다. 반환값은 호출한 쪽에서 zod로 검증할 것. */
export async function generateJson(opts: GenerateJsonOptions): Promise<unknown> {
  const content: ContentPart[] = [
    ...(opts.images ?? []).map((url) => ({ type: 'image_url' as const, image_url: { url } })),
    ...(opts.audio ? [{ type: 'input_audio' as const, input_audio: opts.audio }] : []),
    { type: 'text', text: withExperiencePrompt(opts.prompt) },
  ];
  return withRetry(async () => {
    const json = await callOpenRouter(
      {
        model: opts.model ?? TEXT_MODEL,
        max_tokens: opts.maxTokens ?? 2000,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content },
        ],
        response_format: { type: 'json_schema', json_schema: { name: opts.name, strict: true, schema: opts.schema } },
        reasoning: { effort: 'low' },
        provider: { require_parameters: true },
      },
      opts.images?.length || opts.audio ? 25_000 : 15_000
    );
    const text = json.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new DemoAiError('empty completion');
    return JSON.parse(text);
  });
}

export interface GenerateImageOptions {
  prompt: string;
  /** 참고할 사진 (data URL) — 방문객 사진을 변환할 때 */
  images?: string[];
  /** 기본 3:4 (데모 촬영 비율) */
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '2:3' | '3:2';
}

/** 모델이 돌려주는 PNG(약 1.5MB)를 브라우저로 보내기 전에 JPEG(약 150KB)로 줄인다. sharp가 없으면 그대로 */
async function compress(dataUrl: string): Promise<string> {
  try {
    const { default: sharp } = await import('sharp');
    const input = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
    const jpeg = await sharp(input).resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return dataUrl;
  }
}

/** 이미지를 생성·변환해 data URL(보통 image/jpeg)로 돌려준다. 1장 약 94원, 10~20초. */
export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  const content: ContentPart[] = [
    ...(opts.images ?? []).map((url) => ({ type: 'image_url' as const, image_url: { url } })),
    { type: 'text', text: withExperiencePrompt(opts.prompt) },
  ];
  return withRetry(async () => {
    const json = await callOpenRouter(
      {
        model: IMAGE_MODEL,
        modalities: ['image', 'text'],
        messages: [{ role: 'user', content }],
        image_config: { aspect_ratio: opts.aspectRatio ?? '3:4' },
      },
      45_000
    );
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (typeof url !== 'string' || !url.startsWith('data:image/')) {
      throw new DemoAiError(`no image returned (${String(json.choices?.[0]?.finish_reason ?? 'unknown')})`);
    }
    return compress(url);
  });
}

/* ── 간단한 IP별 호출 제한 ─────────────────────────────
   서버리스 인스턴스마다 따로 세므로 정확한 전역 제한은 아니다.
   연타·스크립트 남용을 늦추는 용도이고, 비용 상한은 OpenRouter 키 한도가 맡는다. */

const WINDOW_MS = 10 * 60 * 1000;
const LIMITS = { text: 20, image: 6 } as const;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, bucket: keyof typeof LIMITS): boolean {
  // 로컬 개발·QA에서는 제한하지 않는다 (여러 테스트가 같은 IP에서 돈다)
  if (process.env.NODE_ENV !== 'production') return false;
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMITS[bucket]) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

/* ── 영감 키워드 ───────────────────────────────────────
   같은 답을 고른 방문객끼리 결과가 똑같이 나오지 않도록 매 요청마다 하나를 섞는다.
   (키워드 없이 테스트했을 때 칵테일 이름이 9번 중 8번 같았다) */

const THEMES = [
  '밤바다', '꽃시장', '첫눈', '재즈바', '벚꽃길', '별똥별', '골목 서점', '노을 진 옥상', '빗소리', '레코드판',
  '여름 소나기', '등대', '필름 카메라', '숲속 산책', '온실', '달빛 호수', '회전목마', '겨울 난로', '파도 소리', '은하수',
  '새벽 시장', '기차 여행', '종이비행기', '라벤더 밭', '눈 덮인 산장', '한옥 처마', '오로라', '캠프파이어', '열기구', '연날리기',
  '만화경', '비밀 정원', '손편지', '오르골', '해바라기', '귤밭', '골든 아워', '물안개', '유리 온실', '시장 골목 포장마차',
  '풍등', '모래사장', '고양이 낮잠', '빈티지 라디오', '보름달', '제주 돌담', '단풍 터널', '안개 낀 부두', '분수대', '폴라로이드',
  '서커스', '천문대', '향수 공방', '도자기 공방', '빵집 아침', '호숫가 보트', '해 질 녘 테라스', '반딧불이', '눈사람', '무지개',
  '청보리밭', '한강 야경', '루프탑 바', '기타 연주', '발레 공연', '미술관 산책', '오래된 극장', '크리스마스 마켓', '봄비', '소금 사막',
  '열대 해변', '산책로 벤치', '비 갠 오후', '연꽃 연못', '대나무 숲', '밤 기차', '우주 정거장', '동화책', '체리 과수원', '석양 사막',
  '북카페', '티 하우스', '허브 정원', '비눗방울', '풍경 소리', '구름 위 산책', '작은 섬', '해녀의 바다', '억새 들판', '눈 오는 밤',
  '아침 이슬', '밤 산책', '재즈 피아노', '보사노바', '레몬 나무', '민트 초원', '장미 정원', '가로등 불빛', '첫 월급날', '졸업식 꽃다발',
];

export function pickTheme(): string {
  return THEMES[Math.floor(Math.random() * THEMES.length)]!;
}

/** 프롬프트에 붙이는 영감 키워드 문장 */
export function themeLine(): string {
  return `이번 결과의 숨은 영감: "${pickTheme()}". 이 단어를 그대로 쓰지 말고, 거기서 떠오르는 색·질감·장면·분위기만 은근히 빌려 오세요. 방문객 답변과 규칙이 항상 우선입니다.`;
}

/** 모든 데모가 공유하는 시스템 프롬프트 머리말 */
export const BASE_SYSTEM = `당신은 이벤트 부스용 AI 체험 서비스 '네안데르'의 결과 작가입니다.
방문객에게 보여줄 결과를 한국어로, 따뜻하고 재치 있게, 과장 없이 씁니다.
재미를 위한 콘텐츠이며 외모 비하·단정적 예언·불안을 주는 표현·의학적 진단은 하지 않습니다.
사진 속 인물이 누구인지 추측하거나 실존 인물과 동일시하지 않습니다.
반드시 지정된 JSON 스키마로만 답합니다.`;
