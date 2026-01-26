# Integration Guide: Enhanced Ranking Algorithm

This guide shows how to integrate the enhanced ranking algorithm with the existing DontBuyTech database queries.

## Current State

The existing ranking system (`lib/db/queries/deals.ts`) uses a simple formula:

```typescript
score = votes_count * (1.0 / (1.0 + hours_since_posted / 24))
```

## New Enhanced System

The enhanced system combines multiple factors:

```typescript
finalScore = (baseScore + aiQualityBoost + categoryBoost + discountBoost) × freshnessDecay
```

## Integration Steps

### Step 1: Update Deal Creation

When creating a new deal, calculate initial ranking:

```typescript
import { calculateDealRanking } from '@/lib/ranking';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';

async function createDealWithRanking(dealData) {
  // 1. Insert deal
  const [newDeal] = await db
    .insert(deals)
    .values({
      ...dealData,
      votes_count: 0,
      score: 0, // Will be updated
    })
    .returning();

  // 2. Calculate initial ranking (no votes yet)
  const ranking = calculateDealRanking({
    dealId: newDeal.id,
    upvotes: 0,
    downvotes: 0,
    createdAt: newDeal.created_at,
    aiQualityScore: newDeal.ai_quality_score,
    categoryPopularity: await getCategoryPopularity(newDeal.category_id),
    discountPercentage: newDeal.discount_percentage,
  });

  // 3. Update with calculated ranking
  await db
    .update(deals)
    .set({
      score: ranking.finalScore,
      ranking_metadata: ranking.metadata,
    })
    .where(eq(deals.id, newDeal.id));

  return newDeal;
}
```

### Step 2: Update on Vote Changes

When a vote is cast, recalculate the ranking:

```typescript
import { calculateDealRanking } from '@/lib/ranking';
import { db } from '@/lib/db';
import { deals, votes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

async function updateDealRankingAfterVote(dealId: string) {
  // 1. Get current deal data
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });

  if (!deal) return;

  // 2. Count upvotes and downvotes
  const voteStats = await db
    .select({
      upvotes: sql<number>`COUNT(*) FILTER (WHERE vote_type = 1)`,
      downvotes: sql<number>`COUNT(*) FILTER (WHERE vote_type = -1)`,
    })
    .from(votes)
    .where(eq(votes.deal_id, dealId));

  const upvotes = Number(voteStats[0]?.upvotes || 0);
  const downvotes = Number(voteStats[0]?.downvotes || 0);

  // 3. Recalculate ranking
  const ranking = calculateDealRanking({
    dealId: deal.id,
    upvotes,
    downvotes,
    createdAt: new Date(deal.created_at),
    aiQualityScore: deal.ai_quality_score,
    categoryPopularity: await getCategoryPopularity(deal.category_id),
    discountPercentage: deal.discount_percentage,
  });

  // 4. Update database
  await db
    .update(deals)
    .set({
      score: ranking.finalScore,
      votes_count: upvotes + downvotes,
      ranking_metadata: ranking.metadata,
    })
    .where(eq(deals.id, dealId));
}
```

### Step 3: Category Popularity Calculation

Calculate category popularity based on engagement:

```typescript
import { db } from '@/lib/db';
import { deals, votes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Cache category popularity (refresh every hour)
const categoryPopularityCache = new Map<string, { value: number; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCategoryPopularity(categoryId: string): Promise<number> {
  // Check cache
  const cached = categoryPopularityCache.get(categoryId);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  // Calculate total engagement across all categories
  const totalEngagement = await db
    .select({
      total: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .where(
      eq(votes.created_at, sql`created_at > NOW() - INTERVAL '30 days'`)
    );

  const total = Number(totalEngagement[0]?.total || 1);

  // Calculate category-specific engagement
  const categoryEngagement = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .innerJoin(deals, eq(votes.deal_id, deals.id))
    .where(
      and(
        eq(deals.category_id, categoryId),
        eq(votes.created_at, sql`created_at > NOW() - INTERVAL '30 days'`)
      )
    );

  const count = Number(categoryEngagement[0]?.count || 0);
  const popularity = (count / total) * 100;

  // Cache result
  categoryPopularityCache.set(categoryId, {
    value: popularity,
    expiry: Date.now() + CACHE_TTL,
  });

  return popularity;
}
```

