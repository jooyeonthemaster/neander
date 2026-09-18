/* ─────────────────────────────────────────────────────────
   NEANDERco.  |  Demo Kit
   카메라/마이크 캡처, 선택형 스텝, 사진 효과, 결과 레이아웃을 묶은 데모 제작 도구
   ───────────────────────────────────────────────────────── */

export * from './core';
export {
  FACE_POINTS,
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  captureFrom,
  createSampleCapture,
  renderLook,
  type PhotoLook,
  type PhotoPaint,
  type PixelEffect,
} from './photo';
export { handPose, isThumbLeft, PALM_CENTER, WRIST, type FingerPose, type HandSide, type HandWhich } from './hand';
export { defineDemo, cameraStep, micStep, choiceStep, textStep, sliderStep } from './steps';
export type { DemoStepDef, ChoiceOption, TextField, SliderField } from './steps';
export { ResultShell, Panel, ScoreBars, TraitChips, InfoGrid, RadarChart, ProcessedPhoto } from './ResultParts';
export { PrintStage } from './PrintStage';
export type { PrintSpec, ReceiptSpec, ReceiptSection, PhotoPrintSpec, PrintMeta } from './print';
