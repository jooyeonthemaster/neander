#!/usr/bin/env python3
"""output/onsite-assets (git 제외) 에서 사이트에 쓸 그림만 골라 public/ 으로 옮기고
src/data/onsite-flows.ts 를 만든다.

- 공개된 체험(src/data/experiences.ts 의 published)만 단계 화면을 올린다. 단계는 시작 → 촬영(또는 선택) → AI 생성 → 결과 → 휴대폰 받기 중 있는 것.
- 공개되지 않은 프로그램은 라인업 타일용 첫 화면 · 결과 · 인화물만 올린다.
- 결과가 어색한 것(README 참고)은 결과 · 인화물을 올리지 않는다.
다시 돌려도 결과가 같다:  python3 scripts/redesign/onsite-assets.py
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'output', 'onsite-assets')
PUB = os.path.join(ROOT, 'public', 'images', 'services', 'onsite')
URL = '/images/services/onsite'

# src/data/experiences.ts 의 공개 목록 (publishedSlugs + EXPERIENCE_PHOTOS)
exp = open(os.path.join(ROOT, 'src', 'data', 'experiences.ts'), encoding='utf8').read()
photos = open(os.path.join(ROOT, 'src', 'data', 'experience-photos.ts'), encoding='utf8').read()
block = exp[exp.index('const publishedSlugs'):]
block = block[:block.index(']);')]
PUBLISHED = set(re.findall(r"'(ai-[a-z0-9-]+)'", block)) | set(re.findall(r"^  '(ai-[a-z0-9-]+)': \{", photos, flags=re.M))

NO_RESULT = {'ai-future-family', 'ai-wedding-booth'}   # 결과 얼굴이 어색함 — 결과 · 인화물은 쓰지 않는다
SKIP = {'ai-scent-soulmate'}                            # 조향은 현장 사진 중심 (화면은 질문까지만 있음)

manifest = json.load(open(os.path.join(SRC, 'manifest.json'), encoding='utf8'))
flows = {}
if os.path.isdir(PUB):
    shutil.rmtree(PUB)
os.makedirs(PUB)

def put(slug, rel, name):
    os.makedirs(os.path.join(PUB, slug), exist_ok=True)
    shutil.copyfile(os.path.join(SRC, rel), os.path.join(PUB, slug, name))
    return f'{URL}/{slug}/{name}'

for slug, s in manifest['services'].items():
    kinds = [st['kind'] for st in s['steps']]
    if slug in SKIP or 'result' not in kinds:
        continue
    by = {}
    for st in s['steps']:
        by.setdefault(st['kind'], []).append(st['src'])
    usable_result = slug not in NO_RESULT
    entry = {'device': s['device'], 'steps': []}
    entry['start'] = put(slug, by['start'][0], 'start.webp')
    if usable_result:
        entry['result'] = put(slug, by['result'][0], 'result.webp')
    if slug in PUBLISHED:
        order = [('start', entry['start'])]
        # 촬영 화면이 있으면 그것을, 없으면 첫 질문 화면을 두 번째 단계로 쓴다
        first_action = next((st for st in s['steps'] if st['kind'] == 'camera'), None) or next((st for st in s['steps'] if st['kind'] == 'input'), None)
        if first_action:
            order.append((first_action['kind'], put(slug, first_action['src'], 'action.webp')))
        if 'loading' in by:
            order.append(('loading', put(slug, by['loading'][0], 'loading.webp')))
        else:
            later = [st for st in s['steps'] if st['kind'] == 'input' and (not first_action or st['src'] != first_action['src'])]
            if later:
                order.append(('input', put(slug, later[-1]['src'], 'choose.webp')))
        if usable_result:
            order.append(('result', entry['result']))
            if 'phone' in by:
                order.append(('phone', put(slug, by['phone'][0], 'send.webp')))
        entry['steps'] = [{'kind': k, 'src': src} for k, src in order]
        if usable_result and s.get('phone'):
            entry['phone'] = put(slug, s['phone'], 'phone.webp')
        if usable_result and s.get('receipt'):
            entry['receipt'] = put(slug, s['receipt'], 'receipt.webp')
    if usable_result and s.get('prints'):
        entry['prints'] = [put(slug, p, f'print-{i}.webp') for i, p in enumerate(s['prints'])]
    flows[slug] = entry

for name in ('scene-kiosk', 'scene-booth', 'scene-phone'):
    shutil.copyfile(os.path.join(SRC, 'images', 'scenes', f'{name}.webp'), os.path.join(PUB, f'{name}.webp'))

labels = manifest['stepLabels']
out = ['''/* ─────────────────────────────────────────────────────────
   실제 체험 프로그램 화면 (행사장 기기에서 도는 프로그램을 끝까지 진행해 캡처한 것)
   scripts/redesign/onsite-assets.py 가 output/onsite-assets 에서 골라 만든다 — 직접 고치지 말 것.

   · 화면 속 인물은 AI 로 만든 가상 예시 인물이다. 실제 행사 사진(experience-photos.ts · 포트폴리오)과 섞어 쓰지 않는다.
   · 장면 3장(ONSITE_SCENES)은 실물을 참고한 생성 이미지라 「체험 콘셉트 이미지」 표시를 붙인다.
   · 기기 스펙은 확인된 것만: 키오스크 = 세로 터치 화면 · 웹캠 · 80mm 영수증 프린터(결과 QR 24시간 보관),
     포토부스 = 가로 화면 · DSLR 카메라 · 4×6 사진 프린터 · 조명(결과 QR 7일 보관).
   ───────────────────────────────────────────────────────── */

export type OnsiteDevice = 'kiosk' | 'booth';
export type OnsiteStepKind = 'start' | 'guide' | 'input' | 'camera' | 'confirm' | 'loading' | 'result' | 'receipt' | 'phone';

export interface OnsiteFlow {
  device: OnsiteDevice;
  /** 첫 화면 */
  start: string;
  /** 결과 화면 (없으면 대표 그림으로 쓰지 않는다) */
  result?: string;
  /** 상세 페이지 단계 화면 — 공개된 체험만 */
  steps: { kind: OnsiteStepKind; src: string }[];
  /** QR 로 연 휴대폰 받기 페이지 */
  phone?: string;
  /** 80mm 영수증 */
  receipt?: string;
  /** 포토부스 4×6 인화 디자인 2종 */
  prints?: string[];
}
''']
out.append('export const ONSITE_STEP_LABELS: Record<OnsiteStepKind, { ko: string; en: string }> = ' + json.dumps(labels, ensure_ascii=False, indent=2) + ';\n')
out.append("export const ONSITE_SCENES = {\n  kiosk: '%s/scene-kiosk.webp',\n  booth: '%s/scene-booth.webp',\n  phone: '%s/scene-phone.webp',\n} as const;\n" % (URL, URL, URL))
out.append('export const ONSITE_FLOWS: Record<string, OnsiteFlow> = ' + json.dumps(flows, ensure_ascii=False, indent=2) + ';\n')
out.append('''export function getOnsiteFlow(slug: string): OnsiteFlow | undefined {
  return ONSITE_FLOWS[slug];
}
''')
open(os.path.join(ROOT, 'src', 'data', 'onsite-flows.ts'), 'w', encoding='utf8').write('\n'.join(out))
n = sum(len(fs) for _, _, fs in os.walk(PUB))
print(f'{len(flows)} flows ({sum(1 for f in flows.values() if f["steps"])} with steps) · {n} files')
