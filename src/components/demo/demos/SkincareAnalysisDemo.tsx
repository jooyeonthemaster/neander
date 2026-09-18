'use client';

import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import {
  FACE_POINTS,
  Panel,
  ProcessedPhoto,
  ResultShell,
  ScoreBars,
  answersSeed,
  cameraStep,
  choiceStep,
  clamp,
  defineDemo,
  getCapture,
  getChoice,
  seededInt,
  type PhotoPaint,
} from '../kit';

/* ── Data ──────────────────────────────────────────────── */

type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'balanced';

const SKIN_TYPES: Record<SkinType, { name: string; desc: string; morning: string[]; night: string[]; picks: string[] }> = {
  dry: {
    name: '수분 부족 건성',
    desc: '피부 장벽이 얇아 수분이 쉽게 날아가는 타입이에요. 세안 후 3분 안에 보습을 채우는 게 핵심이에요.',
    morning: ['약산성 젤 클렌저', '히알루론산 토너 레이어링', '세라마이드 크림', 'SPF50 톤업 선크림'],
    night: ['밀크 클렌저', '판테놀 앰플', '슬리핑 마스크로 수분 잠금'],
    picks: ['세라마이드', '히알루론산', '스쿠알란'],
  },
  oily: {
    name: '유분 과다 지성',
    desc: '피지 분비가 활발해 번들거림과 모공 고민이 생기기 쉬워요. 유분은 덜고 수분은 채우는 밸런스가 필요해요.',
    morning: ['BHA 폼 클렌저', '녹차 수분 토너', '오일프리 젤 크림', '산뜻한 선젤'],
    night: ['더블 클렌징', '나이아신아마이드 세럼', '가벼운 수분 로션'],
    picks: ['나이아신아마이드', 'BHA', '녹차 추출물'],
  },
  combination: {
    name: 'T존 복합성',
    desc: '이마·코는 번들거리고 볼은 당기는 타입이에요. 부위별로 제품을 나눠 쓰면 효과가 좋아요.',
    morning: ['저자극 젤 클렌저', 'T존 피지 케어 토너', '볼 부위 수분 크림', '가벼운 선크림'],
    night: ['클렌징 워터', 'T존 BHA 패드', '볼 집중 보습 크림'],
    picks: ['PHA', '판테놀', '알로에'],
  },
  sensitive: {
    name: '예민한 민감성',
    desc: '작은 자극에도 붉어지기 쉬운 타입이에요. 성분 수를 줄이고 진정 위주로 루틴을 가볍게 가져가세요.',
    morning: ['물 세안 또는 저자극 클렌저', '시카 진정 토너', '무향 보습 크림', '무기자차 선크림'],
    night: ['약산성 클렌저', '마데카소사이드 앰플', '장벽 크림'],
    picks: ['시카', '마데카소사이드', '베타글루칸'],
  },
  balanced: {
    name: '밸런스 중성',
    desc: '유수분 밸런스가 안정적인 건강한 피부예요. 지금 컨디션을 지키면서 톤과 탄력 관리에 집중해 보세요.',
    morning: ['젤 클렌저', '비타민C 세럼', '수분 크림', 'SPF50 선크림'],
    night: ['클렌징 오일', '레티놀 세럼 (주 2~3회)', '영양 크림'],
    picks: ['비타민C', '레티놀', '펩타이드'],
  },
};

const CONCERNS = [
  { id: 'dryness', emoji: '💧', label: '건조·당김', desc: '세안 후 얼굴이 당겨요' },
  { id: 'shine', emoji: '✨', label: '번들거림', desc: '오후만 되면 유분이 올라와요' },
  { id: 'pores', emoji: '🔍', label: '넓은 모공', desc: '코·볼 모공이 신경 쓰여요' },
  { id: 'dullness', emoji: '🌫️', label: '칙칙함·잡티', desc: '피부톤이 고르지 않아요' },
  { id: 'aging', emoji: '⏳', label: '잔주름·탄력', desc: '눈가·팔자가 신경 쓰여요' },
  { id: 'redness', emoji: '🌹', label: '붉은기·민감', desc: '쉽게 빨개지고 따가워요' },
];

/* ── Analysis ─────────────────────────────────────────── */

