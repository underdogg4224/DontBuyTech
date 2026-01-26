/**
 * Vercel Cron Job: Automated Deal Archiving
 *
 * Runs daily at 2 AM UTC to archive deals based on quality, expiration, and engagement.
 *
 * Security:
 * - Verifies CRON_SECRET header
 * - Only accessible by Vercel Cron system
 * - Returns 401 for unauthorized requests
 *
 * Process:
 * 1. Verify authorization
 * 2. Archive expired deals
 * 3. Archive low quality deals
 * 4. Archive heavily downvoted deals
 * 5. Return execution summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { archiveEligibleDeals, getArchivingStats } from '@/lib/archiving';

/**
 * Vercel Cron endpoint for automated archiving
 * GET /api/cron/archive
 *
 * Triggered by Vercel Cron at scheduled intervals
 * Requires CRON_SECRET environment variable for authorization
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Security: Verify Cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron/Archive] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    // Verify authorization header
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron/Archive] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron/Archive] Starting automated archiving job...');

    // Archive eligible deals
    const archivedCount = await archiveEligibleDeals();

    // Get updated statistics
    const stats = await getArchivingStats();

    const executionTime = Date.now() - startTime;

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      execution: {
        durationMs: executionTime,
        durationSeconds: (executionTime / 1000).toFixed(2),
      },
      results: {
        archivedThisRun: archivedCount,
        totalArchived: stats.totalArchived,
        byReason: stats.byReason,
      },
    };

    console.log('[Cron/Archive] Job completed successfully:', summary);

    return NextResponse.json(summary, { status: 200 });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('[Cron/Archive] Job failed:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        execution: {
          durationMs: executionTime,
          durationSeconds: (executionTime / 1000).toFixed(2),
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Optional: Allow POST method for manual triggers (debugging)
 * Keep same security checks as GET
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
