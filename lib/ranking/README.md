# Enhanced Deal Ranking System

A comprehensive ranking algorithm that combines community votes, AI quality assessment, category popularity, and time decay to produce fair and dynamic deal rankings.

## Formula

```
finalScore = (baseScore + aiQualityBoost + categoryBoost + discountBoost) × freshnessDecay
```

### Components

1. **Base Score** = `upvotes - downvotes`
   - Community consensus on deal quality
   - Can be negative if heavily downvoted

2. **AI Quality Boost** = `(aiQualityScore / 100) × 50`
   - AI-assessed quality (0-100) contributes up to 50 bonus points
   - Helps surface high-quality deals even with fewer votes

3. **Category Boost** = `categoryPopularity × 0.1`
   - Popular categories get a small ranking advantage
   - Encourages diversity across categories

4. **Discount Boost** = `(discountPercentage / 100) × 20`
   - Better discounts get up to 20 bonus points
   - Rewards genuine savings

5. **Freshness Decay** = `e^(-days/30)`
   - Exponential decay with 30-day half-life
   - Ensures newer deals naturally rise to the top
   - After 30 days: ~50% of original score
   - After 60 days: ~25% of original score

## Quick Start

### Basic Usage

```typescript
import { calculateDealRanking } from '@/lib/ranking';

const result = calculateDealRanking({
  dealId: 'abc-123',
  upvotes: 150,
  downvotes: 10,
  createdAt: new Date('2024-10-15'),
  aiQualityScore: 85,
  categoryPopularity: 45,
});

console.log(result.finalScore); // e.g., 182.5
console.log(result.metadata); // Detailed breakdown
```

### With Validation

```typescript
import { calculateDealRankingSafe } from '@/lib/ranking';

try {
  const result = calculateDealRankingSafe({
    dealId: 'abc-123',
    upvotes: 150,
    downvotes: 10,
    createdAt: new Date(),
  });
} catch (error) {
  console.error('Invalid input:', error.message);
}
```

### Batch Processing

```typescript
import { calculateBatchRankings } from '@/lib/ranking';

const deals = [
  { dealId: '1', upvotes: 100, downvotes: 10, createdAt: new Date() },
  { dealId: '2', upvotes: 50, downvotes: 5, createdAt: new Date() },
];

const results = calculateBatchRankings(deals);
```

## Integration with Database

### Storing Rankings

```typescript
import { calculateDealRanking } from '@/lib/ranking';
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateDealRanking(dealId: string) {
  // 1. Fetch deal data
  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, dealId),
  });

  if (!deal) return;

  // 2. Calculate ranking
  const ranking = calculateDealRanking({
    dealId: deal.id,
    upvotes: deal.upvotes || 0,
    downvotes: deal.downvotes || 0,
    createdAt: new Date(deal.created_at),
    aiQualityScore: deal.ai_quality_score,
    categoryPopularity: 50, // Calculate from category stats
    discountPercentage: deal.discount_percentage,
  });

  // 3. Update database
  await db
    .update(deals)
    .set({
      score: ranking.finalScore,
      ranking_metadata: ranking.metadata,
    })
    .where(eq(deals.id, dealId));
}
```

### Querying by Rank

```typescript
import { db } from '@/lib/db';
import { deals } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// Get top deals
const topDeals = await db
  .select()
  .from(deals)
  .where(eq(deals.archived, false))
  .orderBy(desc(deals.score))
  .limit(20);
```

## API Reference

### Core Functions

#### `calculateDealRanking(input: RankingInput): RankingOutput`

Calculates the comprehensive ranking score for a deal.

**Parameters:**
- `dealId` (string, required): Unique deal identifier
- `upvotes` (number, required): Number of upvotes
- `downvotes` (number, required): Number of downvotes
- `createdAt` (Date, required): When the deal was created
- `aiQualityScore` (number, optional): AI quality score (0-100)
- `categoryPopularity` (number, optional): Category popularity score
- `discountPercentage` (number, optional): Discount percentage (0-100)

**Returns:**
```typescript
{
  finalScore: number;
  metadata: {
    base_score: number;
    ai_quality_component: number;
    category_component: number;
    discount_component: number;
    combined_pre_decay: number;
    freshness_decay: number;
    age_in_days: number;
    upvotes: number;
    downvotes: number;
    net_votes: number;
    ai_quality_score: number | null;
    category_popularity: number;
    discount_percentage: number | null;
    final_rank: number;
    calculated_at: string;
  }
}
```

#### `calculateBatchRankings(inputs: RankingInput[]): RankingOutput[]`

Efficiently calculates rankings for multiple deals.

#### `recalculateWithComparison(input: RankingInput, previousMetadata: RankingMetadata | null)`

Recalculates ranking and compares with previous calculation to show delta.

#### `estimateVoteImpact(currentRanking: RankingOutput, voteChange: 1 | -1): number`

Estimates the new score if a vote is added/removed (useful for UI previews).

#### `getRankingTier(finalScore: number): string`

Returns a human-readable tier: 'Legendary', 'Exceptional', 'Great', 'Good', 'Fair', 'New', or 'Poor'.

### Decay Functions

#### `calculateExponentialDecay(createdAt: Date, halfLife?: number): number`

Calculates exponential time decay (default 30-day half-life).

#### `calculateLinearDecay(createdAt: Date, graceDays?: number, decayWindow?: number): number`

Calculates linear decay with grace period.

#### `calculateFreshnessScore(createdAt: Date, decayType?: 'exponential' | 'linear'): number`

Returns freshness as a 0-100 score.

#### `getFreshnessCategory(createdAt: Date): string`

Returns category: 'Brand New', 'Hot', 'Fresh', 'Recent', 'Aging', 'Old', or 'Very Old'.

### Boost Functions

#### `calculateQualityBoost(aiQualityScore: number | null, maxBoost?: number): number`

Converts AI quality score to ranking boost (default max: 50 points).

#### `calculateCategoryBoost(categoryPopularity: number, multiplier?: number): number`

Calculates category boost based on popularity (default multiplier: 0.1).

#### `calculateDiscountBoost(discountPercentage: number | null, multiplier?: number): number`

Calculates boost based on discount percentage (default multiplier: 0.2).

## Examples

### Example 1: Brand New High-Quality Deal

```typescript
const result = calculateDealRanking({
  dealId: 'new-deal',
  upvotes: 50,
  downvotes: 2,
  createdAt: new Date(), // Just posted
  aiQualityScore: 90,
  categoryPopularity: 60,
  discountPercentage: 70,
});

// Base: 48
// AI boost: 45
// Category boost: 6
// Discount boost: 14
// Combined: 113
// Decay: ~1.0
// Final: ~113
```

### Example 2: Old Deal with Many Votes

```typescript
const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

const result = calculateDealRanking({
  dealId: 'old-deal',
  upvotes: 500,
  downvotes: 50,
  createdAt: sixtyDaysAgo,
  aiQualityScore: 75,
});

// Base: 450
// AI boost: 37.5
// Combined: 487.5
// Decay after 60 days: ~0.25 (two half-lives)
// Final: ~122
```

### Example 3: Controversial Deal

```typescript
const result = calculateDealRanking({
  dealId: 'controversial',
  upvotes: 100,
  downvotes: 90,
  createdAt: new Date(),
  aiQualityScore: 30,
});

// Base: 10
// AI boost: 15
// Combined: 25
// Decay: ~1.0
// Final: ~25
```

## Performance Considerations

1. **Batch Processing**: Use `calculateBatchRankings()` for multiple deals instead of individual calls
2. **Caching**: Consider caching `categoryPopularity` calculations
3. **Database Indexes**: Ensure `score` field is indexed for efficient sorting
4. **Background Jobs**: Recalculate rankings periodically (e.g., every hour) rather than on every request

## Testing

Run the test suite:

```bash
npm test lib/ranking/algorithm.test.ts
```

The test file includes:
- Unit tests for each component
- Integration tests for the full algorithm
- Real-world scenario tests
- Edge case handling

## Migration Guide

If migrating from the old simple ranking algorithm:

1. The new algorithm is backward compatible (votes still matter most)
2. Update database schema to include `ai_quality_score` and `ranking_metadata`
3. Gradually populate AI scores using background jobs
4. Monitor ranking changes and adjust parameters if needed

## Customization

### Adjusting Weights

You can customize the algorithm by modifying the constants:

```typescript
// In algorithm.ts
const aiQualityBoost = calculateQualityBoost(aiQualityScore, 100); // Increase max from 50
const categoryBoost = calculateCategoryBoost(categoryPopularity, 0.2); // Increase multiplier
```

### Custom Decay Functions

You can implement custom decay strategies:

```typescript
import { calculateAgeInDays } from '@/lib/ranking';

function customDecay(createdAt: Date): number {
  const days = calculateAgeInDays(createdAt);
  // Your custom formula
  return Math.max(0, 1 - (days / 100));
}
```

## Troubleshooting

### Scores seem too low/high

Adjust the boost multipliers:
- AI quality max boost (default: 50)
- Category boost multiplier (default: 0.1)
- Discount boost multiplier (default: 0.2)

### Old deals not decaying enough

Reduce the half-life (default: 30 days):
```typescript
const decay = calculateExponentialDecay(createdAt, 15); // 15-day half-life
```

### New deals dominating too much

Increase the half-life or add a grace period to linear decay.

## Architecture

```
lib/ranking/
├── algorithm.ts      # Core ranking calculation
├── decay.ts          # Time decay functions
├── boost.ts          # Boost calculations
├── index.ts          # Public exports
├── algorithm.test.ts # Unit tests
└── README.md         # This file
```

## Future Enhancements

Potential improvements for future versions:

1. **User Reputation**: Factor in the reputation of users who voted
2. **Engagement Velocity**: Boost deals gaining votes quickly
3. **External Signals**: Incorporate price history, stock levels, etc.
4. **Personalization**: User-specific ranking based on preferences
5. **A/B Testing**: Framework for testing ranking variations

## License

Part of the DontBuyTech project.
