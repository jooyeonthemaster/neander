'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { type AcscentType } from '@/data/acscent-types';
import { PERFUMES, getReviewsForPerfume, getReviewsByType, getTypePerception, type AcscentReview } from '@/data/acscent-perfumes';

interface Props {
  perfumeId: string;
  userType: AcscentType;
  onBack: () => void;
}

type Tab = 'perception' | 'notes' | 'reviews';

export function AcscentPerfumeDetail({ perfumeId, userType, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('perception');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'same-type'>('same-type');

  const perfume = PERFUMES.find((p) => p.id === perfumeId);
  if (!perfume) return null;

  const perception = getTypePerception(userType, perfume);
  const allReviews = getReviewsForPerfume(perfumeId);
  const sameTypeReviews = getReviewsByType(perfumeId, userType.code);
  const displayReviews = reviewFilter === 'same-type' ? sameTypeReviews : allReviews;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'perception', label: '내 유형의 인지' },
    { id: 'notes', label: '노트 분석' },
    { id: 'reviews', label: '리뷰', count: allReviews.length },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-4xl">

        {/* ── Back button ─────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-base text-white/50 transition-colors hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          결과로 돌아가기
        </motion.button>

        {/* ── Hero Section ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 overflow-hidden rounded-3xl border border-neutral-800"
          style={{ background: `linear-gradient(135deg, ${perfume.gradientFrom}10, ${perfume.gradientTo}10)` }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 70% 30%, ${perfume.gradientFrom}40, transparent 60%)` }} />
          <div className="relative grid gap-10 p-10 md:grid-cols-2 md:p-14">
            {/* Left: Perfume visual */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6 flex h-52 w-52 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(135deg, ${perfume.gradientFrom}25, ${perfume.gradientTo}25)` }}>
                <motion.span
                  className="font-display text-7xl font-extrabold"
                  style={{ color: perfume.gradientFrom + '40' }}
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity }}
                >
                  {perfume.brand.charAt(0)}
                </motion.span>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-teal-500 px-4 py-1.5">
                  <span className="text-xs font-bold text-white">{userType.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`h-5 w-5 ${i < Math.floor(perfume.rating) ? 'text-amber-400' : 'text-neutral-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="ml-2 text-base text-white/60">{perfume.rating} ({perfume.reviewCount})</span>
              </div>
              <p className="text-3xl font-bold text-white/80">{perfume.price}</p>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-center">
              <p className="mb-2 text-base text-white/40">{perfume.brand}</p>
              <h1 className="mb-3 font-display text-5xl font-extrabold tracking-tight text-white">{perfume.name}</h1>
              <p className="mb-5 rounded-full border border-neutral-700 bg-neutral-800/50 px-4 py-1.5 text-sm text-white/60 w-fit">{perfume.family}</p>
              <p className="mb-8 text-base leading-relaxed text-white/60">{perfume.brandDescription}</p>

              {/* Type badge */}
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image src={userType.imagePath} alt={userType.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <p className="text-sm text-teal-400">내 후각 인지 유형</p>
                    <p className="font-display text-base font-bold text-white">{userType.code} · {userType.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 rounded-lg px-5 py-3 text-base font-medium transition-all ${
                activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-lg bg-neutral-800" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
              )}
              <span className="relative">{tab.label}{tab.count !== undefined && ` (${tab.count})`}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'perception' && (
            <motion.div key="perception" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <PerceptionTab perception={perception} userType={userType} perfume={perfume} />
            </motion.div>
          )}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <NotesTab perfume={perfume} userType={userType} />
            </motion.div>
          )}
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ReviewsTab reviews={displayReviews} allReviews={allReviews} sameTypeReviews={sameTypeReviews} filter={reviewFilter} onFilterChange={setReviewFilter} userType={userType} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Perception Tab ───────────────────────────────────── */
function PerceptionTab({ perception, userType, perfume }: { perception: string; userType: AcscentType; perfume: typeof PERFUMES[0] }) {
  const paragraphs = perception.split('\n\n');
  const icons = ['🎯', '🧠', '📐', '🌡️'];
  const labels = ['강도 인지', '처리 방식', '인지 스타일', '온도 감각'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: userType.color + '20' }}>
            <span className="text-xl">🔮</span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">{userType.code} 유형의 {perfume.name} 인지 분석</h3>
            <p className="text-sm text-white/40">AI 기반 48차원 후각 벡터 분석 결과</p>
          </div>
        </div>
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/10 p-5">
          <p className="text-sm text-teal-400 mb-2">브랜드 공식 설명</p>
          <p className="text-base text-white/70 italic">&ldquo;{perfume.brandDescription}&rdquo;</p>
        </div>
      </div>

      {/* Perception paragraphs */}
      <div className="space-y-5">
        <p className="text-sm font-medium tracking-widest text-teal-400">당신의 유형에서 실제로 느끼는 것</p>
        {paragraphs.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xl">{icons[i] ?? '✨'}</span>
              <span className="text-sm font-medium text-white/50">{labels[i] ?? '추가 분석'}</span>
            </div>
            <p className="text-base leading-relaxed text-white/80">{p}</p>
          </motion.div>
        ))}
      </div>

      {/* Comparison visualization */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8">
        <h4 className="mb-6 text-center font-display text-base font-bold text-white">일반 인지 vs {userType.code} 유형 인지</h4>
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-xl bg-neutral-800/50 p-5 text-center">
            <p className="mb-3 text-sm text-white/40">일반적 인지</p>
            <div className="mx-auto h-20 w-20 rounded-full bg-neutral-700/50" />
            <p className="mt-3 text-sm text-white/50">표준적 강도와 구조 인지</p>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: userType.color + '10', border: `1px solid ${userType.color}20` }}>
            <p className="mb-3 text-sm" style={{ color: userType.color }}>당신의 인지</p>
            <div className="mx-auto h-20 w-20 rounded-full" style={{ background: `linear-gradient(135deg, ${userType.gradientFrom}40, ${userType.gradientTo}40)` }} />
            <p className="mt-3 text-sm text-white/50">{userType.code[1] === 'B' ? '강화된' : '섬세한'} 인지 + {userType.code[2] === 'S' ? '공감각' : '분석적'} 처리</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notes Tab ────────────────────────────────────────── */
