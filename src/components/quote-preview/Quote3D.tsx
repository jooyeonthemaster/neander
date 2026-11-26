'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PERFUME, type Lang } from '@/lib/quote/catalog';
import type { QuoteInput } from '@/lib/quote/engine';
import { perfumeRackCount } from '@/lib/quote-preview/perfume-furniture';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   온라인 견적 3D 배치 미리보기 (2026-11 개편)
   고른 견적(QuoteInput) 그대로 기기와 운영 인력을 놓아 본다 — 금액과 그림이 같은 값을 읽는다.
   · 사람은 운영 인력(조향사 · 조수 · 현장 인력)만 그린다. 손님은 그리지 않는다 (2026-11-21 사용자 지시)
   · 치수는 고객이 고른 부스(3×3 · 6×3)일 때만 적는다. 그 밖의 면적 · 시간 같은 수치는 지어내지 않는다
   · 끌어서 돌리고, 위 · 정면으로 바꿔 볼 수 있다. 휠 확대는 페이지 스크롤을 막지 않으려고 넣지 않았다
   · three.js 는 이 컴포넌트가 화면에 놓일 때 따로 불러온다 (EventPreview 에서 dynamic import)
   ───────────────────────────────────────────────────────── */

type View = 'iso' | 'top' | 'front';

interface Station {
  kind: 'counter' | 'kiosk' | 'booth' | 'wall' | 'tablet';
  x: number;
  z: number;
  len?: number;
  wrapped?: boolean;
  label: number;
}

interface Layout {
  stations: Station[];
  staff: { x: number; z: number; ry: number; role: 'perfumer' | 'assistant' | 'crew'; label: number }[];
  legend: { no: number; text: string }[];
  width: number;
  booth: { w: number; d: number; wood: boolean } | null;
}

