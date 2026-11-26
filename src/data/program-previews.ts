import { getOnsiteFlow, type OnsiteDevice, type OnsiteFlow } from './onsite-flows';

/* ─────────────────────────────────────────────────────────
   체험 카드에 마우스를 올렸을 때 기기 화면에 띄우는 첫 화면.
   기준은 acscent 데모 탭의 프로그램이다 — 키오스크 기본 화면(/kiosk-demo) · 키오스크 영상판(/kiosk-demo/video) · 포토부스(/booth-demo).
   · 영상판(길잡이 인물이 안내하는 판)이 있는 프로그램은 영상판 첫 화면을 먼저 쓴다 (2026-11-21 사용자 지시)
   · 2026-11-26 사용자 「최신 포트폴리오 PDF 기준으로」 — 포토부스 13 · 키오스크 19 모두 포트폴리오 라인업과 같은 첫 화면.
     그림은 output/experience-portfolio-2026-11-site 의 `THUMBS=1 node build.mjs`(thumbs.json)에서 가져와 preview/<slug>.webp 로 줄여 넣었다.
     실제 영상판이 아직 없는 프로그램은 「영상판 콘셉트 화면」(concept: true, 제작 예정 화면 예시)이다.
   · 여기 없는 체험은 기본 화면 캡처(onsite-flows.ts 의 start)를 쓴다
   · 그림은 실제 데모 주소의 첫 화면을 찍은 것이다 (화면에만 깔리는 DEMO 워터마크는 숨김).
     다시 찍기: node scripts/redesign/program-previews.mjs
   onsite-flows.ts 는 스크립트가 만드는 파일이라 고치지 않고, 카드 미리보기에서 덮어쓸 것만 여기에 둔다.
   ───────────────────────────────────────────────────────── */

export interface ProgramPreview {
  device: OnsiteDevice;
  src: string;
  /** 첫 화면을 6초 녹화한 반복 영상 (영상판만) — public/videos/preview */
  clip?: string;
}

interface PreviewSource extends ProgramPreview {
  /** acscent 프로그램 이름 (데모 탭의 카드) */
  program: string;
  /** 영상판인지 */
  video: boolean;
  /** 영상판 콘셉트 화면(제작 예정 화면 예시)인지 — 실제 프로그램 화면이 아니다 */
  concept?: boolean;
}

const at = (slug: string) => `/images/services/preview/${slug}.webp`;
const clip = (slug: string) => `/videos/preview/${slug}.mp4`;

