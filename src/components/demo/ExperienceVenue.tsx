'use client';

import { generationMessage } from '@/lib/demo-generation';

import Image from 'next/image';
import { useEffect, useId, useState, type CSSProperties } from 'react';
import { Check } from 'lucide-react';
import type { DemoAnswers } from '@/types/demo';
import type { DemoExperienceDesign, ExperienceQuestion } from '@/data/demo-experiences/types';
import { experienceDecisions, readExperienceProfile } from '@/data/demo-experiences';
import { getExperienceImage } from '@/data/experience-images';
import { getProgramArtDirection } from '@/data/demo-experiences/art-directions';
import { getDemoChoicePhoto, getDemoMockupLayout, type DemoMockupLayout } from '@/data/demo-experiences/mockup-layouts';
import { cn } from '@/lib/utils';
import { DemoViewport } from './DemoViewport';

function VenueImage({ slug, name }: { slug: string; name: string }) {
  const image = getExperienceImage(slug);
  if (!image) return null;
  return (
    <figure className="venue-image">
      <Image src={image.src} alt={`${name} 체험 공간`} fill sizes="(max-width: 768px) 100vw, 540px" className="object-cover" />
      <div className="venue-image-shade" />
      <figcaption>{image.kind === 'concept' ? 'AI 콘셉트 이미지' : `운영 사례 · ${image.eventKo}`}</figcaption>
    </figure>
  );
}

/** Physical visual cues change by station: mixing flight, sample fan, orbital dial, etc. */
function StationObject({ design, answers }: { design: DemoExperienceDesign; answers: DemoAnswers }) {
  const decisions = experienceDecisions(design, answers.experienceProfile);
  const colors = [design.accent, design.secondary, ...decisions.map((item) => item.color).filter((c): c is string => !!c)];
  const active = decisions.length;
  if (design.layout === 'counter') {
    return <div className="venue-flight" aria-hidden="true">{[0, 1, 2].map((n) => (
      <div key={n}><div className="venue-glass"><i style={{ height: `${25 + (active > n ? 45 : 8)}%`, background: colors[n % colors.length] }} /></div><span>0{n + 1}</span></div>
    ))}</div>;
  }
  if (design.layout === 'observatory') {
    return <div className="venue-orbit" aria-hidden="true"><i /><i /><i /><span>{active ? '✦' : '✧'}</span>{colors.map((color, i) => <b key={i} style={{ background: color, transform: `rotate(${i * 100}deg) translateX(64px)` }} />)}</div>;
  }
  if (design.layout === 'atelier') {
    return <div className="venue-samples" aria-hidden="true">{[0, 1, 2, 3].map((n) => <i key={n} style={{ background: colors[n % colors.length], transform: `rotate(${(n - 1.5) * 13}deg) translateY(${Math.abs(n - 1.5) * 4}px)` }}><span>NEANDER<br />0{n + 1}</span></i>)}</div>;
  }
  if (design.layout === 'lab') {
    return <div className="venue-meter" aria-hidden="true">{[3, 5, 4, 7, 6, 8, 5, 4, 6, 9, 7, 4, 3, 5, 7].map((n, i) => <i key={i} style={{ height: `${n * 8 + active * 3}%`, background: i % 3 ? design.accent : design.secondary }} />)}<span>INPUT / {String(active).padStart(2, '0')}</span></div>;
  }
  if (design.layout === 'lounge') {
    return <div className="venue-pair" aria-hidden="true"><i style={{ background: design.accent }} /><i style={{ background: design.secondary }} /><span>together.</span></div>;
  }
  if (design.layout === 'gallery') {
    return <div className="venue-film" aria-hidden="true">{[0, 1, 2].map((n) => <i key={n} style={{ background: `linear-gradient(${40 + n * 40}deg, ${colors[n % colors.length]}, transparent)` }}><span>0{n + 1}</span></i>)}</div>;
  }
  return <div className="venue-palette" aria-hidden="true">{[0, 1, 2, 3, 4].map((n) => <i key={n} style={{ background: colors[n % colors.length], opacity: 0.5 + n * 0.12 }} />)}<span>your signature</span></div>;
}

const CONSOLE_PHASES: Record<string, [string, string, string]> = {
  'ai-science-kiosk': ['목표', '실험', '기록'],
  'ai-voice-lab': ['방향', '녹음', '리포트'],
  'ai-musicvideo-maker': ['콘셉트', '제작', '감상'],
  'ai-heritage-timemachine': ['시대', '복원', '기록'],
  'ai-product-experience': ['관심', '탐색', '가이드'],
  'ai-vision-wall': ['주제', '표현', '전시'],
  'ai-memory-movie': ['이야기', '편집', '감상'],
};

