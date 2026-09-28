import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { GROUNDING_RULE } from '@/data/demo-ai/photo-reading';
import {
  COORD_COLOR_NAMES,
  COORD_EMOJIS,
  COORD_FITS,
  COORD_SLOTS,
  COORD_STYLES,
  COORD_TONES,
  COORD_TPOS,
  type CoordFit,
  type CoordStyle,
  type CoordTpo,
} from '@/data/demo-ai/coord';

// AI 코디 추천 — 방문객 사진(퍼스널 톤·지금 옷차림) + TPO·스타일·핏으로 코디 3벌을 짠다. 사람이 안 보이면 { observed: false }

const keys = <T extends object>(o: T) => Object.keys(o) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];

const input = z.object({
  photo: captureImage,
  tpo: z.enum(keys(COORD_TPOS)),
  style: z.enum(keys(COORD_STYLES)),
  fit: z.enum(keys(COORD_FITS)),
});

const line = (max: number) => z.string().min(1).max(max);
const piece = z.object({ name: line(24), color: z.enum(COORD_COLOR_NAMES), emoji: z.enum(COORD_EMOJIS) });

const result = z.object({
  observed: z.literal(true),
  tone: z.enum(COORD_TONES),
  observation: line(140),
  outfits: z
    .array(
      z.object({
        name: line(20),
        match: z.number().int().min(80).max(99),
        tip: line(90),
        pieces: z.object({ top: piece, bottom: piece, shoes: piece, accessory: piece }),
      })
    )
    .length(3),
});

const SLOT_LABELS = { top: '상의', bottom: '하의(스커트·원피스 포함)', shoes: '신발', accessory: '가방·액세서리' } as const;

const pieceSchema = (slot: (typeof COORD_SLOTS)[number]) => ({
  type: 'object',
  additionalProperties: false,
  required: ['name', 'color', 'emoji'],
  description: SLOT_LABELS[slot],
  properties: {
    name: { type: 'string', description: '아이템 이름 (색 이름 빼고, 핏 반영, 예: "오버사이즈 옥스퍼드 셔츠"), 14자 이내' },
    color: { type: 'string', enum: [...COORD_COLOR_NAMES] },
    emoji: { type: 'string', enum: [...COORD_EMOJIS], description: '아이템에 가장 가까운 이모지' },
  },
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['observed', 'tone', 'observation', 'outfits'],
  properties: {
    observed: { type: 'boolean', description: '사진에 사람(얼굴 또는 상반신)이 보이면 true, 아니면 false' },
    tone: { type: 'string', enum: [...COORD_TONES], description: '피부·머리색·눈동자로 본 퍼스널 톤' },
    observation: { type: 'string', description: '사진에서 본 지금 모습(옷 색·아이템·분위기)과 퍼스널 톤 근거를 담은 1~2문장' },
    outfits: {
      type: 'array',
      description: '코디 정확히 3벌, 매칭 점수 높은 순',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'match', 'tip', 'pieces'],
        properties: {
          name: { type: 'string', description: '룩 이름, 12자 이내 (예: "미팅 데이 룩")' },
          match: { type: 'integer', description: '매칭 점수 86~98' },
          tip: { type: 'string', description: '이 사람에게 맞춘 스타일링 팁 1문장, 50자 안팎' },
          pieces: {
            type: 'object',
            additionalProperties: false,
            required: [...COORD_SLOTS],
            properties: Object.fromEntries(COORD_SLOTS.map((slot) => [slot, pieceSchema(slot)])),
          },
        },
      },
    },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 패션 브랜드 부스의 AI 스타일리스트입니다. 방문객 사진과 답변으로 실제로 사 입을 수 있는 코디를 추천합니다.
${GROUNDING_RULE}
체형·몸매·외모를 평가하지 않습니다. 사진 속 지금 옷차림(색·아이템)을 한 벌 이상의 코디에 자연스럽게 이어 활용하면 좋습니다.
색은 퍼스널 톤에 어울리게 고르고, 한 코디 안에서 색이 3가지를 넘지 않게 조합합니다. 브랜드명은 쓰지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ photo, tpo, style, fit }) {
    const prompt = `AI 코디 추천 체험 결과를 만들어 주세요. 첨부한 사진이 방문객이 방금 찍은 사진입니다.
방문객 답변: 입을 날=${COORD_TPOS[tpo as CoordTpo]}, 끌리는 스타일=${COORD_STYLES[style as CoordStyle]}, 선호 핏=${COORD_FITS[fit as CoordFit]}
세 벌은 서로 분위기가 겹치지 않게 해 주세요.`;
    const raw = await generateJson({ name: 'coord', system: SYSTEM, prompt, schema, images: [photo], maxTokens: 2500 });
    if ((raw as { observed?: unknown } | null)?.observed === false) return { observed: false };
    return result.parse(raw);
  },
});