export const PROGRAM_PREVIEWS: Record<string, PreviewSource> = {
  // ── 실제 영상판 (acscent 데모를 끝까지 진행해 찍은 첫 화면 · 반복 영상) ──
  'ai-scent-soulmate': { device: 'kiosk', src: at('ai-scent-soulmate'), program: 'SCENT! 영상판 — 하린의 향수 하우스', video: true },
  'ai-timecapsule-photo': { device: 'booth', src: at('ai-timecapsule-photo'), clip: clip('ai-timecapsule-photo'), program: '영상판 — 길잡이 나중 박사의 타임캡슐', video: true },
  'ai-fortune-robot': { device: 'booth', src: at('ai-fortune-robot'), clip: clip('ai-fortune-robot'), program: '영상판 — 길잡이 관상감 천문 관원', video: true },
  'ai-face-reading': { device: 'booth', src: at('ai-face-reading'), clip: clip('ai-face-reading'), program: '영상판 — 길잡이 도화서 화원', video: true },
  'ai-personal-color': { device: 'kiosk', src: at('ai-personal-color'), clip: clip('ai-personal-color'), program: '영상판 — 길잡이 컬러리스트 서하', video: true },
  'ai-caricature-artist': { device: 'kiosk', src: at('ai-caricature-artist'), clip: clip('ai-caricature-artist'), program: '영상판 — 길잡이 거리 화가 모루', video: true },
  'ai-sommelier': { device: 'kiosk', src: at('ai-sommelier'), clip: clip('ai-sommelier'), program: '영상판 — 길잡이 소믈리에 해나의 와이너리 여정', video: true },
  // ── 영상판 콘셉트 화면 (제작 예정 — 포트폴리오 PDF 의 콘셉트 화면 첫 장, concept) ──
  'ai-idol-makeup-booth': { device: 'booth', src: at('ai-idol-makeup-booth'), program: '영상판 콘셉트 — 길잡이 메이크업 디렉터 수아', video: true, concept: true },
  'ai-future-family': { device: 'booth', src: at('ai-future-family'), program: '영상판 콘셉트 — 길잡이 가족 사진관 주인 다정', video: true, concept: true },
  'ai-fashion-timemachine': { device: 'booth', src: at('ai-fashion-timemachine'), program: '영상판 콘셉트 — 길잡이 패션 타임 스타일리스트 레트', video: true, concept: true },
  'ai-hanbok-booth': { device: 'booth', src: at('ai-hanbok-booth'), program: '영상판 콘셉트 — 길잡이 한복 디자이너 고운', video: true, concept: true },
  'ai-runway-photobooth': { device: 'booth', src: at('ai-runway-photobooth'), program: '영상판 콘셉트 — 길잡이 런웨이 디렉터 마리', video: true, concept: true },
  'ai-graduation-booth': { device: 'booth', src: at('ai-graduation-booth'), program: '영상판 콘셉트 — 길잡이 졸업 사진가 선우', video: true, concept: true },
  'ai-history-travel': { device: 'booth', src: at('ai-history-travel'), program: '영상판 콘셉트 — 길잡이 기록관 사관 한빛', video: true, concept: true },
  'ai-brand-avatar': { device: 'booth', src: at('ai-brand-avatar'), program: '영상판 콘셉트 — 길잡이 아바타 제작자 픽셀', video: true, concept: true },
  'ai-traditional-painter': { device: 'booth', src: at('ai-traditional-painter'), program: '영상판 콘셉트 — 길잡이 화백 청암', video: true, concept: true },
  'ai-wedding-booth': { device: 'booth', src: at('ai-wedding-booth'), program: '영상판 콘셉트 — 길잡이 웨딩 플래너 하늘', video: true, concept: true },
  'ai-future-career': { device: 'kiosk', src: at('ai-future-career'), program: '영상판 콘셉트 — 길잡이 진로 탐험가 나래', video: true, concept: true },
  'ai-celeb-lookalike': { device: 'kiosk', src: at('ai-celeb-lookalike'), program: '영상판 콘셉트 — 길잡이 포토 디렉터 레아', video: true, concept: true },
  'ai-palm-reading': { device: 'kiosk', src: at('ai-palm-reading'), program: '영상판 콘셉트 — 길잡이 손 이야기꾼 온새', video: true, concept: true },
  'ai-skincare-analysis': { device: 'kiosk', src: at('ai-skincare-analysis'), program: '영상판 콘셉트 — 길잡이 스킨케어 연구원 이슬', video: true, concept: true },
  'ai-style-profiler': { device: 'kiosk', src: at('ai-style-profiler'), program: '영상판 콘셉트 — 길잡이 스타일리스트 제이', video: true, concept: true },
  'ai-couple-chemistry': { device: 'kiosk', src: at('ai-couple-chemistry'), program: '영상판 콘셉트 — 길잡이 커플 포토플래너 다온', video: true, concept: true },
  'ai-nail-designer': { device: 'kiosk', src: at('ai-nail-designer'), program: '영상판 콘셉트 — 길잡이 네일 아티스트 보라', video: true, concept: true },
  'ai-cocktail-creator': { device: 'kiosk', src: at('ai-cocktail-creator'), program: '영상판 콘셉트 — 길잡이 바텐더 미아', video: true, concept: true },
  'ai-barista-matching': { device: 'kiosk', src: at('ai-barista-matching'), program: '영상판 콘셉트 — 길잡이 바리스타 하준', video: true, concept: true },
  'ai-taste-dna': { device: 'kiosk', src: at('ai-taste-dna'), program: '영상판 콘셉트 — 길잡이 미식 탐험가 단비', video: true, concept: true },
  'ai-coord-recommender': { device: 'kiosk', src: at('ai-coord-recommender'), program: '영상판 콘셉트 — 길잡이 코디네이터 시우', video: true, concept: true },
  'ai-voice-lab': { device: 'kiosk', src: at('ai-voice-lab'), program: '영상판 콘셉트 — 길잡이 사운드 엔지니어 도윤', video: true, concept: true },
  'ai-aura-reading': { device: 'kiosk', src: at('ai-aura-reading'), program: '영상판 콘셉트 — 길잡이 오라 포토그래퍼 유리', video: true, concept: true },
  'ai-team-chemistry': { device: 'kiosk', src: at('ai-team-chemistry'), program: '영상판 콘셉트 — 길잡이 팀 코치 한결', video: true, concept: true },
  'ai-business-card': { device: 'kiosk', src: at('ai-business-card'), program: '영상판 콘셉트 — 길잡이 그래픽 디자이너 준', video: true, concept: true },
  'ai-travel-style': { device: 'kiosk', src: at('ai-travel-style'), program: '영상판 콘셉트 — 길잡이 여행 가이드 바다', video: true, concept: true },
};