function buildLayout(input: QuoteInput, lang: Lang): Layout {
  const ko = lang === 'ko';
  const stations: Station[] = [];
  const staff: Layout['staff'] = [];
  const legend: Layout['legend'] = [];
  let x = 0;
  let no = 0;
  const gap = 0.7;

  for (const item of input.items) {
    if (item.key === 'acscent') {
      const teams = PERFUME.includedTeams + item.options.extraTeams;
      const racks = Math.min(4, perfumeRackCount(item.options.guests));
      const len = 1.5 + (racks - 1) * 0.55;
      const shown = Math.min(teams, 4);
      const counterNo = ++no;
      const teamNo = ++no;
      for (let t = 0; t < shown; t++) {
        stations.push({ kind: 'counter', x: x + len / 2, z: -0.3, len, label: counterNo });
        staff.push({ x: x + len * 0.28, z: -0.92, ry: 0, role: 'perfumer', label: teamNo });
        staff.push({ x: x + len * 0.74, z: -0.92, ry: 0, role: 'assistant', label: teamNo });
        x += len + gap;
      }
      legend.push({ no: counterNo, text: ko ? `조향 카운터 ${shown}개` : `${shown} perfume counter${shown > 1 ? 's' : ''}` });
      legend.push({ no: teamNo, text: ko ? `조향사 · 조수 ${teams}팀 (${teams * 2}명)` : `${teams} perfumer team${teams > 1 ? 's' : ''} (${teams * 2} people)` });
      const kiosks = item.options.analysisKiosks ?? 0;
      if (kiosks > 0) {
        const kNo = ++no;
        for (let k = 0; k < Math.min(kiosks, 4); k++) {
          stations.push({ kind: 'kiosk', x: x + 0.31, z: -0.45, label: kNo });
          x += 0.62 + 0.4;
        }
        x += gap - 0.4;
        legend.push({ no: kNo, text: ko ? `분석용 AI 키오스크 ${kiosks}대` : `${kiosks} analysis kiosk${kiosks > 1 ? 's' : ''}` });
      }
    } else if (item.key === 'photoBooth') {
      const n = ++no;
      for (let b = 0; b < item.options.booths; b++) {
        stations.push({ kind: 'booth', x: x + 0.38, z: -0.55, wrapped: item.options.wrapping, label: n });
        x += 0.75 + 0.55;
      }
      x += gap - 0.55;
      legend.push({ no: n, text: ko ? `AI 포토부스 ${item.options.booths}대` : `${item.options.booths} AI photo booth${item.options.booths > 1 ? 's' : ''}` });
    } else if (item.key === 'rental') {
      const n = ++no;
      for (let k = 0; k < item.options.kiosks; k++) {
        stations.push({ kind: 'kiosk', x: x + 0.31, z: -0.45, label: n });
        x += 0.62 + 0.45;
      }
      x += gap - 0.45;
      legend.push({ no: n, text: ko ? `AI 키오스크 ${item.options.kiosks}대` : `${item.options.kiosks} AI kiosk${item.options.kiosks > 1 ? 's' : ''}` });
    } else if (item.key === 'mediaArt') {
      const n = ++no;
      stations.push({ kind: 'wall', x: x + 1.3, z: -0.9, len: 2.6, label: n });
      x += 2.6 + gap;
      legend.push({ no: n, text: ko ? '인터랙티브 미디어 아트' : 'Interactive media art' });
    } else if (item.key === 'custom') {
      // 행사 맞춤 AI 콘텐츠 — 거치대 위 태블릿 화면으로 보여 준다 (체험 카드 그림용 · 견적 배치에는 들어오지 않는 별도 문의 서비스)
      const n = ++no;
      stations.push({ kind: 'tablet', x: x + 0.3, z: -0.3, label: n });
      x += 0.6 + gap;
      legend.push({ no: n, text: ko ? '행사 맞춤 AI 콘텐츠' : 'Custom AI content' });
    }
  }

  const width = Math.max(0, x - gap);
  // 가운데 정렬
  const shift = -width / 2;
  stations.forEach((s) => { s.x += shift; });
  staff.forEach((s) => { s.x += shift; });

  // 현장 운영 인력 — 기기 앞쪽에 나란히
  if (input.extraStaff > 0) {
    const n = ++no;
    const shown = Math.min(input.extraStaff, 6);
    for (let i = 0; i < shown; i++) {
      staff.push({ x: (i - (shown - 1) / 2) * 0.95 + Math.min(width / 2 - 0.3, 0.6), z: 0.95, ry: Math.PI - 0.35 + (i % 2) * 0.5, role: 'crew', label: n });
    }
    legend.push({ no: n, text: ko ? `현장 운영 인력 ${input.extraStaff}명` : `${input.extraStaff} on-site staff` });
  }

  const space = input.items.find((item) => item.key === 'spatialDesign');
  const booth = space && space.options.size !== 'large'
    ? { w: space.options.size === 'booth6x3' ? 6 : 3, d: 3, wood: space.options.build === 'wood' }
    : null;
  if (booth) legend.push({ no: 0, text: ko ? `부스 ${booth.w} × ${booth.d} m${booth.wood ? ' · 나무 가벽' : ''}` : `${booth.w} × ${booth.d} m booth${booth.wood ? ' · wooden walls' : ''}` });

  return { stations, staff, legend, width, booth };
}

const SPHERE: Record<View, { az: number; pol: number }> = {
  iso: { az: 0.62, pol: 0.98 },
  top: { az: 0, pol: 0.02 },
  front: { az: 0, pol: 1.42 },
};

