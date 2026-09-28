import { z } from 'zod';
import { BASE_SYSTEM, generateImage, generateJson, themeLine } from '../openrouter';
import { captureImage, defineSpec } from '../types';
import { FF_CHILDREN, FF_FEATURE_IDS, familyMotifMix } from '@/data/demo-ai/future-family';
import { hashString } from '@/components/demo/kit/core';

// 두 사진은 허구 캐릭터의 시각 참고 자료이며 유전·성격·발달 예측에 쓰지 않는다.

const input = z.object({
  partnerA: captureImage,
  partnerB: captureImage,
  child: z.enum(FF_CHILDREN),
});

const percent = z.number().int().min(20).max(80);

const text = z.object({
  summary: z.string().min(10).max(160),
  features: z.object(Object.fromEntries(FF_FEATURE_IDS.map((id) => [id, percent])) as Record<(typeof FF_FEATURE_IDS)[number], typeof percent>),
  firstWord: z.string().min(1).max(8),
  play: z.string().min(2).max(14),
  dream: z.string().min(2).max(16),
  personality: z.array(z.string().min(2).max(10)).min(3).max(3),
});

const FEATURE_LABELS: Record<(typeof FF_FEATURE_IDS)[number], string> = {
  eyes: '눈매', brows: '눈썹', nose: '코', mouth: '입매', face: '얼굴형', smile: '웃는 모습',
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'features', 'firstWord', 'play', 'dream', 'personality'],
  properties: {
    summary: { type: 'string', description: '두 사람의 어떤 점을 어떻게 섞어 상상했는지 따뜻한 설명 1~2문장, 90자 이내' },
    features: {
      type: 'object',
      additionalProperties: false,
      required: [...FF_FEATURE_IDS],
      properties: Object.fromEntries(
        FF_FEATURE_IDS.map((id) => [id, { type: 'integer', description: `${FEATURE_LABELS[id]}: 허구의 A 모티브 배합 35~65. B는 100-A. A 우세와 B 우세를 섞고 전부 50으로 쓰지 않음. 실제 유전·닮을 확률 아님` }])
      ),
    },
    firstWord: { type: 'string', description: '가상의 그림책 속 캐릭터가 하는 첫 인사. 발달 예측이 아닌 허구의 대사, 4자 이내' },
    play: { type: 'string', description: '사용자가 고른 가족 이야기 주제에 맞는 허구의 놀이, 10자 이내. 얼굴에서 추론 금지' },
    dream: { type: 'string', description: '이모지 1개 + 그림책 캐릭터의 상상 역할, 12자 이내. 실제 장래 예측 금지' },
    personality: { type: 'array', items: { type: 'string' }, description: '선택한 그림책 주제에서 나온 허구 캐릭터 설정 3개, 각 6자 이내. 실제 사람의 성격 추정 금지' },
  },
};

const SYSTEM = `${BASE_SYSTEM}
이번 역할은 '미래 가족 상상' 부스의 AI 작가입니다. 첫 번째 사진은 A, 두 번째 사진은 B입니다.
두 사진은 허구 캐릭터를 그리는 시각 자료로만 사용합니다. features는 시각 모티브의 창작 배합값일 뿐 유전 확률·혈연·실제 미래 외모의 예측이 아닙니다. summary에서도 '상상 속 캐릭터'와 '창작 배합'임을 분명히 씁니다.
firstWord·play·dream·personality는 모두 가상의 그림책 설정입니다. 첨부된 체험 브리프의 familyStory(숲속 탐험/그림/우주 놀이)와 사용자가 직접 선택한 이야기 주제를 따라 작성하고 얼굴·성별·외모에서는 성격·지능·능력·건강·발달·관심사를 추정하지 않습니다. 선택이 없으면 무해한 동화 설정을 명시적으로 창작합니다.
두 사람을 엄마·아빠나 남편·아내로 단정하지 말고 'A님', 'B님'으로 부릅니다. 외모를 평가하거나 순위를 매기지 않고, 인종·국적·나이를 추측해 쓰지 않습니다.
사진에 얼굴이 잘 보이지 않으면 구체적 외모 특징을 만들어 내지 말고 일반적인 허구 캐릭터로 설명합니다.`;

const CHILD_PROMPT: Record<(typeof FF_CHILDREN)[number], string> = {
  boy: 'one cheerful little boy, a preschool toddler about 4 years old',
  girl: 'one cheerful little girl, a preschool toddler about 4 years old',
  twins: 'twin siblings about 4 years old — one boy and one girl — standing side by side, cheek to cheek',
};

export default defineSpec({
  input,
  bucket: 'image',
  async run({ partnerA, partnerB, child }) {
    const childLabel = child === 'twins' ? '쌍둥이 남매' : child === 'girl' ? '딸' : '아들';
    const imagePrompt = `The two reference photos are visual references A and B for a fictional storybook character. Create an entirely imaginary warm portrait of ${CHILD_PROMPT[child]}. This is creative fiction, never a genetic or future-child prediction.
Borrow visible visual motifs from both references to design a new fictional character. Do not infer ancestry, ethnicity, health, personality or any real family relationship. Make the fictional character clearly read as about 4: round chubby cheeks, small toddler proportions.
Style: soft, bright, dreamy family-photo look with gentle studio light, a slightly painterly finish so it reads as an imaginative AI portrait. Waist-up, centered, looking at the camera with a happy smile, wearing simple cute pastel clothes, plain soft cream-to-pink background.
Only the child${child === 'twins' ? 'ren' : ''} in the picture — do not include the adults. Wholesome, age-appropriate. No text, letters, logos or watermarks.`;
    const textPrompt = `상상 가족 그림책의 허구 캐릭터 카드를 만들어 주세요. 캐릭터 구성: ${childLabel} (그림책 속 4살 캐릭터).
사진은 외형의 창작 모티브에만 사용하며, 이야기·놀이·역할은 선택한 체험 브리프에서 가져오세요. 실제 미래·유전·성격·발달을 예측하지 마세요.
${themeLine()}`;
    const [image, parsed] = await Promise.all([
      generateImage({ prompt: imagePrompt, images: [partnerA, partnerB], aspectRatio: '3:4' }),
      generateJson({ name: 'future_family', system: SYSTEM, prompt: textPrompt, schema, images: [partnerA, partnerB] }).then((r) => text.parse(r)),
    ]);
    return { image, ...parsed, features: familyMotifMix(hashString(`${partnerA.slice(-128)}|${partnerB.slice(-128)}|${child}`), parsed.features) };
  },
});
