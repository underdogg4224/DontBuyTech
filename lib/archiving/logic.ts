/**
 * Archiving Logic Engine
 * Rules-based system for archiving deals based on quality, expiration, and link validity
 */

import { db } from '../db';
import { deals } from '../db/schema';
import { eq, and, lt, or, sql } from 'drizzle-orm';
import { checkDealLink, type LinkCheckResult } from './link-checker';
import type { ArchiveReason } from '../types/deal';

/**
 * Result of archiving decision
 */
export interface ArchiveDecision {
  /** Whether the deal should be archived */
  shouldArchive: boolean;
  /** Reason for archiving (if applicable) */
  reason: ArchiveReason | null;
  /** Additional details about the decision */
  details?: string;
}

/**
 * Deal data needed for archiving decisions
 */
interface DealArchiveData {
  id: string;
  url: string;
  expiresAt: Date | null;
  createdAt: Date;
  aiQualityScore: number | null;
  score: number;
  archived: boolean;
}

/**
 * Link check history entry
 * Used to track consecutive failed link checks
 */
interface LinkCheckHistory {
  dealId: string;
  consecutiveFailures: number;
  lastChecked: Date;
  lastStatus: number;
}

// In-memory cache for link check history
// In production, this should be persisted to database or Redis
const linkCheckHistory = new Map<string, LinkCheckHistory>();

/**
 * Archiving Rules:
 * A deal should be archived if ANY of the following conditions are met:
 *
 * 1. EXPIRED: expiresAt < now
 * 2. BROKEN_LINK: Link returns 404/500 for 3 consecutive checks
 * 3. LOW_QUALITY: aiQualityScore < 30 AND createdAt > 60 days ago
 * 4. DOWNVOTED: finalScore < -10 (heavily downvoted)
 *
 * @param deal - Deal data to evaluate
 * @param checkLink - Whether to perform live link check (default: false)
 * @returns Archive decision with reason
 *
 * @example
 * ```typescript
 * const deal = await getDealById('some-uuid');
 * const decision = await shouldArchiveDeal(deal, true);
 *
 * if (decision.shouldArchive) {
 *   await archiveDeal(deal.id, decision.reason!);
 * }
 * ```
 */
