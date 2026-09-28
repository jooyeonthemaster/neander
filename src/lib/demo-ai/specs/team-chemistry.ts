import { z } from 'zod';
import { BASE_SYSTEM, generateJson, themeLine } from '../openrouter';
import { defineSpec } from '../types';
import { TEAM_COMM_STYLES, TEAM_EMOJIS, TEAM_ROLES, TEAM_STRESS_RESPONSES } from '@/data/demo-ai/team';

// AI 팀 케미스트리 — 팀 역할·소통 방식·위기 대응으로 협업 아키타입을 만든다.

const input = z.object({
  role: z.enum(TEAM_ROLES.map((r) => r.id) as [string, ...string[]]),
  communication: z.enum(TEAM_COMM_STYLES.map((c) => c.id) as [string, ...string[]]),
  stress: z.enum(TEAM_STRESS_RESPONSES.map((s) => s.id) as [string, ...string[]]),
});

const result = z.object({
  name: z.string().min(1).max(20),
  emoji: z.enum(TEAM_EMOJIS),
  desc: z.string().min(1).max(160),
  strengths: z.array(z.string().min(1).max(20)).length(3),
  challenges: z.array(z.string().min(1).max(20)).length(2),
  partner: z.string().min(1).max(20),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'emoji', 'desc', 'strengths', 'challenges', 'partner'],
  properties: {
    name: { type: 'string', description: '팀 아키타입 이름 (예: 데이터 전략가, 릴라이어블 앵커), 10자 안팎' },
    emoji: { type: 'string', enum: [...TEAM_EMOJIS], description: '아키타입을 나타내는 아이콘' },
    desc: { type: 'string', description: '현재 답변한 상황에서 시도해 볼 협업 방식 2문장. 개인의 고정 성격이나 역량을 단정하지 않음' },
    strengths: { type: 'array', items: { type: 'string' }, description: '이번 상황에서 활용할 행동 정확히 3개, 각 12자 이내' },
    challenges: { type: 'array', items: { type: 'string' }, description: '성장 포인트 정확히 2개, 각 12자 이내 명사구. 비난이 아닌 다듬을 점으로' },
    partner: { type: 'string', description: '함께 역할을 나눠볼 협업 방식 한 가지, 10자 안팎. 궁합 판정이 아님' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 팀의 구체적인 협업 상황을 돌아보는 대화 진행자입니다. 직접 보고한 현재 경험만 사용하며 사진·외모·MBTI로 성격이나 역량을 추론하지 않습니다.
목표·완료 기준·피드백·도움 요청처럼 관찰 가능한 행동을 제안합니다. 아키타입 이름은 대화용 별칭일 뿐입니다. 팀 전체에 대한 평가, 심리 검사, 인사 평가, 검증된 적합도처럼 단정하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ role, communication, stress }) {
    const r = TEAM_ROLES.find((x) => x.id === role)!;
    const c = TEAM_COMM_STYLES.find((x) => x.id === communication)!;
    const s = TEAM_STRESS_RESPONSES.find((x) => x.id === stress)!;
    const prompt = `팀 케미스트리 체험 결과를 만들어 주세요.
방문객 답변: 팀 역할=${r.title}(${r.desc}), 소통 방식=${c.title}(${c.desc}), 위기 대응=${s.title}(${s.desc})
${themeLine()}`;
    return result.parse(await generateJson({ name: 'team_chemistry', system: SYSTEM, prompt, schema }));
  },
});
