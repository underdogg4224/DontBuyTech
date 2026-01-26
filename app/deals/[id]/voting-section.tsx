"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DealWithVotes } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

interface DealVotingSectionProps {
  deal: DealWithVotes;
}

/**
 * DealVotingSection Component (Client Component)
 *
 * Handles voting interactions with optimistic UI updates
 * Separated from the server component to enable client-side interactivity
 */
export function DealVotingSection({ deal }: DealVotingSectionProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState<1 | -1 | null>(deal.user_vote);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(deal.upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(deal.downvotes);
  const [optimisticScore, setOptimisticScore] = useState(deal.score);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle vote action with optimistic UI updates
   */
  const handleVote = async (voteType: 1 | -1) => {
    if (isVoting) return;

    // Store previous state for rollback
    const prevVote = optimisticVote;
    const prevUpvotes = optimisticUpvotes;
    const prevDownvotes = optimisticDownvotes;
    const prevScore = optimisticScore;

    // Calculate new vote state
    let newUpvotes = optimisticUpvotes;
    let newDownvotes = optimisticDownvotes;
    let newScore = optimisticScore;
    let newVote: 1 | -1 | null = voteType;

    // Calculate optimistic update based on vote logic
    if (prevVote === voteType) {
      // Remove vote (clicking same button)
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
      // Change vote (from upvote to downvote or vice versa)
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
    setError(null);

    try {
      // Call the API to persist the vote
      // TODO: Replace with actual user ID when authentication is implemented
      const userId = 'anonymous-user';

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deal_id: deal.id,
          user_id: userId,
          vote_type: voteType === 1 ? 'up' : 'down',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const data = await response.json();

      // Update with actual server response
      if (data.success && data.data) {
        setOptimisticUpvotes(data.data.voteCount.upvotes);
        setOptimisticDownvotes(data.data.voteCount.downvotes);
        setOptimisticScore(data.data.voteCount.total);

        // Update user vote based on response
        if (data.data.userVote === 'up') {
          setOptimisticVote(1);
        } else if (data.data.userVote === 'down') {
          setOptimisticVote(-1);
        } else {
          setOptimisticVote(null);
        }
      }
    } catch (error) {
      // Rollback on error
      setOptimisticVote(prevVote);
      setOptimisticUpvotes(prevUpvotes);
      setOptimisticDownvotes(prevDownvotes);
      setOptimisticScore(prevScore);
      setError('Failed to submit vote. Please try again.');
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Community Rating</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Vote Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Upvote Button */}
          <Button
            variant={optimisticVote === 1 ? "default" : "outline"}
            size="lg"
            className={cn(
              "h-12 w-24 flex-col gap-1",
              optimisticVote === 1 && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleVote(1)}
            disabled={isVoting}
            aria-label="Upvote deal"
            aria-pressed={optimisticVote === 1}
          >
            <ArrowUp className="h-5 w-5" />
            <span className="text-sm font-semibold">{optimisticUpvotes}</span>
          </Button>

          {/* Score Display */}
          <div className="text-center">
            <div className="text-3xl font-bold" aria-label="Deal score">
              {optimisticScore}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Score
            </div>
          </div>

          {/* Downvote Button */}
          <Button
            variant={optimisticVote === -1 ? "default" : "outline"}
            size="lg"
            className={cn(
              "h-12 w-24 flex-col gap-1",
              optimisticVote === -1 && "bg-red-600 hover:bg-red-700"
            )}
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            aria-label="Downvote deal"
            aria-pressed={optimisticVote === -1}
          >
            <ArrowDown className="h-5 w-5" />
            <span className="text-sm font-semibold">{optimisticDownvotes}</span>
          </Button>
        </div>

        {/* Vote Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm border-t pt-4">
          <div>
            <div className="font-semibold text-green-600">{optimisticUpvotes}</div>
            <div className="text-xs text-muted-foreground">Upvotes</div>
          </div>
          <div>
            <div className="font-semibold">{deal.votes_count}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
          <div>
            <div className="font-semibold text-red-600">{optimisticDownvotes}</div>
            <div className="text-xs text-muted-foreground">Downvotes</div>
          </div>
        </div>

        {/* Voting Instructions */}
        <p className="text-xs text-center text-muted-foreground">
          Vote up if this is a good deal, down if it's not worth it
        </p>
      </CardContent>
    </Card>
  );
}
