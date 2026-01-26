import type { Metadata } from "next";
import { getArchivedDeals } from "@/lib/db/queries/deals";
import { DealCard } from "@/components/deals/deal-card";
import { DealWithVotes } from "@/lib/types/deal";
import { Badge } from "@/components/ui/badge";
import { Archive } from "lucide-react";

/**
 * Generate metadata for the archived deals page
 */
export const metadata: Metadata = {
  title: "Archived Deals - DontBuyTech",
  description: "Browse expired and archived tech deals. Past deals that are no longer active.",
  openGraph: {
    title: "Archived Deals - DontBuyTech",
    description: "Browse expired and archived tech deals. Past deals that are no longer active.",
    type: "website",
  },
};

/**
 * Transform archived deal data to DealWithVotes format
 * Archived deals don't include vote data, so we provide defaults
 */
function transformArchivedDeal(deal: any): DealWithVotes {
  return {
    ...deal,
    upvotes: 0,
    downvotes: 0,
    user_vote: null,
    // Convert decimal strings to numbers if needed
    price: typeof deal.price === 'string' ? parseFloat(deal.price) : deal.price,
    original_price: deal.original_price
      ? (typeof deal.original_price === 'string' ? parseFloat(deal.original_price) : deal.original_price)
      : null,
    score: deal.score || 0,
  };
}

/**
 * Archived Deals Page
 * Server-side rendered page displaying expired/archived deals
 */
export default async function ArchivePage() {
  let archivedDeals: any[] = [];
  let error: string | null = null;

  try {
    // Fetch archived deals from database (SSR)
    archivedDeals = await getArchivedDeals({ limit: 50 });
  } catch (err) {
    console.error("Failed to fetch archived deals:", err);
    error = "Failed to load archived deals. Please try again later.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Archive className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Archived Deals
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Browse expired and archived deals that are no longer active
        </p>
        <Badge variant="outline" className="mt-3">
          {archivedDeals.length} archived deal{archivedDeals.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-center">
          <p className="text-red-800 dark:text-red-200 font-medium mb-2">
            Error Loading Deals
          </p>
          <p className="text-red-600 dark:text-red-300 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!error && archivedDeals.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Archived Deals
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            There are currently no archived deals. Expired deals will appear here once they are archived.
          </p>
        </div>
      )}

      {/* Deals Grid */}
      {!error && archivedDeals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archivedDeals.map((deal) => {
            const transformedDeal = transformArchivedDeal(deal);
            return (
              <div key={deal.id} className="relative">
                {/* Archived Badge Overlay */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary" className="bg-gray-600 hover:bg-gray-700 text-white">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>
                </div>

                {/* Deal Card (voting disabled for archived deals) */}
                <DealCard
                  deal={transformedDeal}
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Section (Future Enhancement) */}
      {!error && archivedDeals.length >= 50 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showing first 50 archived deals. Pagination coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
