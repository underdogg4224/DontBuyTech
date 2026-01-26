import { Metadata } from 'next';
import { getAllCategories, getTopDealsByCategory } from '@/lib/db/queries';
import { CategorySection } from '@/components/categories/category-section';
import { Category, DealWithVotes } from '@/lib/types';

/**
 * Homepage metadata for SEO
 */
export const metadata: Metadata = {
  title: 'DontBuyTech - AI-Powered Tech Deals Discovery',
  description: 'Discover the best tech deals curated by AI. Find amazing discounts on electronics, gadgets, and more.',
  keywords: ['tech deals', 'electronics deals', 'AI deals', 'discount tech', 'gadgets'],
  openGraph: {
    title: 'DontBuyTech - AI-Powered Tech Deals Discovery',
    description: 'Discover the best tech deals curated by AI',
    type: 'website',
  },
};

/**
 * Transform deal query results to DealWithVotes format
 * For SSR homepage without user context, we set user_vote to null
 * and calculate upvotes/downvotes from score and votes_count
 */
function transformDeals(deals: any[]): DealWithVotes[] {
  return deals.map(deal => {
    // Calculate upvotes and downvotes from score and votes_count
    // score = upvotes - downvotes
    // votes_count = upvotes + downvotes
    // Therefore: upvotes = (votes_count + score) / 2
    const upvotes = deal.score !== undefined
      ? Math.max(0, Math.round((deal.votes_count + deal.score) / 2))
      : deal.votes_count || 0;
    const downvotes = deal.score !== undefined
      ? Math.max(0, Math.round((deal.votes_count - deal.score) / 2))
      : 0;

    return {
      ...deal,
      upvotes,
      downvotes,
      user_vote: null, // No user context in SSR
      score: deal.score || 0,
    };
  });
}

/**
 * Homepage Component
 * Server-side rendered page displaying top deals by category
 */
export default async function HomePage() {
  try {
    // Fetch all categories
    const categories = await getAllCategories();

    // Fetch top 5 deals for each category in parallel
    const categoryDealsPromises = categories.map(async (category) => {
      const deals = await getTopDealsByCategory(category.id, 5);
      return {
        category,
        deals: transformDeals(deals),
      };
    });

    const categoryDeals = await Promise.all(categoryDealsPromises);

    // Filter out categories with no deals for cleaner display
    const categoriesWithDeals = categoryDeals.filter(({ deals }) => deals.length > 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                DontBuyTech
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 opacity-95">
                AI-Powered Tech Deals Discovery
              </p>
              <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
                Discover the best tech deals curated by our community and powered by AI.
                Never overpay for tech again.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto">
          {/* Category Sections */}
          {categoriesWithDeals.length > 0 ? (
            <div className="space-y-8 md:space-y-12 py-8 md:py-12">
              {categoriesWithDeals.map(({ category, deals }) => (
                <CategorySection
                  key={category.id}
                  category={category as Category}
                  deals={deals}
                  showEmpty={false}
                />
              ))}
            </div>
          ) : (
            /* Empty State - No Deals Available */
            <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-4xl md:text-5xl">🚀</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                No Deals Yet
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md text-center mb-6">
                Be the first to discover amazing tech deals. Check back soon!
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="py-12 md:py-16 px-4 text-center border-t border-gray-200 dark:border-gray-700 mt-12">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Deals are ranked by our AI algorithm based on votes and freshness.
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-2">
              Vote on deals to help the community find the best tech offers.
            </p>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // Error handling
    console.error('Error loading homepage:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section (minimal) */}
        <section className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                DontBuyTech
              </h1>
              <p className="text-xl md:text-2xl font-medium opacity-95">
                AI-Powered Tech Deals Discovery
              </p>
            </div>
          </div>
        </section>

        {/* Error State */}
        <main className="container mx-auto">
          <div className="flex flex-col items-center justify-center py-20 md:py-32 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-4xl md:text-5xl">⚠️</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              Unable to Load Deals
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md text-center mb-6">
              We're experiencing technical difficulties. Please try again later.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Retry
            </a>
          </div>
        </main>
      </div>
    );
  }
}
