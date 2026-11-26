#!/usr/bin/env node
/* 체험 카드 미리보기 화면 다시 찍기 — src/data/program-previews.ts 가 쓰는 그림을 만든다.
   acscent 데모(https://www.acscent.co.kr)의 실제 첫 화면을 열어 찍는다. 첫 화면만 여니 AI 호출 · 비용은 없다.
   · 영상판이 있는 프로그램은 영상판(lab=video)을 연다
   · 화면에만 깔리는 DEMO 워터마크(.kdm-watermark)는 숨긴다
   · 길잡이 인물이 움직이는 영상이라 장면을 6장 찍어 OUT/_frames 에 두고, 아래 TARGETS 의 frame 번째를 쓴다.
     눈을 감은 장면이 걸리면 _frames 를 보고 frame 번호를 바꿔 다시 돌린다.
   사용:  node scripts/redesign/program-previews.mjs [slug]      (slug 를 주면 그것만) */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'public', 'images', 'services', 'preview');
const FRAMES = path.join(ROOT, 'output', 'program-previews', '_frames'); // git 제외(output/)
const BASE = process.env.ACSCENT_BASE || 'https://www.acscent.co.kr';

// [네안데르 체험 slug, 기기, acscent 주소의 쿼리, 쓸 장면 번호]
const TARGETS = [
  ['ai-personal-color', 'kiosk', 'mode=ai-color&demo=1&lab=video', 0], // COLOR! 영상판
  ['ai-caricature-artist', 'kiosk', 'mode=studio-draw&demo=1&lab=video', 0], // DRAW! 영상판
  ['ai-scent-soulmate', 'kiosk', 'mode=ai-perfumer&demo=1&lab=video', 0], // SCENT! 영상판
  ['ai-sommelier', 'kiosk', 'mode=studio-sommelier-nh&demo=1&lab=video', 0], // SIP! 영상판
  ['ai-face-reading', 'booth', 'mode=nh-face&demo=1&camera=webcam&lab=video', 0], // FACE! 영상판
  ['ai-fortune-robot', 'booth', 'mode=nh-saju&demo=1&camera=webcam&lab=video', 1], // SAJU! 영상판
  ['ai-timecapsule-photo', 'booth', 'mode=later&demo=1&camera=webcam', 0], // LATER! (늘 영상판)
  ['ai-musicvideo-maker', 'booth', 'mode=music-video&demo=1', 0], // MV! (영상판 없음)
];

const only = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FRAMES, { recursive: true });
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
for (const [slug, device, query, frame] of TARGETS) {
  if (only && slug !== only) continue;
  const kiosk = device === 'kiosk';
  const ctx = await browser.newContext({ viewport: kiosk ? { width: 560, height: 996 } : { width: 1280, height: 720 }, deviceScaleFactor: 2, locale: 'ko-KR', permissions: ['camera', 'microphone'] });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${device}?${query}`, { waitUntil: 'load', timeout: 90000 });
  await page.addStyleTag({ content: '.kdm-watermark{display:none!important}' });
  await page.waitForTimeout(3500);
  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: path.join(FRAMES, `${slug}-${i}.png`) });
    await page.waitForTimeout(1700);
  }
  await ctx.close();
  // 기존 캡처(onsite)와 같은 크기: 키오스크 600×1067, 포토부스 1280×720
  const file = path.join(OUT, `${slug}.webp`);
  await sharp(path.join(FRAMES, `${slug}-${frame}.png`)).resize(kiosk ? 600 : 1280, kiosk ? 1067 : 720).webp({ quality: 84 }).toFile(file);
  console.log(`${slug}  ${device}  frame ${frame}  →  ${path.relative(ROOT, file)}  ${Math.round(fs.statSync(file).size / 1024)}KB`);
}
await browser.close();
