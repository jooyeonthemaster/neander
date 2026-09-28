'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getServiceContactHref } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IndustryId } from '@/data/experiences';
import type {
  DemoAnswers,
  DemoConfig,
  DemoModule,
  DemoStepProps,
  DemoResultProps,
} from '@/types/demo';
import { requestDemoAi, type PrintSpec } from '../kit';
import { STYLE_ITEM_EMOJIS, STYLE_OCCASIONS, STYLE_PALETTES, STYLE_VIBES, type AiStyle } from '@/data/demo-ai/style';

/* ── Data ──────────────────────────────────────────────── */

const VIBES = STYLE_VIBES;
const PALETTES = STYLE_PALETTES;
const OCCASIONS = STYLE_OCCASIONS;

type ArchetypeKey = 'nordic-minimalist' | 'modern-essentialist' | 'urban-trendsetter'
  | 'timeless-elegance' | 'neo-classic' | 'soft-romantic' | 'creative-disruptor';

interface WardrobeItem { item: string; emoji: string; why: string }
interface ArchetypeData {
  name: string; tags: string[]; wardrobe: WardrobeItem[];
  colors: string[]; desc: string;
}

const RESULTS: Record<ArchetypeKey, ArchetypeData> = {
  'nordic-minimalist': {
    name: '노르딕 미니멀리스트', tags: ['#Less_is_More', '#깔끔', '#톤온톤'],
    wardrobe: [
      { item: '오버사이즈 캐시미어 니트', emoji: '🧶', why: '미니멀의 정석' },
      { item: '와이드 슬랙스', emoji: '👖', why: '깔끔한 실루엣의 기본' },
      { item: '미니멀 토트백', emoji: '👜', why: '군더더기 없는 완성' },
    ],
    colors: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242', '#212121'],
    desc: '불필요한 것을 덜어내는 미학의 소유자. 깔끔한 라인과 뉴트럴 팔레트로 세련된 일상을 완성합니다.',
  },
  'modern-essentialist': {
    name: '모던 에센셜리스트', tags: ['#기본기', '#세련', '#실용적'],
    wardrobe: [
      { item: '퍼펙트 화이트 셔츠', emoji: '👔', why: '모든 룩의 기반' },
      { item: '테이퍼드 데님', emoji: '👖', why: '데일리 세련미' },
      { item: '미니멀 레더 워치', emoji: '⌚', why: '절제된 포인트' },
    ],
    colors: ['#FFFFFF', '#F5F5F5', '#BDBDBD', '#616161', '#212121'],
    desc: '기본에 충실하되 디테일로 차이를 만드는 스타일리스트. 실용적이면서도 세련된 선택이 당신의 무기입니다.',
  },
  'urban-trendsetter': {
    name: '어반 트렌드세터', tags: ['#스트릿', '#트렌디', '#자유로운'],
    wardrobe: [
      { item: '오버사이즈 그래픽 티', emoji: '👕', why: '스트릿의 시작' },
      { item: '카고 팬츠', emoji: '🩳', why: '실용과 트렌드의 조합' },
      { item: '하이탑 스니커즈', emoji: '👟', why: '무드를 완성하는 포인트' },
    ],
    colors: ['#FF6B35', '#F7C948', '#333333', '#FFFFFF', '#00BCD4'],
    desc: '거리의 에너지를 스타일에 담는 트렌드세터. 과감한 믹스매치와 유니크한 아이템으로 시선을 사로잡습니다.',
  },
  'timeless-elegance': {
    name: '타임리스 엘레강스', tags: ['#품격', '#클래식', '#고급스러운'],
    wardrobe: [
      { item: '테일러드 블레이저', emoji: '🧥', why: '품격의 기본' },
      { item: '실크 블라우스', emoji: '👔', why: '우아함의 정수' },
      { item: '레더 탑핸들 백', emoji: '👝', why: '시간이 지날수록 빛나는 아이템' },
    ],
    colors: ['#2C3E50', '#8B7355', '#D4C5A9', '#1A1A1A', '#FFFFFF'],
    desc: '시간이 지나도 변하지 않는 스타일을 추구하는 당신. 클래식한 아이템과 어스 톤의 조화가 품격을 만듭니다.',
  },
  'neo-classic': {
    name: '네오 클래식', tags: ['#모던클래식', '#세련', '#밸런스'],
    wardrobe: [
      { item: '스트럭처드 코트', emoji: '🧥', why: '클래식의 현대적 해석' },
      { item: '하이웨이스트 트라우저', emoji: '👖', why: '모던한 비율 완성' },
      { item: '미디엄 체인 백', emoji: '👜', why: '트렌드와 클래식의 교차점' },
    ],
    colors: ['#1A1A1A', '#4A4A4A', '#C0B9A8', '#E8E0D0', '#FFFFFF'],
    desc: '클래식을 현대적으로 재해석하는 감각의 소유자. 균형 잡힌 스타일링으로 어디서든 빛나는 존재감을 만듭니다.',
  },
  'soft-romantic': {
    name: '소프트 로맨티스트', tags: ['#여성스러운', '#부드러운', '#꿈결'],
    wardrobe: [
      { item: '플로럴 원피스', emoji: '👗', why: '로맨틱의 상징' },
      { item: '니트 가디건', emoji: '🧶', why: '부드러운 레이어링' },
      { item: '리본 장식 플랫', emoji: '🩰', why: '사랑스러운 마무리' },
    ],
    colors: ['#F8BBD0', '#E1BEE7', '#FFF9C4', '#B3E5FC', '#FFFFFF'],
    desc: '부드러운 색감과 여성스러운 디테일을 사랑하는 로맨티스트. 꿈결 같은 분위기로 일상을 특별하게 만듭니다.',
  },
  'creative-disruptor': {
    name: '크리에이티브 디스럽터', tags: ['#파격', '#실험적', '#아트'],
    wardrobe: [
      { item: '비대칭 재킷', emoji: '🎨', why: '규칙을 깨는 시작' },
      { item: '볼드 스테이트먼트 주얼리', emoji: '💎', why: '표현의 자유' },
      { item: '아트 프린트 부츠', emoji: '👢', why: '걸작을 완성하는 터치' },
    ],
    colors: ['#000000', '#FF0000', '#FFFFFF', '#FFD700', '#8B00FF'],
    desc: '패션을 예술로 승화시키는 크리에이터. 파격적인 조합과 실험적 시도로 나만의 세계를 만들어갑니다.',
  },
};

