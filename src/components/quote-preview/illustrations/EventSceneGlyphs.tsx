import type { MediaArtOptions } from '@/lib/quote/engine';
import { perfumeCounterWidth } from '@/lib/quote-preview/perfume-furniture';
import { palette as P } from './VectorPrimitives';

/** Bottle racks keep their proportions while the supporting counter widens. */
export function EventPerfumeCounterGlyph({ racks = 1 }: { racks?: number }) {
  const half = perfumeCounterWidth(racks) / 2;
  return <g data-testid="perfume-table" data-racks={racks} data-table-width={half * 2} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="4" cy="2" rx={half + 2} ry="8" fill={P.shadow} opacity=".7" />
    <path d={`M${-half}-63H${half - 13}L${half}-70H${-half + 13}Z`} fill={P.paper} stroke="#c2cac2" strokeWidth="1" />
    <path d={`M${half - 13}-63 ${half}-70V-7L${half - 13} 0Z`} fill="#d4dcd5" />
    <path d={`M${-half}-63H${half - 13}V0H${-half}Z`} fill="#e8ede7" stroke="#c2cac2" strokeWidth=".8" />
    <path d={`M${-half + 2}-62H${half - 14}V-54H${-half + 2}Z`} fill={P.paper} />
    {Array.from({ length: Math.floor((half * 2 - 30) / 50) }, (_, index) => <path key={index} d={`M${-half + 29 + index * 50}-51V-4`} stroke="#d1dad1" />)}
    <path d={`M${-half}-2H${half - 13}`} fill="none" stroke="#b9c6bd" />
    {Array.from({ length: racks }, (_, index) => <g key={index} data-testid="perfume-scent-rack" data-instance={index + 1} transform={`translate(${(index - (racks - 1) / 2) * 112} 0)`}>
      <path d="M-64-69V-89H22V-69Z" fill={P.wood} /><path d="M-64-89 22-89 30-95-56-95Z" fill={P.woodLight} /><path d="M22-89 30-95V-75L22-69Z" fill="#604937" />
      <path d="M-69-68V-79H26V-68Z" fill="#8e6b4e" /><path d="M-69-79 26-79 33-84-62-84Z" fill="#b49670" />
      {[-89, -79].flatMap((y, row) => [-55, -39, -23, -7, 9, 25].map((x, bottle) => <g key={`${row}-${bottle}`} transform={`translate(${x} ${y})`}>
        <rect x="-3.5" y="-11" width="7" height="11" rx="1.5" fill={bottle % 2 ? '#765132' : '#604632'} stroke="#463d30" strokeWidth=".65" />
        <path d="M-2-11V-15H2V-11M-1-17H1V-15H-1Z" fill={P.navy} /><rect x="-3" y="-7" width="6" height="4" rx=".5" fill={P.paper} />
      </g>))}
    </g>)}
    <g transform={`translate(${-half + 140} 0)`}><path d="M-114-66H-80L-73-71H-107Z" fill={P.tealLight} /><path d="M-103-77-98-67M-96-79-92-68" stroke={P.paper} strokeWidth="2.5" /></g>
    <g transform={`translate(${half - 140} 0)`}>
      <path d="M72-65H116L123-71H79Z" fill="#d1ddd5" stroke="#b4c6bd" strokeWidth=".8" /><path d="M80-68H92M96-68H108" stroke={P.paper} strokeWidth="2" />
      <rect x="106" y="-84" width="8" height="14" rx="1.5" fill="#d6e4df" stroke="#93aaa2" strokeWidth=".8" /><path d="M109-87H112V-84H109Z" fill={P.silverDark} />
    </g>
  </g>;
}

/** Shared-space accessories use the same scale and grounded origins as the
 * existing equipment glyphs. Their backgrounds belong to the parent scene. */
