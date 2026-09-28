import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { TRAVEL_DESTINATIONS, TRAVEL_EMOJIS, TRAVEL_MUST_HAVES, TRAVEL_PACES, shortTripCandidate } from '@/data/demo-ai/travel';

// AI 여행 스타일 — 여행지 분위기·페이스·꼭 하고 싶은 것으로 여행 페르소나와 추천 여행지를 만든다.

const mustHave = z.enum(TRAVEL_MUST_HAVES.map((m) => m.id) as [string, ...string[]]);

const input = z.object({
  tripLength: z.enum(['day', 'weekend', 'long']).default('long'),
  destination: z.enum(TRAVEL_DESTINATIONS.map((d) => d.id) as [string, ...string[]]),
  pace: z.enum(TRAVEL_PACES.map((p) => p.id) as [string, ...string[]]),
  mustHave: z.array(mustHave).min(1).max(2).refine((a) => new Set(a).size === a.length, { message: 'duplicate mustHave' }),
});

const result = z.object({
  name: z.string().min(1).max(20),
  emoji: z.enum(TRAVEL_EMOJIS),
  desc: z.string().min(1).max(160),
  destination: z.string().min(1).max(30),
  airport: z.string().regex(/^[A-Z]{3}$/),
  tip: z.string().min(1).max(120),
  packing: z.array(z.string().min(1).max(16)).length(3),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'emoji', 'desc', 'destination', 'airport', 'tip', 'packing'],
  properties: {
    name: { type: 'string', description: '여행 페르소나 이름 (예: 시티 플라뇌르, 비치 소울), 10자 안팎' },
    emoji: { type: 'string', enum: [...TRAVEL_EMOJIS], description: '페르소나를 나타내는 아이콘' },
    desc: { type: 'string', description: '방문객의 여행 스타일 설명 2문장, 90자 안팎' },
    destination: { type: 'string', description: '방문객의 체류 기간과 프롬프트의 후보 범위에 맞는 실제 여행지. 두 곳이면 대안임을 나타내는 "또는"으로 연결' },
    airport: { type: 'string', description: '첫 번째 여행지와 가장 가까운 실제 국제공항의 IATA 코드, 영문 대문자 3글자' },
    tip: { type: 'string', description: '이 페르소나를 위한 실용적인 여행 팁 1~2문장, 70자 이내' },
    packing: { type: 'array', items: { type: 'string' }, description: '꼭 챙길 준비물 정확히 3개, 각 8자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 관광 박람회의 여행 스타일 분석 AI입니다. 추천 여행지는 실제로 존재하고 여행자가 갈 수 있는 곳만 씁니다.
위험 지역·특정 여행사·가격은 언급하지 않습니다. 공항 코드는 실제 IATA 코드만 씁니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ destination, pace, mustHave, tripLength }) {
    const shortTrip = shortTripCandidate(tripLength, destination);
    const d = TRAVEL_DESTINATIONS.find((x) => x.id === destination)!;
    const p = TRAVEL_PACES.find((x) => x.id === pace)!;
    const musts = mustHave.map((id) => TRAVEL_MUST_HAVES.find((m) => m.id === id)!.label).join(', ');
    const prompt = `여행 스타일 체험 결과를 만들어 주세요.
방문객 답변: 끌리는 여행지 분위기=${d.label}(${d.desc}), 여행 페이스=${p.label}(${p.desc}), 빠질 수 없는 것=${musts}
체류 기간=${tripLength === 'day' ? '당일' : tripLength === 'weekend' ? '2~3일' : '4일 이상'}.
${shortTrip ? `추천 후보는 반드시 ${shortTrip.destination}로 제한하세요. 한 여행에 모두 방문하는 일정이 아닌 대안입니다. description과 팁도 이 국내 후보에 맞추고 다른 해외 지명을 섞지 마세요.` : '기간과 이동 시간을 고려해 한 지역에 머무르는 여행을 제안하세요.'}
추천 여행지·팁·준비물에 꼭 하고 싶은 것(${musts})을 반영해 주세요.
${themeLine()}`;
    const parsed = result.parse(await generateJson({ name: 'travel_style', system: SYSTEM, prompt, schema }));
    return { ...parsed, ...shortTrip };
  },
});
