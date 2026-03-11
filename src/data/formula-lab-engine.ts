import {
  type BrandBrief,
  type FormulaResults,
  type EmotionScore,
  type Formula,
  type FormulaIngredient,
  type ConsumerPrediction,
  KEYWORD_EMOTION_MAP,
  EMOTION_INGREDIENT_MAP,
  INGREDIENTS,
  EMOTION_TYPES,
} from './formula-lab-data';

// ─── Seeded Random ────────────────────────────────────────────────────
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

// ─── Step 1: OPT-16 Emotion Vector Generation ────────────────────────
function generateEmotionVector(brief: BrandBrief, rand: () => number): EmotionScore[] {
  const scores = new Array(16).fill(0);
  const desc = brief.emotionalDescription.toLowerCase();

  for (const [keyword, types] of Object.entries(KEYWORD_EMOTION_MAP)) {
    if (desc.includes(keyword)) {
      types.forEach(t => { scores[t] += 18 + rand() * 12; });
    }
  }

  // Context-based boosts
  const contextBoosts: Record<string, number[]> = {
    daily: [0, 1, 12], office: [7, 12, 1], evening: [4, 6, 2],
    date: [4, 10, 2], relaxation: [0, 8, 11], special: [2, 6, 15],
    travel: [1, 13, 9],
  };
  (contextBoosts[brief.usageContext] || []).forEach(t => { scores[t] += 8 + rand() * 6; });

  // Gender bias
  if (brief.targetGender === 'female') {
    [2, 5, 10].forEach(t => { scores[t] += 4 + rand() * 3; });
  } else if (brief.targetGender === 'male') {
    [7, 15, 1].forEach(t => { scores[t] += 4 + rand() * 3; });
  }

  // Add noise
  scores.forEach((_, i) => { scores[i] += rand() * 4; });

  // Normalize to 100
  const total = scores.reduce((a: number, b: number) => a + b, 0);
  if (total === 0) {
    scores[0] = 30; scores[1] = 20; scores[12] = 20;
    scores[8] = 15; scores[3] = 15;
  }
  const finalTotal = scores.reduce((a: number, b: number) => a + b, 0);

  return scores.map((s: number, i: number) => ({
    typeId: i,
    score: Math.round((s / finalTotal) * 1000) / 10,
  }));
}

