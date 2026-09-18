/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit — hand guide geometry
   카메라 가이드(손 윤곽), 스캔 메시, 샘플 이미지, 결과 오버레이(네일·손금)가
   모두 같은 손 모양을 쓰도록 좌표를 한곳에 둔다.
   좌표계: 3:4 프레임을 300×400으로 본 값. 기본형은 "엄지가 왼쪽"이고,
   thumbLeft=false면 좌우 반전한다.
   ───────────────────────────────────────────────────────── */

export type HandWhich = 'left' | 'right';
export type HandSide = 'palm' | 'back';

export interface FingerSpec {
  name: string;
  /** 손가락 뿌리 (손바닥과 만나는 점) */
  bx: number;
  by: number;
  /** 뿌리→끝 길이, 폭, 기울기(도, 시계방향 +) */
  len: number;
  w: number;
  angle: number;
}

/** 엄지 → 소지 순서, 엄지가 왼쪽인 기본형 */
export const FINGERS: FingerSpec[] = [
  { name: '엄지', bx: 92, by: 262, len: 90, w: 44, angle: -50 },
  { name: '검지', bx: 100, by: 172, len: 120, w: 38, angle: -9 },
  { name: '중지', bx: 138, by: 165, len: 132, w: 40, angle: -1 },
  { name: '약지', bx: 176, by: 168, len: 124, w: 38, angle: 7 },
  { name: '소지', bx: 210, by: 190, len: 96, w: 32, angle: 18 },
];

/** 손바닥 윤곽 (엄지가 왼쪽인 기본형) */
export const PALM_PATH =
  'M85 176 C82 236 88 306 104 390 L198 390 C213 306 220 246 218 196 C217 172 204 160 150 158 C104 158 86 164 85 176 Z';

/** 손가락 캡슐이 손바닥 안쪽으로 겹쳐 들어가는 길이 (윤곽이 끊기지 않게) */
const FINGER_OVERLAP = 34;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** 카메라 셀피 화면(좌우 반전) 기준으로 엄지가 왼쪽에 보이는지 */
export function isThumbLeft(side: HandSide, which: HandWhich): boolean {
  // 손바닥을 보이면 오른손 엄지가 왼쪽, 손등을 보이면 반대
  return side === 'palm' ? which === 'right' : which === 'left';
}

/** SVG rect 속성 — 손가락 하나를 뿌리 기준으로 회전한 캡슐 */
export function fingerRect(f: FingerSpec) {
  return {
    x: f.bx - f.w / 2,
    y: f.by - f.len,
    width: f.w,
    height: f.len + FINGER_OVERLAP,
    rx: f.w / 2,
    transform: `rotate(${f.angle} ${f.bx} ${f.by})`,
  };
}

/** 손톱 영역 — 손끝에서 손가락 축을 따라 조금 내려온 둥근 사각형 */
export function nailRect(f: FingerSpec) {
  const w = f.w * 0.62;
  const h = f.w * 0.78;
  const inset = f.w * 0.16;
  return {
    x: f.bx - w / 2,
    y: f.by - f.len + inset,
    width: w,
    height: h,
    rx: w * 0.42,
    transform: `rotate(${f.angle} ${f.bx} ${f.by})`,
  };
}

export interface FingerPose {
  name: string;
  /** 손끝 위치 (%) */
  tip: { x: number; y: number };
  /** 손톱 중심 위치 (%) */
  nail: { x: number; y: number };
  /** 손가락 뿌리 (%) */
  base: { x: number; y: number };
  /** 기울기 (도) — 반전 시 부호가 바뀐다 */
  angle: number;
  /** 손가락 폭 (프레임 너비 대비 %) */
  width: number;
}

/** 결과 화면 오버레이용 손가락 좌표 (%) */
export function handPose(thumbLeft: boolean): FingerPose[] {
  const fx = (x: number) => (thumbLeft ? x : 300 - x);
  return FINGERS.map((f) => {
    const a = rad(f.angle);
    const tipX = f.bx + f.len * Math.sin(a);
    const tipY = f.by - f.len * Math.cos(a);
    const nailOffset = f.w * 0.16 + f.w * 0.39;
    const nailX = f.bx + (f.len - nailOffset) * Math.sin(a);
    const nailY = f.by - (f.len - nailOffset) * Math.cos(a);
    return {
      name: f.name,
      tip: { x: fx(tipX) / 3, y: tipY / 4 },
      nail: { x: fx(nailX) / 3, y: nailY / 4 },
      base: { x: fx(f.bx) / 3, y: f.by / 4 },
      angle: thumbLeft ? f.angle : -f.angle,
      width: f.w / 3,
    };
  });
}

/** 손바닥 중심·손목 (%) */
export const PALM_CENTER = { x: 50, y: 69 };
export const WRIST = { x: 50, y: 95 };
