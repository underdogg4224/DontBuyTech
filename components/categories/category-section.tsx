"use client";

import React from 'react';
import Link from 'next/link';
import { Category, DealWithVotes } from '@/lib/types';
import { DealCard } from '@/components/deals/deal-card';
import { ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  category: Category;
  deals: DealWithVotes[];
  showEmpty?: boolean;
}

/**
 * CategorySection Component
 *
 * Displays a section of deals organized by category with:
 * - Category header with name and icon
 * - Horizontal scrollable deal cards on mobile
 * - Responsive grid on desktop (3-4 columns)
 * - "View All" link to category page
 * - Deal count display
 * - Empty state when no deals
 */
export function CategorySection({
  category,
  deals,
  showEmpty = true
}: CategorySectionProps) {
  // Don't render empty sections unless explicitly requested
  if (deals.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <section className="w-full py-6 md:py-8">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Category Icon */}
          {category.icon && (
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl md:text-2xl shadow-md">
              {category.icon}
            </div>
          )}

          {/* Category Name and Count */}
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
            </p>
          </div>
        </div>

        {/* View All Link */}
        {deals.length > 0 && (
          <Link
            href={`/categories/${category.slug}`}
            className="flex items-center gap-1 text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
          >
            <span>View All</span>
            <ChevronRight
              className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>

      {/* Empty State */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-3xl md:text-4xl opacity-50">
              {category.icon || '📦'}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No deals yet
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md">
            Check back soon for new deals in {category.name}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Horizontal Scroll */}
          <div className="block md:hidden">
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex-shrink-0 w-[280px] snap-start"
                >
                  <DealCard deal={deal} />
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            {deals.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {deals.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
                  />
                ))}
                {deals.length > 5 && (
                  <div className="text-xs text-gray-500 ml-1">
                    +{deals.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 md:px-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}

      {/* Category Description (if available) */}
      {category.description && (
        <div className="mt-4 px-4 md:px-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
            {category.description}
          </p>
        </div>
      )}
    </section>
  );
}

// CSS for hiding scrollbar (add to global styles or tailwind config)
// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }
