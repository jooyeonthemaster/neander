/* AI 과학 체험 키오스크 — 데모 화면과 생성 API가 함께 쓰는 주제·난이도 데이터 */

export type TopicId = 'physics' | 'chemistry' | 'biology' | 'earth';
export type LevelId = 'elem' | 'middle' | 'high';

export const PROJECTILE_TARGET_M = 30;
export const PROJECTILE_HIT_TOLERANCE_M = 2;
export function projectileRange(angle: number, speed: number): number {
  return speed * speed * Math.sin(2 * angle * Math.PI / 180) / 9.8;
}
export function isProjectileHit(range: number): boolean {
  return Number.isFinite(range) && Math.abs(range - PROJECTILE_TARGET_M) <= PROJECTILE_HIT_TOLERANCE_M;
}
export function projectileOutcome(range: number): string {
  return isProjectileHit(range) ? '30m 깃발 명중' : `목표에서 ${Math.abs(range - PROJECTILE_TARGET_M).toFixed(1)}m 차이`;
}

export interface Topic {
  label: string;
  emoji: string;
  desc: string;
  experiment: string;
  code: string;
  color: string;
  mission: Record<LevelId, string>;
  concept: Record<LevelId, string>;
  links: Record<LevelId, string>;
  terms: string[];
}

