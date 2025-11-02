# Database Query Functions

This directory contains reusable database query functions organized by domain.

## Usage

```typescript
import {
  getTopDealsByCategory,
  getDealById,
  createVote,
  getAllCategories,
} from '@/lib/db/queries';
```

## Ranking Algorithm

The deal ranking system uses a time-decay algorithm to balance vote count with freshness:

**Formula:** `score = votes_count * freshness_factor`

**Freshness Factor:** `1 / (1 + hours_since_posted / 24)`

This ensures:
- Newer deals with similar votes rank higher
- Gradual time decay (half-life of ~24 hours)
- Active deals stay relevant while maintaining quality

## Query Files

### deals.ts

Deal-related queries with ranking algorithm support.

**Functions:**
- `getTopDealsByCategory(categoryId, limit)` - Get top N deals by score
- `getDealById(id)` - Get single deal with details
- `getDealsByCategory(categoryId, options)` - Get all deals with filters
- `getArchivedDeals(options)` - Get archived deals
- `getTopDeals(limit)` - Get top deals across all categories
- `updateDealScore(dealId, votesCount, createdAt)` - Update deal score
- `calculateDealScore(votesCount, createdAt)` - Calculate score value

**Options:**
```typescript
{
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'created_at' | 'price';
  sortOrder?: 'asc' | 'desc';
}
```

### votes.ts

Vote-related queries for upvote/downvote functionality.

**Functions:**
- `getVoteCount(dealId)` - Get vote statistics (upvotes, downvotes, total)
- `getUserVote(dealId, userId)` - Get user's vote on a deal
- `createVote(dealId, userId, voteType)` - Create or update vote
- `deleteVote(voteId)` - Delete vote by ID
- `deleteUserVote(dealId, userId)` - Delete user's vote on deal
- `toggleVote(dealId, userId, voteType)` - Toggle vote (create/update/delete)
- `getVotesByDeal(dealId)` - Get all votes for a deal

**Vote Types:**
- `VoteType.UPVOTE` (1)
- `VoteType.DOWNVOTE` (-1)

### categories.ts

Category-related queries with statistics support.

**Functions:**
- `getAllCategories()` - Get all categories
- `getCategoryBySlug(slug)` - Get category by URL slug
- `getCategoryById(id)` - Get category by UUID
- `getCategoriesWithCounts()` - Get categories with deal counts
- `getTopCategories(limit)` - Get top categories by active deals
- `getCategoryStatistics(categoryId)` - Get detailed category stats
- `categorySlugExists(slug)` - Check if slug exists
- `categoryNameExists(name)` - Check if name exists

## Error Handling

All query functions include:
- Try-catch blocks for database errors
- Descriptive error messages
- Error logging to console
- Proper error propagation

## Type Safety

All functions are fully typed with:
- Input parameter types
- Return type interfaces
- TypeScript strict mode compliance

## Performance

Queries are optimized with:
- Proper database indexes (defined in schema)
- Selective field selection
- Limit/offset pagination
- Composite indexes for common query patterns

## Examples

### Get Top Deals in a Category

```typescript
const topDeals = await getTopDealsByCategory('category-uuid', 10);
```

### Create or Update Vote

```typescript
import { createVote, VoteType } from '@/lib/db/queries';

const vote = await createVote('deal-uuid', 'user-123', VoteType.UPVOTE);
// Automatically updates deal's vote count
```

### Toggle Vote (Like Reddit/HN)

```typescript
// First click: creates upvote
await toggleVote('deal-uuid', 'user-123', VoteType.UPVOTE);

// Second click on same button: removes vote
await toggleVote('deal-uuid', 'user-123', VoteType.UPVOTE); // Returns null

// Click different button: changes to downvote
await toggleVote('deal-uuid', 'user-123', VoteType.DOWNVOTE);
```

### Get Categories with Deal Counts

```typescript
const categories = await getCategoriesWithCounts();
// Returns: [{ id, name, slug, ..., deal_count: 42, active_deal_count: 38 }]
```

### Filter and Sort Deals

```typescript
const deals = await getDealsByCategory('category-uuid', {
  limit: 20,
  offset: 0,
  sortBy: 'price',
  sortOrder: 'asc'
});
```