/** 촬영 이미지 통계 + 고민 + 루틴으로 5가지 지표와 피부 타입을 만든다 */
function analyze(answers: DemoAnswers) {
  const capture = getCapture(answers, 'face');
  const concern = getChoice(answers, 'concern');
  const routine = getChoice(answers, 'routine');
  const seed = answersSeed(answers);
  const brightness = capture?.stats.brightness ?? 55;
  const contrast = capture?.stats.contrast ?? 40;
  const jitter = (salt: string) => seededInt(seed, salt, -8, 8);
  const care = routine === 'full' ? 4 : routine === 'minimal' ? -3 : 0;

  const scores = {
    pore: clamp(74 + jitter('pore') - (concern === 'pores' ? 16 : 0) - (concern === 'shine' ? 8 : 0) - contrast / 10 + care, 30, 97),
    moisture: clamp(70 + jitter('moisture') - (concern === 'dryness' ? 20 : 0) - (concern === 'aging' ? 6 : 0) + care, 30, 97),
    wrinkle: clamp(80 + jitter('wrinkle') - (concern === 'aging' ? 18 : 0) + care, 30, 97),
    tone: clamp(58 + brightness * 0.3 + jitter('tone') - (concern === 'dullness' ? 15 : 0), 30, 97),
    elasticity: clamp(76 + jitter('elasticity') - (concern === 'aging' ? 12 : 0) + care, 30, 97),
  };

  let type: SkinType;
  if (concern === 'redness') type = 'sensitive';
  else if (concern === 'dryness' || (concern === 'aging' && scores.moisture < 65)) type = 'dry';
  else if (concern === 'shine') type = 'oily';
  else if (concern === 'pores') type = scores.moisture < 68 ? 'combination' : 'oily';
  else if (concern === 'dullness') type = scores.moisture < 66 ? 'combination' : 'balanced';
  else type = 'balanced';

  const rounded = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)])) as typeof scores;
  const total = Math.round(Object.values(rounded).reduce((s, v) => s + v, 0) / 5);
  return { type, scores: rounded, total };
}

/** 피부 타입별로 얼굴 위에 얹는 "피부 맵" 색 */
function skinMap(type: SkinType): PhotoPaint[] {
  const { forehead, nose, cheekL, cheekR } = FACE_POINTS;
  const oil = (p: { x: number; y: number }, rx = 12, ry = 7): PhotoPaint => ({ ...p, rx, ry, color: '#facc15', alpha: 0.55, blend: 'hard-light' });
  const dry = (p: { x: number; y: number }): PhotoPaint => ({ ...p, rx: 11, ry: 9, color: '#38bdf8', alpha: 0.5, blend: 'hard-light' });
  const red = (p: { x: number; y: number }): PhotoPaint => ({ ...p, rx: 10, ry: 8, color: '#f43f5e', alpha: 0.5, blend: 'hard-light' });

  if (type === 'oily') return [oil(forehead, 16, 6), oil(nose, 6, 9), oil(cheekL, 8, 6), oil(cheekR, 8, 6)];
  if (type === 'combination') return [oil(forehead, 16, 6), oil(nose, 6, 9), dry(cheekL), dry(cheekR)];
  if (type === 'dry') return [dry(cheekL), dry(cheekR), dry(forehead)];
  if (type === 'sensitive') return [red(cheekL), red(cheekR), oil(nose, 5, 6)];
  return [{ ...cheekL, rx: 10, ry: 8, color: '#34d399', alpha: 0.4, blend: 'hard-light' }, { ...cheekR, rx: 10, ry: 8, color: '#34d399', alpha: 0.4, blend: 'hard-light' }];
}

/* ── Result ────────────────────────────────────────────── */

