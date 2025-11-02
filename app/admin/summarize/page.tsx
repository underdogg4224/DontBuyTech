import { Metadata } from 'next';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq, isNull, sql } from 'drizzle-orm';
import { SummarizationClient } from './client';

/**
 * Admin Summarization Page Metadata
 */
export const metadata: Metadata = {
  title: 'Admin - AI Summarization | DontBuyTech',
  description: 'Batch AI summarization for deals',
};

/**
 * Deal statistics interface
 */
interface DealStatistics {
  total: number;
  summarized: number;
  unsummarized: number;
  averageQualityScore: number | null;
  lastSummarizedAt: string | null;
}

/**
 * Unsummarized deal interface
 */
interface UnsummarizedDeal {
  id: string;
  title: string;
  price: string;
  discount_percentage: number | null;
  created_at: Date;
}

/**
 * Fetch deal statistics from database
 */
async function getDealStatistics(): Promise<DealStatistics> {
  try {
    // Get total deals (non-archived)
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(deals)
      .where(eq(deals.archived, false));

    const total = totalResult[0]?.count || 0;

    // Get summarized deals count
    const summarizedResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(deals)
      .where(sql`${deals.archived} = false AND ${deals.summary} IS NOT NULL`);

    const summarized = summarizedResult[0]?.count || 0;

    // Calculate unsummarized
    const unsummarized = total - summarized;

    // Get average quality score
    const avgScoreResult = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${deals.ai_quality_score}), 0)::int`
      })
      .from(deals)
      .where(sql`${deals.archived} = false AND ${deals.ai_quality_score} IS NOT NULL`);

    const averageQualityScore = avgScoreResult[0]?.avg || null;

    // Get last summarization time
    const lastSummarizedResult = await db
      .select({
        lastSummarizedAt: deals.summarized_at
      })
      .from(deals)
      .where(sql`${deals.archived} = false AND ${deals.summarized_at} IS NOT NULL`)
      .orderBy(sql`${deals.summarized_at} DESC`)
      .limit(1);

    const lastSummarizedAt = lastSummarizedResult[0]?.lastSummarizedAt
      ? new Date(lastSummarizedResult[0].lastSummarizedAt).toISOString()
      : null;

    return {
      total,
      summarized,
      unsummarized,
      averageQualityScore,
      lastSummarizedAt,
    };
  } catch (error) {
    console.error('Error fetching deal statistics:', error);
    throw new Error('Failed to fetch deal statistics');
  }
}

/**
 * Fetch unsummarized deals from database
 */
async function getUnsummarizedDeals(): Promise<UnsummarizedDeal[]> {
  try {
    const unsummarizedDeals = await db
      .select({
        id: deals.id,
        title: deals.title,
        price: deals.price,
        discount_percentage: deals.discount_percentage,
        created_at: deals.created_at,
      })
      .from(deals)
      .where(sql`${deals.archived} = false AND ${deals.summary} IS NULL`)
      .orderBy(sql`${deals.created_at} DESC`)
      .limit(100); // Limit to 100 most recent unsummarized deals

    return unsummarizedDeals;
  } catch (error) {
    console.error('Error fetching unsummarized deals:', error);
    throw new Error('Failed to fetch unsummarized deals');
  }
}

/**
 * Admin Summarization Page (Server Component)
 * Fetches initial data server-side, then passes to client component for interactivity
 */
export default async function AdminSummarizePage() {
  // TODO: Add proper authentication check in Phase 4
  // For now, this is an open admin page - add auth middleware later
  // Example: const session = await getServerSession(authOptions);
  // if (!session || !session.user.isAdmin) { redirect('/'); }

  try {
    // Fetch statistics and unsummarized deals in parallel
    const [statistics, unsummarizedDeals] = await Promise.all([
      getDealStatistics(),
      getUnsummarizedDeals(),
    ]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Summarization Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Batch process deals for AI-generated summaries and quality scores
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <SummarizationClient
            initialStatistics={statistics}
            initialUnsummarizedDeals={unsummarizedDeals}
          />
        </main>
      </div>
    );
  } catch (error) {
    // Error State
    console.error('Error loading admin page:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Summarization Admin
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Unable to Load Admin Page
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md text-center">
              There was an error loading the administration page. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }
}