### Step 4: Background Job for Periodic Recalculation

Recalculate rankings periodically to account for time decay:

```typescript
import { calculateBatchRankings } from '@/lib/ranking';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function recalculateAllRankings() {
  console.log('Starting ranking recalculation...');

  // Get all active deals
  const activeDeals = await db
    .select()
    .from(deals)
    .where(eq(deals.archived, false));

  // Get category popularity for all categories
  const categoryPopularityMap = new Map<string, number>();
  for (const deal of activeDeals) {
    if (!categoryPopularityMap.has(deal.category_id)) {
      categoryPopularityMap.set(
        deal.category_id,
        await getCategoryPopularity(deal.category_id)
      );
    }
  }

  // Prepare ranking inputs
  const rankingInputs = activeDeals.map(deal => ({
    dealId: deal.id,
    upvotes: await getUpvoteCount(deal.id),
    downvotes: await getDownvoteCount(deal.id),
    createdAt: new Date(deal.created_at),
    aiQualityScore: deal.ai_quality_score,
    categoryPopularity: categoryPopularityMap.get(deal.category_id) || 0,
    discountPercentage: deal.discount_percentage,
  }));

  // Batch calculate rankings
  const rankings = calculateBatchRankings(rankingInputs);

  // Update database
  for (let i = 0; i < activeDeals.length; i++) {
    await db
      .update(deals)
      .set({
        score: rankings[i].finalScore,
        ranking_metadata: rankings[i].metadata,
      })
      .where(eq(deals.id, activeDeals[i].id));
  }

  console.log(`Updated rankings for ${activeDeals.length} deals`);
}

// Run every hour
setInterval(recalculateAllRankings, 60 * 60 * 1000);
```

### Step 5: Update Query Functions

Modify existing query functions to use the new score:

```typescript
// The existing queries already use the `score` field, so no changes needed!
// Just ensure the score field is being updated with the new algorithm

import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// This already works with the new ranking system
export async function getTopDeals(limit: number = 20) {
  return await db
    .select()
    .from(deals)
    .where(eq(deals.archived, false))
    .orderBy(desc(deals.score)) // Uses enhanced score
    .limit(limit);
}
```

## Migration Plan

### Phase 1: Parallel Running (1-2 weeks)

1. Keep old scoring in place
2. Calculate new scores in `ranking_metadata` field
3. Monitor and compare results
4. Adjust weights if needed

```typescript
// Calculate both scores during migration
const oldScore = calculateOldScore(votesCount, createdAt);
const newRanking = calculateDealRanking({...});

await db.update(deals).set({
  score: oldScore, // Still use old score
  ranking_metadata: {
    ...newRanking.metadata,
    old_score: oldScore, // Track old score for comparison
  },
});
```

### Phase 2: Gradual Rollout (1 week)

1. Switch 10% of queries to new scoring
2. Monitor performance and user engagement
3. Gradually increase to 50%, then 100%

```typescript
// Feature flag
const USE_NEW_RANKING = Math.random() < rolloutPercentage;

const deals = await getTopDeals(20);
if (USE_NEW_RANKING) {
  deals.sort((a, b) =>
    (b.ranking_metadata?.final_rank || 0) - (a.ranking_metadata?.final_rank || 0)
  );
}
```

### Phase 3: Full Migration (1 week)

1. Switch all queries to new scoring
2. Update `score` field to use new rankings
3. Remove old calculation code

```typescript
// Use new score everywhere
await db.update(deals).set({
  score: newRanking.finalScore,
  ranking_metadata: newRanking.metadata,
});
```

## Performance Considerations

### 1. Index Optimization

Ensure proper indexes exist:

```sql
CREATE INDEX deals_score_idx ON deals(score DESC);
CREATE INDEX deals_ai_quality_score_idx ON deals(ai_quality_score);
CREATE INDEX deals_archived_category_score_idx ON deals(archived, category_id, score DESC);
```

### 2. Caching Strategy

Cache expensive calculations:

```typescript
// Cache category popularity for 1 hour
// Cache AI quality scores permanently (only update when re-analyzed)
// Calculate rankings on-write, not on-read
```

### 3. Database Triggers

Consider using PostgreSQL triggers for automatic updates:

```sql
CREATE OR REPLACE FUNCTION update_deal_ranking()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger external service to recalculate ranking
  PERFORM pg_notify('deal_ranking_update', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_deal_ranking();
```

## Testing

### Unit Tests

Test the integration:

```typescript
import { expect, test } from '@jest/globals';

test('creates deal with initial ranking', async () => {
  const deal = await createDealWithRanking({
    title: 'Test Deal',
    price: 99.99,
    // ...
  });

  expect(deal.score).toBeGreaterThan(0);
  expect(deal.ranking_metadata).toBeDefined();
  expect(deal.ranking_metadata.final_rank).toBe(deal.score);
});

test('updates ranking after vote', async () => {
  const deal = await createDealWithRanking({...});
  const initialScore = deal.score;

  await castVote(deal.id, userId, 1); // Upvote
  await updateDealRankingAfterVote(deal.id);

  const updated = await getDealById(deal.id);
  expect(updated.score).toBeGreaterThan(initialScore);
});
```

### Integration Tests

Test the full workflow:

```typescript
test('ranking workflow: create -> vote -> recalculate', async () => {
  // 1. Create deal
  const deal = await createDealWithRanking({...});

  // 2. Multiple users vote
  for (let i = 0; i < 10; i++) {
    await castVote(deal.id, `user-${i}`, 1);
  }

  // 3. Recalculate
  await updateDealRankingAfterVote(deal.id);

  // 4. Verify
  const updated = await getDealById(deal.id);
  expect(updated.ranking_metadata.upvotes).toBe(10);
  expect(updated.ranking_metadata.downvotes).toBe(0);
  expect(updated.score).toBeGreaterThan(deal.score);
});
```

## Monitoring

Track these metrics:

1. **Score Distribution**: Are scores well-distributed?
2. **Time Decay Impact**: Are old deals decaying as expected?
3. **Query Performance**: Are ranking queries still fast?
4. **User Engagement**: Are users engaging more with top-ranked deals?

```typescript
// Add telemetry
const ranking = calculateDealRanking(input);
analytics.track('deal_ranking_calculated', {
  deal_id: input.dealId,
  final_score: ranking.finalScore,
  tier: getRankingTier(ranking.finalScore),
  has_ai_score: !!input.aiQualityScore,
  age_days: ranking.metadata.age_in_days,
});
```

## Troubleshooting

### Issue: Rankings not updating

**Solution**: Check that vote triggers are working

```typescript
// Debug: Check last ranking update
const deal = await getDealById(dealId);
console.log('Last ranking update:', deal.ranking_metadata?.calculated_at);
console.log('Current score:', deal.score);
```

### Issue: Scores seem too low/high

**Solution**: Adjust boost multipliers

```typescript
// In algorithm.ts, modify constants:
const aiQualityBoost = calculateQualityBoost(aiQualityScore, 100); // Increase max
const categoryBoost = calculateCategoryBoost(categoryPopularity, 0.2); // Increase weight
```

### Issue: Old deals not decaying enough

**Solution**: Reduce half-life

```typescript
// In decay.ts, adjust default half-life:
const freshnessDecay = calculateExponentialDecay(createdAt, 15); // 15 days instead of 30
```

## Next Steps

After integration:

1. Monitor for 1-2 weeks
2. Gather user feedback
3. Adjust parameters based on data
4. Document learnings
5. Consider A/B testing variations

## References

- [Algorithm Documentation](./README.md)
- [Type Definitions](../types/deal.ts)
- [Database Schema](../db/schema/deals.ts)
- [Existing Queries](../db/queries/deals.ts)
