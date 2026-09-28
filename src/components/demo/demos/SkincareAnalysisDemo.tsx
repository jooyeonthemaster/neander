'use client';

import type { DemoAnswers, DemoResultProps } from '@/types/demo';
import { Panel, ProcessedPhoto, ResultShell, cameraStep, choiceStep, defineDemo, getCapture, getChoice, requestDemoAi } from '../kit';
import { SKIN_CONCERNS, SKIN_ROUTINES, SKIN_TYPE_IDS } from '@/data/demo-ai/skincare';
import type { AiSkinAnalysis, SkinType } from '@/data/demo-ai/skincare';
import { isNotObserved } from '@/data/demo-ai/photo-reading';

const SUNSCREEN = '광범위 SPF 30 이상 자외선 차단제';
const SKIN_TYPES: Record<SkinType, { name: string; desc: string; morning: string[]; night: string[]; picks: string[] }> = {
  dry: {
    name: '당김을 위한 보습 루틴', desc: '스스로 느끼는 건조함을 바탕으로, 세안 후 보습을 중심에 둔 일상 관리 제안이에요.',
    morning: ['순한 세안', '피부가 약간 촉촉할 때 무향 크림', SUNSCREEN],
    night: ['순한 클렌저', '당기는 부위에 무향 보습 크림'], picks: ['무향', '크림 제형', '세라마이드'],
  },
  oily: {
    name: '가벼운 보습과 세안 루틴', desc: '말씀해 주신 유분감을 고려했어요. 강하게 씻기보다 순한 세안과 가벼운 보습을 유지해 보세요.',
    morning: ['순한 클렌저', '가벼운 논코메도제닉 보습제', SUNSCREEN],
    night: ['메이크업·선크림을 지우는 순한 세안', '가벼운 보습제'], picks: ['논코메도제닉', '가벼운 제형', '무향'],
  },
  combination: {
    name: '부위별로 조절하는 루틴', desc: 'T존과 볼의 느낌이 다르다는 답변을 반영했어요. 필요한 부위에만 보습의 양을 조절해 보세요.',
    morning: ['순한 클렌저', '가벼운 보습 후 볼에 크림 추가', SUNSCREEN],
    night: ['순한 세안', '건조한 부위 중심의 보습'], picks: ['가벼운 로션', '무향 크림', '부위별 사용량'],
  },
  sensitive: {
    name: '단계를 줄이는 편안한 루틴', desc: '새 제품에 불편함이 있다는 답변을 우선했어요. 잘 맞던 제품을 중심으로 단순하게 시작해 보세요.',
    morning: ['필요한 만큼의 순한 세안', '잘 맞던 무향 보습제', SUNSCREEN],
    night: ['순한 무향 클렌저', '잘 맞던 무향 보습제'], picks: ['무향', '적은 단계', '새 제품은 작은 부위 테스트'],
  },
  balanced: {
    name: '지금의 편안함을 유지하는 루틴', desc: '평소 편안하다는 답변을 바탕으로 기본 관리만 정리했어요. 이미 잘 맞는 제품을 유지해도 좋아요.',
    morning: ['필요에 맞는 순한 세안', '보습제', SUNSCREEN],
    night: ['순한 세안', '보습제'], picks: ['순한 세안', '보습', '자외선 차단'],
  },
};

/** Skin comfort is self-reported. Photo brightness is never a hydration or elasticity measurement. */
function routineType(answers: DemoAnswers): SkinType {
  const profile = (answers.experienceProfile ?? {}) as Record<string, string>;
  if (profile.sensitivity === 'often' || profile.sensitivity === 'sometimes') return 'sensitive';
  if (profile.skinFeel && (SKIN_TYPE_IDS as readonly string[]).includes(profile.skinFeel)) return profile.skinFeel as SkinType;
  const concern = getChoice(answers, 'concern');
  return concern === 'redness' ? 'sensitive' : concern === 'dryness' ? 'dry' : concern === 'shine' ? 'oily' : concern === 'pores' ? 'combination' : 'balanced';
}

function isAiSkin(v: unknown): v is AiSkinAnalysis {
  const o = v as AiSkinAnalysis | null;
  return !!o && o.observed === true && (SKIN_TYPE_IDS as readonly string[]).includes(o.type)
    && typeof o.desc === 'string' && Array.isArray(o.morning) && o.morning.every(s => typeof s === 'string')
    && Array.isArray(o.night) && o.night.every(s => typeof s === 'string') && Array.isArray(o.picks);
}

function skinView(answers: DemoAnswers, generated: unknown) {
  const type = routineType(answers);
  const profile = (answers.experienceProfile ?? {}) as Record<string, string>;
  const base = SKIN_TYPES[type];
  // An image model may suggest observations, but cannot override reported irritation or basic-care constraints.
  const canUseAiRoutine = isAiSkin(generated) && type !== 'sensitive' && profile.careTime === 'steady';
  return {
    ...base,
    morning: canUseAiRoutine ? [...generated.morning.filter(s => !/SPF|선크림|자외선/.test(s)).slice(0, 3), SUNSCREEN] : base.morning,
    night: canUseAiRoutine ? generated.night.slice(0, 3) : base.night,
    retake: isNotObserved(generated) && getCapture(answers, 'face')?.source !== 'sample',
  };
}