export function MediaWallGlyph({ grade }: { grade: MediaArtOptions['grade'] }) {
  const rings = grade === 'fullCustom' ? 7 : grade === 'premium' ? 5 : 3;
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="5" cy="2" rx="151" ry="10" fill={P.shadow} opacity=".65" />
    <path d="M-150-195 145-195 157-202-138-202Z" fill="#586e71" />
    <path d="M145-195 157-202V-9L145-1Z" fill="#142c34" />
    <rect x="-150" y="-195" width="295" height="194" rx="7" fill={P.navy} />
    <rect x="-143" y="-188" width="281" height="177" rx="4" fill="#233e47" />
    <path d="M-136-179H-96M-136-171H-115" stroke={P.tealLight} strokeWidth="2" opacity=".45" />
    {Array.from({ length: rings }, (_, index) => <ellipse key={index} cx={-19 + index * 5} cy="-103" rx={39 + index * 13} ry={22 + index * 9} transform={`rotate(${-17 + index * 8} -19 -103)`} fill="none" stroke={index % 2 ? P.coral : P.tealLight} strokeWidth="2.5" opacity={.9 - index * .055} />)}
    <circle cx="96" cy="-145" r="4" fill={P.coral} opacity=".85" />
    <circle cx="-109" cy="-66" r="2" fill={P.tealLight} /><circle cx="96" cy="-51" r="2.5" fill={P.tealLight} />
    <path d="M-120-4V3H-99V-4M94-4V3H115V-4" fill={P.navy} />
  </g>;
}

export function ProjectorGlyph() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="1" cy="2" rx="27" ry="5" fill={P.shadow} opacity=".7" />
    <path d="M0-61V-2M0-29-24-1M0-29 24-1" stroke={P.navy} strokeWidth="3.5" />
    <path d="M-25-82H19L28-87H-16Z" fill={P.silver} stroke="#a8b9b1" />
    <path d="M19-82 28-87V-63L19-58Z" fill="#d7e0d7" />
    <rect x="-25" y="-82" width="44" height="24" rx="5" fill={P.paper} stroke={P.line} strokeWidth="1.1" />
    <circle cx="8" cy="-70" r="7" fill={P.navy} /><circle cx="8" cy="-70" r="4" fill={P.teal} />
    <path d="M-18-74H-6M-18-70H-6M-18-66H-6" stroke={P.silverDark} strokeWidth="1.3" />
  </g>;
}

export function SensorGlyph({ type = 'image' }: { type?: 'image' | 'depth' }) {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cy="2" rx="13" ry="3" fill={P.shadow} opacity=".8" />
    <path d="M0-15V1M-8 1H8" stroke={P.navy} strokeWidth="2.5" />
    <rect x="-12" y="-24" width="24" height="12" rx="5" fill={P.navy} />
    <circle cx={type === 'depth' ? -4 : 0} cy="-18" r="3" fill={P.tealLight} />{type === 'depth' && <><circle cx="6" cy="-18" r="2.5" fill={P.teal} /></>}
  </g>;
}

export function PrinterStandGlyph() {
  return <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cy="2" rx="26" ry="5" fill={P.shadow} opacity=".6" />
    <path d="M-24-50H20L28-55H-16Z" fill={P.paper} stroke="#c2cec5" />
    <path d="M20-50 28-55V-5L20 0Z" fill="#cbd8cf" />
    <path d="M-24-50H20V0H-24Z" fill="#e2e8df" stroke="#c2cec5" />
    <path d="M-12-42V-7M8-42V-7" stroke="#d0d9ce" />
  </g>;
}

export function EventPhotoZoneGlyph() {
  return <g strokeLinejoin="round">
    <ellipse cx="1" cy="2" rx="57" ry="8" fill={P.shadow} opacity=".7" />
    <path d="M-48 0V-112a48 48 0 0 1 96 0V0" fill="#e9b19a" stroke="#d59f85" strokeWidth="1.5" />
    <path d="M-34-1V-111a34 34 0 0 1 68 0V-1" fill="#f7ecdc" />
    <circle cx="1" cy="-99" r="22" fill={P.tealLight} />
    <path d="M-20-10Q-31-75-7-68 22-64 23-10" fill="#dacdb7" />
    <path d="M-48 0H49L58-6H-39Z" fill="#cc947c" />
    <path d="M-48-9H48" stroke="#d4a18c" />
  </g>;
}
