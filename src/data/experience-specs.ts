/**
 * 체험별 운영 스펙 카드 (/services/[slug])
 *
 * - input: 체험 데모가 실제로 쓰는 입력 장치 (데모 코드의 cameraStep/micStep 기준)
 * - output: 결과를 건네는 방식 (체험 소개 문구 기준)
 * - 모든 체험은 클라우드 AI를 쓰므로 전원과 인터넷이 필요하다 (카드에 항상 표시)
 * - 실측 수치(1인 소요 시간, 시간당 처리 인원, 점유 면적, 운영 인력)는 확인된 값만 넣는다.
 *   비워 두면 카드에 "상담 시 안내"로 표시된다. 추정값을 넣지 말 것.
 */

export type SpecInput = 'camera' | 'mic' | 'touch';
export type SpecOutput = 'print' | 'qr' | 'screen';

export interface ExperienceSpec {
  input: SpecInput[];
  output: SpecOutput[];
  /** 1인 체험 소요 시간 (분) */
  minutesPerGuest?: number;
  /** 기기 1대 기준 시간당 체험 인원 */
  guestsPerHour?: number;
  /** 권장 설치 공간, 예: '2m × 2m' */
  footprint?: string;
  /** 현장 운영 인력 (명) */
  staff?: number;
}

export const EXPERIENCE_SPECS: Record<string, ExperienceSpec> = {
  'ai-personal-color': { input: ['touch'], output: ['print', 'qr'] }, // AI 퍼스널 컬러 진단
  'ai-skincare-analysis': { input: ['camera', 'touch'], output: ['print'] }, // AI 스킨케어 분석관
  'ai-virtual-makeup': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 버추얼 메이크업 스튜디오
  'ai-scent-soulmate': { input: ['touch'], output: ['print'] }, // AI 향수 소울메이트
  'ai-nail-designer': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 네일 디자이너
  'ai-sommelier': { input: ['touch'], output: ['print', 'qr'] }, // AI 소믈리에
  'ai-cocktail-creator': { input: ['touch'], output: ['print'] }, // AI 칵테일 크리에이터
  'ai-barista-matching': { input: ['touch'], output: ['print'] }, // AI 바리스타 매칭
  'ai-taste-dna': { input: ['touch'], output: ['print', 'qr'] }, // AI 미각 DNA 프로파일
  'ai-style-profiler': { input: ['touch'], output: ['print'] }, // AI 스타일 프로파일러
  'ai-runway-photobooth': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 런웨이 포토부스
  'ai-fashion-timemachine': { input: ['camera', 'touch'], output: ['print'] }, // AI 패션 타임머신
  'ai-coord-recommender': { input: ['camera', 'touch'], output: ['qr'] }, // AI 코디 추천 키오스크
  'ai-idol-makeup-booth': { input: ['camera', 'touch'], output: ['print'] }, // AI 아이돌 메이크업 포토부스
  'ai-fan-photocard': { input: ['camera', 'touch'], output: ['print'] }, // AI 팬 포토카드 메이커
  'ai-musicvideo-maker': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 뮤직비디오 메이커
  'ai-celeb-lookalike': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 연예인 닮은꼴 진단
  'ai-voice-lab': { input: ['mic', 'touch'], output: ['qr'] }, // AI 보이스 체험관
  'ai-graduation-booth': { input: ['camera', 'touch'], output: ['print'] }, // AI 졸업 포토부스
  'ai-future-career': { input: ['touch'], output: ['print', 'qr'] }, // AI 미래직업 진단
  'ai-science-kiosk': { input: ['touch'], output: ['print'] }, // AI 과학 체험 키오스크
  'ai-history-travel': { input: ['camera', 'touch'], output: ['print'] }, // AI 역사 속 나
  'ai-timecapsule-photo': { input: ['camera', 'touch'], output: ['qr'] }, // AI 타임캡슐 포토
  'ai-fortune-robot': { input: ['touch'], output: ['print'] }, // AI 원소 운세
  'ai-face-reading': { input: ['camera', 'touch'], output: ['print'] }, // AI 관상 분석
  'ai-palm-reading': { input: ['camera', 'touch'], output: ['print'] }, // AI 손금 로봇
  'ai-caricature-artist': { input: ['camera', 'touch'], output: ['print'] }, // AI 캐리커처 아티스트
  'ai-aura-reading': { input: ['camera', 'touch'], output: ['print'] }, // AI 오라 리딩
  'ai-brand-avatar': { input: ['camera', 'touch'], output: ['print'] }, // AI 브랜드 아바타 메이커
  'ai-product-experience': { input: ['touch'], output: ['print'] }, // AI 제품 인터랙티브 체험관
  'ai-team-chemistry': { input: ['touch'], output: ['print'] }, // AI 팀 케미 분석
  'ai-vision-wall': { input: ['touch'], output: ['screen'] }, // AI 비전 월
  'ai-business-card': { input: ['camera', 'touch'], output: ['print', 'qr'] }, // AI 명함 디자이너
  'ai-hanbok-booth': { input: ['camera', 'touch'], output: ['print'] }, // AI 한복 포토부스
  'ai-traditional-painter': { input: ['camera', 'touch'], output: ['print'] }, // AI 전통 화가
  'ai-heritage-timemachine': { input: ['camera', 'touch'], output: ['screen'] }, // AI 문화유산 타임머신
  'ai-travel-style': { input: ['touch'], output: ['print', 'qr'] }, // AI 여행 성향 진단
  'ai-wedding-booth': { input: ['camera', 'touch'], output: ['print'] }, // AI 웨딩 포토부스
  'ai-couple-chemistry': { input: ['touch'], output: ['print'] }, // AI 커플 케미 진단
  'ai-future-family': { input: ['camera', 'touch'], output: ['print'] }, // AI 미래 가족 상상
  'ai-memory-movie': { input: ['camera', 'touch'], output: ['qr'] }, // AI 추억 무비 메이커
};

export function getExperienceSpec(slug: string): ExperienceSpec | undefined {
  return EXPERIENCE_SPECS[slug];
}
