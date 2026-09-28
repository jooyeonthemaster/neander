import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { CAREER_EMOJIS, CAREER_INTERESTS, CAREER_QUADRANTS, CAREER_SUPERPOWERS } from '@/data/demo-ai/future-career';

// AI 미래 커리어 — 관심 분야·업무 스타일·초능력으로 어울리는 미래 직업과 성장 로드맵을 만든다.

const input = z.object({
  interest: z.enum(CAREER_INTERESTS.map((i) => i.id) as [string, ...string[]]),
  workStyle: z.enum(CAREER_QUADRANTS.map((q) => q.id) as [string, ...string[]]),
  superpower: z.enum(CAREER_SUPERPOWERS.map((s) => s.id) as [string, ...string[]]),
});

const result = z.object({
  name: z.string().min(1).max(20),
  emoji: z.enum(CAREER_EMOJIS),
  compatibility: z.number().int().min(80).max(99),
  desc: z.string().min(1).max(160),
  timeline: z.array(z.string().min(1).max(40)).length(3),
  skills: z.array(z.string().min(1).max(20)).min(3).max(5),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'emoji', 'compatibility', 'desc', 'timeline', 'skills'],
  properties: {
    name: { type: 'string', description: '탐색해 볼 실제 직업 후보 이름 (예: AI 윤리 디자이너), 12자 안팎' },
    emoji: { type: 'string', enum: [...CAREER_EMOJIS], description: '직업을 가장 잘 나타내는 아이콘' },
    compatibility: { type: 'integer', description: '화면에 표시하지 않는 호환용 값 80을 사용. 적합도나 확률을 산출하지 않음' },
    desc: { type: 'string', description: '이 직업이 방문객에게 어울리는 이유 2문장, 100자 안팎. 방문객의 답변을 자연스럽게 반영' },
    timeline: { type: 'array', items: { type: 'string' }, description: '정확히 3개: 입문 자료 알아보기 · 작은 작업 해보기 · 현직 업무와 비교하기. 각 40자 이내의 구체적 활동. 미래 지위나 성공을 예측하지 않음' },
    skills: { type: 'array', items: { type: 'string' }, description: '핵심 스킬 4개, 각 10자 이내' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 관심 활동을 직업 탐색으로 연결하는 안내자입니다. 직접 보고한 흥미를 바탕으로 실제 존재하는 직업 후보를 제안합니다. 사진이나 외모를 근거로 삼지 않습니다.
특정 학교·회사·연봉·성공 확률·미래 지위를 예측하지 않습니다. O*NET RIASEC의 활동 흥미 탐색 원칙을 참고하되 정식 검사나 점수라고 주장하지 않습니다. compatibility는 호환용 80으로 고정하고 설명에는 수치를 쓰지 않습니다. timeline은 이번 주 실제로 해볼 조사·연습·성찰 활동으로 씁니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ interest, workStyle, superpower }) {
    const i = CAREER_INTERESTS.find((x) => x.id === interest)!;
    const w = CAREER_QUADRANTS.find((x) => x.id === workStyle)!;
    const s = CAREER_SUPERPOWERS.find((x) => x.id === superpower)!;
    const prompt = `미래 커리어 체험 결과를 만들어 주세요.
방문객 답변: 관심 분야=${i.label}(${i.desc}), 업무 스타일=${w.label}(${w.id.startsWith('structured') ? '구조적' : '유연한'}·${w.id.endsWith('solo') ? '혼자' : '함께'}), 나의 초능력=${s.label}(${s.desc})
세 답변이 모두 만나는 지점의 직업을 골라 주세요.
${themeLine()}`;
    return result.parse(await generateJson({ name: 'future_career', system: SYSTEM, prompt, schema }));
  },
});