function Result({ answers, onRestart, pillarColor, generated }: DemoResultProps) {
  const data = skinView(answers, generated);
  const capture = getCapture(answers, 'face');
  const concern = SKIN_CONCERNS.find(c => c.id === getChoice(answers, 'concern'));
  return (
    <ResultShell eyebrow="나의 데일리 케어 노트" title={data.name} description={data.desc} pillarColor={pillarColor} onRestart={onRestart}>
      <div className="grid w-full max-w-md grid-cols-[112px_1fr] gap-4 rounded-2xl border border-sky-200/20 bg-sky-200/5 p-4 text-left">
        {capture ? <figure><ProcessedPhoto src={capture.image} look={{}} className="aspect-[3/4] rounded-xl" alt="관리 전 참고 사진" delayMs={0} /><figcaption className="mt-2 text-center text-xs text-slate-400">관리 전 참고 사진</figcaption></figure> : <div className="flex items-center justify-center text-4xl" aria-hidden="true">🫧</div>}
        <div className="self-center">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-sky-200">CONSULTATION NOTES</p>
          <p className="mt-2 text-sm font-semibold text-white">오늘의 관심 · {concern?.label ?? '기본 관리'}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">{capture ? '직접 준비한 사진은 관리 전 모습을 기록하는 참고 이미지예요. ' : '사진 없이 답변으로 준비한 관리 노트예요. '}루틴은 직접 알려주신 피부 느낌과 습관을 바탕으로 구성했어요.</p>
        </div>
      </div>
      <Panel title="하루 두 번, 나의 루틴">
        <div className="grid gap-4 sm:grid-cols-2">
          {[{ label: '☀️ AM · 준비하는 아침', steps: data.morning }, { label: '🌙 PM · 정리하는 저녁', steps: data.night }].map(block => (
            <div key={block.label} className="rounded-xl border border-sky-100/10 bg-sky-100/5 p-3">
              <p className="mb-3 text-xs font-semibold text-sky-100">{block.label}</p>
              <ol className="space-y-3 text-xs leading-relaxed text-slate-300">{block.steps.map((step, i) => <li key={`${i}-${step}`} className="flex gap-2"><span className="text-sky-300">0{i + 1}</span><span>{step}</span></li>)}</ol>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="제품을 고를 때 확인할 것">
        <div className="flex flex-wrap gap-2">{data.picks.map(p => <span key={p} className="rounded-full border border-sky-200/20 px-3 py-1 text-xs text-sky-100">{p}</span>)}</div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">새 제품은 작은 부위에 7–10일 시험한 뒤 적용해요. 지속적인 따가움·발진은 제품을 중단하고 피부과에 문의하세요.</p>
      </Panel>
      {data.retake && <p className="max-w-md text-xs text-slate-400">사진에서 얼굴을 확인하기 어려워요. 직접 알려주신 피부 느낌으로 루틴을 준비했어요.</p>}
      <p className="max-w-md text-xs text-slate-400">일상 관리 참고용이며 의료 진단이나 전문 피부 측정을 대신하지 않아요.</p>
    </ResultShell>
  );
}

const optionalPhoto = cameraStep({
  id: 'face', title: '관리 전 모습을 기록할까요? (선택)', subtitle: '결과 카드에 참고 사진으로 담아요. 사진 없이도 다음으로 넘어갈 수 있어요.', mode: 'face', subject: '피부 사진',
  scanLabels: ['참고 사진 준비', '밝기와 프레임 확인', '관리 전 이미지 준비'],
  readouts: () => [{ label: '사진 활용', value: '관리 전 모습 기록' }, { label: '루틴 근거', value: '직접 답한 느낌과 습관' }],
});

export default defineDemo({
  config: { id: 'skincare-analysis', targetSlug: 'ai-skincare-analysis', industryId: 'beauty', analyzeEmoji: '🫧', analyzeDurationMs: 3600, analyzeImageStepId: 'face', analyzeMessages: ['피부 느낌과 자극 경험 정리', '관리 시간에 맞는 기본 단계 선택', '아침·저녁 루틴 카드 작성'] },
  steps: [
    { ...optionalPhoto, meta: { ...optionalPhoto.meta, canProceed: () => true } },
    choiceStep({ id: 'concern', title: '요즘 가장 신경 쓰이는 피부 고민은?', subtitle: '직접 느끼는 고민을 루틴의 방향에 반영해요', columns: 3, options: [...SKIN_CONCERNS] }),
    choiceStep({ id: 'routine', title: '지금 스킨케어는 몇 단계인가요?', columns: 3, options: [...SKIN_ROUTINES] }),
  ],
  computeResult: routineType,
  Result,
  generate: answers => {
    const photo = getCapture(answers, 'face')?.image;
    if (!photo) return Promise.resolve(null);
    return requestDemoAi<unknown>('skincare-analysis', { experienceProfile: answers.experienceProfile, photo, concern: getChoice(answers, 'concern') ?? 'dryness', routine: getChoice(answers, 'routine') ?? 'basic' }, { validate: (d): d is unknown => isAiSkin(d) || isNotObserved(d) });
  },
  print: (answers, _resultKey, generated) => {
    const data = skinView(answers, generated);
    return { kind: 'receipt', eyebrow: '나의 데일리 케어 노트', title: data.name,
      sections: [{ type: 'text', text: data.desc }, { type: 'list', title: '아침 루틴', items: data.morning }, { type: 'list', title: '저녁 루틴', items: data.night }, { type: 'list', title: '제품 선택 체크', items: data.picks }],
      footer: '자가 보고 기반 관리 참고용 · 사진으로 수분·탄력·질환을 측정하지 않습니다.',
    };
  },
});