function ConsolePhases({ slug, active = 0 }: { slug: string; active?: number }) {
  return <ol className="mockup-phase-rail" aria-label="체험 순서">{(CONSOLE_PHASES[slug] ?? ['취향 설정', '체험 진행', '결과 확인']).map((label, index) => (
    <li key={label} aria-current={active === index ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong></li>
  ))}</ol>;
}

function ChoicePhoto({ slug, optionId }: { slug: string; optionId: string }) {
  const photo = getDemoChoicePhoto(slug, optionId) ?? getExperienceImage(slug);
  if (!photo) return null;
  return <span className="mockup-choice-photo" aria-hidden="true"><Image src={photo.src} alt="" fill sizes="(max-width: 700px) 120px, 360px" style={{ objectPosition: 'position' in photo ? photo.position : undefined }} /></span>;
}

function ScenePhoto({ design, slug, className = '' }: { design: DemoExperienceDesign; slug: string; className?: string }) {
  return <div className={cn('mockup-scene-photo', className)}><VenueImage slug={slug} name={design.venue} /></div>;
}

function ProfileQuestion({ question, selected, onSelect, layout, slug, design }: {
  question: ExperienceQuestion; selected?: string; onSelect: (value: string) => void;
  layout: DemoMockupLayout; slug: string; design: DemoExperienceDesign;
}) {
  const chosen = question.options.find((option) => option.id === selected);
  const detailId = useId();
  return (
    <fieldset className={cn('venue-question', `venue-question--${question.control}`)} data-profile-question={question.id} aria-describedby={detailId}>
      <legend><h2>{question.label}</h2>{layout === 'console' && <ScenePhoto design={design} slug={slug} />}</legend>
      {layout === 'photo-studio' && <ScenePhoto design={design} slug={slug} />}
      <div className="venue-options" style={{ '--mockup-option-count': question.options.length } as CSSProperties}>
        {question.options.map((option) => (
          <button key={option.id} type="button" onClick={() => onSelect(option.id)} aria-pressed={selected === option.id} className="venue-option" data-option={option.id}>
            {layout === 'photo-choices' && <ChoicePhoto slug={slug} optionId={option.id} />}
            {(layout === 'editorial' || layout === 'console') && <i className="mockup-option-radio" aria-hidden="true" />}
            {question.control === 'swatches' && layout !== 'photo-choices' && <i className="venue-option-swatch" style={{ background: option.color ?? 'var(--venue-accent)' }} aria-hidden="true" />}
            <span className="venue-option-label">{option.label}</span>
            <Check className="venue-option-check" size={13} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p id={detailId} className="venue-question-why venue-current-choice-detail" aria-live="polite">{chosen?.detail ?? question.why}</p>
    </fieldset>
  );
}

export function ExperienceWelcome({ design, slug }: { design: DemoExperienceDesign; slug: string }) {
  const art = getProgramArtDirection(slug);
  const layout = getDemoMockupLayout(slug);
  return (
    <section className="mockup-scene mockup-scene--welcome" aria-label="체험 소개">
      {layout === 'editorial' && <ScenePhoto design={design} slug={slug} className="mockup-editorial-photo" />}
      {layout === 'console' && <ConsolePhases slug={slug} />}
      <div className="mockup-scene-copy">
        <DemoViewport label="체험 소개"><div className="mockup-content mockup-welcome-content">
          {layout === 'centered' && <ScenePhoto design={design} slug={slug} />}
          <div className="mockup-welcome-heading">
            <div>{art && <p className="mockup-signature">{art.name}</p>}<h2>{design.headline}</h2></div>
            {layout === 'console' && <ScenePhoto design={design} slug={slug} />}
          </div>
          <p className="mockup-invitation">{design.invitation}</p>
          {layout === 'photo-studio' && <ScenePhoto design={design} slug={slug} />}
          {layout === 'photo-choices' && <div className="mockup-choice-preview" aria-label="나에게 맞는 장면을 골라보세요">{design.questions[0]?.options.slice(0, 3).map((option) => (
            <div key={option.id}><ChoicePhoto slug={slug} optionId={option.id} /><span>{option.label}</span></div>
          ))}</div>}
          <div className="mockup-welcome-meta"><span>{design.duration}</span><span>{design.artifact}</span></div>
        </div></DemoViewport>
      </div>
    </section>
  );
}

export function ExperienceBriefing({ design, slug, answers, onUpdate, questionIndex = 0 }: {
  design: DemoExperienceDesign; slug: string; answers: DemoAnswers; onUpdate: (id: string, value: unknown) => void; questionIndex?: number;
}) {
  const profile = readExperienceProfile(design, answers.experienceProfile);
  const activeIndex = Math.max(0, Math.min(Number.isFinite(questionIndex) ? Math.trunc(questionIndex) : 0, design.questions.length - 1));
  const question = design.questions[activeIndex];
  const layout = getDemoMockupLayout(slug);
  return (
    <section className="mockup-scene mockup-scene--question" data-profile-index={activeIndex} data-profile-count={design.questions.length} aria-label={`체험 질문 ${activeIndex + 1} / ${design.questions.length}`}>
      {layout === 'editorial' && <ScenePhoto design={design} slug={slug} className="mockup-editorial-photo" />}
      {layout === 'console' && <ConsolePhases slug={slug} />}
      <div className="mockup-scene-copy">
        <DemoViewport key={activeIndex} label="체험 질문">
          <div className="mockup-content">
            {layout === 'centered' && <ScenePhoto design={design} slug={slug} />}
            {question && <ProfileQuestion key={question.id} question={question} selected={profile[question.id]} layout={layout} slug={slug} design={design} onSelect={(value) => onUpdate('experienceProfile', { ...profile, [question.id]: value })} />}
          </div>
        </DemoViewport>
      </div>
    </section>
  );
}

export function ExperienceStationGuide({ design, slug }: {
  design: DemoExperienceDesign; slug: string; answers: DemoAnswers; stepTitle: string;
}) {
  const layout = getDemoMockupLayout(slug);
  return (
    <aside className="venue-guide venue-station-photo mockup-station-guide" aria-label={layout === 'console' ? '체험 순서' : '체험 공간 이미지'}>
      {layout === 'console' ? <ConsolePhases slug={slug} active={1} /> : <><ScenePhoto design={design} slug={slug} /><p className="mockup-guide-caption">{design.artifact}</p></>}
    </aside>
  );
}

export function ExperienceSummary({ design, answers, generated, decisionIndex }: { design: DemoExperienceDesign; answers: DemoAnswers; generated: boolean; decisionIndex?: number }) {
  const decisions = experienceDecisions(design, answers.experienceProfile);
  const activeIndex = decisionIndex === undefined ? undefined : Math.max(0, Math.min(Number.isFinite(decisionIndex) ? Math.trunc(decisionIndex) : 0, decisions.length - 1));
  const visibleDecisions = activeIndex === undefined ? decisions : decisions.slice(activeIndex, activeIndex + 1);
  return (
    <section className="venue-summary" aria-label="선택한 조건을 반영한 가이드" data-decision-index={activeIndex} data-decision-count={decisions.length}>
      <div className="venue-summary-title"><div><span>{design.eyebrow} / TAKEAWAY</span><h2>당신의 선택을 담았습니다.</h2></div><b>{generated ? 'AI 맞춤 결과' : '체험 예시 · 선택 기반 가이드'}</b></div>
      {!generated && <p className="venue-fallback-note">현재 화면은 미리 준비한 예시와 선택한 조건에 맞춘 안내입니다. AI 생성이 완료된 결과와는 다를 수 있어요.</p>}
      <div className="venue-summary-grid" aria-live={activeIndex === undefined ? undefined : 'polite'}>{visibleDecisions.map((item) => <article key={item.question}><small>{item.question}</small><h3>{item.label}</h3><p>{item.outcome}</p></article>)}</div>
      {design.scope && <p className="venue-scope">{design.scope}</p>}
    </section>
  );
}

export function ExperienceProcessing({ design, answers, onCancel }: { design: DemoExperienceDesign; answers: DemoAnswers; onCancel: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="venue-processing" role="status">
      <div className="venue-processing-object"><StationObject design={design} answers={answers} /></div>
      <div className="venue-eyebrow">{design.eyebrow} / IN PROGRESS</div>
      <h2>{design.artifact} 준비 중</h2>
      <p>{generationMessage(elapsed)}</p>
      <ol>{design.processing.map((message, index) => <li key={message} className={Math.min(Math.floor(elapsed / 3), 2) === index ? 'is-active' : ''}><span>0{index + 1}</span>{message}</li>)}</ol>
      <div className="venue-processing-time"><i />{elapsed}초 경과 · 결과를 기다리는 중</div>
      <button type="button" onClick={onCancel} className="venue-cancel">입력으로 돌아가기</button>
    </div>
  );
}