export async function shouldArchiveDeal(
  deal: DealArchiveData,
  checkLink: boolean = false
): Promise<ArchiveDecision> {
  // Don't re-archive already archived deals
  if (deal.archived) {
    return {
      shouldArchive: false,
      reason: null,
      details: 'Deal is already archived',
    };
  }

  const now = new Date();

  // Rule 1: Check if deal is expired
  if (deal.expiresAt && new Date(deal.expiresAt) < now) {
    return {
      shouldArchive: true,
      reason: 'expired',
      details: `Deal expired on ${new Date(deal.expiresAt).toISOString()}`,
    };
  }

  // Rule 2: Check if deal is heavily downvoted (score < -10)
  if (deal.score < -10) {
    return {
      shouldArchive: true,
      reason: 'downvoted',
      details: `Deal score is ${deal.score} (threshold: -10)`,
    };
  }

  // Rule 3: Check for low quality + old deals
  const daysSinceCreation = (now.getTime() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const isOld = daysSinceCreation > 60;
  const isLowQuality = deal.aiQualityScore !== null && deal.aiQualityScore < 30;

  if (isLowQuality && isOld) {
    return {
      shouldArchive: true,
      reason: 'low_quality',
      details: `AI quality score: ${deal.aiQualityScore}, Age: ${Math.round(daysSinceCreation)} days`,
    };
  }

  // Rule 4: Check for broken links (if enabled)
  if (checkLink) {
    const linkResult = await checkDealLink(deal.url);
    const history = linkCheckHistory.get(deal.id);

    // Update link check history
    if (!linkResult.isValid) {
      const consecutiveFailures = (history?.consecutiveFailures || 0) + 1;

      linkCheckHistory.set(deal.id, {
        dealId: deal.id,
        consecutiveFailures,
        lastChecked: now,
        lastStatus: linkResult.statusCode,
      });

      // Archive if 3 consecutive failures and status is 404 or 500+
      if (consecutiveFailures >= 3 && (linkResult.statusCode === 404 || linkResult.statusCode >= 500)) {
        return {
          shouldArchive: true,
          reason: 'broken_link',
          details: `Link check failed ${consecutiveFailures} times (HTTP ${linkResult.statusCode})`,
        };
      }
    } else {
      // Reset consecutive failures on success
      if (history) {
        linkCheckHistory.delete(deal.id);
      }
    }
  }

  // No archiving conditions met
  return {
    shouldArchive: false,
    reason: null,
    details: 'Deal passes all archiving checks',
  };
}

/**
 * Archive a deal (soft delete)
 *
 * Sets archived flag, archived_at timestamp, and archive_reason
 * Does not delete the deal from the database
 *
 * @param dealId - Deal UUID to archive
 * @param reason - Reason for archiving
 * @returns True if archived successfully
 *
 * @example
 * ```typescript
 * await archiveDeal('deal-uuid', 'expired');
 * ```
 */
export async function archiveDeal(
  dealId: string,
  reason: ArchiveReason
): Promise<boolean> {
  try {
    const now = new Date();

    await db
      .update(deals)
      .set({
        archived: true,
        archived_at: now,
        archive_reason: reason,
      })
      .where(eq(deals.id, dealId));

    console.log(`[Archiving] Archived deal ${dealId}: ${reason}`);

    // Clean up link check history for archived deals
    linkCheckHistory.delete(dealId);

    return true;
  } catch (error) {
    console.error(`[Archiving] Error archiving deal ${dealId}:`, error);
    throw new Error(`Failed to archive deal ${dealId}: ${error}`);
  }
}

/**
 * Unarchive a deal
 *
 * Removes archived flag and clears archiving metadata
 * Useful for restoring mistakenly archived deals
 *
 * @param dealId - Deal UUID to unarchive
 * @returns True if unarchived successfully
 *
 * @example
 * ```typescript
 * await unarchiveDeal('deal-uuid');
 * ```
 */
export async function unarchiveDeal(dealId: string): Promise<boolean> {
  try {
    await db
      .update(deals)
      .set({
        archived: false,
        archived_at: null,
        archive_reason: null,
      })
      .where(eq(deals.id, dealId));

    console.log(`[Archiving] Unarchived deal ${dealId}`);

    return true;
  } catch (error) {
    console.error(`[Archiving] Error unarchiving deal ${dealId}:`, error);
    throw new Error(`Failed to unarchive deal ${dealId}: ${error}`);
  }
}

/**
 * Get all deals that should be archived based on archiving rules
 *
 * Efficiently queries database for deals matching archiving criteria:
 * - Expired deals (expiresAt < now)
 * - Low quality + old deals (aiQualityScore < 30 AND createdAt > 60 days ago)
 * - Heavily downvoted deals (score < -10)
 *
 * Note: Does not check for broken links (requires live HTTP requests)
 * Use checkAndArchiveBrokenLinks() for link-based archiving
 *
 * @param limit - Maximum number of deals to return (default: 100)
 * @returns Array of deals that should be archived
 *
 * @example
 * ```typescript
 * const archivableDeals = await getArchivableDeals(50);
 *
 * for (const deal of archivableDeals) {
 *   const decision = await shouldArchiveDeal(deal);
 *   if (decision.shouldArchive) {
 *     await archiveDeal(deal.id, decision.reason!);
 *   }
 * }
 * ```
 */
export async function getArchivableDeals(limit: number = 100) {
  try {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Query for deals matching any archiving criteria
    const results = await db
      .select({
        id: deals.id,
        title: deals.title,
        url: deals.url,
        expiresAt: deals.expires_at,
        createdAt: deals.created_at,
        aiQualityScore: deals.ai_quality_score,
        score: deals.score,
        archived: deals.archived,
      })
      .from(deals)
      .where(
        and(
          eq(deals.archived, false),
          or(
            // Rule 1: Expired
            lt(deals.expires_at, now),
            // Rule 2: Heavily downvoted
            sql`${deals.score} < -10`,
            // Rule 3: Low quality + old
            and(
              sql`${deals.ai_quality_score} < 30`,
              lt(deals.created_at, sixtyDaysAgo)
            )
          )
        )
      )
      .limit(limit);

    return results;
  } catch (error) {
    console.error('[Archiving] Error fetching archivable deals:', error);
    throw new Error('Failed to fetch archivable deals');
  }
}

/**
 * Check and archive deals with broken links
 *
 * Performs live link checks on active deals and archives those with
 * consistently broken links (3 consecutive failures with 404 or 500+ status)
 *
 * @param batchSize - Number of deals to check in one run (default: 50)
 * @param concurrency - Number of concurrent link checks (default: 5)
 * @returns Number of deals archived due to broken links
 *
 * @example
 * ```typescript
 * // Run as a cron job every 24 hours
 * const archivedCount = await checkAndArchiveBrokenLinks(100, 10);
 * console.log(`Archived ${archivedCount} deals with broken links`);
 * ```
 */
export async function checkAndArchiveBrokenLinks(
  batchSize: number = 50,
  concurrency: number = 5
): Promise<number> {
  try {
    console.log('[Archiving] Starting broken link check...');

    // Get active deals (prioritize older deals that might have broken links)
    const activeDeals = await db
      .select({
        id: deals.id,
        url: deals.url,
        expiresAt: deals.expires_at,
        createdAt: deals.created_at,
        aiQualityScore: deals.ai_quality_score,
        score: deals.score,
        archived: deals.archived,
      })
      .from(deals)
      .where(eq(deals.archived, false))
      .orderBy(deals.created_at) // Check older deals first
      .limit(batchSize);

    console.log(`[Archiving] Checking ${activeDeals.length} deals for broken links...`);

    let archivedCount = 0;

    // Process deals with concurrency control
    const queue = [...activeDeals];
    const workers = Array(Math.min(concurrency, activeDeals.length))
      .fill(null)
      .map(async () => {
        while (queue.length > 0) {
          const deal = queue.shift();
          if (!deal) break;

          const decision = await shouldArchiveDeal(deal, true);

          if (decision.shouldArchive && decision.reason === 'broken_link') {
            await archiveDeal(deal.id, decision.reason);
            archivedCount++;
            console.log(`[Archiving] ${decision.details}`);
          }
        }
      });

    await Promise.all(workers);

    console.log(`[Archiving] Archived ${archivedCount} deals with broken links`);

    return archivedCount;
  } catch (error) {
    console.error('[Archiving] Error checking broken links:', error);
    throw new Error('Failed to check and archive broken links');
  }
}

/**
 * Archive all deals that meet archiving criteria
 *
 * Comprehensive archiving function that:
 * 1. Finds all archivable deals (expired, low quality, downvoted)
 * 2. Evaluates each deal against archiving rules
 * 3. Archives deals that should be archived
 *
 * @returns Number of deals archived
 *
 * @example
 * ```typescript
 * // Run as a daily cron job
 * const count = await archiveEligibleDeals();
 * console.log(`Archived ${count} deals`);
 * ```
 */
export async function archiveEligibleDeals(): Promise<number> {
  try {
    console.log('[Archiving] Starting archiving job...');

    const archivableDeals = await getArchivableDeals(200);

    console.log(`[Archiving] Found ${archivableDeals.length} potentially archivable deals`);

    let archivedCount = 0;

    for (const deal of archivableDeals) {
      const decision = await shouldArchiveDeal(deal, false);

      if (decision.shouldArchive && decision.reason) {
        await archiveDeal(deal.id, decision.reason);
        archivedCount++;

        if (decision.details) {
          console.log(`[Archiving] ${decision.details}`);
        }
      }
    }

    console.log(`[Archiving] Archived ${archivedCount} deals`);

    return archivedCount;
  } catch (error) {
    console.error('[Archiving] Error in archiving job:', error);
    throw new Error('Failed to archive eligible deals');
  }
}

/**
 * Get archiving statistics
 *
 * @returns Statistics about archived deals
 *
 * @example
 * ```typescript
 * const stats = await getArchivingStats();
 * console.log(`Total archived: ${stats.totalArchived}`);
 * console.log(`By reason:`, stats.byReason);
 * ```
 */
export async function getArchivingStats() {
  try {
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        reason: deals.archive_reason,
      })
      .from(deals)
      .where(eq(deals.archived, true))
      .groupBy(deals.archive_reason);

    const totalArchived = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(deals)
      .where(eq(deals.archived, true));

    const byReason: Record<string, number> = {};
    stats.forEach(stat => {
      if (stat.reason) {
        byReason[stat.reason] = Number(stat.total);
      }
    });

    return {
      totalArchived: Number(totalArchived[0]?.count || 0),
      byReason,
    };
  } catch (error) {
    console.error('[Archiving] Error fetching stats:', error);
    throw new Error('Failed to fetch archiving stats');
  }
}
