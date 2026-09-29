'use client';

import type { ReactNode } from 'react';
import type { Lang } from '@/lib/quote/catalog';
import type { SpaceOptions } from '@/lib/quote/engine';
import { formatSpaceArea } from '@/lib/quote/space-area';
import { sceneFloor, type SceneSize } from '@/lib/quote-preview/perfume-scene';
import { PreviewCanvas } from '../PreviewCanvas';

/** One oblique projection: every depth edge goes right and up at 2:1. */
export function BoothEnvironment({ size, photoZone = false, lighting = false, build = 'fabric', children }: {
  size: SceneSize; photoZone?: boolean; lighting?: boolean; build?: 'fabric' | 'wood'; children?: ReactNode;
}) {
  const f = sceneFloor(size);
  const x = f.left, y = f.front, w = f.width, dx = f.depthX, dy = f.depthY, h = f.wallHeight;
  const built = size === 'booth3x3' || size === 'booth6x3';
  const back = y - dy;
  // 나무 가벽: 나뭇결 색·세로 판재·벽 선반 / 조립식 천 부스: 천 그래픽 + 알루미늄 프레임 기둥
  const wood = built && build === 'wood';
  return <g data-vector="booth-environment" data-build={built ? build : undefined} strokeLinejoin="round">
    <ellipse cx="417" cy="439" rx="330" ry="32" fill="#263b45" opacity=".045" />
    {built && <>
      <path d={`M ${x} ${y} L ${x + dx} ${back} V ${back - h} L ${x} ${y - h} Z`} fill={wood ? '#dcc096' : '#dce5de'} stroke={wood ? '#bf9f72' : '#c8d6cf'} strokeWidth="1.5" />
      <path d={`M ${x + dx} ${back} H ${x + w + dx} V ${back - h} H ${x + dx} Z`} fill={wood ? '#ecd6b2' : '#f0eee5'} stroke={wood ? '#caa97c' : '#d9dfd6'} strokeWidth="1.5" />
      {wood ? <g data-testid="vector-wood-walls">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M ${x + dx + w * i / 8} ${back} V ${back - h}`} stroke="#d8bb8e" strokeWidth="1" />)}
        {[.25, .5, .75].map((t) => <path key={t} d={`M ${x + dx * t} ${y - dy * t} v ${-h}`} stroke="#c8a87b" strokeWidth="1" />)}
        {[.4, .64].map((t) => <path key={t} d={`M ${x + dx + w * .56} ${back - h * t} H ${x + w + dx - 14}`} stroke="#a9825a" strokeWidth="5" strokeLinecap="round" />)}
      </g> : <>
        <path d={`M ${x + dx} ${back - h} h ${w * .29} v ${h} h ${-w * .29} Z`} fill="#c4e2d9" />
        <g data-testid="vector-fabric-frame" stroke="#b4bcb8" strokeWidth="2" strokeLinecap="round">
          <path d={`M ${x} ${y} V ${y - h}`} /><path d={`M ${x + dx} ${back} V ${back - h}`} /><path d={`M ${x + w + dx} ${back} V ${back - h}`} />
        </g>
      </>}
      <path d={`M ${x + dx + 13} ${back - h + 17} H ${x + w + dx - 16}`} stroke="#fffdf4" strokeWidth="7" strokeLinecap="round" />
      <path d={`M ${x} ${y} h ${w} l ${dx} ${-dy} v 12 l ${-dx} ${dy} h ${-w} Z`} fill="#c9c8b7" />
    </>}
    <path d={`M ${x} ${y} H ${x + w} L ${x + w + dx} ${back} H ${x + dx} Z`} fill={built ? '#e8e4d6' : '#e7efeb'} stroke={built ? '#d3d3c2' : '#d8e3de'} strokeWidth="1.5" />
    {[.25, .5, .75].map((t) => <path key={t} d={`M ${x + w * t} ${y} l ${dx} ${-dy}`} stroke={built ? '#d7d8c9' : '#d5e3db'} strokeWidth="1" />)}
    {[.33, .66].map((t) => <path key={t} d={`M ${x + dx * t} ${y - dy * t} h ${w}`} stroke={built ? '#d7d8c9' : '#d5e3db'} strokeWidth="1" />)}
    {photoZone && <g data-testid="vector-photozone" transform={`translate(${x + w + dx - 125} ${back - 5})`}>
      <path d="M-40 0V-105a40 40 0 0 1 80 0V0" fill="#e9b19a" stroke="#cf947d" strokeWidth="2" />
      <path d="M-27-2V-102a27 27 0 0 1 54 0V-2" fill="#f9eee0" />
      <circle cx="0" cy="-88" r="17" fill="#c4e2d9" /><path d="M-15-12q-8-55 9-49q22 7 22 49" fill="#dacdb7" />
      <path d="M-30 0h64l12-7H-17Z" fill="#ce9782" />
    </g>}
    {lighting && <g data-testid="vector-lighting" stroke="#c8a765" strokeWidth="3" strokeLinecap="round">
      <path d={`M ${x + dx + 14} ${back - h + 34} H ${x + w + dx - 17}`} />
      {[.15, .45, .75].map((t) => <g key={t} transform={`translate(${x + dx + w * t} ${back - h + 34})`}>
        <path d="M0 0v16" /><path d="M-8 16h16l6 13h-28Z" fill="#e8c884" /><path d="M-7 29-25 92H25L7 29Z" stroke="none" fill="#f7d78d" opacity=".15" />
      </g>)}
    </g>}
    {children}
  </g>;
}

export function SpaceIllustration({ options, view = 'space', lang, children }: {
  options?: SpaceOptions; view?: 'space' | 'top'; lang: Lang; children?: ReactNode;
}) {
  const size = options?.size ?? 'existing';
  const top = view === 'top';
  const label = size === 'booth3x3' ? '3 × 3 m' : size === 'booth6x3' ? '6 × 3 m' : size === 'large' ? `${formatSpaceArea(options ?? { pyeong: 10 }, lang)} · ${lang === 'ko' ? '맞춤 공간' : 'custom space'}` : lang === 'ko' ? '준비된 행사장' : 'Existing venue';
  const title = lang === 'ko' ? `${label} 공간 일러스트` : `${label} space illustration`;
  const width = size === 'booth6x3' ? 560 : 340;
  const x = 400 - width / 2;
  return <div className="bg-[#f7f5f0]" data-illustration="space">
    <div className="px-5 pt-4 text-[11px] font-medium text-slate-500">{label}<span className="float-right text-slate-400">{lang === 'ko' ? '공간 구성 예시' : 'Illustrative layout'}</span></div>
    <PreviewCanvas lang={lang} label={title}>
    <svg viewBox={top ? '0 40 800 445' : '0 100 800 380'} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet" className="block h-full w-full" data-testid="vector-space" data-view={view}>
      <title>{title}</title>
      {top ? <g strokeLinejoin="round">
        <rect x={x + 6} y="98" width={width} height="304" rx="8" fill="#263b45" opacity=".055" />
        <rect x={x} y="90" width={width} height="304" rx="5" fill="#e7e3d5" stroke="#c8d4cb" strokeWidth="3" />
        <path d={`M${x} 394V90H${x + width}`} fill="none" stroke="#c4ddd2" strokeWidth="13" />
        <path d={`M${x + 15} 104H${x + width * .35}`} stroke="#22969b" strokeWidth="9" />
        {[1, 2, 3].map((n) => <path key={n} d={`M${x + width * n / 4} 108V380`} stroke="#d6d7c9" />)}
        {[1, 2].map((n) => <path key={n} d={`M${x + 12} ${90 + n * 100}H${x + width - 12}`} stroke="#d6d7c9" />)}
        {options?.photoZone && <g data-testid="vector-photozone"><rect x={x + width - 92} y="113" width="69" height="52" rx="24" fill="#e9b19a" /><rect x={x + width - 83} y="122" width="51" height="34" rx="16" fill="#f9eee0" /></g>}
        {options?.lighting && <g data-testid="vector-lighting">{[.2, .5, .8].map((t) => <circle key={t} cx={x + width * t} cy="118" r="9" fill="#e6c479" stroke="#caaa61" />)}</g>}
        <path d={`M${x} 428H${x + width} M${x} 421V435 M${x + width} 421V435`} fill="none" stroke="#8da79d" strokeWidth="1.5" />
        <text x="400" y="458" textAnchor="middle" fill="#55766e" fontSize="17" fontFamily="inherit">{label}</text>
      </g> : <BoothEnvironment size={size} photoZone={options?.photoZone} lighting={options?.lighting} build={options?.build === 'wood' ? 'wood' : 'fabric'}>{children}</BoothEnvironment>}
    </svg>
    </PreviewCanvas>
  </div>;
}
