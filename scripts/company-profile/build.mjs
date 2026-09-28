#!/usr/bin/env node
/**
 * 네안데르 회사소개서 PDF 빌드
 *
 *   node scripts/company-profile/build.mjs [--png <dir>]
 *
 * 입력: scripts/company-profile/profile.html
 * 출력: public/downloads/neander-company-profile.pdf
 *
 * 필요 환경 (macOS, 레포에 playwright 의존성을 추가하지 않음):
 *   PLAYWRIGHT_DIR   playwright 패키지가 있는 node_modules 경로
 *                    기본값: ~/.npm/_npx/e41f203b7505f1fb/node_modules
 *   CHROME_PATH      Chromium 실행 파일 경로
 *                    기본값: ~/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/
 *                            Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing
 *   macOS `sips` 로 이미지를 축소 JPG 로 변환합니다 (PDF 용량 관리).
 *
 * --png <dir> 을 주면 각 페이지를 PNG 로도 저장합니다 (시각 검수용).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const SRC = path.join(HERE, 'profile.html');
const OUT = path.join(ROOT, 'public/downloads/neander-company-profile.pdf');
const HOME = os.homedir();

const PW_DIR = process.env.PLAYWRIGHT_DIR || path.join(HOME, '.npm/_npx/e41f203b7505f1fb/node_modules');
const CHROME = process.env.CHROME_PATH || path.join(HOME,
  'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');

const require = createRequire(path.join(PW_DIR, 'noop.js'));
const { chromium } = require('playwright');

const pngIdx = process.argv.indexOf('--png');
const PNG_DIR = pngIdx > -1 ? path.resolve(process.argv[pngIdx + 1]) : null;

// 1) 이미지 축소: ../../public/... 로 참조된 이미지를 최대 1200px JPG 로 변환해 임시 폴더에 둡니다.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'neander-profile-'));
let html = fs.readFileSync(SRC, 'utf8');
const MAX_PX = 1200;
html = html.replace(/src="(\.\.\/\.\.\/public\/[^"]+)"/g, (m, rel) => {
  const abs = path.resolve(HERE, rel);
  if (!/\.(webp|jpe?g|png)$/i.test(abs)) return m;
  const out = path.join(work, path.basename(abs).replace(/\.\w+$/, '.jpg'));
  if (!fs.existsSync(out)) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', String(MAX_PX), abs, '--out', out], { stdio: 'ignore' });
  }
  return `src="${pathToFileURL(out).href}"`;
});
// 폰트 등 나머지 상대경로는 절대 file:// URL 로 바꿉니다.
html = html.replace(/url\('(\.\.\/\.\.\/public\/[^']+)'\)/g, (_, rel) => `url('${pathToFileURL(path.resolve(HERE, rel)).href}')`);
const tmpHtml = path.join(work, 'profile.html');
fs.writeFileSync(tmpHtml, html);

// 2) 렌더링
const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
try {
  const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });

  // overflow 검사: 페이지 박스 밖으로 넘친 요소를 경고합니다.
  const overflow = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const r = pg.getBoundingClientRect();
      pg.querySelectorAll('*').forEach((el) => {
        const e = el.getBoundingClientRect();
        if (e.width && (e.bottom > r.bottom + 0.5 || e.right > r.right + 0.5)) out.push(`p${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}">`);
      });
    });
    return out;
  });
  if (overflow.length) console.warn('overflow:\n  ' + overflow.slice(0, 20).join('\n  '));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.pdf({ path: OUT, format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });

  if (PNG_DIR) {
    fs.mkdirSync(PNG_DIR, { recursive: true });
    const n = await page.locator('.page').count();
    for (let i = 0; i < n; i++) {
      await page.locator('.page').nth(i).screenshot({ path: path.join(PNG_DIR, `page-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${kb} KB)`);
} finally {
  await browser.close();
  fs.rmSync(work, { recursive: true, force: true });
}