// ─── Step 2-3: Formula Generation (CVAE-PA + CINN) ───────────────────
function generateFormulas(
  emotionVector: EmotionScore[],
  brief: BrandBrief,
  rand: () => number,
): Formula[] {
  const sorted = [...emotionVector].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);

  const budgetMultiplier = { standard: 1, premium: 1.6, luxury: 2.4 }[brief.budgetLevel];
  const variants = [
    { id: 'A', suffix: 'Balanced Accord', suffixKo: '밸런스드 어코드', type: 'balanced' },
    { id: 'B', suffix: 'Bold Statement', suffixKo: '볼드 스테이트먼트', type: 'bold' },
    { id: 'C', suffix: 'Nuanced Layer', suffixKo: '뉘앙스드 레이어', type: 'nuanced' },
  ] as const;

  return variants.map(variant => {
    const ingredientIds = new Set<string>();
    const weights: Record<string, number> = {};

    // Select ingredients based on dominant emotions
    top3.forEach((em, rank) => {
      const affinityIds = EMOTION_INGREDIENT_MAP[em.typeId] || [];
      const count = variant.type === 'bold' && rank === 0 ? 4 : variant.type === 'nuanced' ? 3 : 3;
      affinityIds.slice(0, count).forEach(id => {
        ingredientIds.add(id);
        const w = variant.type === 'bold' && rank === 0
          ? em.score * 1.5
          : variant.type === 'nuanced'
            ? em.score * (0.8 + rand() * 0.4)
            : em.score;
        weights[id] = (weights[id] || 0) + w;
      });
    });

    // Ensure note balance (top/middle/base)
    const selected = Array.from(ingredientIds);
    const byNote = { top: 0, middle: 0, base: 0 };
    selected.forEach(id => {
      const ing = INGREDIENTS.find(i => i.id === id);
      if (ing) byNote[ing.noteType]++;
    });

    // Add missing note types
    (['top', 'middle', 'base'] as const).forEach(nt => {
      if (byNote[nt] === 0) {
        const candidates = INGREDIENTS.filter(i => i.noteType === nt && !ingredientIds.has(i.id));
        if (candidates.length) {
          const pick = candidates[Math.floor(rand() * candidates.length)];
          ingredientIds.add(pick.id);
          weights[pick.id] = 5 + rand() * 10;
        }
      }
    });

    // Normalize percentages
    const totalW = Object.values(weights).reduce((a, b) => a + b, 0);
    const ingredients: FormulaIngredient[] = Array.from(ingredientIds).map(id => ({
      ingredientId: id,
      percentage: Math.round((weights[id] / totalW) * 1000) / 10,
    })).sort((a, b) => b.percentage - a.percentage);

    // Calculate cost
    const cost = ingredients.reduce((sum, fi) => {
      const ing = INGREDIENTS.find(i => i.id === fi.ingredientId);
      const tierCost = { 1: 800, 2: 2400, 3: 5500 }[ing?.costTier || 1];
      return sum + tierCost * (fi.percentage / 100);
    }, 0) * budgetMultiplier;

    const matchScore = variant.type === 'balanced' ? 87 + rand() * 8
      : variant.type === 'bold' ? 82 + rand() * 10
      : 79 + rand() * 12;

    const brandSlug = brief.brandName.slice(0, 3).toUpperCase() || 'ONS';

    return {
      id: `${brandSlug}-${variant.id}`,
      name: `${brief.brandName || 'Untitled'} ${variant.suffix}`,
      nameKo: `${brief.brandName || '미정'} ${variant.suffixKo}`,
      concept: generateConcept(top3, variant.type, brief),
      matchScore: Math.round(matchScore * 10) / 10,
      ingredients,
      estimatedCostPer10ml: Math.round(cost * 100) / 100,
      stabilityScore: Math.round((85 + rand() * 12) * 10) / 10,
      uniquenessIndex: Math.round((60 + rand() * 35) * 10) / 10,
      ifraCompliant: true,
      longevityHours: Math.round((5 + rand() * 7) * 10) / 10,
      sillageRating: (['intimate', 'moderate', 'strong', 'enormous'] as const)[
        Math.floor(rand() * 3)
      ],
      character: generateCharacter(top3),
    };
  });
}

function generateConcept(
  topEmotions: EmotionScore[],
  type: string,
  brief: BrandBrief,
): string {
  const e1 = EMOTION_TYPES[topEmotions[0].typeId].nameKo;
  const e2 = EMOTION_TYPES[topEmotions[1].typeId].nameKo;
  if (type === 'balanced') {
    return `${e1}과(와) ${e2}의 조화로운 균형을 추구하며, ${brief.usageContext === 'evening' ? '저녁 시간' : '일상'}의 감성을 담은 어코드`;
  }
  if (type === 'bold') {
    return `${e1}을(를) 극대화한 대담한 해석으로, 강렬한 첫 인상과 깊은 잔향을 설계한 시그니처`;
  }
  return `${e1}, ${e2}, ${EMOTION_TYPES[topEmotions[2].typeId].nameKo}의 다층적 전개로 시간에 따라 변화하는 복합 레이어`;
}

function generateCharacter(topEmotions: EmotionScore[]): string {
  const names = topEmotions.slice(0, 2).map(e => EMOTION_TYPES[e.typeId].nameKo);
  return `${names[0]} · ${names[1]}`;
}

