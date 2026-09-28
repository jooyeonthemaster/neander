/* AI 음색 분석 — 데모 화면과 생성 API가 함께 쓰는 선택지·결과 타입 */

export const VOICE_TYPE_IDS = ['bass', 'baritone', 'tenor', 'alto', 'soprano'] as const;
export type VoiceType = (typeof VOICE_TYPE_IDS)[number];

/** 측정 음높이 → 음색 유형 (브라우저 측정값 기준, AI 결과가 없을 때도 이것으로 고른다) */
export const VOICE_TYPE_RANGES: Record<VoiceType, { label: string; range: string }> = {
  bass: { label: '울림 있는 저음', range: '115Hz 미만' },
  baritone: { label: '부드러운 중저음', range: '115–155Hz' },
  tenor: { label: '청량한 미성', range: '155–200Hz' },
  alto: { label: '허스키 알토', range: '200–245Hz' },
  soprano: { label: '반짝이는 하이 톤', range: '245Hz 이상' },
};

export const VOICE_GOALS = { sing: '노래 스타일 (어울리는 장르와 보컬 타입)', speak: '말하는 목소리 (발표·내레이션 음색)' } as const;
export type VoiceGoal = keyof typeof VOICE_GOALS;

/** MediaRecorder MIME → OpenRouter input_audio format */
export const VOICE_AUDIO_FORMATS = ['webm', 'mp4', 'ogg', 'wav', 'mp3', 'aac'] as const;
export type VoiceAudioFormat = (typeof VOICE_AUDIO_FORMATS)[number];

export function audioFormatOf(mime: string): VoiceAudioFormat | null {
  const m = mime.toLowerCase();
  if (m.includes('webm')) return 'webm';
  if (m.includes('mp4') || m.includes('m4a')) return 'mp4';
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('wav')) return 'wav';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('aac')) return 'aac';
  return null;
}

/** /api/demo-ai/voice-lab 응답 (목소리가 들렸을 때) */
export interface AiVoice {
  observed: true;
  type: VoiceType;
  title: string;
  desc: string;
  heardNote: string;
  style: string;
  scores: { delivery: number; expression: number; stability: number };
  genres: string[];
  reference: string;
  /** 모델이 녹음에서 알아들은 문장 (녹음이 없으면 빈 문자열) */
  transcript: string;
  /** 실제 녹음을 듣고 쓴 결과인지 (false면 측정 수치만 보고 씀) */
  listened: boolean;
}
