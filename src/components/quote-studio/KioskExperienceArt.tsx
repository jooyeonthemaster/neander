import { palette as P } from '@/components/quote-preview/illustrations/VectorPrimitives';
import { cn } from '@/lib/utils';

const SKIN = '#e6bb99';
const LILAC = '#b6aecb';

function Spark({ x, y, size = 6, color = P.coral }: { x: number; y: number; size?: number; color?: string }) {
  return <path d={`M${x} ${y - size}l${size * .32} ${size * .68}L${x + size} ${y}l${-size * .68} ${size * .32}L${x} ${y + size}l${-size * .32} ${-size * .68}L${x - size} ${y}l${size * .68} ${-size * .32}Z`} fill={color} />;
}

function Bust({ x = 40, y = 53, scale = 1, shirt = P.teal, bob = false }: { x?: number; y?: number; scale?: number; shirt?: string; bob?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {bob && <path d="M-13-6V-17Q-13-33 1-33T14-17V7H-14Z" fill={P.navy} />}
    <path d="M-21 23V15Q-20 4-7 2H7Q20 4 21 15V23Z" fill={shirt} />
    <path d="M-5-4H5V6Q0 11-5 6Z" fill="#cf9b78" />
    <ellipse cy="-14" rx="11" ry="14" fill={SKIN} />
    <path d="M-11-16Q-16-31 0-32 14-33 12-15L6-23Q-2-17-8-22Z" fill={P.navy} />
    <path d="M-5-13H-3M3-13H5" stroke={P.navy} strokeWidth="1.7" />
    <path d="M-3-6Q0-3 4-7" fill="none" stroke="#ae7764" strokeWidth="1.4" />
  </g>;
}

function Note({ x, y, scale = 1, color = P.teal }: { x: number; y: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 7V-13L14-17V3M0-7 14-11" fill="none" stroke={color} strokeWidth="3" />
    <ellipse cx="-4" cy="8" rx="5" ry="4" fill={color} /><ellipse cx="10" cy="4" rx="5" ry="4" fill={color} />
  </g>;
}

function Heart({ x, y, scale = 1, color = P.coral }: { x: number; y: number; scale?: number; color?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0 9Q-18-3-10-10-4-15 0-8 4-15 10-10 18-3 0 9Z" fill={color} />;
}

function Palm() {
  return <path d="M30 81Q21 75 18 63L10 49Q7 43 12 40 16 38 20 45L26 53V28Q26 23 30 23T34 28V51 20Q34 15 38 15T42 20V50 25Q42 20 46 20T50 25V53 35Q50 30 54 30T58 35V62Q58 75 50 82Z" fill={SKIN} stroke="#c69a7c" strokeWidth="1.3" />;
}

function Artwork({ slug }: { slug: string }) {
  switch (slug) {
    case 'ai-personal-color': return <>
      <Bust y={54} shirt={P.paper} bob />
      {[P.coral, P.ochre, P.tealLight, P.teal, LILAC].map((color, index) => <rect key={color} x={13 + index * 11} y={63 + Math.abs(index - 2) * 3} width="10" height="19" rx="3" fill={color} transform={`rotate(${(index - 2) * 11} ${18 + index * 11} 73)`} />)}
      <Spark x={63} y={24} color={P.ochre} />
    </>;
    case 'ai-skincare-analysis': return <>
      <Bust x={34} y={57} shirt={P.paper} bob />
      <path d="M51 27 59 17 67 24 59 35" fill={P.teal} /><path d="m58 32-9 13" stroke={P.tealDark} strokeWidth="4" />
      <path d="M62 47Q51 60 62 64 73 60 62 47Z" fill={P.teal} />
      <path d="M28 46Q35 51 41 45" fill="none" stroke={P.paper} strokeWidth="4" /><Spark x={16} y={25} size={5} />
    </>;
    case 'ai-nail-designer': return <>
      <rect x="21" y="45" width="33" height="34" rx="9" fill={P.coral} /><rect x="29" y="25" width="17" height="23" rx="4" fill={P.navy} />
      <rect x="27" y="55" width="21" height="14" rx="4" fill={P.paper} /><path d="M33 27V44" stroke={P.silverDark} strokeWidth="2" />
      <g transform="rotate(22 62 53)"><rect x="55" y="35" width="12" height="35" rx="6" fill={SKIN} /><rect x="57" y="38" width="8" height="15" rx="4" fill={LILAC} /></g>
      <Spark x={18} y={29} size={5} /><Spark x={59} y={21} size={4} color={P.teal} />
    </>;
    case 'ai-sommelier': return <>
      <path d="M18 18H28V34Q35 39 35 47V80H11V47Q11 39 18 34Z" fill={P.tealDark} /><rect x="17" y="14" width="12" height="13" rx="2" fill={P.ochre} />
      <rect x="14" y="51" width="18" height="19" rx="2" fill={P.paper} /><path d="M18 57H28M18 62H25" stroke={P.woodLight} />
      <path d="M43 32H68L65 51Q55 64 46 51Z" fill={P.paper} stroke={P.line} strokeWidth="1.5" /><path d="M45 43H66L64 51Q55 60 47 51Z" fill="#9e6f79" />
      <path d="M55 58V78M45 80H65" stroke={P.tealDark} strokeWidth="2.5" /><Spark x={61} y={21} size={5} color={P.ochre} />
    </>;
    case 'ai-cocktail-creator': return <>
      <circle cx="58" cy="31" r="13" fill="#91b18c" /><circle cx="58" cy="31" r="10" fill="#e9edbd" /><path d="M58 21V41M48 31H68M51 24 65 38" stroke="#a6bd84" strokeWidth="1.5" />
      <path d="M12 34H67L40 63Z" fill={P.paper} stroke={P.line} strokeWidth="1.5" /><path d="M20 41H59L40 61Z" fill={P.coral} />
      <path d="M40 63V80M26 82H54" stroke={P.tealDark} strokeWidth="3" /><path d="M42 44 30 18H20" fill="none" stroke={P.teal} strokeWidth="3" />
    </>;
    case 'ai-barista-matching': return <>
      <path d="M29 18Q23 25 30 31M43 15Q36 22 43 30" fill="none" stroke={P.teal} strokeWidth="2.5" />
      <ellipse cx="38" cy="78" rx="28" ry="6" fill={P.tealLight} /><path d="M57 46H64Q77 47 71 61 67 68 55 64" fill="none" stroke={P.tealDark} strokeWidth="5" />
      <path d="M15 44H59V60Q59 75 38 75T15 60Z" fill={P.teal} /><ellipse cx="37" cy="44" rx="22" ry="8" fill={P.paper} /><ellipse cx="37" cy="44" rx="17" ry="5" fill={P.woodLight} />
      <path d="M37 47Q22 41 31 40 36 39 37 42 42 36 47 41 47 44 37 47Z" fill={P.paper} />
    </>;
    case 'ai-taste-dna': return <>
      <circle cx="41" cy="54" r="27" fill={P.paper} stroke={P.tealLight} strokeWidth="4" /><circle cx="41" cy="54" r="20" fill="#eee7d7" />
      <path d="M28 61 43 35 57 61Z" fill={P.ochre} /><path d="M29 61H56" stroke={P.woodLight} strokeWidth="5" /><circle cx="42" cy="47" r="4" fill={P.coral} /><circle cx="46" cy="57" r="3" fill={P.coral} />
      <path d="M8 36V77M4 28V42Q8 48 12 42V28M8 28V42M73 28V77M69 29V48H73" fill="none" stroke={P.tealDark} strokeWidth="2" /><Spark x={23} y={20} size={5} />
    </>;
    case 'ai-style-profiler': return <>
      <path d="M25 29 9 38 17 55 25 51V80H57V51L64 55 72 38 55 29 40 35Z" fill={P.teal} />
      <path d="M25 29 40 35 34 47 26 41ZM55 29 40 35 46 47 55 41Z" fill={P.paper} /><path d="M40 43V79" stroke={P.tealDark} strokeWidth="2" />
      <path d="M48 57H55V65H48Z" fill={P.tealLight} /><path d="M29 18H49" stroke={P.navy} strokeWidth="3" /><circle cx="22" cy="17" r="5" fill={P.coral} />
    </>;
    case 'ai-coord-recommender': return <>
      <path d="M32 22Q30 13 38 13T44 23L21 37H64L42 25" fill="none" stroke={P.tealDark} strokeWidth="2.5" />
      <path d="M24 31 12 39 17 52 24 49V64H52V49L59 52 64 39 52 31 38 36Z" fill={P.coral} /><path d="M31 32Q38 43 45 32" fill="none" stroke={P.paper} strokeWidth="3" />
      <path d="M29 62H53L57 83H43L41 69 39 83H25Z" fill={P.navy} /><rect x="58" y="66" width="15" height="13" rx="3" fill={P.ochre} /><path d="M62 66V63Q66 58 69 63V66" fill="none" stroke={P.woodLight} strokeWidth="2" />
    </>;
    case 'ai-musicvideo-maker': return <>
      <rect x="10" y="32" width="58" height="44" rx="6" fill={P.navy} /><rect x="15" y="38" width="48" height="32" rx="3" fill={P.teal} />
      <path d="M32 44 49 54 32 64Z" fill={P.paper} /><path d="M12 28 64 17 68 30 14 41Z" fill={P.navy} /><path d="m23 26 9 10m7-13 9 10m7-13 8 10" stroke={P.paper} strokeWidth="5" />
      <Note x={62} y={79} scale={.55} color={P.coral} />
    </>;
    case 'ai-celeb-lookalike': return <>
      <rect x="7" y="24" width="30" height="54" rx="6" fill={P.paper} stroke={P.tealLight} strokeWidth="2" /><rect x="43" y="24" width="30" height="54" rx="6" fill={P.tealLight} />
      <Bust x={22} y={58} scale={.59} shirt={P.teal} /><Bust x={58} y={58} scale={.59} shirt={P.coral} bob />
      <Spark x={59} y={20} size={9} color={P.ochre} /><path d="M34 82H48M42 77 48 82 42 87" fill="none" stroke={P.tealDark} strokeWidth="2" />
    </>;
    case 'ai-voice-lab': return <>
      <rect x="28" y="20" width="25" height="43" rx="12.5" fill={P.tealDark} /><path d="M34 29H46M34 36H46M34 43H46" stroke={P.tealLight} strokeWidth="2.5" />
      <path d="M21 49V53Q21 72 40 72T60 53V49M40 72V83M29 84H51" fill="none" stroke={P.navy} strokeWidth="3" />
      <path d="M10 39V53M16 34V58M66 35V56M72 40V51" stroke={P.coral} strokeWidth="3" />
    </>;
    case 'ai-future-career': return <>
      <Bust x={36} y={54} scale={1.02} shirt={P.tealDark} /><path d="M28 58 35 65 42 58 39 71 35 77 31 71Z" fill={P.paper} />
      <rect x="43" y="65" width="28" height="20" rx="4" fill={P.ochre} /><path d="M51 65V60H62V65M44 73H70" fill="none" stroke={P.wood} strokeWidth="2" /><rect x="55" y="71" width="5" height="6" rx="1" fill={P.paper} />
      <Spark x={62} y={24} size={8} />
    </>;
    case 'ai-fortune-robot': return <>
      <circle cx="39" cy="45" r="25" fill={P.tealDark} /><path d="M43 24A20 20 0 1 0 59 52 22 22 0 0 1 43 24Z" fill={P.tealLight} />
      <Spark x={49} y={37} size={7} color={P.ochre} /><circle cx="32" cy="59" r="2" fill={P.paper} />
      <path d="M25 67H54L61 80H18Z" fill={P.navy} /><path d="M21 80H58" stroke={P.ochre} strokeWidth="3" /><Spark x={68} y={17} size={5} />
    </>;
    case 'ai-face-reading': return <>
      <Bust y={54} scale={1.08} shirt={P.tealLight} />
      <path d="M14 38V25H26M54 25H66V38M14 65V78H26M54 78H66V65" fill="none" stroke={P.tealDark} strokeWidth="2.5" />
      <path d="M27 41H52M31 55 49 55M40 28V60" fill="none" stroke={P.coral} strokeWidth="1.6" strokeDasharray="3 3" /><circle cx="40" cy="42" r="3" fill={P.paper} stroke={P.teal} />
    </>;
    case 'ai-palm-reading': return <>
      <Palm /><path d="M29 57Q40 49 48 57M31 64Q40 58 48 63M28 51Q39 65 34 74M42 55V73" fill="none" stroke={P.tealDark} strokeWidth="2" />
      <Spark x={65} y={22} size={7} /><circle cx="66" cy="54" r="4" fill={P.tealLight} />
    </>;
    case 'ai-caricature-artist': return <>
      <rect x="10" y="17" width="49" height="66" rx="5" fill={P.paper} stroke={P.tealLight} strokeWidth="2" /><Bust x={35} y={57} scale={1.06} shirt={P.tealLight} bob />
      <path d="M27 50Q35 61 44 49" fill={P.paper} stroke={P.navy} strokeWidth="1.4" /><circle cx="25" cy="45" r="3" fill={P.coral} />
      <g transform="rotate(24 63 61)"><rect x="59" y="34" width="9" height="42" rx="2" fill={P.ochre} /><path d="M59 76 63.5 86 68 76Z" fill={SKIN} /><path d="M61 81 63.5 86 66 81Z" fill={P.navy} /><rect x="59" y="30" width="9" height="9" rx="2" fill={P.coral} /></g>
    </>;
    case 'ai-aura-reading': return <>
      <ellipse cx="40" cy="49" rx="32" ry="38" fill={LILAC} opacity=".35" /><ellipse cx="40" cy="51" rx="25" ry="30" fill={P.coral} opacity=".32" /><ellipse cx="40" cy="54" rx="19" ry="23" fill={P.tealLight} />
      <Bust x={40} y={59} scale={.86} shirt={P.paper} bob /><Spark x={63} y={24} size={6} color={P.teal} /><Spark x={13} y={61} size={5} color={P.ochre} />
    </>;
    case 'ai-team-chemistry': return <>
      <path d="M19 65 40 30 61 65Z" fill="none" stroke={P.tealLight} strokeWidth="4" />
      <circle cx="40" cy="33" r="18" fill={P.paper} /><Bust x={40} y={36} scale={.62} shirt={P.teal} />
      <circle cx="19" cy="65" r="17" fill={P.paper} /><Bust x={19} y={68} scale={.59} shirt={P.coral} bob />
      <circle cx="61" cy="65" r="17" fill={P.paper} /><Bust x={61} y={68} scale={.59} shirt={LILAC} />
      <Spark x={40} y={65} size={6} color={P.ochre} />
    </>;
    case 'ai-business-card': return <>
      <rect x="15" y="22" width="58" height="39" rx="5" fill={P.tealLight} transform="rotate(12 44 41)" />
      <rect x="7" y="35" width="64" height="43" rx="6" fill={P.paper} stroke={P.tealDark} strokeWidth="1.8" /><rect x="12" y="41" width="22" height="30" rx="4" fill={P.tealLight} />
      <Bust x={23} y={57} scale={.44} shirt={P.tealDark} /><path d="M41 46H61M41 53H55M41 64H62M41 70H53" stroke={P.teal} strokeWidth="2.5" /><Spark x={59} y={18} size={6} />
    </>;
    case 'ai-traditional-painter': return <>
      <path d="M17 20H60V80H17Z" fill="#eee4ce" /><path d="M14 19H62M14 81H62" stroke={P.wood} strokeWidth="5" />
      <circle cx="48" cy="37" r="9" fill={P.coral} /><path d="M18 65 33 44 48 66 57 52 60 71H18Z" fill={P.tealDark} opacity=".78" /><path d="M19 72Q34 64 49 74" fill="none" stroke={P.paper} strokeWidth="2" />
      <path d="M64 61 70 26" stroke={P.woodLight} strokeWidth="5" /><path d="M62 60Q70 61 64 70L58 76 59 67Z" fill={P.navy} /><rect x="50" y="70" width="6" height="6" fill={P.coral} />
    </>;
    case 'ai-travel-style': return <>
      <path d="M21 37V28H39V37" fill="none" stroke={P.navy} strokeWidth="3" /><rect x="10" y="36" width="42" height="44" rx="8" fill={P.teal} /><path d="M19 39V78M42 39V78" stroke={P.tealDark} strokeWidth="3" /><path d="M19 80V84M44 80V84" stroke={P.navy} strokeWidth="4" />
      <path d="M59 56Q37 32 47 22 59 10 71 22 81 32 59 56Z" fill={P.coral} /><circle cx="59" cy="29" r="7" fill={P.paper} /><rect x="27" y="51" width="13" height="12" rx="3" fill={P.paper} transform="rotate(-12 34 57)" />
    </>;
    case 'ai-couple-chemistry': return <>
      <path d="M16 60Q40 39 64 60" fill="none" stroke={P.tealLight} strokeWidth="9" /><Bust x={23} y={60} scale={.83} shirt={P.teal} /><Bust x={58} y={60} scale={.83} shirt={P.coral} bob />
      <Heart x={41} y={25} scale={.85} /><path d="M32 76Q41 83 49 76" fill="none" stroke={P.ochre} strokeWidth="2" />
    </>;
    case 'ai-memory-movie': return <>
      <rect x="8" y="18" width="63" height="66" rx="5" fill={P.navy} /><rect x="13" y="30" width="53" height="40" rx="3" fill={P.tealLight} />
      <Bust x={27} y={54} scale={.61} shirt={P.tealDark} /><Bust x={52} y={54} scale={.61} shirt={P.coral} bob />
      {[17, 29, 41, 53].map((x) => <g key={x}><rect x={x} y="22" width="7" height="4" rx="1" fill={P.paper} /><rect x={x} y="76" width="7" height="4" rx="1" fill={P.paper} /></g>)}
      <Heart x={58} y={22} scale={.55} /><circle cx="20" cy="39" r="5" fill={P.ochre} />
    </>;
    default: return <>
      <rect x="22" y="17" width="37" height="56" rx="6" fill={P.navy} /><rect x="27" y="23" width="27" height="40" rx="3" fill={P.paper} />
      <Spark x={41} y={43} size={10} color={P.teal} /><path d="M35 74V82M46 74V82M28 84H54" stroke={P.navy} strokeWidth="4" />
    </>;
  }
}

/** Small topic art for an existing kiosk experience; the adjacent card names it. */
export function KioskExperienceArt({ slug, className }: { slug: string; className?: string }) {
  return <svg viewBox="0 0 80 96" aria-hidden="true" focusable="false" data-kiosk-experience-art={slug} data-renderer="svg"
    className={cn('block h-full w-full', className)}>
    <rect width="80" height="96" rx="12" fill={P.background} />
    <circle cx="52" cy="31" r="26" fill={P.tealLight} opacity=".32" />
    <ellipse cx="40" cy="87" rx="29" ry="3" fill={P.shadow} opacity=".65" />
    <g strokeLinecap="round" strokeLinejoin="round"><Artwork slug={slug} /></g>
  </svg>;
}
