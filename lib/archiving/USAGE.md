# Archiving Logic Usage Guide

This module provides a comprehensive archiving system for DontBuyTech deals based on quality, expiration, link validity, and voting scores.

## Table of Contents

- [Overview](#overview)
- [Archiving Rules](#archiving-rules)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Cron Jobs](#cron-jobs)

## Overview

The archiving system implements **soft deletion** - archived deals are not removed from the database but marked with:
- `archived = true`
- `archived_at = timestamp`
- `archive_reason = reason`

This allows for:
- Historical analysis
- Audit trails
- Potential restoration of mistakenly archived deals

## Archiving Rules

A deal is archived if **ANY** of the following conditions are met:

### 1. **Expired** (`expired`)
- `expiresAt < now`
- Deal has passed its expiration date

### 2. **Broken Link** (`broken_link`)
- Link returns HTTP 404 or 500+ status
- 3 consecutive failed checks required
- Prevents false positives from temporary outages

### 3. **Low Quality** (`low_quality`)
- `aiQualityScore < 30` AND
- `createdAt > 60 days ago`
- Only archives poor quality deals that have been around long enough

### 4. **Heavily Downvoted** (`downvoted`)
- `finalScore < -10`
- Community has heavily downvoted the deal

## API Reference

### Link Checker

#### `checkDealLink(url: string, retries?: number): Promise<LinkCheckResult>`

Validates a single URL with retry logic.

**Parameters:**
- `url` - URL to check
- `retries` - Number of retry attempts (default: 2)

**Returns:**
```typescript
{
  isValid: boolean;
  statusCode: number;
  error?: string;
}
```

**Features:**
- 5-second timeout per attempt
- Exponential backoff (1s, 2s, 4s)
- Handles redirects, timeouts, and network errors

#### `checkMultipleLinks(urls: string[], concurrency?: number): Promise<Map<string, LinkCheckResult>>`

Check multiple URLs in parallel.

**Parameters:**
- `urls` - Array of URLs to check
- `concurrency` - Max concurrent checks (default: 5)

**Returns:** Map of URL to check result

### Archiving Logic

#### `shouldArchiveDeal(deal: DealArchiveData, checkLink?: boolean): Promise<ArchiveDecision>`

Evaluate if a deal should be archived.

**Parameters:**
- `deal` - Deal data (id, url, expiresAt, createdAt, aiQualityScore, score, archived)
- `checkLink` - Perform live link check (default: false)

**Returns:**
```typescript
{
  shouldArchive: boolean;
  reason: ArchiveReason | null;
  details?: string;
}
```

#### `archiveDeal(dealId: string, reason: ArchiveReason): Promise<boolean>`

Archive a deal (soft delete).

**Parameters:**
- `dealId` - Deal UUID
- `reason` - Archive reason: `'expired' | 'broken_link' | 'low_quality' | 'downvoted'`

**Returns:** `true` if successful

#### `unarchiveDeal(dealId: string): Promise<boolean>`

Restore an archived deal.

**Parameters:**
- `dealId` - Deal UUID

**Returns:** `true` if successful

#### `getArchivableDeals(limit?: number): Promise<DealArchiveData[]>`

Get deals matching archiving criteria.

**Parameters:**
- `limit` - Max number of deals (default: 100)

**Returns:** Array of archivable deals

**Note:** Does not check for broken links (requires live HTTP requests)

#### `checkAndArchiveBrokenLinks(batchSize?: number, concurrency?: number): Promise<number>`

Check and archive deals with broken links.

**Parameters:**
- `batchSize` - Number of deals to check (default: 50)
- `concurrency` - Concurrent link checks (default: 5)

**Returns:** Number of deals archived

#### `archiveEligibleDeals(): Promise<number>`

Archive all eligible deals based on rules (except broken links).

**Returns:** Number of deals archived

#### `getArchivingStats(): Promise<Stats>`

Get archiving statistics.

**Returns:**
```typescript
{
  totalArchived: number;
  byReason: {
    expired: number;
    broken_link: number;
    low_quality: number;
    downvoted: number;
  };
}
```

## Usage Examples

### Basic Usage

```typescript
import {
  shouldArchiveDeal,
  archiveDeal,
  getArchivableDeals,
} from '@/lib/archiving';
import { getDealById } from '@/lib/db/queries/deals';

// Check a single deal
const deal = await getDealById('some-uuid');
const decision = await shouldArchiveDeal(deal);

if (decision.shouldArchive) {
  console.log(`Archiving: ${decision.details}`);
  await archiveDeal(deal.id, decision.reason!);
}
```

### Check with Live Link Validation

```typescript
import { shouldArchiveDeal, archiveDeal } from '@/lib/archiving';
import { getDealById } from '@/lib/db/queries/deals';

const deal = await getDealById('some-uuid');

// Enable live link checking
const decision = await shouldArchiveDeal(deal, true);

if (decision.shouldArchive) {
  await archiveDeal(deal.id, decision.reason!);
  console.log(`Archived: ${decision.reason} - ${decision.details}`);
}
```

### Batch Archive Eligible Deals

```typescript
import { archiveEligibleDeals } from '@/lib/archiving';

// Archive all deals matching criteria (except broken links)
const count = await archiveEligibleDeals();
console.log(`Archived ${count} deals`);
```

### Check and Archive Broken Links

```typescript
import { checkAndArchiveBrokenLinks } from '@/lib/archiving';

// Check 100 deals with 10 concurrent link checks
const count = await checkAndArchiveBrokenLinks(100, 10);
console.log(`Archived ${count} deals with broken links`);
```

### Get Archiving Statistics

```typescript
import { getArchivingStats } from '@/lib/archiving';

const stats = await getArchivingStats();
console.log(`Total archived: ${stats.totalArchived}`);
console.log('By reason:', stats.byReason);

// Output:
// Total archived: 152
// By reason: {
//   expired: 83,
//   broken_link: 34,
//   low_quality: 21,
//   downvoted: 14
// }
```

### Manual Link Checking

```typescript
import { checkDealLink, checkMultipleLinks } from '@/lib/archiving';

// Check single link
const result = await checkDealLink('https://example.com/deal');
console.log(`Valid: ${result.isValid}, Status: ${result.statusCode}`);

// Check multiple links
const urls = [
  'https://example.com/deal1',
  'https://example.com/deal2',
  'https://example.com/deal3',
];

const results = await checkMultipleLinks(urls, 5);

for (const [url, result] of results) {
  console.log(`${url}: ${result.isValid ? 'OK' : 'BROKEN'}`);
}
```

### Restore Archived Deal

```typescript
import { unarchiveDeal } from '@/lib/archiving';

// Restore a mistakenly archived deal
await unarchiveDeal('some-uuid');
console.log('Deal restored');
```

## Cron Jobs

### Daily Archiving Job

Run this job once per day to archive expired, low-quality, and downvoted deals:

```typescript
// app/api/cron/archive-deals/route.ts
import { NextResponse } from 'next/server';
import { archiveEligibleDeals, getArchivingStats } from '@/lib/archiving';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const count = await archiveEligibleDeals();
    const stats = await getArchivingStats();

    return NextResponse.json({
      success: true,
      archivedCount: count,
      stats,
    });
  } catch (error) {
    console.error('Archiving job failed:', error);
    return NextResponse.json(
      { error: 'Archiving job failed' },
      { status: 500 }
    );
  }
}
```

### Weekly Link Check Job

Run this job weekly to check for broken links (slower, performs HTTP requests):

```typescript
// app/api/cron/check-broken-links/route.ts
import { NextResponse } from 'next/server';
import { checkAndArchiveBrokenLinks } from '@/lib/archiving';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check 200 deals with 10 concurrent requests
    const count = await checkAndArchiveBrokenLinks(200, 10);

    return NextResponse.json({
      success: true,
      archivedCount: count,
    });
  } catch (error) {
    console.error('Link check job failed:', error);
    return NextResponse.json(
      { error: 'Link check job failed' },
      { status: 500 }
    );
  }
}
```

### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-deals",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/check-broken-links",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

## Performance Considerations

### Link Checking
- **Batch Size:** Start with 50-100 deals per run
- **Concurrency:** Limit to 5-10 concurrent requests to avoid rate limiting
- **Frequency:** Weekly is sufficient for link checks
- **Timeout:** 5 seconds per link check

### Archiving
- **Frequency:** Daily for rule-based archiving
- **Batch Size:** Process 200+ deals per run (no HTTP overhead)
- **Database Impact:** Minimal - uses indexed queries

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  await archiveEligibleDeals();
} catch (error) {
  console.error('Archiving failed:', error);
  // Error is logged but should be monitored
}
```

Errors are:
1. Logged to console with context
2. Thrown with descriptive messages
3. Safe to retry (idempotent operations)

## Monitoring

Track archiving operations:

```typescript
import { getArchivingStats } from '@/lib/archiving';

// Monitor daily
const stats = await getArchivingStats();

if (stats.totalArchived > THRESHOLD) {
  // Send alert
}
```

## Testing

```typescript
// Test archiving logic without database
import { shouldArchiveDeal } from '@/lib/archiving';

const testDeal = {
  id: 'test-uuid',
  url: 'https://example.com',
  expiresAt: new Date('2020-01-01'), // Expired
  createdAt: new Date('2024-01-01'),
  aiQualityScore: 50,
  score: 5,
  archived: false,
};

const decision = await shouldArchiveDeal(testDeal);
console.log(decision);
// { shouldArchive: true, reason: 'expired', details: '...' }
```
