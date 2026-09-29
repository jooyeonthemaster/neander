import type { PhotoBoothTemplateAppearance } from '@/lib/quote/photo-booth-templates';
import { palette as P } from '@/components/quote-preview/illustrations/VectorPrimitives';
import { cn } from '@/lib/utils';

/** Illustrative previews of existing demo themes, never a promised AI result. */
export function PhotoBoothTemplateArt({ appearance, label, className }: {
  appearance: PhotoBoothTemplateAppearance;
  label?: string;
  className?: string;
}) {
  const dark = appearance === 'idol' || appearance === 'runway';
  const paper = appearance === 'retro' || appearance === 'traditional' || appearance === 'history';
  const background = dark ? P.navy : paper ? '#eee3cb' : P.tealLight;
  return <svg viewBox="0 0 240 240" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    data-template-appearance={appearance} data-renderer="svg" className={cn('block h-auto w-full rounded-2xl', className)}>
    {label && <title>{label}</title>}
    <rect width="240" height="240" rx="20" fill={P.background} />
    <rect x="17" y="16" width="206" height="211" rx="16" fill={P.shadow} opacity=".55" />
    <rect x="14" y="12" width="212" height="212" rx="16" fill={P.paper} />
    <rect x="25" y="23" width="190" height="179" rx="9" fill={background} />
    <g strokeLinecap="round" strokeLinejoin="round">
      <Backdrop appearance={appearance} />
      {appearance === 'wedding' && <path d="M91 91Q120 61 149 91L183 187Q120 210 57 187Z" fill={P.paper} opacity=".88" />}
      <path d="M88 101Q84 61 120 61T152 102L157 152H82Z" fill={P.navy} />
      <Outfit appearance={appearance} />
      <g transform={appearance === 'caricature' ? 'translate(-28 -22) scale(1.23)' : undefined}>
        <path d="M110 119H130V145Q120 153 110 145Z" fill="#dba981" />
        <ellipse cx="120" cy="102" rx="27" ry="33" fill="#ebc6a5" />
        <path d="M91 96Q86 67 117 66 146 58 151 98L137 83Q115 94 99 83L92 101Z" fill={P.navy} />
        <path d="M105 104H109M131 104H135" stroke={P.navy} strokeWidth="3" />
        <path d="M120 106 118 116 123 116" fill="none" stroke="#c18c70" strokeWidth="1.5" />
        <path d="M114 123Q120 128 127 122" fill="none" stroke={appearance === 'idol' ? '#bf6472' : '#ae7560'} strokeWidth="2" />
        {appearance === 'caricature' && <><path d="M105 120Q120 140 138 119" fill={P.paper} stroke={P.navy} strokeWidth="1.5" /><circle cx="100" cy="116" r="5" fill={P.coral} opacity=".7" /></>}
        {appearance === 'idol' && <><path d="M102 101 108 99M132 99 138 101" stroke={P.navy} strokeWidth="2" /><ellipse cx="102" cy="114" rx="7" ry="3" fill={P.coral} opacity=".6" /><ellipse cx="138" cy="114" rx="7" ry="3" fill={P.coral} opacity=".6" /></>}
      </g>
      <Accessories appearance={appearance} />
      <path d="M98 214H142" stroke={P.line} strokeWidth="2" opacity=".35" />
    </g>
  </svg>;
}

