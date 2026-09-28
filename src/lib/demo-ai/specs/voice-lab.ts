import { z } from 'zod';
import { BASE_SYSTEM, generateJson } from '../openrouter';
import { defineSpec } from '../types';
import { VOICE_AUDIO_FORMATS, VOICE_GOALS, VOICE_TYPE_IDS, VOICE_TYPE_RANGES } from '@/data/demo-ai/voice';

// AI 음색 분석 — 녹음(webm·mp4 등, Gemini가 직접 듣는다) + 브라우저가 잰 음높이·성량·억양으로 음색 리포트를 쓴다.
// 녹음이 없으면(샘플 모드·변환 실패) 측정 수치만 보고 쓴다. 녹음에 목소리가 없으면 { observed: false }

const input = z.object({
  goal: z.enum(Object.keys(VOICE_GOALS) as ['sing', 'speak']),
  pitchHz: z.number().min(40).max(1000),
  volume: z.number().min(0).max(100),
  variation: z.number().min(0).max(100),
  audio: z
    .object({
      data: z.string().max(1_500_000).regex(/^[A-Za-z0-9+/=]+$/),
      format: z.enum(VOICE_AUDIO_FORMATS),
    })
    .nullable()
    .optional(),
});

const line = (max: number) => z.string().min(1).max(max);
const score = z.number().int().min(30).max(98);

const result = z.object({
  transcript: z.string().max(120),
  heard: z.boolean(),
  type: z.enum(VOICE_TYPE_IDS),
  title: line(24),
  desc: line(200),
  heardNote: line(140),
  style: line(12),
  scores: z.object({ delivery: score, expression: score, stability: score }),
  genres: z.array(line(14)).min(3).max(3),
  reference: line(80),
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['transcript', 'heard', 'type', 'title', 'desc', 'heardNote', 'style', 'scores', 'genres', 'reference'],
  properties: {
    transcript: { type: 'string', description: '녹음에서 실제로 알아들은 말을 그대로 받아 적기. 말소리가 안 들리면 빈 문자열. 녹음이 없으면 빈 문자열' },
    heard: { type: 'boolean', description: '녹음에 사람 목소리(말·노래)가 들리면 true, 무음·잡음뿐이면 false. 녹음이 없으면 true' },
    type: { type: 'string', enum: [...VOICE_TYPE_IDS], description: '이번 녹음의 참고 음높이 구간용 내부 ID. 성악 성부·전체 음역 판정이 아님' },
    title: { type: 'string', description: '목소리 별명, "~ 보이스"로 끝나는 16자 이내' },
    desc: { type: 'string', description: '이번 짧은 녹음에서 들린 소리와 다음 테이크 연습 팁 2문장. 실력·전체 음역·성격·건강 확정 금지' },
    heardNote: { type: 'string', description: '녹음에서 실제로 들린 특징(속도·발음·끝음 처리·호흡 등) 한 문장. 녹음이 없으면 측정 수치에서 읽은 특징' },
    style: { type: 'string', description: '보컬/화법 스타일 한 단어구, 7자 이내 (예: 감정 표현형)' },
    scores: {
      type: 'object',
      additionalProperties: false,
      required: ['delivery', 'expression', 'stability'],
      properties: {
        delivery: { type: 'integer', description: '이번 테이크의 녹음 크기 참고값 40~96. 실력·성량의 절대 측정 아님' },
        expression: { type: 'integer', description: '이번 테이크의 음높이 변화 참고값 40~96. 성격·감정 추론 금지' },
        stability: { type: 'integer', description: '이번 테이크의 연출 안정감 참고값 40~96. 임상·건강 지표 아님' },
      },
    },
    genres: { type: 'array', items: { type: 'string' }, description: '정확히 3개, 각 10자 이내 — 노래 목표면 어울리는 장르, 말하기 목표면 빛나는 자리(예: 라디오 DJ, 발표)' },
    reference: { type: 'string', description: '어울리는 보컬/화자 스타일 한 문장, 40자 이내 — 실존 인물 이름 금지' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 짧은 녹음으로 다음 테이크를 돕는 연습 코치입니다. 방문객이 약 10초 동안 읽은 문장과 브라우저의 추정값을 참고합니다.
이번 테이크에서 들린 것만 설명하며, 짧은 발화로 전체 노래 음역·성악 성부·보컬 실력·성격·정서 상태·건강·성별·나이·민족을 추론하거나 확정하지 않습니다. 마이크·거리·환경 소음이 결과에 영향을 준다는 한계를 반영합니다.
첨부된 체험 브리프의 녹음 환경과 연습 목표에 맞춰, 짧게 쉬기·또박또박 읽기·익숙한 음높이로 읽기 중 실행 가능한 다음 테이크 팁을 제안합니다. 목에 힘주기·고음 한계 시험·큰 소리 강요는 하지 않습니다.
실존 가수·성우·유명인 이름을 쓰지 않습니다.
참고 음높이 구간표(내부 type ID로만 사용, 성악 성부 판정 아님): ${VOICE_TYPE_IDS.map((id) => `${id}=${VOICE_TYPE_RANGES[id].range}`).join(' / ')}
짧은 녹음에 대한 창작 별명과 연습 제안으로 표현하며 '고음을 잘 낼 수 있다'처럼 확인하지 않은 능력을 말하지 않습니다.`;

export default defineSpec({
  input,
  bucket: 'text',
  async run({ goal, pitchHz, volume, variation, audio }) {
    const prompt = `AI 음색 분석 체험 결과를 만들어 주세요.
방문객 목표: ${VOICE_GOALS[goal]}
읽은 문장: "안녕하세요. 오늘은 제 목소리로 이야기를 전해 보려고 해요. 잠깐 쉬었다가, 가장 전하고 싶은 말을 또박또박 읽어볼게요."
브라우저 추정 참고값: 평균 음높이 ${Math.round(pitchHz)}Hz, 녹음 크기 ${Math.round(volume)}/100, 음높이 변화폭 ${Math.round(variation)}/100
${audio ? '첨부한 오디오가 방문객의 실제 녹음입니다. 직접 듣고 풀이해 주세요.' : '녹음 파일은 없습니다. 측정값만 보고 풀이해 주세요 (heard=true).'}`;
    const raw = await generateJson({ name: 'voice_lab', system: SYSTEM, prompt, schema, audio: audio ?? undefined, maxTokens: 1500 });
    const r = raw as { heard?: unknown; transcript?: unknown } | null;
    // 무음·잡음이면 모델이 목소리를 지어내지 않도록 받아쓰기부터 시킨다 — 알아들은 말이 없으면 목소리 없음으로 본다
    if (audio && (r?.heard === false || typeof r?.transcript !== 'string' || r.transcript.trim().length < 2)) {
      return { observed: false };
    }
    const { type, title, desc, heardNote, style, scores, genres, reference, transcript } = result.parse(raw);
    return {
      observed: true,
      type, title, desc, heardNote, style, scores, genres, reference,
      transcript: audio ? transcript.trim() : '',
      listened: !!audio,
    };
  },
});
