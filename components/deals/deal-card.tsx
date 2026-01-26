"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowDown, ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DealWithVotes } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: DealWithVotes;
  onVote?: (dealId: string, voteType: 1 | -1) => Promise<void>;
  className?: string;
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
 * Format price with currency
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Get quality score badge variant based on score
 */
function getQualityScoreVariant(score: number): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  if (score >= 80) {
    return { variant: "default", className: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100" };
  } else if (score >= 50) {
    return { variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100" };
  } else {
    return { variant: "destructive", className: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100" };
  }
}

/**
 * DealCard Component
 * Displays a deal with image, pricing, voting, and metadata
 */
export function DealCard({ deal, onVote, className }: DealCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState<1 | -1 | null>(deal.user_vote);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(deal.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(deal.downvotes);
  const [optimisticScore, setOptimisticScore] = useState(deal.score);

  const daysUntilExpiration = getDaysUntilExpiration(deal.expires_at);
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 3;
  const isExpired = daysUntilExpiration === 0;

  /**
   * Handle vote action with optimistic UI
   */
  const handleVote = async (voteType: 1 | -1) => {
    if (!onVote || isVoting) return;

    // Store previous state for rollback
    const prevVote = optimisticVote;
    const prevUpvotes = optimisticUpvotes;
    const prevDownvotes = optimisticDownvotes;
    const prevScore = optimisticScore;

    // Optimistic update
    let newUpvotes = optimisticUpvotes;
    let newDownvotes = optimisticDownvotes;
    let newScore = optimisticScore;
    let newVote: 1 | -1 | null = voteType;

    // Calculate new vote state
    if (prevVote === voteType) {
      // Remove vote
      newVote = null;
      if (voteType === 1) {
        newUpvotes--;
        newScore--;
      } else {
        newDownvotes--;
        newScore++;
      }
    } else if (prevVote === null) {
      // Add new vote
      if (voteType === 1) {
        newUpvotes++;
        newScore++;
      } else {
        newDownvotes++;
        newScore--;
      }
    } else {
      // Change vote
      if (voteType === 1) {
        newUpvotes++;
        newDownvotes--;
        newScore += 2;
      } else {
        newDownvotes++;
        newUpvotes--;
        newScore -= 2;
      }
    }

    // Apply optimistic update
    setOptimisticVote(newVote);
    setOptimisticUpvotes(newUpvotes);
    setOptimisticDownvotes(newDownvotes);
    setOptimisticScore(newScore);
    setIsVoting(true);

    try {
      await onVote(deal.id, voteType);
    } catch (error) {
      // Rollback on error
      setOptimisticVote(prevVote);
      setOptimisticUpvotes(prevUpvotes);
      setOptimisticDownvotes(prevDownvotes);
      setOptimisticScore(prevScore);
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-lg", className)}>
      {/* Deal Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {deal.image_url ? (
          <Image
            src={deal.image_url}
            alt={deal.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {deal.discount_percentage !== null && deal.discount_percentage > 0 && (
          <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-600 text-white font-bold">
            {Math.round(deal.discount_percentage)}% OFF
          </Badge>
        )}
      </div>

      {/* Card Header */}
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
            {deal.title}
          </h3>
        </div>

        {/* AI Summary Section */}
        {deal.summary && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="gap-1 text-xs font-normal">
                <Sparkles className="h-3 w-3" />
                AI Summary
              </Badge>
              {deal.ai_quality_score !== null && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-normal",
                    getQualityScoreVariant(deal.ai_quality_score).className
                  )}
                >
                  {Math.round(deal.ai_quality_score)}
                </Badge>
              )}
            </div>
            <p className="line-clamp-3 text-sm italic text-muted-foreground">
              {deal.summary}
            </p>
          </div>
        )}

        {/* Brand and Category */}
        <div className="flex flex-wrap items-center gap-2">
          {deal.brand && (
            <span className="text-sm text-muted-foreground">{deal.brand}</span>
          )}
          {deal.category && (
            <Badge variant="outline" className="text-xs">
              {deal.category.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="space-y-3 pb-3">
        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {deal.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(deal.price)}
          </span>
          {deal.original_price !== null && deal.original_price > deal.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(deal.original_price)}
            </span>
          )}
        </div>

        {/* Expiration Indicator */}
        {daysUntilExpiration !== null && (
          <div
            className={cn(
              "text-xs font-medium",
              isExpired
                ? "text-red-600"
                : isExpiringSoon
                ? "text-orange-600"
                : "text-muted-foreground"
            )}
          >
            {isExpired
              ? "Expired"
              : `Expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? "" : "s"}`}
          </div>
        )}
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="flex items-center justify-between gap-3 pt-3">
        {/* Vote Buttons */}
        <div className="flex items-center gap-1">
          {/* Upvote Button */}
          <Button
            variant={optimisticVote === 1 ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 gap-1",
              optimisticVote === 1 && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleVote(1)}
            disabled={isVoting}
            aria-label="Upvote deal"
            aria-pressed={optimisticVote === 1}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="text-xs font-medium">{optimisticUpvotes}</span>
          </Button>

          {/* Score Display */}
          <div className="px-2 text-sm font-semibold" aria-label="Deal score">
            {optimisticScore}
          </div>

          {/* Downvote Button */}
          <Button
            variant={optimisticVote === -1 ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-8 gap-1",
              optimisticVote === -1 && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            aria-label="Downvote deal"
            aria-pressed={optimisticVote === -1}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="text-xs font-medium">{optimisticDownvotes}</span>
          </Button>
        </div>

        {/* View Deal Button */}
        <Button
          asChild
          size="sm"
          variant="default"
          className="gap-1.5"
        >
          <Link
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View deal for ${deal.title}`}
          >
            View Deal
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