/* ── Config ─────────────────────────────────────────────── */

const config: DemoConfig = {
  id: 'style-profiler',
  targetSlug: 'ai-style-profiler',
  industryId: 'fashion' as IndustryId,
  analyzeEmoji: '👗',
  analyzeDurationMs: 2500,
  steps: [
    {
      id: 'vibe',
      titleKey: '당신의 스타일 무드는?',
      subtitleKey: '가장 끌리는 스타일을 선택하세요',
      canProceed: (a) => !!a['vibe'],
    },
    {
      id: 'palette',
      titleKey: '선호하는 컬러 팔레트는?',
      subtitleKey: '최대 2개를 골라주세요',
      canProceed: (a) => Array.isArray(a['palette']) && (a['palette'] as string[]).length > 0,
    },
    {
      id: 'occasion',
      titleKey: '주로 어떤 상황에서 입나요?',
      subtitleKey: '가장 중요한 TPO를 골라주세요',
      canProceed: (a) => !!a['occasion'],
    },
  ],
};

/* ── Step 1 : Style Vibe ───────────────────────────────── */

function StepVibe({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['vibe'] as string | undefined;
  return (
    <div className="demo-choice-grid grid gap-3">
      {VIBES.map((v) => (
        <motion.button
          key={v.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUpdate('vibe', v.id)}
          type="button"
          aria-pressed={selected === v.id}
          className={cn(
            'demo-choice demo-custom-choice demo-style-vibe overflow-hidden rounded-2xl border text-left transition-colors',
            selected === v.id
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <div
            className="h-2 w-full rounded-t-2xl"
            style={{ background: `linear-gradient(to right, ${v.gradient[0]}, ${v.gradient[1]})` }}
          />
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="text-2xl">{v.emoji}</span>
            <div>
              <p className="text-base font-semibold text-slate-100">{v.label}</p>
              <p className="mt-0.5 text-sm text-slate-400">{v.desc}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Step 2 : Color Palette ────────────────────────────── */

function StepPalette({ answers, onUpdate }: DemoStepProps) {
  const selected = (answers['palette'] as string[] | undefined) ?? [];

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onUpdate('palette', selected.filter((s) => s !== id));
    } else if (selected.length < 2) {
      onUpdate('palette', [...selected, id]);
    }
  };

  return (
    <div>
      <p className="mb-4 text-right text-sm font-medium text-slate-400">
        {selected.length}/2
      </p>
      <div className="demo-choice-grid grid gap-3">
        {PALETTES.map((p) => {
          const active = selected.includes(p.id);
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(p.id)}
              type="button"
              aria-pressed={active}
              className={cn(
                'demo-choice demo-custom-choice demo-palette-choice flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors',
                active
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
              )}
            >
              <span className="text-sm font-semibold text-slate-200">{p.label}</span>
              <div className="flex gap-2">
                {p.colors.map((hex) => (
                  <div
                    key={hex}
                    className={cn(
                      'h-7 w-7 rounded-full',
                      hex === '#FFFFFF' && 'border border-slate-600',
                    )}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3 : Occasion ─────────────────────────────────── */

function StepOccasion({ answers, onUpdate }: DemoStepProps) {
  const selected = answers['occasion'] as string | undefined;
  return (
    <div className="demo-choice-grid grid grid-cols-2 gap-4">
      {OCCASIONS.map((o) => (
        <motion.button
          key={o.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUpdate('occasion', o.id)}
          type="button"
          aria-pressed={selected === o.id}
          className={cn(
            'demo-choice demo-custom-choice demo-occasion-choice flex flex-col items-center gap-2 rounded-2xl border px-4 py-6 text-center transition-colors',
            selected === o.id
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600',
          )}
        >
          <span className="text-3xl">{o.emoji}</span>
          <p className="text-sm font-semibold text-slate-100">{o.label}</p>
          <p className="text-xs text-slate-400">{o.desc}</p>
        </motion.button>
      ))}
    </div>
  );
}

/* ── Compute Result ────────────────────────────────────── */

function computeResult(answers: DemoAnswers): string {
  const vibe = answers['vibe'] as string | undefined;
  const palette = (answers['palette'] as string[] | undefined) ?? [];

  if (vibe === 'minimal') {
    if (palette.includes('monochrome') || palette.includes('neutral')) return 'nordic-minimalist';
    return 'modern-essentialist';
  }
  if (vibe === 'street') return 'urban-trendsetter';
  if (vibe === 'classic') {
    if (palette.includes('earth') || palette.includes('neutral')) return 'timeless-elegance';
    return 'neo-classic';
  }
  if (vibe === 'romantic') return 'soft-romantic';
  if (vibe === 'avantgarde') return 'creative-disruptor';
  return 'modern-essentialist';
}

/* ── Result Component ──────────────────────────────────── */

function archetypeFor(resultKey: string): ArchetypeData {
  return RESULTS[resultKey as ArchetypeKey] ?? RESULTS['modern-essentialist'];
}

const HEX = /^#[0-9A-F]{6}$/;

function isAiStyle(v: unknown): v is AiStyle {
  const o = v as AiStyle | null;
  return !!o && typeof o.name === 'string' && typeof o.desc === 'string'
    && Array.isArray(o.tags) && o.tags.every((t) => typeof t === 'string')
    && Array.isArray(o.colors) && o.colors.every((c) => typeof c === 'string' && HEX.test(c))
    && Array.isArray(o.wardrobe) && o.wardrobe.every((w) => !!w && typeof w.item === 'string' && typeof w.why === 'string'
      && (STYLE_ITEM_EMOJIS as readonly string[]).includes(w.emoji));
}

/** 화면·출력물이 그리는 아키타입 — AI 결과가 있으면 그것, 없으면 고정 결과 */
function archetypeView(resultKey: string, generated: unknown): ArchetypeData & { ai: boolean } {
  if (isAiStyle(generated)) {
    const { name, tags, wardrobe, colors, desc } = generated;
    return { name, tags, wardrobe, colors, desc, ai: true };
  }
  return { ...archetypeFor(resultKey), ai: false };
}

function ResultComponent({ resultKey, onRestart, pillarColor, generated }: DemoResultProps) {
  const tCommon = useTranslations('demos.common');
  const data = archetypeView(resultKey, generated);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="demo-custom-result flex flex-col items-center gap-8 text-center"
    >
      {/* Label */}
      <p className="demo-custom-result-eyebrow text-sm font-medium tracking-widest text-slate-400 uppercase">
        당신의 스타일 아키타입
      </p>

      {/* Archetype name */}
      <h2 className="demo-custom-result-title text-3xl font-bold" style={{ color: `var(--venue-accent, ${pillarColor})` }}>
        {data.name}
      </h2>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {data.tags.map((tag, i) => (
          <span
            key={`${i}-${tag}`}
            className="demo-result-tag rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm text-blue-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="max-w-sm text-sm leading-relaxed text-slate-300">{data.desc}</p>

      {/* Recommended palette */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          추천 컬러 팔레트
        </p>
        <div className="flex justify-center gap-3">
          {data.colors.map((hex, i) => (
            <div
              key={`${i}-${hex}`}
              className={cn(
                'h-9 w-9 rounded-full shadow-md',
                hex === '#FFFFFF' && 'border border-slate-600',
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Wardrobe recommendations */}
      <div className="w-full">
        <p className="mb-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          추천 워드로브
        </p>
        <div className="grid grid-cols-3 gap-3">
          {data.wardrobe.map((w, i) => (
            <div
              key={`${i}-${w.item}`}
              className="demo-result-item flex flex-col items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/50 px-3 py-5"
            >
              <span className="text-2xl">{w.emoji}</span>
              <p className="text-sm font-semibold text-slate-100">{w.item}</p>
              <p className="text-xs text-slate-400">{w.why}</p>
            </div>
          ))}
        </div>
      </div>

      {data.ai && (
        <p className="text-xs text-slate-500">AI가 당신의 답변으로 분석한 스타일이에요</p>
      )}

      {/* Actions */}
      <div className="demo-legacy-result-cta flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="demo-secondary-action rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500"
        >
          다시 취향 고르기
        </motion.button>
        <Link
          href={getServiceContactHref('ai-style-profiler')}
          className="demo-primary-action demo-accent-surface rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: `var(--venue-accent, ${pillarColor})` }}
        >
          {tCommon('ctaButton')}
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Export ──────────────────────────────────────────────── */

/* ── Print — 스타일 태그 영수증 ─────────────────────────── */

function getPrint(answers: DemoAnswers, resultKey: string, generated?: unknown): PrintSpec {
  const data = archetypeView(resultKey, generated);
  const palette = (answers['palette'] as string[] | undefined) ?? [];
  const vibe = VIBES.find((v) => v.id === answers['vibe']);
  const occasion = OCCASIONS.find((o) => o.id === answers['occasion']);
  const palettes = PALETTES.filter((p) => palette.includes(p.id)).map((p) => p.label);
  return {
    kind: 'receipt',
    eyebrow: '당신의 스타일 아키타입',
    title: data.name,
    sections: [
      { type: 'text', text: data.tags.join(' ') },
      {
        type: 'rows',
        title: '스타일 프로필',
        rows: [
          { label: '무드', value: vibe?.label ?? '-' },
          { label: '컬러', value: palettes.join(' · ') || '-' },
          { label: 'TPO', value: occasion?.label ?? '-' },
        ],
      },
      { type: 'list', title: '추천 워드로브', items: data.wardrobe.map((w) => `${w.item} (${w.why})`) },
      { type: 'text', title: '추천 컬러 코드', text: data.colors.join(' ') },
      { type: 'text', title: '스타일 노트', text: data.desc },
    ],
    footer: '내일 아침 옷장 앞에서 꺼내 보세요',
  };
}

/* ── AI 생성 ──────────────────────────────────────────── */

function generate(answers: DemoAnswers): Promise<AiStyle | null> {
  return requestDemoAi<AiStyle>(
    config.id,
    { experienceProfile: answers.experienceProfile, vibe: answers['vibe'], palette: answers['palette'], occasion: answers['occasion'] },
    { validate: isAiStyle }
  );
}

const StyleProfilerDemo: DemoModule = {
  config,
  StepComponents: [StepVibe, StepPalette, StepOccasion],
  ResultComponent,
  computeResult,
  getPrint,
  generate,
};

export default StyleProfilerDemo;