// ─── Step 4-5: Consumer Prediction (BO-OC + SOP) ─────────────────────
function generateConsumerPrediction(
  emotionVector: EmotionScore[],
  brief: BrandBrief,
  rand: () => number,
): ConsumerPrediction {
  const basePref = 60 + rand() * 20;
  const ci = 2.5 + rand() * 2;

  const ageMap: Record<string, number> = {
    '10late': 0.08, '20early': 0.22, '20late': 0.34,
    '30early': 0.18, '30late': 0.10, '40s': 0.05, '50plus': 0.03,
  };

  // Boost target age
  const targetAge = brief.targetAge;
  if (ageMap[targetAge]) ageMap[targetAge] = Math.min(ageMap[targetAge] + 0.15, 0.5);

  // Normalize
  const totalAge = Object.values(ageMap).reduce((a, b) => a + b, 0);
  const ageBreakdown: Record<string, number> = {};
  for (const [k, v] of Object.entries(ageMap)) {
    ageBreakdown[k] = Math.round((v / totalAge) * 1000) / 10;
  }

  const genderFemale = brief.targetGender === 'female' ? 68 + rand() * 15
    : brief.targetGender === 'male' ? 25 + rand() * 15
    : 45 + rand() * 10;

  const positionings = [
    '매스 프레스티지 시장 내 차별화된 감성 포지셔닝',
    '니치 향수 시장의 접근성 높은 엔트리 포인트',
    '프리미엄 라이프스타일 브랜드로의 확장 가능성',
    '밀레니얼/Z세대 타깃의 감성 중심 포지셔닝',
  ];

  return {
    preferenceRate: Math.round(basePref * 10) / 10,
    confidenceInterval: [
      Math.round((basePref - ci) * 10) / 10,
      Math.round((basePref + ci) * 10) / 10,
    ],
    targetAudienceMatch: Math.round((30 + rand() * 20) * 10) / 10,
    purchaseIntentRate: Math.round((basePref * 0.65 + rand() * 8) * 10) / 10,
    repurchaseRate: Math.round((basePref * 0.45 + rand() * 10) * 10) / 10,
    genderBreakdown: {
      female: Math.round(genderFemale * 10) / 10,
      male: Math.round((100 - genderFemale) * 10) / 10,
    },
    ageBreakdown,
    competitiveEdge: Math.round((65 + rand() * 25) * 10) / 10,
    marketPositioning: positionings[Math.floor(rand() * positionings.length)],
  };
}

// ─── Main Engine: Generate Full Results ───────────────────────────────
export function generateFormulaResults(brief: BrandBrief): FormulaResults {
  const seed = `${brief.brandName}-${brief.emotionalDescription}-${brief.targetAge}`;
  const rand = seededRandom(seed);

  const emotionVector = generateEmotionVector(brief, rand);
  const sorted = [...emotionVector].sort((a, b) => b.score - a.score);
  const dominantEmotions = sorted.slice(0, 3);

  const totalCandidates = 600 + Math.floor(rand() * 400);
  const afterCINN = Math.floor(totalCandidates * (0.03 + rand() * 0.04));
  const afterBOOC = Math.min(afterCINN, 3 + Math.floor(rand() * 5));

  const formulas = generateFormulas(emotionVector, brief, rand);
  const consumerPrediction = generateConsumerPrediction(emotionVector, brief, rand);

  const ageLabel = {
    '10late': '10대 후반', '20early': '20대 초반', '20late': '20대 후반',
    '30early': '30대 초반', '30late': '30대 후반', '40s': '40대', '50plus': '50대 이상',
  }[brief.targetAge] || brief.targetAge;

  const genderLabel = { female: '여성', male: '남성', unisex: '유니섹스' }[brief.targetGender];
  const topEmotion = EMOTION_TYPES[dominantEmotions[0].typeId];

  return {
    emotionVector,
    dominantEmotions,
    formulas,
    consumerPrediction,
    totalCandidatesGenerated: totalCandidates,
    candidatesAfterCINN: afterCINN,
    candidatesAfterBOOC: afterBOOC,
    targetInsight: `타깃 고객(${ageLabel} ${genderLabel}) 중 '${topEmotion.nameKo}' 감성에 가장 강하게 반응하는 유형은 Type ${topEmotion.id}이며, 해당 인구통계의 ${consumerPrediction.targetAudienceMatch}%가 이 프로파일에 해당합니다.`,
    processingTimeSec: Math.round((14 + rand() * 8) * 10) / 10,
  };
}