function Backdrop({ appearance }: { appearance: PhotoBoothTemplateAppearance }) {
  switch (appearance) {
    case 'caricature': return <>
      <path d="m40 54 28-15 8 27-24 14ZM160 133l34-11 8 33-30 8Z" fill={P.ochre} />
      <path d="m170 41 4 11 12 2-9 8 2 12-11-6-11 6 2-12-9-8 12-2Z" fill={P.coral} />
      <path d="M41 103H70M44 115H62M172 94H199" stroke={P.teal} strokeWidth="4" />
    </>;
    case 'hanbok': return <>
      <path d="M33 89Q61 80 69 67 82 84 107 89M145 89Q173 80 181 67 191 84 207 89" fill={P.tealDark} />
      <path d="M45 90V151M92 91V151M158 91V151M197 91V151" stroke={P.woodLight} strokeWidth="7" />
      <path d="M35 108H103M147 108H207" stroke={P.woodLight} strokeWidth="3" />
      <circle cx="168" cy="46" r="12" fill={P.paper} />
    </>;
    case 'runway': return <>
      <path d="M42 36 95 159H38ZM198 36 145 159H204Z" fill={P.paper} opacity=".1" />
      <path d="M49 184 112 132H128L191 184Z" fill={P.teal} opacity=".5" />
      <path d="M40 41H77M40 49H61M163 41H199M179 49H199" stroke={P.paper} strokeWidth="2" opacity=".7" />
      <path d="M38 152H57M184 159H202" stroke={P.coral} strokeWidth="4" />
    </>;
    case 'retro': return <>
      <path d="M37 35V191M52 35V191M189 35V191M203 35V191" stroke={P.ochre} strokeWidth="4" opacity=".5" />
      <circle cx="175" cy="74" r="22" fill={P.coral} opacity=".55" />
      <path d="M37 160Q70 135 83 161M158 174Q183 148 205 173" fill="none" stroke={P.tealDark} strokeWidth="6" />
    </>;
    case 'idol': return <>
      <path d="M38 25 96 149 126 138 73 25ZM193 25 151 132 168 141 210 55Z" fill={P.coral} opacity=".2" />
      <Star x={56} y={68} /><Star x={181} y={87} /><Star x={62} y={146} />
      <circle cx="166" cy="40" r="4" fill={P.tealLight} /><circle cx="191" cy="149" r="4" fill={P.tealLight} />
    </>;
    case 'photocard': return <>
      <rect x="37" y="35" width="166" height="154" rx="12" fill="none" stroke={P.paper} strokeWidth="3" />
      <path d="m47 49 13 7 14-7-4 16 4 16-14-7-13 7 4-16Z" fill={P.coral} />
      <Star x={182} y={53} /><Star x={178} y={161} />
      <path d="M49 165H71M49 175H66" stroke={P.tealDark} strokeWidth="2" />
    </>;
    case 'graduation': return <>
      <path d="M33 76 68 49 103 76ZM145 76 177 49 208 76Z" fill={P.woodLight} />
      <path d="M42 81V170M61 81V170M81 81V170M157 81V170M176 81V170M196 81V170" stroke={P.paper} strokeWidth="9" />
      <path d="M35 173H97M149 173H206" stroke={P.woodLight} strokeWidth="5" />
    </>;
    case 'history': return <>
      <path d="M32 106 61 55 94 110 119 91 151 126 178 62 209 115V191H32Z" fill={P.tealDark} opacity=".17" />
      <circle cx="179" cy="51" r="15" fill={P.coral} opacity=".75" />
      <path d="M40 170Q73 151 88 172M153 163Q181 147 201 162" fill="none" stroke={P.woodLight} strokeWidth="2" />
    </>;
    case 'avatar': return <>
      <rect x="36" y="37" width="47" height="47" rx="13" fill={P.coral} />
      <circle cx="184" cy="85" r="19" fill={P.ochre} />
      <path d="m39 164 20-27 20 27Z" fill={P.teal} />
      {[P.navy, P.coral, P.teal, P.paper].map((color, index) => <rect key={color} x={163 + index * 10} y="168" width="8" height="16" rx="3" fill={color} />)}
    </>;
    case 'traditional': return <>
      <path d="M39 177Q70 136 42 74M44 104 67 84M49 136 71 116" fill="none" stroke={P.tealDark} strokeWidth="3" />
      <path d="M39 76Q62 69 55 54 40 57 39 76ZM60 88Q81 80 80 67 62 67 60 88ZM68 119Q86 116 84 102 69 101 68 119Z" fill={P.tealDark} opacity=".65" />
      <path d="M178 56V117M187 52V106M176 143H193V162H176Z" fill="none" stroke={P.woodLight} strokeWidth="2" opacity=".65" />
      <rect x="175" y="143" width="18" height="18" rx="2" fill={P.coral} opacity=".75" />
    </>;
    case 'wedding': return <>
      <path d="M45 176V89Q45 37 120 37T195 89V176" fill="none" stroke={P.paper} strokeWidth="8" />
      <path d="M51 133 41 93M188 129 201 91" stroke={P.tealDark} strokeWidth="2" />
      {[{ x: 46, y: 94 }, { x: 59, y: 64 }, { x: 183, y: 64 }, { x: 194, y: 100 }].map(({ x, y }) => <g key={x}><circle cx={x} cy={y} r="9" fill={P.coral} /><circle cx={x} cy={y} r="3" fill={P.paper} /></g>)}
    </>;
  }
}

