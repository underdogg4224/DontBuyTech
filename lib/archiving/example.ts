/**
 * Archiving System Example
 * Demonstrates how to use the archiving logic engine
 */

import {
  shouldArchiveDeal,
  archiveDeal,
  getArchivableDeals,
  checkAndArchiveBrokenLinks,
  archiveEligibleDeals,
  getArchivingStats,
  checkDealLink,
} from './index';

/**
 * Example 1: Check if a single deal should be archived
 */
async function example1_checkSingleDeal() {
  console.log('\n=== Example 1: Check Single Deal ===\n');

  // Mock deal data
  const mockDeal = {
    id: 'deal-123',
    url: 'https://example.com/expired-deal',
    expiresAt: new Date('2023-01-01'), // Expired
    createdAt: new Date('2024-01-01'),
    aiQualityScore: 75,
    score: 10,
    archived: false,
  };

  const decision = await shouldArchiveDeal(mockDeal);

  console.log('Deal:', mockDeal.id);
  console.log('Should Archive:', decision.shouldArchive);
  console.log('Reason:', decision.reason);
  console.log('Details:', decision.details);

  // Output:
  // Should Archive: true
  // Reason: expired
  // Details: Deal expired on 2023-01-01T00:00:00.000Z
}

/**
 * Example 2: Check deal with link validation
 */
async function example2_checkWithLinkValidation() {
  console.log('\n=== Example 2: Check with Link Validation ===\n');

  const mockDeal = {
    id: 'deal-456',
    url: 'https://httpstat.us/404', // Returns 404
    expiresAt: null,
    createdAt: new Date('2024-01-01'),
    aiQualityScore: 75,
    score: 5,
    archived: false,
  };

  // First check: Link will be checked and marked as failing
  const decision1 = await shouldArchiveDeal(mockDeal, true);
  console.log('First check:');
  console.log('  Should Archive:', decision1.shouldArchive);
  console.log('  Reason:', decision1.reason);

  // Second check: Consecutive failure count increases
  const decision2 = await shouldArchiveDeal(mockDeal, true);
  console.log('\nSecond check:');
  console.log('  Should Archive:', decision2.shouldArchive);
  console.log('  Reason:', decision2.reason);

  // Third check: 3 consecutive failures = archive
  const decision3 = await shouldArchiveDeal(mockDeal, true);
  console.log('\nThird check:');
  console.log('  Should Archive:', decision3.shouldArchive);
  console.log('  Reason:', decision3.reason);
  console.log('  Details:', decision3.details);

  // Output (after 3 checks):
  // Should Archive: true
  // Reason: broken_link
  // Details: Link check failed 3 times (HTTP 404)
}

/**
 * Example 3: Archive low quality old deals
 */
async function example3_lowQualityOldDeal() {
  console.log('\n=== Example 3: Low Quality Old Deal ===\n');

  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 65); // 65 days ago

  const mockDeal = {
    id: 'deal-789',
    url: 'https://example.com/deal',
    expiresAt: null,
    createdAt: oldDate,
    aiQualityScore: 25, // Low quality
    score: 2,
    archived: false,
  };

  const decision = await shouldArchiveDeal(mockDeal);

  console.log('Deal Age:', Math.round((Date.now() - oldDate.getTime()) / (1000 * 60 * 60 * 24)), 'days');
  console.log('AI Quality Score:', mockDeal.aiQualityScore);
  console.log('Should Archive:', decision.shouldArchive);
  console.log('Reason:', decision.reason);
  console.log('Details:', decision.details);

  // Output:
  // Deal Age: 65 days
  // AI Quality Score: 25
  // Should Archive: true
  // Reason: low_quality
  // Details: AI quality score: 25, Age: 65 days
}

/**
 * Example 4: Archive heavily downvoted deal
 */
async function example4_heavilyDownvotedDeal() {
  console.log('\n=== Example 4: Heavily Downvoted Deal ===\n');

  const mockDeal = {
    id: 'deal-999',
    url: 'https://example.com/deal',
    expiresAt: null,
    createdAt: new Date('2024-01-01'),
    aiQualityScore: 75,
    score: -15, // Heavily downvoted
    archived: false,
  };

  const decision = await shouldArchiveDeal(mockDeal);

  console.log('Deal Score:', mockDeal.score);
  console.log('Should Archive:', decision.shouldArchive);
  console.log('Reason:', decision.reason);
  console.log('Details:', decision.details);

  // Output:
  // Deal Score: -15
  // Should Archive: true
  // Reason: downvoted
  // Details: Deal score is -15 (threshold: -10)
}