export const TOPICS: Record<TopicId, Topic> = {
  physics: {
    label: '물리',
    emoji: '🚀',
    desc: '포물선 운동',
    experiment: '발사각과 포물선 운동',
    code: 'PHY',
    color: '#38bdf8',
    mission: {
      elem: '발사 각도를 바꿔서 30m 깃발을 맞혀 보세요!',
      middle: '발사 각도와 속력에 따라 날아가는 거리가 어떻게 달라지는지 비교해 보세요.',
      high: '수평 도달 거리 R = v²·sin2θ / g 가 언제 최대가 되는지 확인해 보세요.',
    },
    concept: {
      elem: '공을 너무 낮게 던지면 금방 떨어지고, 너무 높게 던지면 위로만 올라가요. 비스듬히 45° 근처로 던질 때 가장 멀리 날아가요!',
      middle:
        '던진 물체는 앞으로 나아가면서 중력 때문에 아래로 끌려 포물선을 그려요. 공기 저항이 없다면 45°에서 가장 멀리 날아가고, 30°와 60°처럼 합이 90°인 두 각도는 같은 거리를 날아가요.',
      high:
        '수평 방향은 등속 운동(v·cosθ), 연직 방향은 중력 가속도 g = 9.8 m/s²의 등가속도 운동이에요. 체공 시간 t = 2v·sinθ/g, 수평 도달 거리 R = v²·sin2θ/g 이므로 sin2θ가 최대인 45°에서 R이 가장 커요.',
    },
    links: { elem: '물체의 운동', middle: '운동과 에너지', high: '역학 · 포물선 운동' },
    terms: ['포물선', '중력', '발사각', '수평 도달 거리'],
  },
  chemistry: {
    label: '화학',
    emoji: '🧪',
    desc: '산과 염기',
    experiment: '지시약으로 알아보는 pH',
    code: 'CHM',
    color: '#a3e635',
    mission: {
      elem: '여러 가지 용액을 넣어 보고 색깔이 어떻게 변하는지 관찰해요.',
      middle: 'pH에 따라 만능 지시약의 색이 어떻게 달라지는지 알아봐요.',
      high: '수소 이온 농도 [H⁺]와 pH의 관계(pH = −log[H⁺])를 확인해 보세요.',
    },
    concept: {
      elem: '레몬즙처럼 신맛이 나는 용액은 산성, 비눗물처럼 미끌미끌한 용액은 염기성이에요. 지시약은 용액의 성질에 따라 색깔이 바뀌는 "색깔 탐정"이에요.',
      middle:
        'pH는 0~14 사이의 숫자로 산성과 염기성의 정도를 나타내요. 7은 중성, 7보다 작으면 산성, 크면 염기성이에요. 만능 지시약은 산성에서 붉은색, 중성에서 초록색, 염기성에서 푸른색~보라색을 띠어요.',
      high:
        'pH = −log[H⁺] 이므로 pH가 1 작아지면 수소 이온 농도는 10배 커져요. 지시약은 약산(또는 약염기) 분자로, H⁺와 결합한 형태와 떨어진 형태의 색이 달라서 용액의 pH에 따라 색이 변해요.',
    },
    links: { elem: '산과 염기', middle: '산과 염기의 성질', high: '산·염기와 중화 반응' },
    terms: ['산성', '염기성', '중성', '지시약'],
  },
  biology: {
    label: '생물',
    emoji: '🌱',
    desc: '광합성',
    experiment: '빛의 세기와 광합성',
    code: 'BIO',
    color: '#4ade80',
    mission: {
      elem: '불빛을 밝게 하면 물풀에서 무슨 일이 생길까요? 조명을 조절해 보세요.',
      middle: '빛의 세기와 광합성 속도(산소 기포 수)의 관계를 알아봐요.',
      high: '광포화점을 찾아보세요 — 빛이 세져도 광합성 속도가 거의 늘지 않는 지점이에요.',
    },
    concept: {
      elem: '식물은 햇빛을 받아 스스로 양분을 만들어요. 이때 산소가 나오는데, 물속 식물에서는 작은 기포로 보여요. 빛이 밝을수록 기포가 더 많이 생겨요!',
      middle:
        '광합성은 빛에너지를 이용해 이산화 탄소와 물로 포도당을 만들고 산소를 내놓는 과정이에요. 빛이 셀수록 광합성 속도가 빨라져 산소 기포가 많아지지만, 어느 정도 이상이면 더 늘지 않아요.',
      high:
        '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O. 빛이 약할 때는 빛의 세기가 제한 요인이지만, 광포화점을 넘으면 CO₂ 농도나 온도가 제한 요인이 되어 광합성 속도가 더 이상 증가하지 않아요.',
    },
    links: { elem: '식물의 구조와 기능', middle: '식물과 에너지', high: '생명 활동과 에너지' },
    terms: ['광합성', '엽록체', '산소', '광포화점'],
  },
  earth: {
    label: '지구과학',
    emoji: '🌋',
    desc: '판 구조론',
    experiment: '움직이는 판과 지형 변화',
    code: 'EAR',
    color: '#fb923c',
    mission: {
      elem: '땅덩어리(판)를 밀고 당겨 보세요. 어떤 일이 일어날까요?',
      middle: '판의 경계에서 어떤 지형과 지각 변동이 생기는지 관찰해요.',
      high: '발산형·수렴형 경계에서 일어나는 지각 변동을 비교해 보세요.',
    },
    concept: {
      elem: '지구의 겉은 여러 조각(판)으로 나뉘어 아주 천천히 움직여요. 판끼리 부딪히면 산이 솟고 지진이 나고, 멀어지면 그 틈으로 마그마가 올라와요.',
      middle:
        '지구 표면은 10여 개의 판으로 이루어져 있고, 맨틀 대류 때문에 1년에 수 cm씩 움직여요. 판의 경계에서는 지진과 화산 활동이 활발해요. 판이 멀어지면 해령, 부딪히면 해구와 습곡 산맥이 생겨요.',
      high:
        '발산형 경계에서는 맨틀 물질이 상승해 새 해양 지각이 만들어지고(해령·열곡대), 수렴형 경계에서는 밀도가 큰 해양판이 섭입하며 해구와 화산대가 생겨요. 대륙판끼리 충돌하면 거대한 습곡 산맥이 형성돼요.',
    },
    links: { elem: '화산과 지진', middle: '지권의 변화', high: '판 구조론' },
    terms: ['판', '맨틀 대류', '해령', '해구'],
  },
};

export const LEVELS: Record<LevelId, { label: string; emoji: string; desc: string }> = {
  elem: { label: '초등', emoji: '🐣', desc: '그림과 놀이로 쉽게' },
  middle: { label: '중등', emoji: '📘', desc: '교과 개념까지' },
  high: { label: '고등', emoji: '🎓', desc: '공식과 그래프로 깊게' },
};

/** /api/demo-ai/science-kiosk 응답 */
export interface AiScienceNote {
  /** 방문객의 실제 측정값을 짚으며 원리를 설명 (난이도 맞춤) */
  concept: string;
  /** 오늘 배운 핵심 용어 3~5개 */
  terms: string[];
  /** 집이나 학교에서 해 볼 다음 탐구 한 문장 */
  nextChallenge: string;
}