function Outfit({ appearance }: { appearance: PhotoBoothTemplateAppearance }) {
  const formal = appearance === 'runway' || appearance === 'graduation' || appearance === 'history';
  const color = formal ? P.navy : appearance === 'wedding' ? P.paper : appearance === 'retro' ? P.ochre : appearance === 'idol' ? P.coral : P.tealDark;
  return <>
    <path d="M108 140Q89 143 82 160L66 202H174L158 160Q151 143 132 140L120 149Z" fill={color} />
    {appearance === 'hanbok' ? <>
      <path d="M82 170H158L178 202H62Z" fill={P.coral} /><path d="M107 140 133 168M132 140 109 158" fill="none" stroke={P.paper} strokeWidth="8" />
      <path d="m132 167 16-4-8 10 12 15M132 168l1 24" fill="none" stroke={P.ochre} strokeWidth="4" />
    </> : appearance === 'history' ? <>
      <path d="m108 139 31 39M132 139 112 163" fill="none" stroke={P.paper} strokeWidth="7" /><rect x="95" y="178" width="50" height="20" rx="3" fill={P.ochre} /><path d="m111 188 8-6 10 6-10 6Z" fill={P.tealDark} />
    </> : appearance === 'graduation' ? <>
      <path d="m102 143 10 43 8-10 8 10 10-43" fill="none" stroke={P.ochre} strokeWidth="9" />
      <path d="M93 162V195M147 162V195" stroke={P.line} strokeWidth="2" />
    </> : appearance === 'wedding' ? <>
      <path d="M98 153 120 169 142 153" fill="none" stroke={P.tealLight} strokeWidth="3" />
      <path d="M106 202 116 180 128 202" fill={P.tealDark} /><circle cx="117" cy="177" r="11" fill={P.coral} /><circle cx="130" cy="181" r="9" fill={P.ochre} /><circle cx="107" cy="184" r="8" fill={P.tealLight} />
    </> : appearance === 'runway' ? <>
      <path d="m107 142-12 31 25 29 25-29-12-31-13 15Z" fill={P.coral} /><path d="M120 159V202" stroke={P.navy} strokeWidth="2" />
    </> : <>
      <path d="M105 143Q120 165 135 143" fill="none" stroke={P.paper} strokeWidth="5" />
      {appearance === 'retro' && <path d="M92 168H148M84 182H156M77 196H163" stroke={P.paper} strokeWidth="3" opacity=".6" />}
      {appearance === 'idol' && <path d="m120 172 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill={P.paper} />}
    </>}
  </>;
}

function Accessories({ appearance }: { appearance: PhotoBoothTemplateAppearance }) {
  switch (appearance) {
    case 'graduation': return <><path d="M96 60V74Q120 83 144 74V60Z" fill={P.navy} /><path d="m82 59 38-14 38 14-38 13Z" fill={P.navy} stroke={P.line} strokeWidth="2" /><path d="M151 62V89" stroke={P.ochre} strokeWidth="3" /><path d="m148 88 6 0 3 10h-12Z" fill={P.ochre} /></>;
    case 'history': return <><path d="M96 73V56Q120 44 144 56V73Z" fill={P.navy} /><path d="M75 75Q120 68 165 75" stroke={P.navy} strokeWidth="10" /><path d="M96 77 97 134M144 77 143 134" stroke={P.navy} strokeWidth="1.5" /></>;
    case 'retro': return <><circle cx="106" cy="106" r="10" fill="none" stroke={P.navy} strokeWidth="3" /><circle cx="134" cy="106" r="10" fill="none" stroke={P.navy} strokeWidth="3" /><path d="M116 105H124M97 102 90 99M143 102 150 99" stroke={P.navy} strokeWidth="2" /><path d="M93 76Q119 63 146 78" stroke={P.coral} strokeWidth="8" /></>;
    case 'hanbok': return <><path d="M144 82 158 84" stroke={P.ochre} strokeWidth="4" /><circle cx="155" cy="81" r="5" fill={P.coral} /></>;
    case 'idol': return <><path d="m147 85 5-4M148 92l6-2" stroke={P.paper} strokeWidth="3" /><circle cx="91" cy="119" r="4" fill={P.ochre} /><circle cx="149" cy="119" r="4" fill={P.ochre} /></>;
    case 'wedding': return <><path d="M95 78Q120 59 145 78" fill="none" stroke={P.paper} strokeWidth="7" /><circle cx="106" cy="70" r="4" fill={P.coral} /><circle cx="121" cy="66" r="4" fill={P.coral} /><circle cx="135" cy="70" r="4" fill={P.coral} /></>;
    default: return null;
  }
}

function Star({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="M0-9 3-3 9 0 3 3 0 9-3 3-9 0-3-3Z" fill={P.paper} />;
}
