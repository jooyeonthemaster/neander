'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SERVICE_TEXT, type Lang, type ServiceKey } from '@/lib/quote/catalog';
import type { QuoteInput } from '@/lib/quote/engine';
import { EVENT_SCENE_FLOOR, resolveEventScene } from '@/lib/quote-preview/event-scene';
import { perfumeCounterWidth } from '@/lib/quote-preview/perfume-furniture';
import { PreviewCanvas } from './PreviewCanvas';
import { CustomContentTablet } from './CustomContentTablet';
import { KioskExperienceGlyph } from './illustrations/ServiceIllustration';
import { KioskGlyph, PerfumeBottleGlyph, PersonGlyph, PhotoBoothGlyph, PrinterGlyph, TeamGlyph, palette as P } from './illustrations/VectorPrimitives';
import { EventPerfumeCounterGlyph, EventPhotoZoneGlyph, MediaWallGlyph, PrinterStandGlyph, ProjectorGlyph, SensorGlyph } from './illustrations/EventSceneGlyphs';

type SceneModel = NonNullable<ReturnType<typeof resolveEventScene>>;
type SceneObject = SceneModel['objects'][number];

function cameraFor(model: SceneModel): string {
  // Focus only follows the selected inventory, never the editor's active tab.
  // Include the actual wall volume as well as every selected object. A single
  // experience gets closer without changing equipment scale or placement.
  const bounds = model.bounds;
  const top = bounds.top;
  const width = Math.max(650, bounds.right - bounds.left + 140);
  const height = Math.max(400, bounds.bottom - top + 140);
  const left = Math.max(0, (bounds.left + bounds.right - width) / 2);
  const upper = Math.max(0, (top + bounds.bottom - height) / 2);
  return `${left} ${upper} ${width} ${height}`;
}

