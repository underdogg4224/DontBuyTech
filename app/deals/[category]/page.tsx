/**
 * Category Deals Page
 * Dynamic route for displaying all deals in a specific category
 * Path: /deals/[category]
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/db/queries/categories';
import { getDealsByCategory } from '@/lib/db/queries/deals';
import { DealCard } from '@/components/deals/deal-card';
import { Badge } from '@/components/ui/badge';

/**
 * Page Props with category slug parameter
 */
interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
  };
}

/**
 * Generate metadata for SEO
 * Dynamically generates page title and description based on category
 */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category);

  if (!category) {
    return {
      title: 'Category Not Found - DontBuyTech',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} Deals - DontBuyTech`,
    description:
      category.description ||
      `Browse the latest ${category.name} deals and discounts on DontBuyTech. Find great prices on top products.`,
    keywords: [category.name, 'deals', 'discounts', 'tech', 'shopping'],
    openGraph: {
      title: `${category.name} Deals - DontBuyTech`,
      description:
        category.description ||
        `Browse the latest ${category.name} deals and discounts`,
      type: 'website',
    },
  };
}

/**
 * Category Deals Page Component
 * Server component that fetches and displays deals for a specific category
 */
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  // Parse query parameters
  const page = parseInt(searchParams.page || '1', 10);
  const sort = (searchParams.sort as 'score' | 'created_at' | 'price') || 'score';
  const limit = 20; // Items per page
  const offset = (page - 1) * limit;

  // Fetch category by slug
  const category = await getCategoryBySlug(params.category);

  // Handle invalid category (404)
  if (!category) {
    notFound();
  }

  // Fetch deals for this category with pagination
  const deals = await getDealsByCategory(category.id, {
    limit: limit + 1, // Fetch one extra to check if there are more pages
    offset,
    sortBy: sort,
    sortOrder: 'desc',
  });

  // Determine if there are more pages
  const hasMore = deals.length > limit;
  const displayDeals = hasMore ? deals.slice(0, limit) : deals;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {category.icon && (
            <div className="text-4xl" aria-hidden="true">
              {category.icon}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Category Stats Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {displayDeals.length} {displayDeals.length === 1 ? 'Deal' : 'Deals'} Available
          </Badge>
        </div>
      </header>

      {/* Deals Grid */}
      {displayDeals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={{
                  id: deal.id,
                  title: deal.title,
                  description: deal.description,
                  price: typeof deal.price === 'string' ? parseFloat(deal.price) : deal.price,
                  original_price: deal.original_price ? (typeof deal.original_price === 'string' ? parseFloat(deal.original_price) : deal.original_price) : null,
                  discount_percentage: deal.discount_percentage,
                  url: deal.url,
                  image_url: deal.image_url,
                  category_id: deal.category_id,
                  brand: deal.brand,
                  score: deal.calculated_score || 0,
                  votes_count: deal.votes_count,
                  created_at: deal.created_at,
                  expires_at: deal.expires_at,
                  archived: deal.archived,
                  embedding: null,
                  upvotes: 0, // TODO: Add vote aggregation query
                  downvotes: 0,
                  user_vote: null,
                  category: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                  },
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 && (
                <a
                  href={`/deals/${params.category}?page=${page - 1}${sort !== 'score' ? `&sort=${sort}` : ''}`}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Previous
                </a>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page}
              </span>
              {hasMore && (
                <a
                  href={`/deals/${params.category}?page=${page + 1}${sort !== 'score' ? `&sort=${sort}` : ''}`}
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-center">
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No deals found
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              There are currently no active deals in this category.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check back later for new deals!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