/** 카드 미리보기 화면 — 영상판 등 따로 정한 것이 먼저, 없으면 기본 화면 캡처 */
export function getProgramPreview(slug: string): ProgramPreview | undefined {
  const picked = PROGRAM_PREVIEWS[slug];
  if (picked) return picked;
  const flow = getOnsiteFlow(slug);
  return flow ? { device: flow.device, src: flow.start } : undefined;
}

/** 온라인 견적 목록 썸네일 — 서비스 소개 카드와 같은 실제 프로그램 화면.
 *  그 기기의 화면(영상판 먼저)이 없으면 다른 기기 화면, 그것도 없으면 undefined (그림으로 대신) */
export function getProgramScreen(slug: string, device: OnsiteDevice): string | undefined {
  const preview = PROGRAM_PREVIEWS[slug];
  const flow = getOnsiteFlow(slug);
  if (preview?.device === device && (preview.video || flow?.device !== device)) return preview.src;
  if (flow?.device === device) return flow.start;
  return preview?.src ?? flow?.start;
}

/* 상품 상세 「체험 순서」에 쓰는 영상판 데모 과정 — acscent 데모 주소를 끝까지 진행해 찍은 화면 (2026-11-21).
   SAJU! 영상판: https://www.acscent.co.kr/booth?mode=nh-saju&demo=1&camera=webcam&lab=video
   화면 속 인물은 AI 로 만든 예시 인물, DEMO 워터마크는 화면에서만 숨겼다. */
const F = '/images/services/flow/saju-video';
/** 과정 전체를 한 번 녹화한 영상과 각 단계가 시작하는 시각(초). AI 생성 대기 23초는 잘라 냈다 */
export type VideoFlow = OnsiteFlow & {
  video?: string;
  /** AI 대기 구간을 빨리 감았는지 (설명 문구에 밝힌다) */
  fastForward?: boolean;
  /** 빨리 감은 구간이 AI 대기가 아닐 때 설명 문구 (예: 장면 이동) */
  fastNote?: { ko: string; en: string };
  stepAt?: number[];
  /** 단계 이름을 바꿔 부를 때 (기본은 ONSITE_STEP_LABELS) — sub 는 작게 붙는 보조 설명 */
  stepLabels?: ({ ko: string; en: string; subKo?: string; subEn?: string } | undefined)[];
  /** 손님이 받아 가는 접는 카드(가로) — 「손님이 받아 가는 것」에서 인화 사진 대신 크게 보여 준다 */
  card?: string;
};
export const SAJU_VIDEO_FLOW: VideoFlow = {
  device: 'booth',
  start: `${F}/start.webp`,
  result: `${F}/result.webp`,
  // AI 생성 대기 21초는 3.5배 빠르게 감았다 (잘라 내면 화면이 끊겨 보였다)
  video: '/videos/flow/saju-video-v2.mp4',
  fastForward: true,
  stepAt: [0, 11, 17.7, 29.3, 36.5, 52.4],
  // 마지막 단계는 사진 인화가 주인공, 휴대폰 받기는 덧붙임 (2026-11-21 사용자)
  stepLabels: [undefined, { ko: '생년월일 입력', en: 'Birth date' }, undefined, undefined, undefined, { ko: '사진 인화', en: 'Photo print', subKo: '휴대폰으로도 저장', subEn: 'also saved to phone' }],
  prints: [`${F}/print.webp`],
  card: `${F}/card.webp`,
  phone: `${F}/phone.webp`,
  steps: [
    { kind: 'start', src: `${F}/start.webp` },
    { kind: 'input', src: `${F}/input.webp` },
    { kind: 'camera', src: `${F}/confirm.webp` },
    { kind: 'loading', src: `${F}/loading.webp` },
    { kind: 'result', src: `${F}/result.webp` },
    { kind: 'receipt', src: `${F}/send.webp` },
  ],
};