/**
 * Example 5: Check a valid URL
 */
async function example5_checkValidLink() {
  console.log('\n=== Example 5: Check Valid Link ===\n');

  const result = await checkDealLink('https://httpstat.us/200');

  console.log('URL:', 'https://httpstat.us/200');
  console.log('Is Valid:', result.isValid);
  console.log('Status Code:', result.statusCode);
  console.log('Error:', result.error);

  // Output:
  // Is Valid: true
  // Status Code: 200
  // Error: undefined
}

/**
 * Example 6: Check multiple archiving rules
 */
async function example6_multipleRules() {
  console.log('\n=== Example 6: Multiple Rules Check ===\n');

  const testDeals = [
    {
      id: 'deal-1',
      name: 'Valid Deal',
      data: {
        id: 'deal-1',
        url: 'https://example.com/deal1',
        expiresAt: null,
        createdAt: new Date(),
        aiQualityScore: 75,
        score: 10,
        archived: false,
      },
    },
    {
      id: 'deal-2',
      name: 'Expired Deal',
      data: {
        id: 'deal-2',
        url: 'https://example.com/deal2',
        expiresAt: new Date('2023-01-01'),
        createdAt: new Date(),
        aiQualityScore: 75,
        score: 10,
        archived: false,
      },
    },
    {
      id: 'deal-3',
      name: 'Low Quality Old Deal',
      data: {
        id: 'deal-3',
        url: 'https://example.com/deal3',
        expiresAt: null,
        createdAt: new Date('2023-01-01'),
        aiQualityScore: 20,
        score: 5,
        archived: false,
      },
    },
    {
      id: 'deal-4',
      name: 'Downvoted Deal',
      data: {
        id: 'deal-4',
        url: 'https://example.com/deal4',
        expiresAt: null,
        createdAt: new Date(),
        aiQualityScore: 75,
        score: -15,
        archived: false,
      },
    },
  ];

  for (const testDeal of testDeals) {
    const decision = await shouldArchiveDeal(testDeal.data);
    console.log(`${testDeal.name}:`);
    console.log(`  Should Archive: ${decision.shouldArchive}`);
    console.log(`  Reason: ${decision.reason || 'N/A'}`);
    console.log();
  }
}

/**
 * Example 7: Archiving statistics summary
 */
function example7_archivingRulesSummary() {
  console.log('\n=== Example 7: Archiving Rules Summary ===\n');

  console.log('ARCHIVING RULES');
  console.log('===============');
  console.log();
  console.log('A deal is archived if ANY of these conditions are met:');
  console.log();
  console.log('1. EXPIRED');
  console.log('   - expiresAt < now');
  console.log('   - Archive Reason: "expired"');
  console.log();
  console.log('2. BROKEN LINK');
  console.log('   - Link returns HTTP 404 or 500+');
  console.log('   - 3 consecutive failed checks required');
  console.log('   - Archive Reason: "broken_link"');
  console.log();
  console.log('3. LOW QUALITY + OLD');
  console.log('   - aiQualityScore < 30');
  console.log('   - AND createdAt > 60 days ago');
  console.log('   - Archive Reason: "low_quality"');
  console.log();
  console.log('4. HEAVILY DOWNVOTED');
  console.log('   - score < -10');
  console.log('   - Archive Reason: "downvoted"');
  console.log();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       DontBuyTech Archiving System - Examples             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    example7_archivingRulesSummary();
    await example1_checkSingleDeal();
    await example3_lowQualityOldDeal();
    await example4_heavilyDownvotedDeal();
    await example5_checkValidLink();
    await example6_multipleRules();
    // Note: example2 makes actual HTTP requests and may be slow

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

export {
  example1_checkSingleDeal,
  example2_checkWithLinkValidation,
  example3_lowQualityOldDeal,
  example4_heavilyDownvotedDeal,
  example5_checkValidLink,
  example6_multipleRules,
  example7_archivingRulesSummary,
  runAllExamples,
};
