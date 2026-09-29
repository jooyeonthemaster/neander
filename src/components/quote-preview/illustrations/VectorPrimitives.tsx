import type { ReactNode } from 'react';

/** A shared editorial illustration system. Every glyph is grounded at (x, y).
 * Units are SVG user units; the caller owns the SVG canvas, labels and motion.
 * No raster assets, filters, definitions or document-global IDs are required. */
export const palette = {
  background: '#f7f5f0', paper: '#fffdf8', teal: '#22969b', tealLight: '#bfe3df',
  tealDark: '#267478', navy: '#263b45', coral: '#ed997a', ochre: '#d7ae5d',
  ink: '#253b43', line: '#647b7f', shadow: '#dde2db', wood: '#775743',
  woodLight: '#ac8968', silver: '#d7dfdf', silverDark: '#a4b1b4',
} as const;

export type GlyphProps = { x?: number; y?: number; scale?: number };
const P = palette;

function Grounded({ x = 0, y = 0, scale = 1, children }: GlyphProps & { children: ReactNode }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round" strokeLinejoin="round">{children}</g>;
}

export function KioskGlyph({ screen = 'analysis', ...position }: GlyphProps & { screen?: 'analysis' | 'color' | 'brand' }) {
  return <Grounded {...position}>
    <ellipse cx="3" cy="1" rx="30" ry="5" fill={P.shadow} opacity="0.7" />
    <path d="M-24-57 16-57 25-63-15-63Z" fill="#607277" />
    <path d="M16-57 25-63 25-6 16 0Z" fill="#25353e" />
    <path d="M-24-57H16V0H-24Z" fill="#344951" />
    <path d="M-19-58 16-58 21-62-14-62Z" fill="#1b2f37" />
    <path d="M13-149 22-143 22-63 13-57Z" fill="#344b54" stroke={P.navy} strokeWidth="1.2" />
    <rect x="-19" y="-151" width="35" height="94" rx="4" fill={P.navy} stroke={P.silverDark} strokeWidth="1.3" />
    <rect x="-15" y="-144" width="27" height="62" rx="1.5" fill={screen === 'brand' ? P.tealDark : '#deefeb'} />
    {screen === 'analysis' && <g>
      <path d="M-9-116C-8-133 11-122 7-141" fill="none" stroke="white" strokeWidth="1.3" opacity="0.85" />
      <path d="M-1-103C-12-116 8-117 7-127" fill="none" stroke={P.teal} strokeWidth="1.1" opacity="0.5" />
      <rect x="-7" y="-115" width="11" height="18" rx="2" fill={P.paper} stroke={P.tealDark} strokeWidth="1" />
      <rect x="-4.5" y="-120" width="6" height="5" rx="1" fill={P.silverDark} />
      <path d="M4-107Q13-111 10-116 3-116 4-107ZM-8-110Q-15-116-12-120-6-117-8-110Z" fill={P.teal} opacity="0.75" />
      <path d="M-10-89H7" stroke={P.teal} strokeWidth="2.5" />
    </g>}
    {screen === 'color' && <g>
      <circle cx="-1.5" cy="-128" r="8" fill={P.coral} />
      <path d="M-1.5-136A8 8 0 0 1 6.5-128H-1.5Z" fill={P.ochre} />
      <path d="M-1.5-128H6.5A8 8 0 0 1-1.5-120Z" fill={P.teal} />
      <rect x="-10" y="-111" width="7" height="7" rx="2" fill={P.ochre} /><rect x="0" y="-111" width="7" height="7" rx="2" fill={P.coral} />
      <path d="M-10-97H7M-10-92H2" stroke={P.tealDark} strokeWidth="1.8" />
    </g>}
    {screen === 'brand' && <g fill={P.paper}>
      <path d="m-1.5-133 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" />
      <rect x="-10" y="-109" width="17" height="2" rx="1" opacity="0.8" /><rect x="-7" y="-103" width="11" height="2" rx="1" opacity="0.45" />
      <rect x="-10" y="-94" width="17" height="7" rx="2" fill={P.tealLight} />
    </g>}
    <path d="M-18-79H15V-70H-18Z" fill={P.silver} />
    <rect x="-8" y="-76" width="14" height="2" rx="1" fill="#42565c" />
    <rect x="-9" y="-67" width="15" height="6" rx="1" fill="#172930" />
    <path d="M-2-151V-155" stroke={P.silverDark} strokeWidth="3" />
    <rect x="-9" y="-160" width="16" height="6" rx="3" fill={P.navy} stroke={P.silverDark} strokeWidth="0.8" />
    <circle cx="-1" cy="-157" r="1.7" fill="#748d90" /><circle cx="-1" cy="-157" r="0.8" fill="#142b34" />
    <path d="M-15-148H10" stroke="white" opacity="0.3" strokeWidth="0.8" />
  </Grounded>;
}

