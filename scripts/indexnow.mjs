#!/usr/bin/env node
/**
 * IndexNow로 검색엔진(Bing·네이버·Yandex 등 참여 엔진 공유)에 바뀐 페이지를 알린다.
 * Bing 색인은 ChatGPT 검색 답변의 출처로도 쓰인다.
 *
 *   node scripts/indexnow.mjs                 # 운영 sitemap.xml 의 모든 주소
 *   node scripts/indexnow.mjs /insights/foo   # 특정 경로만
 *
 * 키 파일: public/<KEY>.txt (내용 = KEY). 배포된 뒤에 실행해야 한다.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HOST = 'neander.co.kr'
const SITE = `https://${HOST}`
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const keyFile = readdirSync(path.join(root, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) throw new Error('public/<32자리 hex>.txt 키 파일이 없습니다')
const key = readFileSync(path.join(root, 'public', keyFile), 'utf8').trim()

const live = await fetch(`${SITE}/${keyFile}`)
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`${SITE}/${keyFile} 가 아직 배포되지 않았습니다 — 배포 후 다시 실행하세요`)
}

let urls = process.argv.slice(2).map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? '' : '/'}${p}`))
if (urls.length === 0) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  // 영문 주소도 함께 알린다 (sitemap 에는 hreflang 대체 주소로만 들어 있다)
  urls.push(...[...xml.matchAll(/hreflang="en" href="([^"]+)"/g)].map((m) => m[1]))
  urls = [...new Set(urls)]
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls.slice(0, 10000) }),
})
console.log(`IndexNow ${res.status} ${res.statusText} — ${urls.length}개 주소`)
if (res.status >= 300) console.log(await res.text())