function ObjectGlyph({ object }: { object: SceneObject }) {
  switch (object.type) {
    case 'team': return <TeamGlyph variant={object.variant} />;
    case 'counter': return <><EventPerfumeCounterGlyph racks={object.racks} /><g transform={`translate(${perfumeCounterWidth(object.racks ?? 1) / 2 - 105} 0)`}><PerfumeBottleGlyph x={62} y={-71} scale={.33} volume={object.volume} packaging={object.packaging} />{object.customScent && <path d="m34-94 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill={P.teal} />}</g></>;
    case 'analysis-kiosk': return <KioskGlyph />;
    case 'photo-booth': return <PhotoBoothGlyph wrapped={object.wrapped} />;
    case 'kiosk': return <KioskExperienceGlyph slug={object.slug ?? ''} branded={object.branded} />;
    case 'printer': return <><PrinterStandGlyph /><PrinterGlyph y={-50} /></>;
    case 'media-screen': return <MediaWallGlyph grade={object.grade ?? 'standard'} />;
    case 'projector': return <ProjectorGlyph />;
    case 'sensor': return <SensorGlyph type={object.sensorType} />;
    case 'media-operator': return <PersonGlyph role="assistant" variant={0} gesture="touch" />;
    case 'media-guest': return <g transform="scale(-1 1)"><PersonGlyph role="guest" variant={2} gesture="wave" /></g>;
    case 'photo-zone': return <EventPhotoZoneGlyph />;
  }
}

function SharedFloor() {
  const [frontLeft, frontRight, backRight, backLeft] = EVENT_SCENE_FLOOR.points;
  const points = EVENT_SCENE_FLOOR.points.map((point) => `${point.x},${point.y}`).join(' ');
  return <g data-testid="event-scene-floor" aria-hidden="true" strokeLinejoin="round">
    <ellipse cx="790" cy="833" rx="656" ry="24" fill={P.navy} opacity=".04" />
    <path d={`M${frontLeft.x},${frontLeft.y}H${frontRight.x}L${backRight.x},${backRight.y}V${backRight.y + 12}L${frontRight.x},${frontRight.y + 12}H${frontLeft.x}Z`} fill="#e5e2d7" />
    <polygon points={points} fill="#eeeee5" stroke="#e0e3d9" strokeWidth="1.4" />
    {[.2, .4, .6, .8].map((part) => <path key={`column-${part}`} d={`M${frontLeft.x + (frontRight.x - frontLeft.x) * part},${frontLeft.y}L${backLeft.x + (backRight.x - backLeft.x) * part},${backLeft.y}`} stroke="#e1e4da" strokeWidth="1" />)}
    {[.25, .5, .75].map((part) => <path key={`row-${part}`} d={`M${frontLeft.x + (backLeft.x - frontLeft.x) * part},${frontLeft.y + (backLeft.y - frontLeft.y) * part}L${frontRight.x + (backRight.x - frontRight.x) * part},${frontRight.y + (backRight.y - frontRight.y) * part}`} stroke="#e1e4da" strokeWidth="1" />)}
    <path d={`M${backLeft.x},${backLeft.y}H${backRight.x}`} stroke="#d1ddd4" strokeWidth="2" />
  </g>;
}

/** Full-height walls stand on the same projection as the shared floor.
 * All selected equipment stands inside these walls. */
function BoothFootprint({ model }: { model: SceneModel }) {
  const footprint = model.footprint;
  if (!footprint) return null;
  const [a, b, c, d] = footprint.points;
  const wallHeight = footprint.wallHeight;
  // 나무 가벽: 나뭇결 색과 세로 판재 줄, 벽 선반 / 조립식 천 부스: 천 그래픽 + 알루미늄 프레임 기둥
  const wood = model.space.build === 'wood';
  const backWidth = c.x - d.x;
  const planks = Math.max(3, Math.round(backWidth / 44));
  return <g data-testid="event-booth-footprint" data-size={footprint.size} data-build={model.space.build} aria-hidden="true" strokeLinejoin="round">
    <path data-testid="event-left-wall" d={`M${a.x},${a.y} ${d.x},${d.y}V${d.y - wallHeight}L${a.x},${a.y - wallHeight}Z`} fill={wood ? '#dcc096' : '#d9e6dc'} stroke={wood ? '#bf9f72' : '#bdcec2'} strokeWidth="1.8" />
    <path data-testid="event-back-wall" d={`M${d.x},${d.y}H${c.x}V${c.y - wallHeight}H${d.x}Z`} fill={wood ? '#ecd6b2' : '#f0eee3'} stroke={wood ? '#caa97c' : '#d0d6c8'} strokeWidth="1.8" />
    {wood ? <g data-testid="event-wood-walls">
      {Array.from({ length: planks }, (_, i) => <path key={i} d={`M${d.x + backWidth * (i + 1) / (planks + 1)},${d.y}V${d.y - wallHeight}`} stroke="#d8bb8e" strokeWidth="1.2" />)}
      {[.2, .4, .6, .8].map((part) => <path key={part} d={`M${a.x + (d.x - a.x) * part},${a.y + (d.y - a.y) * part}v${-wallHeight}`} stroke="#c8a87b" strokeWidth="1.1" />)}
      {[.38, .62].map((part) => <g key={part}>
        <path d={`M${d.x + backWidth * .56},${d.y - wallHeight * part}H${c.x - 22}`} stroke="#a9825a" strokeWidth="6" strokeLinecap="round" />
        <path d={`M${d.x + backWidth * .56},${d.y - wallHeight * part + 4}H${c.x - 22}`} stroke="#8f6c48" strokeWidth="1.5" opacity=".5" />
      </g>)}
    </g> : <>
      <path d={`M${d.x},${d.y - wallHeight}h${Math.min(130, backWidth * .28)}v${wallHeight}H${d.x}Z`} fill="#c4ddd2" />
      <g data-testid="event-fabric-frame" stroke="#b4bcb8" strokeWidth="2.4" strokeLinecap="round">
        <path d={`M${a.x},${a.y}V${a.y - wallHeight}`} /><path d={`M${d.x},${d.y}V${d.y - wallHeight}`} /><path d={`M${c.x},${c.y}V${c.y - wallHeight}`} />
      </g>
    </>}
    <path d={`M${a.x},${a.y - wallHeight}l${d.x - a.x},${d.y - a.y}H${c.x}`} fill="none" stroke={P.paper} strokeWidth="5" />
    <path d={`M${d.x + 15},${d.y - wallHeight + 17}H${c.x - 14}`} stroke="#fffdf5" strokeWidth="5" strokeLinecap="round" />
    <path d={`M${d.x},${d.y}H${c.x}`} stroke="#c2c7b8" strokeWidth="5" />
    <polygon points={footprint.points.map((point) => `${point.x},${point.y}`).join(' ')} fill="#e3dbc9" stroke="#c6c3ae" strokeWidth="1.6" />
    {[.25, .5, .75].map((part) => <path key={part} d={`M${a.x + (b.x - a.x) * part},${a.y}L${d.x + (c.x - d.x) * part},${d.y}`} stroke="#d3cfbc" strokeWidth="1" />)}
    <path d={`M${a.x},${a.y}H${b.x}`} stroke="#baa88e" strokeWidth="4" />
    {model.space.lighting && <g data-testid="event-lighting" strokeLinecap="round">
      <path d={`M${d.x + 15},${d.y - wallHeight + 30}H${c.x - 15}`} stroke="#9c967d" strokeWidth="3" />
      {[.2, .5, .8].map((part) => <g key={part} transform={`translate(${d.x + (c.x - d.x) * part} ${d.y - wallHeight + 30})`}>
        <path d="M0 0V12" stroke="#8f8d79" strokeWidth="2.5" /><path d="M-7 12H7L12 23H-12Z" fill="#dfb76d" stroke="#c49b50" />
        <path d="M-6 23-48 196H48L6 23Z" fill="#f6d994" opacity=".13" />
      </g>)}
    </g>}
  </g>;
}

/** All physical services share one floor, scale, camera and stable placement.
 * The external legend changes emphasis; it never changes the scene inventory. */
export function EventScene({ input, lang, activeKey }: {
  input: QuoteInput;
  lang: Lang;
  activeKey: ServiceKey | null;
  onActiveKeyChange?: (key: ServiceKey | null) => void;
}) {
  const reducedMotion = useReducedMotion();
  const desktop = useMediaQuery('lg');
  const model = resolveEventScene(input);
  const custom = input.items.find(item => item.key === 'custom');
  const duration = reducedMotion ? 0 : .2;
  const Svg = reducedMotion ? 'svg' : motion.svg;
  const fittedCamera = model ? cameraFor(model) : '0 425 1600 460';
  // Reserve the right side for the digital-content tablet so it never hides
  // selected equipment in the initial overview. The viewport itself is fixed.
  const [left, top, width, height] = fittedCamera.split(' ').map(Number);
  const camera = custom ? `${left} ${top} ${width / (desktop ? .58 : .5)} ${height}` : fittedCamera;
  const cameraMotion = reducedMotion ? {} : { initial: false as const, animate: { viewBox: camera }, transition: { duration } };
  const title = !model ? (lang === 'ko' ? '아직 체험을 배치하지 않은 행사 공간' : 'Event space with no experiences selected') : lang === 'ko'
    ? `한 행사 공간에 함께 배치한 ${model.services.map((key) => SERVICE_TEXT[key].name.ko).join(', ')}`
    : `${model.services.map((key) => SERVICE_TEXT[key].name.en).join(', ')} together in one event venue`;
  const services: ServiceKey[] = ['spatialDesign', 'mediaArt', 'photoBooth', 'acscent', 'rental'];
  const illustratedTeams = model?.objects.filter(object => object.type === 'team').length ?? 0;
  const summarizedTeams = model && model.counts.teams > illustratedTeams;

  return <div data-testid="event-scene" data-renderer="svg" data-empty={!model} data-space={model?.footprint?.size ?? 'existing'} data-needs-placement={model?.needsPlacement ?? false}
    data-teams={model?.counts.teams ?? 0} data-analysis-kiosks={model?.counts.analysisKiosks ?? 0} data-photo-booths={model?.counts.photoBooths ?? 0} data-kiosks={model?.counts.kiosks ?? 0}
    className="overflow-hidden bg-[#f7f5f0]">
    <PreviewCanvas lang={lang} label={title} overlay={<>
      {summarizedTeams && <p data-testid="event-team-summary" className="absolute left-3 top-3 max-w-[48%] rounded-xl bg-white/95 px-3 py-2 text-[11px] text-slate-700">{lang === 'ko' ? `조향 ${model.counts.teams}팀 · 대표 ${illustratedTeams}팀 표시` : `${model.counts.teams} teams · ${illustratedTeams} illustrated`}</p>}
      {custom && <div className="pointer-events-auto absolute top-2 right-2 lg:top-3 lg:right-3"><CustomContentTablet options={custom.options} eventType={input.eventType} lang={lang} /></div>}
    </>}>
    <Svg data-testid="event-scene-svg" role="img" aria-label={title} viewBox={camera} {...cameraMotion} preserveAspectRatio="xMidYMid meet" className="block h-full w-full">
      <title>{title}</title>
      <desc>{!model ? (lang === 'ko' ? '체험을 고르면 이 공간에 하나씩 나타나요.' : 'Selected experiences will appear in this space.') : lang === 'ko' ? '선택한 장비와 조향팀 구성 예시입니다. 대규모 조향팀은 대표 인원과 전체 수량으로 표시하며, 실제 배치와 동선은 상담에서 정합니다.' : 'An illustration of selected devices and perfumer teams. Large teams use representative figures and the full count; the actual layout is planned during consultation.'}</desc>
      <SharedFloor />
      {model && services.filter((key) => model.services.includes(key as SceneModel['services'][number])).map((service) => {
        const focused = service === activeKey;
        const zone = model.zones.find((entry) => entry.service === service);
        const objects = model.objects.filter((object) => object.service === service);
        const indices = new Map<string, number>();
        return <g key={service} data-testid={`event-service-${service}`} data-service={service} data-active={focused}>
          {service === 'spatialDesign' && <BoothFootprint model={model} />}
          {zone && <motion.ellipse aria-hidden="true" cx={(zone.bounds.left + zone.bounds.right) / 2} cy={zone.bounds.bottom - 8} rx={(zone.bounds.right - zone.bounds.left) / 2} ry="14" fill={P.teal} initial={false} animate={{ opacity: focused ? .1 : 0 }} transition={{ duration }} />}
          {objects.map((object) => {
            const instance = (indices.get(object.type) ?? 0) + 1;
            indices.set(object.type, instance);
            const numbered = object.type === 'kiosk' || object.type === 'analysis-kiosk' || object.type === 'photo-booth';
            return <motion.g key={object.id} data-testid="event-object" data-object-id={object.id} data-kind={object.type} data-service={object.service} data-instance={instance}
              data-experience-slug={object.slug} data-wrapped={object.wrapped} data-grade={object.grade} data-branded={object.branded} data-volume={object.volume} data-packaging={object.packaging} data-custom-scent={object.customScent} data-sensor-type={object.sensorType} data-racks={object.racks}
              transform={`translate(${object.x} ${object.y}) scale(${object.scale})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration }}>
              <g data-testid={object.type === 'photo-zone' ? 'event-photo-zone' : undefined}><ObjectGlyph object={object} /></g>
              {numbered && <g aria-hidden="true" transform="translate(0 17)"><rect x="-13" y="-8" width="26" height="16" rx="8" fill={P.paper} opacity=".95" /><text textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="600" fill={P.tealDark} fontFamily="inherit">{String(instance).padStart(2, '0')}</text></g>}
            </motion.g>;
          })}
        </g>;
      })}
    </Svg>
    </PreviewCanvas>
  </div>;
}
