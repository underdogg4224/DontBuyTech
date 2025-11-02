import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Calendar, Tag, Package } from 'lucide-react';
import { getDealById } from '@/lib/db/queries/deals';
import { getVoteCount, getUserVote } from '@/lib/db/queries/votes';
import { getCategoryById } from '@/lib/db/queries/categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DealWithVotes } from '@/lib/types/deal';
import { DealVotingSection } from './voting-section';

/**
 * Props for the deal detail page
 */
interface DealPageProps {
  params: {
    id: string;
  };
}

/**
 * Format price with currency
 * Handles both number and string (decimal) types from database
 */
function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
}

/**
 * Calculate days until expiration
 */
function getDaysUntilExpiration(expiresAt: Date | string | null): number | null {
  if (!expiresAt) return null;

  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  try {
    const deal = await getDealById(params.id);

    if (!deal) {
      return {
        title: 'Deal Not Found',
        description: 'The requested deal could not be found.',
      };
    }

    const discount = deal.discount_percentage
      ? ` - ${Math.round(deal.discount_percentage)}% OFF`
      : '';

    return {
      title: `${deal.title}${discount} | DontBuyTech`,
      description: deal.description,
      openGraph: {
        title: deal.title,
        description: deal.description,
        images: deal.image_url ? [{ url: deal.image_url }] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Deal Details',
      description: 'View deal details on DontBuyTech',
    };
  }
}

/**
 * Deal Detail Page Component (Server Component)
 *
 * Displays full details for a single deal with:
 * - Large image
 * - Complete description
 * - Pricing information
 * - Voting interface
 * - Category and brand info
 * - Expiration date
 * - "Visit Deal" CTA button
 */
export default async function DealPage({ params }: DealPageProps) {
  try {
    // Fetch deal data
    const deal = await getDealById(params.id);

    // Handle not found
    if (!deal) {
      notFound();
    }

    // Fetch vote counts
    const voteCount = await getVoteCount(params.id);

    // Fetch category info
    const category = deal.category_id
      ? await getCategoryById(deal.category_id)
      : null;

    // TODO: Get user vote when authentication is implemented (Phase 4)
    // For now, userVote is null (no authentication)
    const userVote = null;

    // Transform deal data to DealWithVotes format for voting component
    const dealWithVotes: DealWithVotes = {
      ...deal,
      archive_reason: deal.archive_reason as 'expired' | 'broken_link' | 'low_quality' | 'downvoted' | null,
      ranking_metadata: deal.ranking_metadata as any,
      price: parseFloat(String(deal.price)),
      original_price: deal.original_price ? parseFloat(String(deal.original_price)) : null,
      upvotes: voteCount.upvotes,
      downvotes: voteCount.downvotes,
      user_vote: userVote,
      embedding: null, // Embedding not fetched in detail view
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
          }
        : undefined,
    };

    // Calculate expiration info
    const daysUntilExpiration = getDaysUntilExpiration(deal.expires_at);
    const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3;
    const isExpired = daysUntilExpiration === 0;

    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/category/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{deal.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square w-full bg-muted">
                {deal.image_url ? (
                  <Image
                    src={deal.image_url}
                    alt={deal.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                    <Package className="h-24 w-24" />
                  </div>
                )}

                {/* Discount Badge */}
                {deal.discount_percentage !== null && deal.discount_percentage > 0 && (
                  <Badge className="absolute right-4 top-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-4 py-2">
                    {Math.round(deal.discount_percentage)}% OFF
                  </Badge>
                )}
              </div>
            </Card>

            {/* Voting Section - Desktop */}
            <div className="hidden lg:block">
              <DealVotingSection deal={dealWithVotes} />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold leading-tight mb-4">{deal.title}</h1>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 items-center">
                {deal.brand && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-medium">{deal.brand}</span>
                  </div>
                )}
                {category && (
                  <Badge variant="outline" className="text-sm">
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-green-600">
                      {formatPrice(deal.price)}
                    </span>
                    {deal.original_price !== null && parseFloat(String(deal.original_price)) > parseFloat(String(deal.price)) && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(deal.original_price)}
                      </span>
                    )}
                  </div>
                  {deal.original_price !== null && parseFloat(String(deal.original_price)) > parseFloat(String(deal.price)) && (
                    <p className="text-sm text-muted-foreground">
                      You save {formatPrice(parseFloat(String(deal.original_price)) - parseFloat(String(deal.price)))}
                    </p>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Visit Deal Button - Prominent CTA */}
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              <Link
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Visit Deal
                <ExternalLink className="h-5 w-5" />
              </Link>
            </Button>

            {/* Expiration Info */}
            {daysUntilExpiration !== null && (
              <Card className={isExpired ? 'border-red-300' : isExpiringSoon ? 'border-orange-300' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-5 w-5 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-muted-foreground'}`} />
                    <div>
                      <p className={`font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : ''}`}>
                        {isExpired
                          ? 'Deal Expired'
                          : isExpiringSoon
                          ? `Expires Soon - ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'} left`
                          : `Valid for ${daysUntilExpiration} more day${daysUntilExpiration === 1 ? '' : 's'}`}
                      </p>
                      {deal.expires_at && (
                        <p className="text-sm text-muted-foreground">
                          Expires on {formatDate(deal.expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voting Section - Mobile */}
            <div className="lg:hidden">
              <DealVotingSection deal={dealWithVotes} />
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Deal Description</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {deal.description}
                </p>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Additional Information</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Posted on</span>
                  <span className="font-medium">{formatDate(deal.created_at)}</span>
                </div>
                {deal.brand && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Brand</span>
                    <span className="font-medium">{deal.brand}</span>
                  </div>
                )}
                {category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Link
                      href={`/category/${category.slug}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {category.name}
                    </Link>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deal Score</span>
                  <span className="font-medium">{deal.score}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading deal:', error);
    throw error;
  }
}