/* COLOR! 영상판 — https://www.acscent.co.kr/kiosk?mode=ai-color&demo=1&lab=video (2026-11-21 녹화).
   AI 분석은 9초 정도라 빨리 감지 않았다. 영수증은 같은 회차의 영수증 미리보기 그림 */
const C = '/images/services/flow/color-video';
export const COLOR_VIDEO_FLOW: VideoFlow = {
  device: 'kiosk',
  start: `${C}/start.webp`,
  result: `${C}/result.webp`,
  video: '/videos/flow/color-video-v2.mp4',
  stepAt: [0, 11.8, 20.6, 29, 38, 42.5],
  stepLabels: [undefined, { ko: '기본 정보', en: 'Basic info' }, undefined, { ko: 'AI 분석', en: 'AI analysis' }, undefined, { ko: '영수증 출력', en: 'Receipt print' }],
  receipt: `${C}/receipt.webp`,
  steps: [
    { kind: 'start', src: `${C}/start.webp` },
    { kind: 'input', src: `${C}/input.webp` },
    { kind: 'camera', src: `${C}/camera.webp` },
    { kind: 'loading', src: `${C}/loading.webp` },
    { kind: 'result', src: `${C}/result.webp` },
    { kind: 'receipt', src: `${C}/receipt.webp` },
  ],
};

/* 나머지 영상판 — 2026-11-21 데모 주소를 끝까지 진행해 녹화. AI 생성 구간은 3.5배 빨리 감았다 */
const vflow = (folder: string, device: OnsiteDevice, at: number[], kinds: OnsiteFlow['steps'][number]['kind'][], labels?: VideoFlow['stepLabels'], files?: string[]): VideoFlow => {
  const base = `/images/services/flow/${folder}`;
  const names = files ?? kinds.map((k) => k);
  return {
    device, start: `${base}/start.webp`, result: `${base}/result.webp`,
    video: `/videos/flow/${folder}.mp4`, fastForward: true, stepAt: at, stepLabels: labels,
    steps: kinds.map((kind, i) => ({ kind, src: `${base}/${names[i]}.webp` })),
  };
};
export const DRAW_VIDEO_FLOW = vflow('draw-video', 'kiosk', [0, 8.8, 19.8, 25.5, 29.2, 35.3], ['start', 'camera', 'confirm', 'input', 'loading', 'result'],
  [undefined, undefined, undefined, { ko: '스타일 고르기', en: 'Pick a style' }, undefined, undefined], ['start', 'camera', 'confirm', 'input', 'loading', 'result']);
export const LATER_VIDEO_FLOW = vflow('later-video', 'booth', [0, 6.7, 23.8, 31.6], ['start', 'camera', 'loading', 'result'],
  [undefined, undefined, { ko: 'AI 생성 · 시간 여행', en: 'AI · time travel' }, { ko: '결과 · 10·20·30년 뒤', en: 'Result · 10, 20, 30 years on' }]);
export const SIP_VIDEO_FLOW = vflow('sip-video', 'kiosk', [0, 13.3, 40.8, 49.2], ['start', 'input', 'loading', 'result'],
  [undefined, { ko: '취향 고르기', en: 'Taste' }, { ko: 'AI 추천', en: 'AI pick' }, { ko: '오늘의 한 잔', en: 'Today’s glass' }]);
export const FACE_VIDEO_FLOW = vflow('face-video', 'booth', [0, 5.5, 14.5, 18.6, 20.3, 27.6], ['start', 'camera', 'confirm', 'input', 'loading', 'result'],
  [undefined, undefined, undefined, { ko: '주제 고르기', en: 'Pick a theme' }, undefined, { ko: '새해 초상', en: 'New Year portrait' }]);

/* CHEESE! 스튜디오 — AI 없는 기본 네 컷 포토부스의 영상판 (포토그래퍼 온유).
   https://www.acscent.co.kr/booth?mode=cheese&demo=1&camera=webcam 을 끝까지 진행해 녹화 (2026-11-25).
   AI 체험 slug 가 없는 프로그램이라 VIDEO_FLOWS 가 아니라 AI 포토부스 상품 페이지 「BASIC BOOTH」 칸에서만 쓴다.
   장면 이동(인물이 걸어가는 구간) 세 곳만 2.5배 빨리 감았다. 폰 저장 업로드는 녹화 때 가짜 응답으로 막아 인화물 QR 은 열리지 않는 예시 주소 */
const CH = '/images/services/flow/cheese-video';
export const CHEESE_VIDEO_FLOW: VideoFlow = {
  device: 'booth',
  start: `${CH}/start.webp`,
  result: `${CH}/result.webp`,
  video: '/videos/flow/cheese-video.mp4',
  fastForward: true,
  fastNote: { ko: '장면 이동 구간은 빨리 감았습니다', en: 'scene changes fast-forwarded' },
  stepAt: [0, 5, 23.1, 26.3, 35.8],
  stepLabels: [
    undefined,
    { ko: '네 컷 촬영', en: 'Four shots' },
    { ko: '네 컷 확인', en: 'Check the four' },
    { ko: '프레임 고르기', en: 'Pick a frame' },
    { ko: '사진 인화', en: 'Photo print', subKo: '휴대폰으로도 저장', subEn: 'also saved to phone' },
  ],
  prints: [`${CH}/print.webp`],
  steps: [
    { kind: 'start', src: `${CH}/start.webp` },
    { kind: 'camera', src: `${CH}/camera.webp` },
    { kind: 'confirm', src: `${CH}/confirm.webp` },
    { kind: 'input', src: `${CH}/input.webp` },
    { kind: 'receipt', src: `${CH}/result.webp` },
  ],
};

/** 체험 상세 「체험 순서」 — 영상판이 있는 체험은 카드 미리보기와 같은 영상판 녹화를 쓴다 */
export const VIDEO_FLOWS: Record<string, VideoFlow> = {
  'ai-personal-color': COLOR_VIDEO_FLOW,
  'ai-fortune-robot': SAJU_VIDEO_FLOW,
  'ai-caricature-artist': DRAW_VIDEO_FLOW,
  'ai-timecapsule-photo': LATER_VIDEO_FLOW,
  'ai-sommelier': SIP_VIDEO_FLOW,
  'ai-face-reading': FACE_VIDEO_FLOW,
};

/* 체험 카드에 마우스를 올리면 기기 화면이 1.5초마다 다음 단계로 넘어간다 (2026-11-23 사용자 지시).
   첫 장은 카드 미리보기 첫 화면, 다음은 영상판 과정(있으면) → 없으면 기본 화면 과정.
   SCENT! 은 영상판 과정을 아직 못 찍어 기본 화면(kiosk-studio-scent) 녹화에서 촬영~질문 단계를 골랐다 —
   그 녹화는 결과까지 가지 못해 질문 단계에서 끝난다. MV! 는 단계 화면이 없어 첫 화면만 둔다. */
const SCENT_STEPS = ['camera', 'confirm', 'analysis', 'input', 'input-2', 'input-3'].map((n) => `/images/services/flow/scent-basic/${n}.webp`);
const EXTRA_STEPS: Record<string, string[]> = { 'ai-scent-soulmate': SCENT_STEPS };

/** 카드 기기 화면에 차례로 띄울 그림 — 첫 장은 getProgramPreview 의 첫 화면 */
export function getProgramSteps(slug: string): string[] {
  const preview = getProgramPreview(slug);
  if (!preview) return [];
  const rest = EXTRA_STEPS[slug]
    ?? (VIDEO_FLOWS[slug] ?? getOnsiteFlow(slug))?.steps.filter((s) => s.kind !== 'start').map((s) => s.src)
    ?? [];
  return [preview.src, ...rest.filter((src, i) => src !== preview.src && rest.indexOf(src) === i)];
}