export function PersonGlyph({ variant = 0, role = 'guest', gesture = 'blend', ...position }: GlyphProps & { variant?: number; role?: 'perfumer' | 'assistant' | 'guest'; gesture?: 'blend' | 'touch' | 'wave' }) {
  const v = ((variant % 4) + 4) % 4;
  const skin = ['#dca986', '#e5bfa1', '#c79676', '#dfb092'][v];
  const hair = ['#2a3439', '#514035', '#41494a', '#293b3e'][v];
  const shirt = role === 'guest' ? [P.tealLight, P.coral, '#d5d9ce', '#d5be92'][v] : [P.paper, '#dce9e3', '#ece5d8', '#e6eeeb'][v];
  const apron = role === 'perfumer' ? P.navy : P.tealDark;
  return <Grounded {...position}>
    <ellipse cx="0" cy="1" rx="24" ry="4" fill={P.shadow} opacity="0.65" />
    <path d="M-14-64H2L-3-7H-16Z" fill="#495d63" /><path d="M1-64H15L16-7H4Z" fill={P.navy} />
    <path d="M-16-9H-3V-1H-24Q-25-6-16-9Z" fill="#24343c" /><path d="M4-9H16L22-3Q23 0 19 0H4Z" fill="#24343c" />
    <path d="M-13-111Q-22-108-22-95L-17-63Q0-58 17-63L22-95Q22-108 12-111Z" fill={shirt} stroke="#94a7a1" strokeWidth="0.8" />
    <path d="M-7-116H7V-105Q0-101-7-105Z" fill={skin} />
    <path d="M-7-112 0-105-8-100-13-110M7-112 0-105 8-100 13-110" fill={P.paper} stroke="#bdc9c4" strokeWidth="0.65" />
    {role !== 'guest' && <g>
      <path d="M-10-109-13-93M10-109 13-93" fill="none" stroke={apron} strokeWidth="3" />
      <path d="M-13-95H13L16-59Q0-54-16-59Z" fill={apron} />
      <path d="M-8-78H8V-69Q0-65-8-69Z" fill="none" stroke={P.tealLight} strokeWidth="0.9" opacity="0.55" />
      <path d="M-11-92H11" stroke={P.tealLight} strokeWidth="0.75" opacity="0.35" />
    </g>}
    {gesture === 'blend' && <g>
      <path d="M-18-99-24-84-8-77M18-98 23-86 8-80" fill="none" stroke={shirt} strokeWidth="10" />
      <path d="M-9-78 0-76M8-80 1-77" stroke={skin} strokeWidth="7" />
      <rect x="-1" y="-84" width="5" height="9" rx="1" fill={P.ochre} stroke={P.wood} strokeWidth="0.7" />
      <path d="M4-91 1-84" stroke={P.navy} strokeWidth="1.3" />
    </g>}
    {gesture === 'touch' && <g>
      <path d="M-18-98-20-76M18-98 25-89 35-102" fill="none" stroke={shirt} strokeWidth="9" />
      <path d="M-20-76-19-69M35-102 37-108" stroke={skin} strokeWidth="6" />
    </g>}
    {gesture === 'wave' && <g>
      <path d="M-18-98-20-77M18-100 28-108 29-124" fill="none" stroke={shirt} strokeWidth="9" />
      <path d="M-20-77-19-70M29-124 30-133" stroke={skin} strokeWidth="6" />
    </g>}
    {v === 1 && <path d="M-15-138Q-21-110-12-107L16-108Q22-131 12-143Z" fill={hair} />}
    {v === 3 && <circle cx="9" cy="-144" r="7" fill={hair} />}
    <path d="M-13-132Q-13-147 1-147 15-145 14-132L13-123Q9-114 1-115-10-115-12-127Z" fill={skin} />
    <path d={v === 2 ? 'M-14-130Q-19-138-11-145L-9-148-4-146Q5-152 13-144 19-139 15-128L9-134 3-137-5-133Z' : v === 1 ? 'M-14-128Q-19-141-7-147 7-152 14-143L16-125 11-129 9-140Q-1-130-14-128Z' : 'M-13-128Q-19-138-9-146 4-151 13-143L16-135 10-132 7-139Q-3-134-10-134L-10-126Z'} fill={hair} />
    <circle cx="5" cy="-130" r="0.8" fill={P.navy} /><path d="M7-129 8-125 5-124M2-120Q5-118 8-120" fill="none" stroke="#946c56" strokeWidth="0.8" />
    {v === 2 && <path d="M-7-131H1M3-131H11M1-131H3" fill="none" stroke={P.navy} strokeWidth="1.1" />}
  </Grounded>;
}

