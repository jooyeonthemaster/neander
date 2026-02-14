'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { portfolioProjects, type PortfolioCategory } from '@/data/portfolio';
import { PortfolioFilter } from './PortfolioFilter';
import { PortfolioCard } from './PortfolioCard';

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('all');

  const filteredProjects =
    activeCategory === 'all'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory);

  return (
    <div>
      <PortfolioFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Grid */}
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        role="list"
        aria-label="Portfolio projects"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <div key={project.slug} role="listitem">
              <PortfolioCard project={project} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500">No projects found in this category.</p>
        </div>
      )}
    </div>
  );
}