export default function Quote3D({ input, lang, className }: { input: QuoteInput; lang: Lang; className?: string }) {
  const ko = lang === 'ko';
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ setView: (v: View) => void; setStaff: (on: boolean) => void; save: () => void } | null>(null);
  const [view, setView] = useState<View>('iso');
  const [showStaff, setShowStaff] = useState(true);
  const [failed, setFailed] = useState(false);

  const layout = useMemo(() => buildLayout(input, lang), [input, lang]);
  const empty = layout.stations.length === 0;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const pins = pinsRef.current;
    if (!wrap || !canvas || !pins) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch {
      // WebGL 을 쓸 수 없는 브라우저 — 다음 틱에 안내 문구로 바꾼다
      queueMicrotask(() => setFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

    scene.add(new THREE.HemisphereLight(0xe4e9ff, 0x2a2e37, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.9);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
    key.shadow.bias = -0.0005;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7d95ff, 1.6);
    rim.position.set(-6, 4, -5);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);
    const staffGroup = new THREE.Group();
    root.add(staffGroup);

    const M = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...o });
    const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    const white = M(0xf1f1ee, { roughness: 0.35 });
    const dark = M(0x15171c, { roughness: 0.4 });
    const navy = M(0x1b2250, { roughness: 0.5 });
    const accent = M(0x7d95ff, { roughness: 0.5 });

    // 바닥 · 모눈
    // 바닥은 어두운 슬레이트 — 검은 키오스크 · 남색 카운터 · 흰 포토부스가 모두 바닥과 구분되는 밝기
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M(0x2c313b, { roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);
    const grid = new THREE.GridHelper(60, 120, 0x3e4450, 0x353a45);
    grid.position.y = 0.002;
    root.add(grid);

    const { booth } = layout;
    const spanW = Math.max(layout.width + 1.6, booth ? booth.w : 0, 2.6);
    const spanD = booth ? booth.d : 2.6;
    // 놓이는 자리 (고른 부스가 있으면 그 크기 그대로, 없으면 기기 둘레만 옅게)
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(spanW, spanD), M(0x3b414d, { roughness: 0.95 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.004, 0);
    pad.receiveShadow = true;
    root.add(pad);
    const hw = spanW / 2;
    const hd = spanD / 2;
    const outline = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [-hw, -hd]].map(([px, pz]) => new THREE.Vector3(px, 0.01, pz))),
      new THREE.LineDashedMaterial({ color: 0x7d95ff, dashSize: 0.18, gapSize: 0.12 }),
    );
    outline.computeLineDistances();
    root.add(outline);

    if (booth) {
      const wallMat = booth.wood ? M(0xb9905e, { roughness: 0.8 }) : M(0xe9e9e6, { roughness: 0.9 });
      box(booth.w, 2.4, 0.06, wallMat, 0, 1.2, -hd);
      box(0.06, 2.4, booth.d, wallMat, -hw, 1.2, 0);
    }

    const builders = {
      counter(s: Station) {
        const len = s.len ?? 1.8;
        box(len, 0.86, 0.6, navy, s.x, 0.43, s.z);
        box(len + 0.06, 0.04, 0.66, white, s.x, 0.88, s.z);
        box(len - 0.2, 0.04, 0.2, white, s.x, 1.06, s.z - 0.2);
        const glass = M(0xd9a35a, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
        const g = new THREE.CylinderGeometry(0.026, 0.026, 0.1, 10);
        const n = Math.floor((len - 0.38) / 0.097);
        for (let row = 0; row < 2; row++) {
          for (let i = 0; i < n; i++) {
            const m = new THREE.Mesh(g, glass);
            m.position.set(s.x - (len - 0.38) / 2 + i * 0.097, row ? 1.13 : 0.95, s.z - 0.2);
            m.castShadow = true;
            root.add(m);
          }
        }
        box(0.3, 0.02, 0.22, dark, s.x, 0.91, s.z + 0.12);
      },
      booth(s: Station) {
        const body = s.wrapped ? accent : white;
        box(0.75, 1.95, 0.65, body, s.x, 0.975, s.z);
        box(0.56, 0.34, 0.02, dark, s.x, 1.32, s.z + 0.33);
        box(0.12, 0.08, 0.04, dark, s.x, 1.62, s.z + 0.33);
        box(0.3, 0.025, 0.04, dark, s.x, 0.98, s.z + 0.33);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), new THREE.MeshBasicMaterial({ color: 0x7d95ff }));
        screen.position.set(s.x, 1.32, s.z + 0.342);
        root.add(screen);
      },
      kiosk(s: Station) {
        const blk = M(0x0d0e11, { roughness: 0.35, metalness: 0.2 });
        const silver = M(0xc9ccd3, { metalness: 0.8, roughness: 0.25 });
        box(0.62, 0.05, 0.5, blk, s.x, 0.025, s.z);
        box(0.18, 0.55, 0.14, blk, s.x, 0.3, s.z - 0.05);
        box(0.56, 1.12, 0.12, blk, s.x, 1.12, s.z);
        box(0.56, 0.07, 0.13, silver, s.x, 0.62, s.z + 0.005);
        box(0.1, 0.05, 0.05, blk, s.x, 1.72, s.z + 0.04);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.86), new THREE.MeshBasicMaterial({ color: 0x5f78e8 }));
        screen.position.set(s.x, 1.16, s.z + 0.062);
        root.add(screen);
      },
      wall(s: Station) {
        const len = s.len ?? 2.6;
        box(len, 1.7, 0.08, dark, s.x, 1.05, s.z);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(len - 0.12, 1.56), new THREE.MeshBasicMaterial({ color: 0x3a49a8 }));
        screen.position.set(s.x, 1.05, s.z + 0.045);
        root.add(screen);
        box(0.22, 0.12, 0.3, silverMat, s.x, 0.06, s.z + 1.5);
      },
      tablet(s: Station) {
        // 바닥 거치대 + 기울인 태블릿
        box(0.36, 0.03, 0.36, silverMat, s.x, 0.015, s.z);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 12), silverMat);
        pole.position.set(s.x, 0.54, s.z);
        pole.castShadow = true;
        root.add(pole);
        const head = new THREE.Group();
        head.position.set(s.x, 1.12, s.z + 0.02);
        head.rotation.x = -0.45;
        root.add(head);
        box(0.42, 0.3, 0.025, dark, 0, 0, 0, head);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.26), new THREE.MeshBasicMaterial({ color: 0x7d95ff }));
        screen.position.set(0, 0, 0.014);
        head.add(screen);
      },
    };
    const silverMat = M(0xc9ccd3, { metalness: 0.8, roughness: 0.25 });
    layout.stations.forEach((s) => builders[s.kind](s));

    // 운영 인력 — 관절이 있는 사람 모형
    const mat = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0, ...o });
    const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const limb = (r1: number, r2: number, len: number) => new THREE.CylinderGeometry(r1, r2, len, 16).translate(0, -len / 2, 0);
    const torsoGeo = new THREE.LatheGeometry([[0.13, 0], [0.135, 0.06], [0.128, 0.16], [0.145, 0.27], [0.165, 0.37], [0.172, 0.43], [0.15, 0.47], [0.06, 0.5]].map(([a, b]) => new THREE.Vector2(a, b)), 24).scale(1, 1, 0.62);
    const hipGeo = new THREE.SphereGeometry(0.15, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(1, 0.6, 0.7);
    const headGeo = new THREE.SphereGeometry(0.1, 24, 16).scale(0.86, 1.08, 0.95);
    const hairGeo = (short: boolean) => new THREE.SphereGeometry(0.108, 24, 14, 0, Math.PI * 2, 0, short ? Math.PI * 0.52 : Math.PI * 0.62).scale(0.9, 1.1, 1);

    function human(p: { x: number; z: number; ry: number; h: number; skin: number; hair: number; shortHair: boolean; top: number; apron?: number; lanyard?: boolean; pose: Record<string, number | string> }) {
      const S = mat(p.skin, { roughness: 0.6 });
      const T = mat(p.top);
      const B = mat(0x1a1c22);
      const SH = mat(0x111216, { roughness: 0.4 });
      const HR = mat(p.hair, { roughness: 0.9 });
      const g = new THREE.Group();
      g.position.set(p.x, 0, p.z);
      g.rotation.y = p.ry;
      g.scale.setScalar(p.h / 1.72);
      staffGroup.add(g);
      [-1, 1].forEach((side) => {
        const hip = new THREE.Group();
        hip.position.set(side * 0.085, 0.9, 0);
        g.add(hip);
        mesh(limb(0.072, 0.052, 0.43), B, hip);
        const knee = new THREE.Group();
        knee.position.y = -0.43;
        hip.add(knee);
        mesh(limb(0.052, 0.038, 0.41), B, knee);
        mesh(new THREE.BoxGeometry(0.09, 0.055, 0.24), SH, knee, 0, -0.43, 0.045);
      });
      mesh(hipGeo, B, g, 0, 0.97, 0).rotation.x = Math.PI;
      const torso = new THREE.Group();
      torso.position.y = 0.95;
      torso.rotation.x = (p.pose.lean as number) || 0;
      g.add(torso);
      mesh(torsoGeo, T, torso);
      if (p.apron) mesh(new THREE.BoxGeometry(0.25, 0.62, 0.012), mat(p.apron, { roughness: 0.85 }), torso, 0, 0.08, 0.095).rotation.x = -0.04;
      if (p.lanyard) mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), mat(0xf4f4f2), torso, 0, 0.27, 0.11);
      const neck = new THREE.Group();
      neck.position.y = 0.5;
      torso.add(neck);
      mesh(limb(0.042, 0.046, 0.08).translate(0, 0.08, 0), S, neck);
      const head = new THREE.Group();
      head.position.y = 0.19;
      head.rotation.x = (p.pose.headTilt as number) || 0;
      head.rotation.y = (p.pose.headTurn as number) || 0;
      neck.add(head);
      mesh(headGeo, S, head);
      mesh(hairGeo(p.shortHair), HR, head, 0, 0.012, -0.008).rotation.x = -0.18;
      if (!p.shortHair) mesh(new THREE.BoxGeometry(0.19, 0.2, 0.06), HR, head, 0, -0.1, -0.075).rotation.x = 0.1;
      const arm = (side: number, sp: number, sr: number, el: number, hand?: string) => {
        const sh = new THREE.Group();
        sh.position.set(side * 0.19, 0.44, 0);
        sh.rotation.set(sp, 0, side * sr);
        torso.add(sh);
        mesh(new THREE.SphereGeometry(0.05, 14, 10), T, sh);
        mesh(limb(0.05, 0.04, 0.29), T, sh);
        const e = new THREE.Group();
        e.position.y = -0.29;
        e.rotation.x = el;
        sh.add(e);
        mesh(limb(0.038, 0.03, 0.26), S, e);
        mesh(new THREE.SphereGeometry(0.036, 12, 8).scale(0.8, 1.15, 0.6), S, e, 0, -0.29, 0);
        if (hand === 'tablet') mesh(new THREE.BoxGeometry(0.2, 0.27, 0.012), mat(0x101216, { roughness: 0.3 }), e, -side * 0.07, -0.3, 0.03).rotation.set(-0.9, 0, 0);
        if (hand === 'bottle') mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 10), mat(0xd9a35a, { roughness: 0.15 }), e, 0, -0.33, 0.02);
      };
      const P = p.pose;
      arm(-1, (P.lp as number) ?? 0.05, (P.lr as number) ?? 0.07, (P.le as number) ?? -0.12, P.lh as string | undefined);
      arm(1, (P.rp as number) ?? 0.05, (P.rr as number) ?? 0.07, (P.re as number) ?? -0.12, P.rh as string | undefined);
    }

    layout.staff.forEach((s, i) => {
      if (s.role === 'perfumer') human({ x: s.x, z: s.z, ry: s.ry, h: 1.74, skin: 0xe2bc9c, hair: 0x1a1512, shortHair: true, top: 0xf1f1ee, apron: 0x1b2250, pose: { lean: 0.12, headTilt: 0.35, lp: -0.75, le: -0.55, rp: -0.95, re: -0.8, rh: 'bottle' } });
      else if (s.role === 'assistant') human({ x: s.x, z: s.z, ry: s.ry, h: 1.63, skin: 0xedcdb2, hair: 0x2b201a, shortHair: false, top: 0xf1f1ee, apron: 0x1b2250, pose: { headTilt: 0.25, lp: -0.55, le: -1.25, lh: 'tablet', rp: -0.5, re: -1.3 } });
      else human({ x: s.x, z: s.z, ry: s.ry, h: i % 2 ? 1.68 : 1.78, skin: i % 2 ? 0xedcdb2 : 0xe2bc9c, hair: 0x141210, shortHair: i % 2 === 0, top: 0x6f86f0, lanyard: true, pose: { headTurn: -0.3, lp: -0.6, le: -1.2, lh: 'tablet', rp: -0.35, rr: 0.5, re: -0.25 } });
    });

    // 카메라: 구면 좌표로 두고, 보기 전환은 부드럽게 따라간다
    const home = new THREE.Vector3(0, 0.75, 0);
    const target = home.clone();
    // 휠 · 핀치로 확대 (커서 아래 지점을 붙잡은 채로). 보기 버튼을 누르면 처음 크기로
    let zoom = 1;
    const ZOOM_MIN = 0.6;
    const ZOOM_MAX = 4;
    const cur = { ...SPHERE.iso };
    const goal = { ...SPHERE.iso };
    let spin = 0; // 끌어 돌린 각 (보기 방향에 더한다)
    let spinVel = 0;
    const R = 20;
    const size = { w: 1, h: 1 };

    function frame() {
      const half = Math.max(spanW, spanD + 1.6, 3.2) * 0.62;
      const aspect = size.w / size.h;
      const fit = aspect > 1.5 ? half / aspect * 1.5 : half; // 넓은 화면에서는 가로에 맞춘다
      const v = Math.max(fit, 1.9);
      camera.left = -v * aspect;
      camera.right = v * aspect;
      camera.top = v;
      camera.bottom = -v;
      const az = cur.az + spin;
      camera.position.set(target.x + R * Math.sin(cur.pol) * Math.sin(az), target.y + R * Math.cos(cur.pol), target.z + R * Math.sin(cur.pol) * Math.cos(az));
      camera.up.set(0, 1, 0);
      camera.lookAt(target);
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      // 번호표
      const pinEls = pins!.children;
      for (let i = 0; i < pinEls.length; i++) {
        const el = pinEls[i] as HTMLElement;
        const p = new THREE.Vector3(Number(el.dataset.x), Number(el.dataset.y), Number(el.dataset.z)).project(camera);
        el.style.transform = `translate(${((p.x + 1) / 2) * size.w}px, ${((1 - p.y) / 2) * size.h}px) translate(-50%, -100%)`;
        el.style.display = el.dataset.staff && !staffGroup.visible ? 'none' : '';
      }
    }

    let raf = 0;
    let running = false;
    function loop() {
      const dAz = goal.az - cur.az;
      const dPol = goal.pol - cur.pol;
      cur.az += dAz * 0.12;
      cur.pol += dPol * 0.12;
      spin += spinVel;
      spinVel *= 0.92;
      frame();
      if (Math.abs(dAz) > 0.001 || Math.abs(dPol) > 0.001 || Math.abs(spinVel) > 0.0004 || dragging) raf = requestAnimationFrame(loop);
      else running = false;
    }
    function kick() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    // 끌어서 돌리기
    let dragging = false;
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || pinch) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      spinVel = -dx * 0.006;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const axisX = new THREE.Vector3();
    const axisY = new THREE.Vector3();
    function zoomAt(factor: number, clientX: number, clientY: number) {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom * factor));
      if (next === zoom) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = 1 - ((clientY - rect.top) / rect.height) * 2;
      camera.updateMatrixWorld();
      axisX.setFromMatrixColumn(camera.matrixWorld, 0);
      axisY.setFromMatrixColumn(camera.matrixWorld, 1);
      const k = 1 / zoom - 1 / next;
      target.addScaledVector(axisX, nx * camera.right * k).addScaledVector(axisY, ny * camera.top * k);
      zoom = next;
      // 처음 크기보다 작아지면 가운데로 돌아오고, 커져도 배치 밖으로 멀리 가지 않는다
      if (zoom <= 1) target.lerp(home, 0.35);
      target.x = Math.min(spanW, Math.max(-spanW, target.x));
      target.z = Math.min(spanD + 1, Math.max(-spanD - 1, target.z));
      target.y = Math.min(3, Math.max(-1.5, target.y));
      frame();
    }
    const onWheel = (e: WheelEvent) => {
      if (layout.stations.length === 0) return;
      e.preventDefault();
      // 줄 단위로 오는 휠(마우스)과 픽셀 단위(트랙패드)를 비슷한 세기로
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0012)), e.clientX, e.clientY);
    };
    // Safari 트랙패드 핀치는 wheel 대신 gesture 이벤트로 온다
    let gestureScale = 1;
    const onGestureStart = (e: Event) => { e.preventDefault(); gestureScale = 1; };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as Event & { scale: number; clientX: number; clientY: number };
      zoomAt(g.scale / gestureScale, g.clientX, g.clientY);
      gestureScale = g.scale;
    };
    // 터치 두 손가락 핀치
    const touches = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const pinchDistance = () => {
      const [a, b] = [...touches.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onTouchDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) { pinch = pinchDistance(); dragging = false; spinVel = 0; }
    };
    const onTouchMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size !== 2 || !pinch) return;
      const d = pinchDistance();
      const [a, b] = [...touches.values()];
      zoomAt(d / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = d;
    };
    const onTouchUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = 0;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerdown', onTouchDown);
    canvas.addEventListener('pointermove', onTouchMove);
    canvas.addEventListener('pointerup', onTouchUp);
    canvas.addEventListener('pointercancel', onTouchUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('gesturestart', onGestureStart);
    canvas.addEventListener('gesturechange', onGestureChange);

    const ro = new ResizeObserver(() => {
      size.w = wrap.clientWidth;
      size.h = wrap.clientHeight;
      renderer.setSize(size.w, size.h, false);
      frame();
    });
    ro.observe(wrap);

    api.current = {
      setView(v) {
        goal.az = SPHERE[v].az;
        goal.pol = SPHERE[v].pol;
        zoom = 1;
        target.copy(home);
        spin = 0;
        spinVel = 0;
        kick();
      },
      setStaff(on) {
        staffGroup.visible = on;
        frame();
      },
      save() {
        frame();
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'neander-layout.png';
        a.click();
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerdown', onTouchDown);
      canvas.removeEventListener('pointermove', onTouchMove);
      canvas.removeEventListener('pointerup', onTouchUp);
      canvas.removeEventListener('pointercancel', onTouchUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('gesturestart', onGestureStart);
      canvas.removeEventListener('gesturechange', onGestureChange);
      api.current = null;
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const material = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((x) => x.dispose());
        else material?.dispose?.();
      });
      renderer.dispose();
    };
  }, [layout]);

  // 장면을 새로 만든 뒤에도 고른 보기 · 인력 표시를 이어 간다
  useEffect(() => {
    api.current?.setView(view);
    api.current?.setStaff(showStaff);
  }, [layout, view, showStaff]);

  // 번호표 위치 (종류별로 하나씩)
  const pins = useMemo(() => {
    const seen = new Set<number>();
    const out: { no: number; x: number; y: number; z: number; staff?: boolean }[] = [];
    for (const s of layout.stations) {
      if (seen.has(s.label)) continue;
      seen.add(s.label);
      out.push({ no: s.label, x: s.x, y: s.kind === 'booth' ? 2.1 : s.kind === 'kiosk' ? 1.9 : s.kind === 'wall' ? 2.05 : s.kind === 'tablet' ? 1.5 : 1.3, z: s.z });
    }
    for (const s of layout.staff) {
      if (seen.has(s.label)) continue;
      seen.add(s.label);
      out.push({ no: s.label, x: s.x, y: 1.98, z: s.z, staff: true });
    }
    return out;
  }, [layout]);

  if (failed) {
    return <p className="flex min-h-48 items-center justify-center px-6 text-center text-sm text-paper/60">{ko ? '이 브라우저에서는 3D 미리보기를 열 수 없어요. 고른 구성과 금액은 오른쪽에서 그대로 확인할 수 있어요.' : '3D preview is not available in this browser. Your selection and estimate are still shown alongside.'}</p>;
  }

  const viewLabels: [View, string][] = [['iso', '3D'], ['top', ko ? '위에서' : 'Top'], ['front', ko ? '정면' : 'Front']];

  return (
    <div className={cn('theme-dark relative flex flex-col overflow-hidden text-paper', className)} style={{ background: 'radial-gradient(70% 80% at 55% 45%, #3a404c, #272b34 75%)' }} data-testid="quote-3d">
      {/* 운영 인력 · 이미지 저장 — 좁은 화면에서는 3D 화면 위에 한 줄로 두고(번호표를 가리지 않게), sm 부터 화면 오른쪽 위에 얹는다 */}
      <div className="flex flex-wrap justify-end gap-2 border-b border-paper/10 px-3 py-2 sm:absolute sm:right-3 sm:top-3 sm:z-10 sm:border-b-0 sm:p-0">
        <button type="button" aria-pressed={showStaff} onClick={() => setShowStaff((s) => !s)} className="flex min-h-9 items-center gap-2 border border-paper/15 bg-ink/60 px-3 text-xs font-semibold text-paper/80 backdrop-blur hover:text-paper">
          {ko ? '운영 인력' : 'Staff'}
          <span aria-hidden="true" className={cn('relative h-4 w-7 rounded-full transition-colors', showStaff ? 'bg-accent' : 'bg-paper/25')}>
            <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-snow transition-[left]', showStaff ? 'left-3.5' : 'left-0.5')} />
          </span>
        </button>
        <button type="button" onClick={() => api.current?.save()} disabled={empty} className="min-h-9 border border-paper/15 bg-ink/60 px-3 text-xs font-semibold text-paper/80 backdrop-blur hover:text-paper disabled:opacity-40">
          {ko ? '이미지 저장' : 'Save image'} <span aria-hidden="true">↓</span>
        </button>
      </div>
      {/* 옆 카드가 더 길면 그만큼 늘어난다 */}
      <div ref={wrapRef} data-lenis-prevent data-cursor={empty ? undefined : 'DRAG'} className="relative min-h-[260px] flex-1 touch-pan-y lg:min-h-[clamp(280px,42dvh,420px)]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" aria-label={ko ? '고른 구성의 3D 배치 예시' : '3D layout example of your selection'} role="img" />
        <div ref={pinsRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
          {pins.map((p) => (
            <span key={p.no} data-x={p.x} data-y={p.y} data-z={p.z} data-staff={p.staff ? '1' : undefined} className="absolute left-0 top-0 flex flex-col items-center will-change-transform">
              <b className="flex h-6 w-6 items-center justify-center rounded-full bg-paper font-display text-[11px] font-extrabold text-ink shadow-[0_0_0_4px_rgba(244,244,242,0.14)]">{p.no}</b>
              <i className="h-5 w-px bg-paper/60" />
            </span>
          ))}
        </div>
        {empty && <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-paper/55">{ko ? '체험을 고르면 여기에 배치해 드려요.' : 'Pick an experience and we will place it here.'}</p>}

        <div className="absolute bottom-3 left-3 flex border border-paper/15 bg-ink/60 backdrop-blur" role="group" aria-label={ko ? '보는 방향' : 'View'}>
          {viewLabels.map(([v, label]) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => { setView(v); api.current?.setView(v); }} className={cn('min-h-9 px-3 text-xs font-semibold transition-colors', view === v ? 'bg-paper text-ink' : 'text-paper/65 hover:text-paper')}>{label}</button>
          ))}
        </div>
      </div>

      {layout.legend.length > 0 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-paper/10 px-4 py-3 text-xs text-paper/80">
          {layout.legend.map((l) => (
            <li key={`${l.no}-${l.text}`} className="flex items-center gap-2">
              {l.no > 0 ? <b className="flex h-5 w-5 items-center justify-center rounded-full bg-paper font-display text-[10px] font-extrabold text-ink">{l.no}</b> : <span aria-hidden="true" className="h-px w-5 border-t border-dashed border-accent" />}
              {l.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