export function TeamGlyph({ variant = 0, ...position }: GlyphProps & { variant?: number }) {
  // Different pairings keep all eleven selectable teams visually distinct.
  const assistantVariant = variant + 1 + Math.floor(variant / 4);
  return <Grounded {...position}><PersonGlyph x={-26} variant={variant} role="perfumer" /><PersonGlyph x={26} variant={assistantVariant} role="assistant" gesture={variant % 2 ? 'touch' : 'blend'} /></Grounded>;
}

function AromaBottle({ x, y, shade = 0 }: { x: number; y: number; shade?: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-3.5" y="-11" width="7" height="11" rx="1.5" fill={shade % 2 ? '#765132' : '#604632'} stroke="#463d30" strokeWidth="0.65" />
    <path d="M-2-11V-15H2V-11" fill={P.navy} /><path d="M-1-17H1V-15H-1Z" fill={P.navy} />
    <rect x="-3" y="-7" width="6" height="4" rx="0.5" fill={P.paper} /><path d="M-2-9V-10" stroke="#c49a66" strokeWidth="0.8" />
  </g>;
}

export function CounterGlyph(position: GlyphProps) {
  return <Grounded {...position}>
    <ellipse cx="4" cy="2" rx="100" ry="7" fill={P.shadow} opacity="0.8" />
    <path d="M-100-63H87L100-70H-87Z" fill={P.paper} stroke="#c2cac2" strokeWidth="1" />
    <path d="M87-63 100-70V-7L87 0Z" fill="#d4dcd5" />
    <path d="M-100-63H87V0H-100Z" fill="#e8ede7" stroke="#c2cac2" strokeWidth="0.8" />
    <path d="M-98-62H86V-53H-98Z" fill={P.paper} />
    <path d="M-73-51V-5M-32-51V-3M17-51V-4M65-51V-5" stroke="#d1dad1" strokeWidth="1" />
    <path d="M-100-2Q-51 1-5-1 45-4 87-1" fill="none" stroke="#b9c6bd" strokeWidth="0.9" />
    <path d="M-64-69V-89H22V-69Z" fill={P.wood} /><path d="M-64-89 22-89 30-95-56-95Z" fill={P.woodLight} /><path d="M22-89 30-95V-75L22-69Z" fill="#604937" />
    <path d="M-69-68V-79H26V-68Z" fill="#8e6b4e" /><path d="M-69-79 26-79 33-84-62-84Z" fill="#b49670" />
    {[-52, -37, -22, -7, 8, 21].map((x, i) => <AromaBottle key={`back-${i}`} x={x} y={-89} shade={i} />)}
    {[-57, -41, -25, -9, 7, 23].map((x, i) => <AromaBottle key={`front-${i}`} x={x} y={-79} shade={i + 1} />)}
    <path d="M40-65H77L84-70H47Z" fill="#d1ddd5" stroke="#b4c6bd" strokeWidth="0.8" />
    <path d="M45-68H55M47-71H58M63-67H76" stroke={P.paper} strokeWidth="2" />
    <rect x="62" y="-83" width="8" height="14" rx="1.5" fill="#d6e4df" stroke="#93aaa2" strokeWidth="0.8" /><path d="M65-86H68V-83H65Z" fill={P.silverDark} />
    <path d="M-88-66H-74L-69-69H-83Z" fill={P.tealLight} /><path d="M-82-77-77-66M-78-79-74-67" stroke={P.paper} strokeWidth="2.5" />
  </Grounded>;
}

export function PerfumeBottleGlyph({ volume = '50ml', packaging = 'none', ...position }: GlyphProps & { volume?: '10ml' | '50ml'; packaging?: 'none' | 'brand' | 'custom' }) {
  const slim = volume === '10ml';
  const boxed = packaging !== 'none';
  return <Grounded {...position}>
    <ellipse cx={boxed ? 5 : 0} cy="2" rx={boxed ? 53 : 31} ry="5" fill={P.shadow} opacity="0.7" />
    {boxed && <g>
      <path d="M15-118 49-118 59-124 25-124Z" fill={packaging === 'brand' ? '#617276' : '#f0d9ba'} />
      <path d="M49-118 59-124V-8L49-2Z" fill={packaging === 'brand' ? '#1c3038' : '#d0b791'} />
      <rect x="15" y="-118" width="34" height="116" rx="1" fill={packaging === 'brand' ? P.navy : '#e9d9bd'} />
      <path d="M21-109H42M21-106H35" stroke={packaging === 'brand' ? P.silver : P.wood} strokeWidth="1.2" />
      <path d="M22-65Q42-94 42-53M23-51Q34-63 43-56" fill="none" stroke={packaging === 'brand' ? P.silverDark : P.tealDark} strokeWidth="1.5" opacity="0.65" />
      <path d="M22-17H41M26-12H37" stroke={packaging === 'brand' ? P.silver : P.wood} strokeWidth="1" />
    </g>}
    <g transform={`translate(${boxed ? -18 : 0} 0)`}>
      {slim ? <g>
        <rect x="-13" y="-100" width="26" height="100" rx="8" fill="#deece6" stroke="#8fa6a0" strokeWidth="1.3" />
        <path d="M-10-70H10V-10Q0-4-10-10Z" fill="#e5cd8d" opacity="0.7" /><path d="M-7-88V-19" stroke="white" strokeWidth="2" opacity="0.85" />
        <rect x="-13" y="-125" width="26" height="30" rx="3" fill={P.silver} stroke={P.silverDark} strokeWidth="1" /><path d="M-7-122V-98M8-122V-98" stroke="white" strokeWidth="2" opacity="0.7" />
        <rect x="-10" y="-55" width="20" height="21" rx="1" fill={P.paper} opacity="0.9" /><path d="M-6-46H6M-4-41H4" stroke={P.tealDark} strokeWidth="1.2" />
      </g> : <g>
        <path d="M-27-89Q-27-96-20-98L-10-102H10L20-98Q27-96 27-89V-5Q27 0 22 0H-22Q-27 0-27-5Z" fill={P.navy} stroke="#142a32" strokeWidth="1.3" />
        <path d="M20-96 29-100 32-93V-8L26-3V-89Z" fill="#1c2e36" /><path d="M-21-89V-12" stroke="#658084" strokeWidth="2" opacity="0.45" />
        <rect x="-14" y="-125" width="28" height="29" rx="4" fill={P.silver} stroke={P.silverDark} strokeWidth="1" /><path d="M-8-122V-100M8-122V-100" stroke="white" strokeWidth="2" opacity="0.75" />
        <path d="M-15-66H15M-10-58H10" stroke={P.silver} strokeWidth="1.4" /><path d="M-5-32H5M-9-25H9" stroke={P.silverDark} strokeWidth="1" />
      </g>}
    </g>
  </Grounded>;
}

export function PrinterGlyph(position: GlyphProps) {
  return <Grounded {...position}>
    <ellipse cx="2" cy="1" rx="24" ry="4" fill={P.shadow} opacity="0.7" />
    <path d="M-22-23 12-23 22-29-12-29Z" fill="#526a70" /><path d="M12-23 22-29V-5L12 0Z" fill="#23383f" />
    <rect x="-22" y="-23" width="34" height="23" rx="3" fill={P.navy} /><path d="M-20-15H10" stroke="#5d7277" strokeWidth="1" />
    <path d="M-13-21-9-38H9L5-21Z" fill={P.paper} stroke="#c4cfca" strokeWidth="0.8" />
    <path d="M-7-32H4M-8-28H2M-9-24H3" stroke={P.silverDark} strokeWidth="1" />
    <circle cx="6" cy="-9" r="1.8" fill={P.tealLight} /><path d="M-15-7H-2" stroke="#839a9c" strokeWidth="1.2" />
  </Grounded>;
}

export function PhotoBoothGlyph({ wrapped = false, ...position }: GlyphProps & { wrapped?: boolean }) {
  const body = wrapped ? P.teal : '#edf0e8';
  return <Grounded {...position}>
    <ellipse cx="3" cy="1" rx="42" ry="6" fill={P.shadow} opacity="0.75" />
    <path d="M-39-174 27-174 39-180-27-180Z" fill={wrapped ? '#76bcb8' : P.paper} stroke="#adbeb7" strokeWidth="0.8" />
    <path d="M27-174 39-180V-7L27-1Z" fill={wrapped ? P.tealDark : '#ccd7cf'} />
    <rect x="-39" y="-174" width="66" height="173" rx="2" fill={body} stroke={wrapped ? '#387e7b' : '#b8c6bd'} strokeWidth="1" />
    <circle cx="-6" cy="-153" r="6" fill={P.navy} /><circle cx="-6" cy="-153" r="2.5" fill="#688a8e" />
    <rect x="-31" y="-134" width="50" height="41" rx="2" fill={P.navy} />
    <rect x="-27" y="-130" width="42" height="33" rx="1" fill="#d0e7df" /><circle cx="-6" cy="-119" r="6" fill={P.coral} /><path d="M-19-100Q-18-113-6-113 6-113 7-100Z" fill={P.tealDark} />
    <path d="M-27-77H15V-66H-27Z" fill={P.silverDark} /><path d="M-24-74H12V-69H-24Z" fill={P.navy} />
    <path d="M-22-70H9L5-50H-26Z" fill={P.paper} stroke="#c7d2cc" strokeWidth="0.75" /><rect x="-19" y="-65" width="22" height="10" fill={P.tealLight} />
    {wrapped ? <g><path d="M-33-38Q-8-64 22-34M-34-20Q-2-45 21-20" fill="none" stroke={P.tealLight} strokeWidth="2" opacity="0.75" /><path d="m11-155 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill={P.paper} /></g> : <path d="M-26-27H10M-26-20H-4" stroke="#a1b7af" strokeWidth="1.5" />}
    <path d="M-33-1V2M20-1V2" stroke={P.navy} strokeWidth="4" />
  </Grounded>;
}

export function PlantGlyph(position: GlyphProps) {
  return <Grounded {...position}>
    <ellipse cx="2" cy="1" rx="22" ry="4" fill={P.shadow} opacity="0.7" />
    <path d="M0-27V-88M0-53-18-68M0-66 17-81M0-41 21-54M0-75-9-88" fill="none" stroke={P.tealDark} strokeWidth="2" />
    <path d="M-1-80Q-17-94-7-100 5-96-1-80Z" fill="#749f87" /><path d="M-17-65Q-38-65-31-80-16-82-17-65Z" fill={P.tealDark} />
    <path d="M3-67Q5-93 25-89 27-75 3-67Z" fill="#84b19a" /><path d="M3-44Q11-66 31-58 28-43 3-44Z" fill={P.tealDark} />
    <path d="M-1-49Q-24-61-27-47-21-34-1-49Z" fill="#9cbca3" />
    <path d="M-20-30H20L14-1H-14Z" fill="#d8c8af" stroke="#bcae98" strokeWidth="1" /><ellipse cx="0" cy="-30" rx="20" ry="4" fill="#ebe0cc" /><ellipse cx="0" cy="-30" rx="14" ry="2" fill="#a59479" />
    <path d="M-13-22-10-7" stroke={P.paper} strokeWidth="2" opacity="0.65" />
  </Grounded>;
}

export function PhotoFrameGlyph({ style = 'source', ...position }: GlyphProps & { style?: 'source' | 'ready' | 'custom' }) {
  const custom = style === 'custom';
  const ready = style === 'ready';
  return <Grounded {...position}>
    <ellipse cx="3" cy="2" rx="57" ry="5" fill={P.shadow} opacity="0.7" />
    <path d="M44-135 55-140V-5L44 0Z" fill="#c9d4ca" /><path d="M-55-135 44-135 55-140-44-140Z" fill={P.paper} />
    <rect x="-55" y="-135" width="99" height="135" rx="2" fill={P.paper} stroke="#c3cfc5" strokeWidth="1" />
    <rect x="-47" y="-126" width="83" height="102" rx="1" fill={custom ? '#e3e8cf' : ready ? '#f1dfca' : '#e2ece7'} />
    {ready && <g fill={P.paper} opacity="0.85"><path d="m-33-111 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" /><path d="m24-115 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" /></g>}
    <path d="M-33-27Q-32-66-7-68 20-67 24-27Z" fill={ready ? P.teal : P.navy} />
    <path d="M-17-69V-57Q-8-51 1-57V-71Z" fill="#d9a989" /><path d="M-30-92Q-33-121-7-120 18-120 17-91L14-66Q-7-60-28-68Z" fill="#3a413c" />
    <path d="M-24-93Q-23-113-7-114 10-112 10-92L7-79Q-7-64-21-80Z" fill="#e4b894" />
    <path d="M-24-91Q-12-94-2-108L10-91 11-107Q3-121-9-120-31-117-27-92Z" fill="#3a413c" />
    <path d="M-21-86H-16M-3-86H2M-13-77Q-8-73-3-77" fill="none" stroke="#5b4b3f" strokeWidth={ready ? 1.6 : 1} />
    {ready && <path d="M-23-95Q-17-99-12-96M-4-96Q1-99 5-95" fill="none" stroke="#3a413c" strokeWidth="1.5" />}
    {custom && <g fill={P.tealDark}>
      <path d="M-38-30Q-54-65-34-78-27-58-38-30ZM28-26Q6-47 22-66 36-46 28-26Z" /><path d="M-35-34Q-26-58-14-48-19-30-35-34Z" fill="#97ba92" />
      <path d="M22-91Q17-119 34-118 38-102 22-91Z" fill="#97ba92" /><circle cx="24" cy="-83" r="7" fill={P.coral} /><circle cx="24" cy="-83" r="2" fill={P.ochre} />
    </g>}
    <path d="M-30-13H17M-20-8H7" stroke={P.tealDark} strokeWidth="1.4" opacity="0.7" />
  </Grounded>;
}