function Result({ answers, onRestart, pillarColor }: DemoResultProps) {
  const { type, scores, total } = analyze(answers);
  const data = SKIN_TYPES[type];
  const capture = getCapture(answers, 'face');

  return (
    <ResultShell eyebrow="AI 피부 분석 결과" title={data.name} description={data.desc} pillarColor={pillarColor} onRestart={onRestart}>
      <div className="flex w-full max-w-md flex-col items-center gap-5 sm:flex-row sm:items-stretch">
        {capture && (
          <div className="w-40 shrink-0">
            <ProcessedPhoto
              src={capture.image}
              look={{ adjust: { saturation: 0.55, contrast: 1.05 }, paints: skinMap(type) }}
              className="aspect-[3/4] rounded-2xl border border-slate-700"
              alt="피부 맵"
            />
            <div className="mt-2 flex justify-center gap-3 text-[10px] text-slate-400">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-yellow-400" />유분</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />건조</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />민감</span>
            </div>
          </div>
        )}
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs text-slate-400">종합 피부 점수</p>
          <p className="font-display text-5xl font-extrabold" style={{ color: pillarColor }}>
            {total}
          </p>
          <p className="mt-1 text-xs text-slate-500">동일 연령대 평균 대비 {total >= 75 ? '상위' : '평균'} 그룹</p>
        </div>
      </div>

      <ScoreBars
        color={pillarColor}
        items={[
          { label: '모공', value: scores.pore },
          { label: '수분', value: scores.moisture },
          { label: '주름', value: scores.wrinkle },
          { label: '톤 균일도', value: scores.tone },
          { label: '탄력', value: scores.elasticity },
        ]}
      />

      <Panel title="맞춤 스킨케어 루틴">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: '☀️ 아침', steps: data.morning },
            { label: '🌙 저녁', steps: data.night },
          ].map((block) => (
            <div key={block.label}>
              <p className="mb-2 font-semibold text-white">{block.label}</p>
              <ol className="space-y-1.5 text-xs text-slate-300">
                {block.steps.map((s, i) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-slate-500">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-500">추천 성분</span>
          {data.picks.map((p) => (
            <span key={p} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${pillarColor}20`, color: pillarColor }}>
              {p}
            </span>
          ))}
        </div>
      </Panel>
    </ResultShell>
  );
}

/* ── Export ─────────────────────────────────────────────── */

export default defineDemo({
  config: {
    id: 'skincare-analysis',
    targetSlug: 'ai-skincare-analysis',
    industryId: 'beauty',
    analyzeEmoji: '🔬',
    analyzeDurationMs: 3600,
    analyzeImageStepId: 'face',
    analyzeMessages: ['모공 밀도 계산 중', '수분·유분 밸런스 측정 중', '주름 깊이 추정 중', '맞춤 루틴 생성 중'],
  },
  steps: [
    cameraStep({
      id: 'face',
      title: '피부를 스캔해 볼게요',
      subtitle: '밝은 곳에서 화장기 없이 정면을 바라봐 주세요',
      mode: 'face',
      subject: '피부',
      scanLabels: ['피부 영역 분리', '모공·결 텍스처 측정', '수분·유분 반사광 분석', '톤 균일도 계산', '탄력 지표 추정'],
      readouts: (c) => [
        { label: '피부 톤', value: c.stats.warmth > 55 ? '웜 베이스' : c.stats.warmth < 45 ? '쿨 베이스' : '뉴트럴' },
        { label: '조명 상태', value: c.stats.brightness > 45 ? '양호' : '어두움 · 보정' },
        { label: '반사광', value: `${Math.round(c.stats.contrast * 0.8 + 10)}%` },
        { label: '측정 포인트', value: '1,284개' },
      ],
    }),
    choiceStep({
      id: 'concern',
      title: '요즘 가장 신경 쓰이는 피부 고민은?',
      subtitle: '분석 결과에 가중치로 반영돼요',
      columns: 3,
      options: CONCERNS,
    }),
    choiceStep({
      id: 'routine',
      title: '지금 스킨케어는 몇 단계인가요?',
      columns: 3,
      options: [
        { id: 'minimal', emoji: '🧴', label: '미니멀', desc: '1~2단계' },
        { id: 'basic', emoji: '🧖', label: '기본', desc: '3~4단계' },
        { id: 'full', emoji: '💎', label: '풀코스', desc: '5단계 이상' },
      ],
    }),
  ],
  computeResult: (answers) => analyze(answers).type,
  Result,
  print: (answers) => {
    const { type, scores, total } = analyze(answers);
    const data = SKIN_TYPES[type];
    const capture = getCapture(answers, 'face');
    return {
      kind: 'receipt',
      eyebrow: 'AI 피부 분석 결과',
      title: data.name,
      photo: capture ? { src: capture.image } : undefined,
      sections: [
        { type: 'big', title: '종합 피부 점수', text: `${total}점` },
        {
          type: 'bars',
          title: '5대 피부 지표',
          bars: [
            { label: '모공', value: scores.pore },
            { label: '수분', value: scores.moisture },
            { label: '주름', value: scores.wrinkle },
            { label: '톤', value: scores.tone },
            { label: '탄력', value: scores.elasticity },
          ],
        },
        { type: 'list', title: '아침 루틴', items: data.morning },
        { type: 'list', title: '저녁 루틴', items: data.night },
        { type: 'rows', title: '추천 성분', rows: data.picks.map((pick, i) => ({ label: `성분 ${i + 1}`, value: pick })) },
      ],
      footer: '피부 컨디션은 매일 달라요. 한 달 뒤 다시 측정해 보세요',
    };
  },
});