function NotesTab({ perfume, userType }: { perfume: typeof PERFUMES[0]; userType: AcscentType }) {
  const isBold = userType.code[1] === 'B';
  const isLinear = userType.code[2] === 'L';

  const noteStages = [
    { label: 'Top Notes', labelKo: '탑 노트', desc: '처음 10~15분', notes: perfume.notes.top, color: '#40c9cf', intensity: isBold ? 85 : 65 },
    { label: 'Middle Notes', labelKo: '미들 노트', desc: '15분~2시간', notes: perfume.notes.middle, color: '#06B6D4', intensity: isBold ? 75 : 80 },
    { label: 'Base Notes', labelKo: '베이스 노트', desc: '2시간 이후', notes: perfume.notes.base, color: '#475569', intensity: isBold ? 60 : 50 },
  ];

  return (
    <div className="space-y-8">
      {/* Pyramid visualization */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10">
        <h4 className="mb-8 text-center font-display text-lg font-bold text-white">향 피라미드 · {userType.code} 유형 기준</h4>

        <div className="space-y-5">
          {noteStages.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-bold text-white">{stage.labelKo}</p>
                  <p className="text-sm text-white/40">{stage.label} · {stage.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold" style={{ color: stage.color }}>{stage.intensity}%</p>
                  <p className="text-xs text-white/40">인지 강도</p>
                </div>
              </div>
              {/* Intensity bar */}
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-neutral-800">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.intensity}%` }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                  style={{ backgroundColor: stage.color }}
                />
              </div>
              {/* Note pills */}
              <div className="flex flex-wrap gap-2">
                {stage.notes.map((note) => (
                  <span key={note} className="rounded-full px-4 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: stage.color + '25', border: `1px solid ${stage.color}40` }}>
                    {note}
                  </span>
                ))}
              </div>
              {/* Type-specific note */}
              <p className="mt-4 text-sm text-white/50">
                {i === 0 && (isBold ? '💡 대담한 감각의 당신은 탑 노트를 일반보다 강하게 인지합니다' : '💡 섬세한 당신은 탑 노트에서 숨겨진 뉘앙스를 포착합니다')}
                {i === 1 && (isLinear ? '💡 선형적 분석 능력으로 미들 노트의 구조 변화를 추적합니다' : '💡 공감각적 인지로 미들 노트에서 색과 질감을 느낍니다')}
                {i === 2 && (isBold ? '💡 베이스 노트의 깊이감이 오래 지속되는 유형입니다' : '💡 베이스 노트의 미세한 잔향까지 섬세하게 감지합니다')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8">
        <h4 className="mb-6 font-display text-base font-bold text-white">시간에 따른 인지 변화</h4>
        <div className="relative flex items-center justify-between py-4">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-neutral-700" />
          {['0분', '15분', '30분', '1시간', '2시간', '4시간+'].map((t, i) => (
            <div key={t} className="relative flex flex-col items-center">
              <motion.div
                className="mb-3 h-4 w-4 rounded-full border-2 border-neutral-700 bg-neutral-900"
                animate={i <= 3 ? { borderColor: '#40c9cf', scale: [1, 1.2, 1] } : {}}
                transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity }}
                style={i <= 3 ? { borderColor: '#40c9cf' } : {}}
              />
              <span className="text-xs text-white/40">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Reviews Tab ──────────────────────────────────────── */
function ReviewsTab({ reviews, allReviews, sameTypeReviews, filter, onFilterChange, userType }: {
  reviews: AcscentReview[];
  allReviews: AcscentReview[];
  sameTypeReviews: AcscentReview[];
  filter: 'all' | 'same-type';
  onFilterChange: (f: 'all' | 'same-type') => void;
  userType: AcscentType;
}) {
  return (
    <div className="space-y-8">
      {/* Filter */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 p-2">
        <button
          onClick={() => onFilterChange('same-type')}
          className={`flex-1 rounded-lg px-5 py-3 text-base font-medium transition-all ${
            filter === 'same-type' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="font-display text-sm font-bold">{userType.code}</span>
            같은 유형 리뷰 ({sameTypeReviews.length})
          </span>
        </button>
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-1 rounded-lg px-5 py-3 text-base font-medium transition-all ${
            filter === 'all' ? 'bg-neutral-800 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          전체 리뷰 ({allReviews.length})
        </button>
      </div>

      {/* Same type info */}
      {filter === 'same-type' && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-5">
          <p className="text-base text-teal-300">
            <span className="font-bold">{userType.name} ({userType.code})</span> 유형의 사용자들이 작성한 리뷰만 모아봅니다.
            같은 후각 인지 유형이기 때문에, 이 리뷰들이 당신의 경험과 가장 유사할 것입니다.
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-2xl text-white/30">🔍</p>
          <p className="mt-3 text-base text-white/40">
            {filter === 'same-type' ? `${userType.code} 유형의 리뷰가 아직 없습니다` : '리뷰가 없습니다'}
          </p>
          {filter === 'same-type' && (
            <button onClick={() => onFilterChange('all')} className="mt-4 text-sm text-teal-400 hover:text-teal-300">
              전체 리뷰 보기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 font-display text-sm font-bold text-white/70">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        review.userType === userType.code ? 'bg-teal-500/20 text-teal-400' : 'bg-neutral-800 text-white/40'
                      }`}>
                        {review.userType}
                      </span>
                      {review.userType === userType.code && (
                        <span className="text-xs text-teal-400">나와 같은 유형</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className={`h-4 w-4 ${j < review.rating ? 'text-amber-400' : 'text-neutral-700'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-white/30">{review.date}</p>
                </div>
              </div>
              <p className="mb-4 text-base leading-relaxed text-white/80">{review.content}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/30">👍 {review.helpful}명이 도움됨</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
